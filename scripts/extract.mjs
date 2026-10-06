// Estrae template completi e blocchi (sezioni) dai repository in vendor/.
//
// Per ogni template:
//  - parsing con il parser XML di MJML
//  - <mj-attributes> (mj-all, default per tag, mj-class) applicati inline sugli elementi,
//    così ogni sezione è autosufficiente quando GrapesJS la renderizza da sola
//  - componenti non supportati da grapesjs-mjml (mj-table, mj-accordion, mj-carousel)
//    convertiti in equivalenti supportati
//  - validazione con mjml (template completo e singolo blocco)
// Output: static/data/index.json + static/data/<source>.json + reports/<source>.md

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import mjml2html from 'mjml';
import { components } from 'mjml-core';
import parseXml from 'mjml-parser-xml';
import { SOURCES } from './sources.mjs';

const ROOT = process.cwd();
const OUT = join(ROOT, 'static', 'data');
const REPORTS = join(ROOT, 'reports');
mkdirSync(OUT, { recursive: true });
mkdirSync(REPORTS, { recursive: true });

// Attributi accettati da ogni componente (+ globali)
const GLOBAL_ATTRS = new Set(['css-class', 'mj-class']);
const allowed = (tag, attr) =>
  GLOBAL_ATTRS.has(attr) || !!components[tag]?.allowedAttributes?.[attr];

// Elementi di mj-head mantenuti: grapesjs-mjml 1.x non ha componenti per mj-title/mj-preview
// (verrebbero mostrati come testo nel canvas), mj-attributes viene applicato inline.
const HEAD_KEEP = new Set(['mj-font', 'mj-style']);

// ---------- utilità ----------
const walkFiles = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === 'node_modules' || f.startsWith('.')) return [];
    return statSync(p).isDirectory() ? walkFiles(p) : f.endsWith('.mjml') ? [p] : [];
  });

const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titleCase = (s) =>
  s.replace(/^\d+[-_]/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^./, (c) => c.toUpperCase());

