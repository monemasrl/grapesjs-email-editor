// Temi del kit lato browser: segnaposto, email vuota e "Cambia stile" di un'email già composta.
//
// Il cambio stile converte i token del tema di partenza in quelli del tema di arrivo
// direttamente nell'MJML, quindi i testi modificati dall'utente restano intatti:
//  - colori #rrggbb (attributi e stili inline) e colori nelle URL dei segnaposto placehold.co
//  - font-family dei titoli e del testo
//  - border-radius: dei bottoni (mj-button e badge inline) e dei riquadri (immagini, colonne)
//  - mj-font nell'head
import type { Block, Theme, ThemeColors } from './types';

type ColorKey = keyof ThemeColors;

export function ph(t: Theme, w: number, h: number, label: string, bg: ColorKey = 'accentSoft', fg: ColorKey = 'accent') {
  const c = (k: ColorKey) => t.colors[k].slice(1);
  return `https://placehold.co/${w}x${h}/${c(bg)}/${c(fg)}/png?text=${encodeURIComponent(label).replace(/%20/g, '+')}&font=${t.placeholderFont}`;
}

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rgbToHex = (s: string) =>
  s.replace(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/g, (_m, r, g, b) =>
    `#${[r, g, b].map((n: string) => Number(n).toString(16).padStart(2, '0')).join('')}`);

export function reskin(mjml: string, from: Theme | null | undefined, to: Theme | null | undefined): string {
  if (!from || !to || from.id === to.id) return mjml;

  // 0. eventuali colori rgb() (es. inseriti dalla barra testo) → #rrggbb
  let out = rgbToHex(mjml);

  // 1. colori
  const keys = Object.keys(from.colors) as ColorKey[];
  const colorMap = new Map(keys.map((k) => [from.colors[k].toLowerCase(), to.colors[k]]));
  out = out.replace(/#[0-9a-fA-F]{6}\b/g, (m) => colorMap.get(m.toLowerCase()) || m);
  out = out.replace(/(placehold\.co\/\d+x\d+\/)([0-9a-fA-F]{6})\/([0-9a-fA-F]{6})/g, (_m, pre, bg, fg) => {
    const map = (hex: string) => (colorMap.get(`#${hex.toLowerCase()}`) || `#${hex}`).slice(1);
    return `${pre}${map(bg)}/${map(fg)}`;
  });
  out = out.replace(new RegExp(`([?&]font=)${reEsc(from.placeholderFont)}\\b`, 'g'), `$1${to.placeholderFont}`);

  // 2. font (valore esatto dell'attributo)
  const fontMap = new Map([[from.fonts.heading, to.fonts.heading], [from.fonts.body, to.fonts.body]]);
  out = out.replace(/font-family="([^"]*)"/g, (m, v) => (fontMap.has(v) ? `font-family="${fontMap.get(v)}"` : m));

  // 3. raggi: dipendono dal tipo di elemento
  out = out.replace(/<(mj-[a-z-]+)\b([^>]*)>/g, (tag, name: string, attrs: string) => {
    if (!attrs.includes('border-radius="')) return tag;
    const next = attrs.replace(/border-radius="([^"]*)"/, (m, v) => {
      if (name === 'mj-button') return v === from.radiusBtn ? `border-radius="${to.radiusBtn}"` : m;
      return v === from.radiusCard ? `border-radius="${to.radiusCard}"` : m;
    });
    return `<${name}${next}>`;
  });
  out = out.replace(new RegExp(`border-radius:\\s*${reEsc(from.radiusBtn)}`, 'g'), `border-radius:${to.radiusBtn}`);

  // 4. web font nell'head
  const fromNames = new Set(from.webFonts.map((f) => f.name));
  out = out.replace(/<mj-font\b[^>]*name="([^"]+)"[^>]*>(\s*<\/mj-font>)?/g, (m, name) => (fromNames.has(name) ? '' : m));
  const tags = to.webFonts.map((f) => `<mj-font name="${f.name}" href="${f.href}"></mj-font>`).join('');
  if (tags) {
    if (/<mj-head[^>]*>/.test(out)) out = out.replace(/<mj-head([^>]*)>/, `<mj-head$1>${tags}`);
    else out = out.replace(/<mjml([^>]*)>/, `<mjml$1><mj-head>${tags}</mj-head>`);
  }
  return out;
}

/** Riconosce il tema di un MJML dal colore di sfondo del body (per email senza tema salvato) */
export function detectTheme(mjml: string, themes: Theme[]): string | null {
  const bg = /<mj-body[^>]*background-color="([^"]+)"/.exec(mjml)?.[1]?.toLowerCase();
  return themes.find((t) => t.colors.bg.toLowerCase() === bg)?.id || null;
}

/** Email vuota, nei colori del tema (se c'è) */
export function blankMjml(theme: Theme | null | undefined): string {
  const c = theme?.colors || { bg: '#f4f4f5', surface: '#ffffff', text: '#18181b', muted: '#52525b' };
  const fh = theme?.fonts.heading || 'Helvetica, Arial, sans-serif';
  const fb = theme?.fonts.body || 'Helvetica, Arial, sans-serif';
  const fonts = (theme?.webFonts || []).map((f) => `<mj-font name="${f.name}" href="${f.href}"></mj-font>`).join('');
  const logo = theme ? `<mj-image src="${ph(theme, 280, 80, 'LOGO', 'surface', 'accent')}" alt="Logo" width="140px" padding="0px 0px 24px 0px"></mj-image>` : '';
  return `<mjml>${fonts ? `<mj-head>${fonts}</mj-head>` : ''}
  <mj-body background-color="${c.bg}" width="600px">
    <mj-section background-color="${c.surface}" padding="40px 40px">
      <mj-column>
        ${logo}
        <mj-text font-family="${fh}" font-size="24px" font-weight="700" color="${c.text}" padding="0px 0px 12px 0px">Nuova email</mj-text>
        <mj-text font-family="${fb}" font-size="16px" line-height="1.6" color="${c.muted}" padding="0px">Trascina qui i blocchi dal pannello a sinistra, oppure cliccali per aggiungerli in fondo.</mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
}

/** MJML completo per l'anteprima di un singolo blocco */
export function blockMjml(block: Block): string {
  const head = [...(block.head?.fonts || []), ...(block.head?.styles || [])].join('');
  const bg = block.bodyBg ? ` background-color="${block.bodyBg}"` : '';
  return `<mjml>${head ? `<mj-head>${head}</mj-head>` : ''}<mj-body${bg}>${block.content}</mj-body></mjml>`;
}
