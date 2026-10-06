// Cosa mostra l'inspector per ogni tipo di elemento MJML: gruppi → controlli → attributo.
import type { Component } from 'grapesjs';

export type ControlType = 'text' | 'number' | 'select' | 'segmented' | 'toggle' | 'color' | 'spacing' | 'border' | 'font' | 'image';
export interface SegOption { value: string; icon?: string; label?: string; title?: string }
export interface ControlDef {
  type: ControlType;
  attr: string;
  label: string;
  placeholder?: string;
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
  options?: any[];
  defaultLabel?: string;
  fallback?: string;
  on?: string;
  off?: string;
  text?: string;
  sides?: boolean;
  clearable?: boolean;
  hint?: string;
}
export interface Group { title: string; collapsed?: boolean; items: ControlDef[] }
const ALIGN: SegOption[] = [
  { value: 'left', icon: 'alignLeft', title: 'Sinistra' },
  { value: 'center', icon: 'alignCenter', title: 'Centro' },
  { value: 'right', icon: 'alignRight', title: 'Destra' },
];
const ALIGN_J = [...ALIGN, { value: 'justify', icon: 'alignJustify', title: 'Giustificato' }];
const VALIGN: SegOption[] = [
  { value: 'top', icon: 'vTop', title: 'In alto' },
  { value: 'middle', icon: 'vMiddle', title: 'Al centro' },
  { value: 'bottom', icon: 'vBottom', title: 'In basso' },
];
const WEIGHTS = [['400', 'Normale'], ['300', 'Leggero'], ['500', 'Medio'], ['600', 'Semi-grassetto'], ['700', 'Grassetto'], ['800', 'Extra-grassetto']];
const TRANSFORM = [['none', 'Nessuna'], ['uppercase', 'MAIUSCOLO'], ['lowercase', 'minuscolo'], ['capitalize', 'Iniziali Maiuscole']];

const typography = (o: { lineHeight?: boolean } = {}): ControlDef[] => [
  { type: 'font', attr: 'font-family', label: 'Font' },
  { type: 'number', attr: 'font-size', label: 'Dimensione', units: ['px'], min: 8, max: 96 },
  { type: 'select', attr: 'font-weight', label: 'Peso', options: WEIGHTS },
  ...(o.lineHeight !== false ? [{ type: 'text', attr: 'line-height', label: 'Interlinea', placeholder: 'es. 1.5 o 24px' } as ControlDef] : []),
  { type: 'number', attr: 'letter-spacing', label: 'Spaziatura lettere', units: ['px', 'em'], step: 0.5 },
  { type: 'select', attr: 'text-transform', label: 'Maiuscole', options: TRANSFORM },
  { type: 'color', attr: 'color', label: 'Colore testo' },
];

const linkGroup = (title = 'Link'): Group => ({
  title, items: [
    { type: 'text', attr: 'href', label: 'URL', placeholder: 'https://…' },
    { type: 'toggle', attr: 'target', label: 'Apertura', on: '_blank', off: '_self', text: 'In una nuova scheda' },
  ],
});