const stripComments = (s) => s.replace(/<!--(?!\[if)(?!<!\[endif)[\s\S]*?-->/g, '');

function serialize(node, indent = '') {
  const attrs = Object.entries(node.attributes || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => ` ${k}="${escAttr(v)}"`)
    .join('');
  const tag = node.tagName;
  if (node.content !== undefined && !(node.children && node.children.length)) {
    return `${indent}<${tag}${attrs}>${node.content}</${tag}>`;
  }
  const kids = (node.children || []).map((c) => serialize(c, indent + '  '));
  if (!kids.length) return `${indent}<${tag}${attrs}></${tag}>`;
  return `${indent}<${tag}${attrs}>\n${kids.join('\n')}\n${indent}</${tag}>`;
}

const textOf = (node) => {
  let t = node.content ? node.content.replace(/<[^>]+>/g, ' ') : '';
  for (const c of node.children || []) t += ' ' + textOf(c);
  return t.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

const each = (node, fn) => {
  fn(node);
  (node.children || []).forEach((c) => each(c, fn));
};

// ---------- mj-attributes → attributi inline ----------
function collectAttributes(head) {
  const res = { all: {}, tags: {}, classes: {} };
  for (const el of head?.children || []) {
    if (el.tagName !== 'mj-attributes') continue;
    for (const a of el.children || []) {
      const { name, ...rest } = a.attributes || {};
      if (a.tagName === 'mj-all') Object.assign(res.all, a.attributes);
      else if (a.tagName === 'mj-class') res.classes[name] = { ...(res.classes[name] || {}), ...rest };
      else res.tags[a.tagName] = { ...(res.tags[a.tagName] || {}), ...a.attributes };
    }
  }
  return res;
}

function inlineAttributes(body, defs) {
  each(body, (n) => {
    if (!n.tagName?.startsWith('mj-')) return;
    const own = { ...(n.attributes || {}) };
    const fromClass = {};
    if (own['mj-class']) {
      for (const c of own['mj-class'].split(/\s+/)) Object.assign(fromClass, defs.classes[c] || {});
      delete own['mj-class'];
    }
    const merged = { ...defs.all, ...(defs.tags[n.tagName] || {}), ...fromClass };
    const out = {};
    for (const [k, v] of Object.entries(merged)) if (allowed(n.tagName, k)) out[k] = v;
    // css-class: MJML le concatena tra mj-class e attributo
    if (fromClass['css-class'] && own['css-class']) own['css-class'] = `${fromClass['css-class']} ${own['css-class']}`;
    n.attributes = { ...out, ...own };
  });
}

// Attributi illegali (che MJML ignora comunque) rimossi; colore "none" → "transparent"
function sanitize(body, stats) {
  each(body, (n) => {
    const spec = components[n.tagName]?.allowedAttributes;
    if (!spec || !n.attributes) return;
    for (const [k, v] of Object.entries(n.attributes)) {
      if (!allowed(n.tagName, k)) {
        delete n.attributes[k];
        stats.removedAttrs[`${n.tagName}[${k}]`] = (stats.removedAttrs[`${n.tagName}[${k}]`] || 0) + 1;
      } else if (spec[k] === 'color' && String(v).trim() === 'none') {
        n.attributes[k] = 'transparent';
      }
    }
  });
}

// ---------- componenti non supportati dall'editor ----------
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const TEXT_KEYS = ['align', 'color', 'font-family', 'font-size', 'line-height', 'padding', 'padding-top',
  'padding-bottom', 'padding-left', 'padding-right', 'container-background-color', 'css-class'];

function convertUnsupported(body, stats) {
  each(body, (n) => {
    if (!n.children) return;
    n.children = n.children.flatMap((c) => {
      const a = c.attributes || {};
      if (c.tagName === 'mj-table') {
        stats.converted['mj-table'] = (stats.converted['mj-table'] || 0) + 1;
        const style = [
          `border:${a.border || 'none'}`, `table-layout:${a['table-layout'] || 'auto'}`,
          `width:${a.width || '100%'}`, a.color && `color:${a.color}`,
          a['font-family'] && `font-family:${a['font-family']}`, a['font-size'] && `font-size:${a['font-size']}`,
          a['line-height'] && `line-height:${a['line-height']}`,
        ].filter(Boolean).join(';');
        return [{
          tagName: 'mj-text',
          attributes: pick(a, TEXT_KEYS),
          content: `<table cellpadding="${a.cellpadding || 0}" cellspacing="${a.cellspacing || 0}" width="${
            String(a.width || '100%').replace('px', '')}" border="0" style="${style}">${c.content || ''}</table>`,
        }];
      }
      if (c.tagName === 'mj-accordion') {
        stats.converted['mj-accordion'] = (stats.converted['mj-accordion'] || 0) + 1;
        const html = (c.children || []).map((el) => {
          const t = el.children?.find((x) => x.tagName === 'mj-accordion-title');
          const x = el.children?.find((x) => x.tagName === 'mj-accordion-text');
          return `<p><strong>${t?.content || ''}</strong></p><div>${x?.content || ''}</div>`;
        }).join('');
        return [{ tagName: 'mj-text', attributes: pick(a, TEXT_KEYS), content: html }];
      }
      if (c.tagName === 'mj-carousel') {
        stats.converted['mj-carousel'] = (stats.converted['mj-carousel'] || 0) + 1;
        const first = (c.children || []).find((x) => x.tagName === 'mj-carousel-image');
        if (!first) return [];
        return [{ tagName: 'mj-image', attributes: pick(first.attributes || {}, ['src', 'alt', 'href', 'title']) }];
      }
      // mj-raw con soli commenti (es. "<!-- Header -->"): rumore
      if (c.tagName === 'mj-raw' && !stripComments(c.content || '').trim()) return [];
      return [c];
    });
  });
}

// ---------- categorie ----------
const FOOTER_RX = /unsubscribe|disiscri|privacy|all rights|©|&copy;|copyright|view (it )?in (your )?browser|manage (your )?preferences|you (are )?receiv|update (your )?preferences|terms/i;
const PRICE_RX = /([$€£]\s?\d)|(\d[.,]\d{2}\s?[$€£])|\bprice\b|\bprezzo\b/i;

function categorize(sec, index, total) {
  const f = { img: 0, btn: 0, text: 0, cols: 0, social: 0, nav: 0, div: 0, bigImg: false, bg: !!sec.attributes?.['background-url'] };
  each(sec, (n) => {
    switch (n.tagName) {
      case 'mj-image': f.img++; if (!n.attributes?.width || parseInt(n.attributes.width) >= 400) f.bigImg = f.bigImg || true; break;
      case 'mj-button': f.btn++; break;
      case 'mj-text': f.text++; break;
      case 'mj-column': f.cols++; break;
      case 'mj-social': f.social++; break;
      case 'mj-navbar': f.nav++; break;
      case 'mj-divider': case 'mj-spacer': f.div++; break;
    }
  });
  const txt = textOf(sec);
  const isLast = index >= total - 2;
  if (f.img + f.btn + f.text + f.social + f.nav === 0) return { category: 'Separatori', rule: 'solo divider/spacer' };
  if (isLast && (FOOTER_RX.test(txt) || (f.social && txt.length < 400)))
    return { category: 'Footer', rule: 'ultime sezioni + testo legale/social' };
  if (FOOTER_RX.test(txt) && /unsubscribe|disiscri|all rights|©|&copy;/i.test(txt))
    return { category: 'Footer', rule: 'testo di disiscrizione/copyright' };
  if (f.social && txt.length < 200) return { category: 'Social', rule: 'mj-social con poco testo' };
  if (f.nav || (index === 0 && f.img <= 2 && f.btn === 0 && txt.length < 120))
    return { category: 'Header', rule: f.nav ? 'mj-navbar' : 'prima sezione, logo/poco testo' };
  if (index <= 2 && (f.bg || (f.bigImg && f.img === 1)) && (f.btn || txt.length < 300) && f.cols <= 2)
    return { category: 'Hero', rule: 'in alto, immagine grande/background + titolo' };
  if (f.cols >= 2 && f.img >= 2 && PRICE_RX.test(txt)) return { category: 'Prodotti', rule: 'colonne con immagini e prezzi' };
  if (f.img === 1 && f.text <= 3 && PRICE_RX.test(txt)) return { category: 'Prodotti', rule: 'immagine prodotto + prezzo' };
  if (f.cols >= 2) return { category: 'Colonne', rule: '2+ colonne' };
  if (f.btn && f.img === 0 && txt.length < 300) return { category: 'CTA', rule: 'bottone con poco testo' };
  if (f.img && !f.text && !f.btn) return { category: 'Immagine', rule: 'solo immagini' };
  if (f.img) return { category: 'Testo + immagine', rule: 'immagine e testo' };
  return { category: 'Testo', rule: 'solo testo' };
}

export const CATEGORY_ORDER = ['Header', 'Hero', 'Testo', 'Testo + immagine', 'Immagine', 'Colonne',
  'Prodotti', 'CTA', 'Social', 'Separatori', 'Footer'];

// ---------- nomi e gruppi ----------
function templateName(src, file, rawText, head) {
  const tagTitle = head?.children?.find((c) => c.tagName === 'mj-title')?.content?.trim();
  const comment = rawText.match(/Template:\s*(.+)/)?.[1]?.trim();
  if (src.id === 'mailteorite' && comment) return comment;
  if (src.id === 'easyemail') {
    const n = basename(dirname(file)).replace('template', '');
    const t = tagTitle ? titleCase(tagTitle.toLowerCase()) : `Template ${n}`;
    return t.length > 48 ? t.slice(0, 46) + '…' : t;
  }
  return titleCase(basename(file, '.mjml'));
}
function templateGroup(src, file) {
  if (src.id === 'mailteorite') return titleCase(basename(dirname(file)));
  return '';
}

// ---------- hash per deduplicare (struttura + stili, senza testi e URL) ----------
function structuralHash(node) {
  const strip = (n) => ({
    t: n.tagName,
    a: Object.fromEntries(Object.entries(n.attributes || {}).filter(([k]) => !/^(src|href|alt|title|background-url|name)$/.test(k))),
    c: n.content !== undefined ? n.content.replace(/>[^<]*</g, '><').replace(/^[^<]*|[^>]*$/g, '').replace(/(src|href)="[^"]*"/g, '') : undefined,
    k: (n.children || []).map(strip),
  });
  return createHash('sha1').update(JSON.stringify(strip(node))).digest('hex').slice(0, 12);
}

const compile = (mjml, level = 'soft') => {
  try {
    const r = mjml2html(mjml, { validationLevel: level, keepComments: false });
    return { ok: true, errors: r.errors || [] };
  } catch (e) {
    return { ok: false, errors: e.errors || [{ formattedMessage: e.message }] };
  }
};

// ---------- main ----------
const index = { generatedAt: new Date().toISOString(), categories: CATEGORY_ORDER, sources: [] };

for (const src of SOURCES) {
  const base = join(ROOT, 'vendor', src.dir, src.glob);
  const files = walkFiles(base).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const stats = { files: files.length, templates: 0, templateErrors: [], blocks: 0, discarded: [], duplicates: 0, converted: {}, removedAttrs: {}, perCategory: {} };
  const templates = [];
  const blocks = [];
  const seen = new Map();

  for (const file of files) {
    const rel = relative(join(ROOT, 'vendor', src.dir), file);
    const raw = readFileSync(file, 'utf8');
    let tree;
    try {
      tree = parseXml(raw, { keepComments: false, components, filePath: file, ignoreIncludes: true });
    } catch (e) {
      stats.templateErrors.push(`${rel}: parsing fallito (${e.message})`);
      continue;
    }
    const head = tree.children?.find((c) => c.tagName === 'mj-head');
    const body = tree.children?.find((c) => c.tagName === 'mj-body');
    if (!body) { stats.templateErrors.push(`${rel}: nessun mj-body`); continue; }

    const defs = collectAttributes(head);
    // mj-body non accetta attributi arbitrari (es. font-family): tengo solo quelli validi
    body.attributes = Object.fromEntries(Object.entries(body.attributes || {}).filter(([k]) => allowed('mj-body', k)));
    inlineAttributes(body, defs);
    convertUnsupported(body, stats);
    sanitize(body, stats);
    // elementi di contenuto messi direttamente in mj-body: li avvolgo in section/column
    body.children = (body.children || []).map((c) =>
      ['mj-section', 'mj-wrapper', 'mj-hero', 'mj-raw'].includes(c.tagName) ? c
        : { tagName: 'mj-section', attributes: { padding: '0' }, children: [{ tagName: 'mj-column', attributes: {}, children: [c] }] });

    const headKept = (head?.children || []).filter((c) => HEAD_KEEP.has(c.tagName));
    const headNode = { tagName: 'mj-head', attributes: {}, children: headKept };
    const mjmlTree = { tagName: 'mjml', attributes: {}, children: [...(headKept.length ? [headNode] : []), body] };
    const templateMjml = serialize(mjmlTree);

    const name = templateName(src, file, raw, head);
    const tId = `${src.id}--${slug(rel.replace(/\.mjml$/, '').replace(/^templates\/|^mjml\//, '').replace(/\/index$/, ''))}`;
    const res = compile(templateMjml);
    if (!res.ok) { stats.templateErrors.push(`${rel}: compilazione fallita`); continue; }
    if (res.errors.length) stats.templateErrors.push(`${rel}: ${res.errors.length} avvisi di validazione (template mantenuto)`);

    // dipendenze da head per i blocchi: font e stili
    const fonts = headKept.filter((c) => c.tagName === 'mj-font').map((c) => serialize(c));
    const styles = headKept.filter((c) => c.tagName === 'mj-style').map((c) => serialize(c));

    const sections = (body.children || []).filter((c) => ['mj-section', 'mj-wrapper', 'mj-hero'].includes(c.tagName));
    let blockCount = 0;
    sections.forEach((sec, i) => {
      const content = serialize(sec);
      const wrapped = `<mjml>${headKept.length ? serialize(headNode) : ''}<mj-body width="${body.attributes.width || '600px'}">${content}</mj-body></mjml>`;
      const v = compile(wrapped, 'strict');
      if (!v.ok) {
        stats.discarded.push(`${rel} #${i + 1}: ${v.errors.map((e) => e.formattedMessage || e.message).slice(0, 2).join(' | ')}`);
        return;
      }
      const h = structuralHash(sec);
      if (seen.has(h)) { stats.duplicates++; return; }
      seen.set(h, true);
      const { category, rule } = categorize(sec, i, sections.length);
      stats.perCategory[category] = (stats.perCategory[category] || 0) + 1;
      const usesCssClass = content.includes('css-class=');
      blocks.push({
        id: `${tId}--${i + 1}`,
        label: `${name} · ${i + 1}`,
        category,
        rule,
        templateId: tId,
        content,
        bodyBg: body.attributes['background-color'] || '',
        head: { fonts, styles: usesCssClass ? styles : [] },
      });
      blockCount++;
    });

    templates.push({
      id: tId,
      name,
      group: templateGroup(src, file),
      sourceFile: rel,
      sections: sections.length,
      blocks: blockCount,
      mjml: templateMjml,
    });
  }

  stats.templates = templates.length;
  stats.blocks = blocks.length;
  writeFileSync(join(OUT, `${src.id}.json`), JSON.stringify({ source: src.id, templates, blocks }));
  index.sources.push({
    id: src.id, label: src.label, repo: src.repo, sha: src.sha, license: src.license,
    templates: templates.length, blocks: blocks.length,
  });

  const report = [
    `# ${src.label} — ${src.repo}`,
    '',
    `- Commit: \`${src.sha}\``,
    `- Licenza: ${src.license}`,
    `- File .mjml letti: ${stats.files}`,
    `- Template estratti: ${stats.templates}`,
    `- Blocchi estratti: ${stats.blocks}`,
    `- Blocchi duplicati scartati: ${stats.duplicates}`,
    `- Blocchi non validi scartati: ${stats.discarded.length}`,
    `- Attributi non validi rimossi (MJML li ignorava già): ${Object.entries(stats.removedAttrs).map(([k, v]) => `${k} ×${v}`).join(', ') || 'nessuno'}`,
    `- Componenti convertiti: ${Object.entries(stats.converted).map(([k, v]) => `${k} ×${v}`).join(', ') || 'nessuno'}`,
    '',
    '## Blocchi per categoria',
    '',
    ...CATEGORY_ORDER.filter((c) => stats.perCategory[c]).map((c) => `- ${c}: ${stats.perCategory[c]}`),
    '',
    '## Note sui template',
    '',
    ...(stats.templateErrors.length ? stats.templateErrors.map((e) => `- ${e}`) : ['- nessuna']),
    '',
    '## Blocchi scartati',
    '',
    ...(stats.discarded.length ? stats.discarded.map((e) => `- ${e}`) : ['- nessuno']),
    '',
  ].join('\n');
  writeFileSync(join(REPORTS, `${src.id}.md`), report);
  console.log(`${src.id.padEnd(12)} template ${String(stats.templates).padStart(3)}  blocchi ${String(stats.blocks).padStart(4)}  duplicati ${String(stats.duplicates).padStart(4)}  scartati ${stats.discarded.length}  avvisi template ${stats.templateErrors.length}`);
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 2));
