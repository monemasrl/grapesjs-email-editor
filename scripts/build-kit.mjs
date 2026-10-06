// Genera il kit di blocchi e i template d'esempio per ogni tema → static/data/kit.json
// Uso: pnpm kit
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import mjml2html from 'mjml';
import { THEMES, checkTheme } from './kit/themes.mjs';
import { BLOCKS, CATEGORIES } from './kit/blocks.mjs';
import { TEMPLATES } from './kit/templates.mjs';

const OUT = join(process.cwd(), 'static', 'data');
mkdirSync(OUT, { recursive: true });

const fontTags = (t) => t.webFonts.map((f) => `<mj-font name="${f.name}" href="${f.href}"></mj-font>`);
const head = (t) => `<mj-head>${fontTags(t).join('')}</mj-head>`;
const body = (t, inner) => `<mj-body background-color="${t.colors.bg}" width="600px">${inner}</mj-body>`;
const doc = (t, inner) => `<mjml>${head(t)}${body(t, inner)}</mjml>`;

/** Indenta l'MJML generato (solo per leggibilità del codice esportato) */
function pretty(mjml) {
  let depth = 0;
  const ENDING = /^<(mj-text|mj-button|mj-navbar-link|mj-social-element|mj-raw)\b/;
  const out = [];
  // separa i tag mj-* lasciando intatto il contenuto dei tag "ending" (HTML)
  const re = /<mj-(text|button|navbar-link|social-element|raw)\b[^>]*>[\s\S]*?<\/mj-\1>|<\/?mj[^>]*>|<\/?mjml>/g;
  let m;
  while ((m = re.exec(mjml))) {
    const tag = m[0];
    if (tag.startsWith('</')) {
      depth--;
      const prev = out[out.length - 1];
      // elemento vuoto: chiusura sulla stessa riga dell'apertura
      if (prev && prev.trimStart().startsWith(`<${tag.slice(2, -1)}`) && !prev.includes('</')) out[out.length - 1] = prev + tag;
      else out.push('  '.repeat(depth) + tag);
      continue;
    }
    out.push('  '.repeat(depth) + tag);
    if (!ENDING.test(tag) && !tag.endsWith('/>') && !/<\/mj-[a-z-]+>$/.test(tag)) depth++;
  }
  return out.join('\n');
}

const errors = [];
function validate(id, mjml) {
  try {
    const r = mjml2html(mjml, { validationLevel: 'strict' });
    if (r.errors?.length) errors.push(`${id}: ${r.errors.map((e) => e.formattedMessage).join(' | ')}`);
  } catch (e) {
    errors.push(`${id}: ${(e.errors || []).map((x) => x.formattedMessage).join(' | ') || e.message}`);
  }
}

const themes = [];
const blocks = [];
const templates = [];
const byKey = new Map(BLOCKS.map((b) => [b.key, b]));

for (const t of THEMES) {
  checkTheme(t);
  themes.push({
    id: t.id, label: t.label, description: t.description, colors: t.colors, fonts: t.fonts,
    webFonts: t.webFonts, radiusBtn: t.radiusBtn, radiusCard: t.radiusCard, placeholderFont: t.placeholderFont,
  });

  for (const b of BLOCKS) {
    const content = pretty(b.mjml(t));
    const id = `kit--${t.id}--${b.key}`;
    validate(id, doc(t, content));
    blocks.push({
      id, key: b.key, theme: t.id, label: b.label, category: b.category, rule: 'kit',
      templateId: null, content, bodyBg: t.colors.bg,
      head: { fonts: fontTags(t), styles: [] },
    });
  }

  for (const tpl of TEMPLATES) {
    const inner = tpl.blocks.map(([key, opts]) => {
      const b = byKey.get(key);
      if (!b) throw new Error(`Template ${tpl.key}: blocco sconosciuto ${key}`);
      return b.mjml(t, opts);
    }).join('');
    const id = `kit--${t.id}--${tpl.key}`;
    const mjml = pretty(doc(t, inner));
    validate(id, mjml);
    templates.push({
      id, key: tpl.key, theme: t.id, name: tpl.name, group: t.label, sourceFile: `scripts/kit/templates.mjs#${tpl.key}`,
      sections: tpl.blocks.length, blocks: tpl.blocks.length, mjml,
    });
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} errori di validazione MJML:\n` + errors.join('\n'));
  process.exit(1);
}

writeFileSync(join(OUT, 'kit.json'), JSON.stringify({
  source: 'kit',
  label: 'Kit',
  repo: null,
  license: 'Generato da scripts/build-kit.mjs',
  categories: CATEGORIES,
  themes,
  templates,
  blocks,
}));
console.log(`✓ kit: ${THEMES.length} temi · ${BLOCKS.length} blocchi per tema (${blocks.length} totali) · ${templates.length} template — tutti validi (MJML strict)`);