const sectionLike: Group[] = [
  { title: 'Layout', items: [
    { type: 'color', attr: 'background-color', label: 'Sfondo' },
    { type: 'spacing', attr: 'padding', label: 'Spaziatura interna' },
    { type: 'segmented', attr: 'text-align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
    { type: 'toggle', attr: 'full-width', label: 'Larghezza', on: 'full-width', text: 'Sfondo a tutta pagina' },
  ] },
  { title: 'Immagine di sfondo', collapsed: true, items: [
    { type: 'image', attr: 'background-url', label: 'Immagine', clearable: true },
    { type: 'select', attr: 'background-size', label: 'Adattamento', options: [['cover', 'Riempi (cover)'], ['contain', 'Contieni'], ['auto', 'Originale']] },
    { type: 'select', attr: 'background-repeat', label: 'Ripetizione', options: [['no-repeat', 'Nessuna'], ['repeat', 'Ripeti']] },
    { type: 'select', attr: 'background-position', label: 'Posizione', options: [['center center', 'Centro'], ['top center', 'In alto'], ['bottom center', 'In basso']] },
  ] },
  { title: 'Bordo', collapsed: true, items: [
    { type: 'border', attr: 'border', label: 'Bordo' },
    { type: 'number', attr: 'border-radius', label: 'Angoli', units: ['px'] },
  ] },
];

export const SCHEMA: Record<string, Group[]> = {
  'mj-body': [
    { title: 'Email', items: [
      { type: 'color', attr: 'background-color', label: 'Colore di sfondo' },
      { type: 'number', attr: 'width', label: 'Larghezza contenuto', units: ['px'], min: 320, max: 900, step: 10 },
    ] },
  ],
  'mj-section': sectionLike,
  'mj-wrapper': sectionLike,
  'mj-column': [
    { title: 'Colonna', items: [
      { type: 'number', attr: 'width', label: 'Larghezza', units: ['%', 'px'] },
      { type: 'segmented', attr: 'vertical-align', label: 'Allineamento verticale', options: VALIGN, fallback: 'top' },
      { type: 'color', attr: 'background-color', label: 'Sfondo' },
      { type: 'spacing', attr: 'padding', label: 'Spaziatura interna' },
    ] },
    { title: 'Bordo', collapsed: true, items: [
      { type: 'border', attr: 'border', label: 'Bordo' },
      { type: 'number', attr: 'border-radius', label: 'Angoli', units: ['px'] },
    ] },
  ],
  'mj-group': [
    { title: 'Gruppo colonne', items: [
      { type: 'color', attr: 'background-color', label: 'Sfondo' },
      { type: 'segmented', attr: 'vertical-align', label: 'Allineamento verticale', options: VALIGN, fallback: 'top' },
    ] },
  ],
  'mj-text': [
    { title: 'Testo', items: [
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN_J, fallback: 'left' },
      ...typography(),
    ] },
    { title: 'Spaziatura e sfondo', items: [
      { type: 'spacing', attr: 'padding', label: 'Spaziatura' },
      { type: 'color', attr: 'container-background-color', label: 'Sfondo' },
    ] },
  ],
  'mj-button': [
    linkGroup('Link del bottone'),
    { title: 'Aspetto', items: [
      { type: 'color', attr: 'background-color', label: 'Colore bottone' },
      { type: 'number', attr: 'border-radius', label: 'Angoli', units: ['px'] },
      { type: 'border', attr: 'border', label: 'Bordo' },
      { type: 'spacing', attr: 'inner-padding', label: 'Spaziatura interna', sides: false },
      { type: 'number', attr: 'width', label: 'Larghezza', units: ['px', '%'] },
    ] },
    { title: 'Testo', collapsed: true, items: typography({ lineHeight: false }) },
    { title: 'Posizione', items: [
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
      { type: 'spacing', attr: 'padding', label: 'Margini' },
    ] },
  ],
  'mj-image': [
    { title: 'Immagine', items: [
      { type: 'image', attr: 'src', label: 'File' },
      { type: 'text', attr: 'alt', label: 'Testo alternativo', placeholder: 'Descrivi l’immagine' },
      { type: 'number', attr: 'width', label: 'Larghezza', units: ['px'], placeholder: 'auto' },
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
      { type: 'number', attr: 'border-radius', label: 'Angoli', units: ['px'] },
    ] },
    linkGroup('Link sull’immagine'),
    { title: 'Spaziatura e bordo', collapsed: true, items: [
      { type: 'spacing', attr: 'padding', label: 'Spaziatura' },
      { type: 'border', attr: 'border', label: 'Bordo' },
      { type: 'color', attr: 'container-background-color', label: 'Sfondo' },
    ] },
  ],
  'mj-divider': [
    { title: 'Divisore', items: [
      { type: 'color', attr: 'border-color', label: 'Colore' },
      { type: 'number', attr: 'border-width', label: 'Spessore', units: ['px'] },
      { type: 'select', attr: 'border-style', label: 'Stile', options: [['solid', 'Continuo'], ['dashed', 'Tratteggio'], ['dotted', 'Punti']] },
      { type: 'number', attr: 'width', label: 'Larghezza', units: ['%', 'px'] },
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
      { type: 'spacing', attr: 'padding', label: 'Spaziatura' },
    ] },
  ],
  'mj-spacer': [
    { title: 'Spazio', items: [
      { type: 'number', attr: 'height', label: 'Altezza', units: ['px'], min: 0 },
      { type: 'color', attr: 'container-background-color', label: 'Sfondo' },
    ] },
  ],
  'mj-social': [
    { title: 'Social', items: [
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
      { type: 'select', attr: 'mode', label: 'Disposizione', options: [['horizontal', 'Orizzontale'], ['vertical', 'Verticale']] },
      { type: 'number', attr: 'icon-size', label: 'Dimensione icone', units: ['px'] },
      { type: 'number', attr: 'border-radius', label: 'Angoli icone', units: ['px'] },
      { type: 'spacing', attr: 'icon-padding', label: 'Spazio attorno all’icona', sides: false },
      { type: 'spacing', attr: 'padding', label: 'Spaziatura' },
    ] },
  ],
  'mj-social-element': [
    { title: 'Icona social', items: [
      { type: 'select', attr: 'name', label: 'Rete', defaultLabel: '—', options: [
        ['facebook-noshare', 'Facebook'], ['instagram-noshare', 'Instagram'], ['linkedin-noshare', 'LinkedIn'], ['youtube-noshare', 'YouTube'],
        ['x-noshare', 'X'], ['pinterest-noshare', 'Pinterest'], ['github-noshare', 'GitHub'], ['web', 'Sito web'],
      ] },
      { type: 'text', attr: 'href', label: 'URL profilo', placeholder: 'https://…' },
      { type: 'color', attr: 'background-color', label: 'Colore icona' },
      { type: 'image', attr: 'src', label: 'Icona personalizzata', clearable: true },
      { type: 'text', attr: 'alt', label: 'Testo alternativo' },
    ] },
  ],
  'mj-navbar': [
    { title: 'Menu', items: [
      { type: 'segmented', attr: 'align', label: 'Allineamento', options: ALIGN, fallback: 'center' },
      { type: 'toggle', attr: 'hamburger', label: 'Su mobile', on: 'hamburger', text: 'Menu a scomparsa' },
      { type: 'color', attr: 'ico-color', label: 'Colore icona menu' },
    ] },
  ],
  'mj-navbar-link': [
    linkGroup('Voce di menu'),
    { title: 'Testo', items: [...typography({ lineHeight: false }), { type: 'spacing', attr: 'padding', label: 'Spaziatura' }] },
  ],
  'mj-hero': [
    { title: 'Hero', items: [
      { type: 'select', attr: 'mode', label: 'Altezza', options: [['fixed-height', 'Fissa'], ['fluid-height', 'Adattiva']] },
      { type: 'number', attr: 'height', label: 'Altezza', units: ['px'] },
      { type: 'color', attr: 'background-color', label: 'Sfondo' },
      { type: 'image', attr: 'background-url', label: 'Immagine di sfondo', clearable: true },
      { type: 'segmented', attr: 'vertical-align', label: 'Contenuto', options: VALIGN, fallback: 'top' },
      { type: 'spacing', attr: 'padding', label: 'Spaziatura' },
    ] },
  ],
};

