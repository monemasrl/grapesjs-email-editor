// Mattoncini MJML parametrizzati sul tema `t`
const esc = (v) => String(v).replace(/"/g, '&quot;');
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '')
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');

export const URL = 'https://example.com';

/** Immagine segnaposto (placehold.co) nei colori del tema */
export function ph(t, w, h, label, bg = 'accentSoft', fg = 'accent') {
  const c = (k) => t.colors[k].slice(1);
  return `https://placehold.co/${w}x${h}/${c(bg)}/${c(fg)}/png?text=${encodeURIComponent(label).replace(/%20/g, '+')}&font=${t.placeholderFont}`;
}

export const logo = (t, onDark = false) =>
  onDark ? ph(t, 280, 80, 'LOGO', 'dark', 'surface') : ph(t, 280, 80, 'LOGO', 'surface', 'accent');

export function section(t, inner, o = {}) {
  return `<mj-section${attrs({
    'background-color': t.colors[o.bg || 'surface'],
    padding: o.pad ?? '24px 24px',
    'background-url': o.bgUrl,
    'background-size': o.bgUrl ? 'cover' : undefined,
    'background-repeat': o.bgUrl ? 'no-repeat' : undefined,
    'background-position': o.bgUrl ? 'center center' : undefined,
    'text-align': o.align,
    'css-class': o.cls,
  })}>${inner}</mj-section>`;
}

export function column(inner, o = {}, t) {
  return `<mj-column${attrs({
    width: o.width,
    'vertical-align': o.valign,
    'background-color': o.bg && t ? t.colors[o.bg] : undefined,
    'border-radius': o.radius,
    border: o.border,
    'border-left': o.borderLeft,
    padding: o.pad,
  })}>${inner}</mj-column>`;
}

export function wrapper(t, inner, o = {}) {
  return `<mj-wrapper${attrs({ 'background-color': t.colors[o.bg || 'surface'], padding: o.pad ?? '0px' })}>${inner}</mj-wrapper>`;
}

/** Testo. kind: h1|h2|h3|body|small|label */
export function text(t, html, o = {}) {
  const k = o.kind || 'body';
  const S = {
    h1: { size: '32px', lh: '1.2', font: 'heading', weight: t.headingWeight, color: 'text' },
    h2: { size: '24px', lh: '1.25', font: 'heading', weight: t.headingWeight, color: 'text' },
    h3: { size: '18px', lh: '1.3', font: 'heading', weight: t.headingWeight, color: 'text' },
    body: { size: '16px', lh: '1.6', font: 'body', weight: '400', color: 'muted' },
    small: { size: '13px', lh: '1.5', font: 'body', weight: '400', color: 'subtle' },
    label: { size: '12px', lh: '1.4', font: 'body', weight: '700', color: 'accent', ls: '2px', tt: 'uppercase' },
  }[k];
  return `<mj-text${attrs({
    'font-family': t.fonts[o.font || S.font],
    'font-size': o.size || S.size,
    'line-height': o.lh || S.lh,
    'font-weight': o.weight || S.weight,
    'font-style': o.italic ? 'italic' : undefined,
    color: t.colors[o.color || S.color],
    align: o.align || 'left',
    'letter-spacing': o.ls || S.ls,
    'text-transform': S.tt,
    padding: o.pad ?? '0px 0px 12px 0px',
    'container-background-color': o.bg ? t.colors[o.bg] : undefined,
  })}>${html}</mj-text>`;
}

/** Link inline nel colore del tema */
export const a = (t, label, color = 'accent', href = URL) =>
  `<a href="${href}" style="color:${t.colors[color]};text-decoration:underline;">${label}</a>`;

/** Bottone. variant: primary | outline | light | dark */
export function button(t, label, o = {}) {
  const v = o.variant || 'primary';
  const V = {
    primary: { bg: 'accent', color: 'surface', border: undefined },
    outline: { bg: 'surface', color: 'accent', border: `2px solid ${t.colors.accent}` },
    light: { bg: 'surface', color: 'accent', border: undefined },
    dark: { bg: 'text', color: 'surface', border: undefined },
  }[v];
  return `<mj-button${attrs({
    href: o.href || URL,
    'background-color': t.colors[V.bg],
    color: t.colors[V.color],
    border: V.border,
    'border-radius': t.radiusBtn,
    'font-family': t.fonts.body,
    'font-size': o.size || '15px',
    'font-weight': '700',
    'inner-padding': o.inner || (v === 'outline' ? '12px 26px' : '14px 28px'),
    padding: o.pad ?? '8px 0px 0px 0px',
    align: o.align || 'left',
    width: o.width,
  })}>${label}</mj-button>`;
}

export function image(t, src, o = {}) {
  return `<mj-image${attrs({
    src,
    alt: o.alt || '',
    href: o.href,
    width: o.width,
    align: o.align || 'center',
    padding: o.pad ?? '0px',
    'border-radius': o.radius === true ? t.radiusCard : o.radius,
  })}></mj-image>`;
}

export function divider(t, o = {}) {
  return `<mj-divider${attrs({
    'border-color': t.colors[o.color || 'border'],
    'border-width': o.bw || '1px',
    width: o.width || '100%',
    align: o.align || 'center',
    padding: o.pad ?? '0px',
  })}></mj-divider>`;
}

export const spacer = (h = '32px') => `<mj-spacer height="${h}"></mj-spacer>`;

export function social(t, o = {}) {
  const nets = [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['linkedin', 'LinkedIn'],
    ['youtube', 'YouTube'],
  ];
  const bg = t.colors[o.iconBg || 'accent'];
  return `<mj-social${attrs({ 'icon-size': o.size || '28px', mode: 'horizontal', align: o.align || 'center', padding: o.pad ?? '0px 0px 12px 0px', 'border-radius': o.round ? '14px' : '4px', 'icon-padding': '4px' })}>${nets
    .map(([n, l]) => `<mj-social-element name="${n}-noshare" href="${URL}/${n}" background-color="${bg}" alt="${l}"></mj-social-element>`)
    .join('')}</mj-social>`;
}

export function navbar(t, links, o = {}) {
  return `<mj-navbar${attrs({ align: o.align || 'center', hamburger: 'hamburger', 'ico-color': t.colors.text })}>${links
    .map((l) => `<mj-navbar-link${attrs({ href: `${URL}/${l.toLowerCase()}`, color: t.colors[o.color || 'text'], 'font-family': t.fonts.body, 'font-size': '14px', 'font-weight': '700', padding: '10px 14px' })}>${l}</mj-navbar-link>`)
    .join('')}</mj-navbar>`;
}

/** Prezzo, opzionalmente con prezzo pieno barrato */
export function price(t, now, before) {
  const b = before ? `<span style="color:${t.colors.subtle};text-decoration:line-through;font-weight:400;">${before}</span>&nbsp;&nbsp;` : '';
  return `${b}<span style="color:${before ? t.colors.sale : t.colors.text};">${now}</span>`;
}

/** Badge in linea (es. -30%) */
export const badge = (t, label, color = 'sale') =>
  `<span style="display:inline-block;background-color:${t.colors[color]};color:${t.colors.surface};font-size:12px;font-weight:700;letter-spacing:1px;padding:4px 10px;border-radius:${t.radiusBtn};">${label}</span>`;