// Link dentro un blocco di testo
SCHEMA.a = [
  { title: 'Link', items: [
    { type: 'text', attr: 'href', label: 'URL', placeholder: 'https://…' },
    { type: 'toggle', attr: 'target', label: 'Apertura', on: '_blank', text: 'In una nuova scheda' },
    { type: 'text', attr: 'title', label: 'Titolo (tooltip)' },
  ] },
];

export const NAMES: Record<string, string> = {
  a: 'Link', span: 'Testo formattato', strong: 'Grassetto', b: 'Grassetto', em: 'Corsivo', i: 'Corsivo', u: 'Sottolineato',
  ul: 'Elenco', ol: 'Elenco numerato', li: 'Voce di elenco', p: 'Paragrafo', br: 'A capo', table: 'Tabella', tr: 'Riga', td: 'Cella',
  mjml: 'Documento', 'mj-head': 'Intestazione', 'mj-body': 'Email', 'mj-section': 'Sezione', 'mj-wrapper': 'Gruppo di sezioni',
  'mj-column': 'Colonna', 'mj-group': 'Gruppo di colonne', 'mj-text': 'Testo', 'mj-button': 'Bottone', 'mj-image': 'Immagine',
  'mj-divider': 'Divisore', 'mj-spacer': 'Spazio', 'mj-social': 'Social', 'mj-social-element': 'Icona social',
  'mj-navbar': 'Menu', 'mj-navbar-link': 'Voce di menu', 'mj-hero': 'Hero', 'mj-raw': 'HTML', 'mj-font': 'Font', 'mj-style': 'Stile CSS',
};

export const tagOf = (c: Component | null | undefined): string => c?.get('tagName') || c?.get('type') || '';
export const nameOf = (c: Component | null | undefined): string => NAMES[tagOf(c)] || c?.getName?.() || tagOf(c);
