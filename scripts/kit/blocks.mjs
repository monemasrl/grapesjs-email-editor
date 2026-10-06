// Catalogo dei blocchi del kit. Ogni blocco è una funzione (tema, opzioni) → MJML di una sezione.
// Le opzioni (o) permettono ai template d'esempio di cambiare i testi principali.
import { URL, ph, logo, section, column, wrapper, text, a, button, image, divider, spacer, social, navbar, price, badge } from './helpers.mjs';

const LOREM = 'Un testo breve che spiega il messaggio principale: cosa offri, perché è utile e cosa deve fare chi legge.';

export const CATEGORIES = ['Header', 'Hero', 'Testo', 'Testo + immagine', 'Colonne', 'Immagine', 'Logo',
  'Prodotto singolo', 'Prodotti', 'CTA', 'Social', 'Separatori', 'Footer'];

const legal = (t, color = 'muted', linkColor = 'text') => text(t,
  `Nome Azienda S.r.l. · Via Roma 1, 50100 Firenze (FI) · P.IVA 01234567890<br/>Ricevi questa email perché sei iscritto alla nostra newsletter.<br/>${a(t, 'Disiscriviti', linkColor)} · ${a(t, 'Preferenze', linkColor)} · ${a(t, 'Privacy', linkColor)}`,
  { kind: 'small', color, align: 'center', size: '12px', pad: '0px' });

export const BLOCKS = [
  // ───────────── HEADER ─────────────
  {
    key: 'header-logo', category: 'Header', label: 'Logo centrato',
    mjml: (t) => section(t, column(image(t, logo(t), { alt: 'Logo', width: '140px', href: URL })), { pad: '24px 24px' }),
  },
  {
    key: 'header-logo-link', category: 'Header', label: 'Logo + "Vedi online"',
    mjml: (t) => section(t,
      column(image(t, logo(t), { alt: 'Logo', width: '120px', align: 'left', href: URL }), { width: '50%', valign: 'middle' }) +
      column(text(t, a(t, 'Visualizza nel browser', 'muted'), { kind: 'small', align: 'right', pad: '0px' }), { width: '50%', valign: 'middle' }),
      { pad: '20px 24px' }),
  },
  {
    key: 'header-menu', category: 'Header', label: 'Logo + menu',
    mjml: (t) => section(t,
      column(image(t, logo(t), { alt: 'Logo', width: '140px', href: URL, pad: '0px 0px 8px 0px' }) +
        navbar(t, ['Novità', 'Collezioni', 'Offerte', 'Contatti'])),
      { pad: '24px 16px 8px 16px' }),
  },
  {
    key: 'header-annuncio', category: 'Header', label: 'Barra annuncio + logo e link',
    mjml: (t) => wrapper(t,
      section(t, column(text(t, 'Spedizione gratuita per ordini sopra 50 €', { kind: 'small', color: 'surface', align: 'center', weight: '700', pad: '0px' })), { bg: 'accent', pad: '10px 24px' }) +
      section(t,
        column(image(t, logo(t), { alt: 'Logo', width: '120px', align: 'left', href: URL }), { width: '40%', valign: 'middle' }) +
        column(text(t, `${a(t, 'Shop', 'text')}&nbsp;&nbsp;&nbsp;${a(t, 'Novità', 'text')}&nbsp;&nbsp;&nbsp;${a(t, 'Account', 'text')}`, { size: '14px', align: 'right', pad: '0px' }), { width: '60%', valign: 'middle' }),
        { pad: '18px 24px' })),
  },

  // ───────────── HERO ─────────────
  {
    key: 'hero-immagine', category: 'Hero', label: 'Immagine + titolo + bottone',
    mjml: (t, o = {}) => section(t, column(
      image(t, ph(t, 1200, 640, 'Immagine principale'), { alt: 'Immagine principale', href: URL }) +
      text(t, o.title || 'La nuova collezione è arrivata', { kind: 'h1', align: 'center', pad: '32px 40px 12px 40px' }) +
      text(t, o.text || LOREM, { align: 'center', pad: '0px 48px 8px 48px' }) +
      button(t, o.cta || 'Scopri di più', { align: 'center', pad: '16px 40px 40px 40px' })), { pad: '0px' }),
  },
  {
    key: 'hero-colore', category: 'Hero', label: 'Titolo su colore',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.label || 'Solo per pochi giorni', { kind: 'label', color: 'accentSoft', align: 'center' }) +
      text(t, o.title || 'Fino al 40% su tutto il catalogo', { kind: 'h1', color: 'surface', align: 'center', size: '36px' }) +
      text(t, o.text || 'Approfitta dei saldi di stagione: i prezzi più bassi dell’anno, spedizione inclusa.', { color: 'accentSoft', align: 'center', pad: '0px 24px 12px 24px' }) +
      button(t, o.cta || 'Vai allo shop', { variant: 'light', align: 'center', pad: '12px 0px 0px 0px' })),
      { bg: 'accent', pad: '56px 32px' }),
  },
  {
    key: 'hero-sfondo', category: 'Hero', label: 'Testo su immagine di sfondo',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.label || 'Novità', { kind: 'label', color: 'onDark', align: 'center' }) +
      text(t, o.title || 'Progettato per durare', { kind: 'h1', color: 'surface', align: 'center', size: '38px' }) +
      text(t, o.text || 'Materiali scelti, dettagli curati e una garanzia di due anni.', { color: 'onDark', align: 'center', pad: '0px 40px 12px 40px' }) +
      button(t, o.cta || 'Guarda il prodotto', { align: 'center', pad: '12px 0px 0px 0px' })),
      { bg: 'dark', bgUrl: ph(t, 1200, 760, 'Immagine di sfondo', 'dark', 'muted'), pad: '96px 32px' }),
  },
  {
    key: 'hero-affiancato', category: 'Hero', label: 'Immagine e testo affiancati',
    mjml: (t, o = {}) => section(t,
      column(image(t, ph(t, 560, 560, 'Immagine'), { alt: 'Immagine', radius: true, pad: '0px 12px 0px 0px' }), { width: '50%', valign: 'middle' }) +
      column(
        text(t, o.label || 'In evidenza', { kind: 'label', pad: '16px 0px 8px 12px' }) +
        text(t, o.title || 'Il momento giusto per iniziare', { kind: 'h2', pad: '0px 0px 12px 12px' }) +
        text(t, o.text || LOREM, { pad: '0px 0px 8px 12px' }) +
        button(t, o.cta || 'Inizia ora', { pad: '8px 0px 0px 12px' }),
        { width: '50%', valign: 'middle' }),
      { pad: '32px 24px' }),
  },

  // ───────────── TESTO ─────────────
  {
    key: 'testo-titolo', category: 'Testo', label: 'Titolo e paragrafo',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.title || 'Un titolo chiaro e diretto', { kind: 'h2' }) +
      text(t, o.text || `${LOREM} Puoi aggiungere ${a(t, 'un link')} o mettere in <strong>grassetto</strong> le parti importanti.`, { pad: '0px' })),
      { pad: '32px 40px' }),
  },
  {
    key: 'testo-paragrafo', category: 'Testo', label: 'Paragrafo',
    mjml: (t, o = {}) => section(t, column(text(t, o.text || `${LOREM} ${LOREM}`, { pad: '0px' })), { pad: '16px 40px' }),
  },
  {
    key: 'testo-citazione', category: 'Testo', label: 'Citazione',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.text || '“Ordinare è stato semplicissimo e il prodotto è arrivato in due giorni. Lo consiglio a tutti.”', { font: 'heading', size: '20px', lh: '1.5', italic: true, color: 'text', weight: '400' }) +
      text(t, o.author || '— Giulia R., cliente dal 2021', { kind: 'small', color: 'muted', pad: '0px' }),
      { bg: 'accentSoft', borderLeft: `4px solid ${t.colors.accent}`, pad: '24px 28px' }, t),
      { pad: '24px 40px' }),
  },
  {
    key: 'testo-elenco', category: 'Testo', label: 'Elenco puntato',
    mjml: (t) => section(t, column(
      text(t, 'Cosa trovi in questo numero', { kind: 'h3' }) +
      text(t, `<ul style="margin:0;padding:0 0 0 20px;">
<li style="margin:0 0 8px 0;">Le novità del mese e i prodotti più richiesti</li>
<li style="margin:0 0 8px 0;">Una guida pratica per scegliere quello giusto</li>
<li style="margin:0;">Un codice sconto riservato agli iscritti</li></ul>`, { pad: '0px' })),
      { pad: '24px 40px' }),
  },
  {
    key: 'testo-firma', category: 'Testo', label: 'Saluto e firma',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.greeting || 'Ciao Mario,', { color: 'text', weight: '700' }) +
      text(t, o.text || 'grazie per essere con noi. Se hai domande rispondi pure a questa email: ti leggiamo sempre.') +
      text(t, `A presto,<br/><span style="color:${t.colors.text};font-weight:700;">${o.signature || 'Il team di Nome Azienda'}</span>`, { pad: '0px' })),
      { pad: '24px 40px 32px 40px' }),
  },

  // ───────────── TESTO + IMMAGINE ─────────────
  {
    key: 'ti-img-sx', category: 'Testo + immagine', label: 'Immagine a sinistra',
    mjml: (t, o = {}) => section(t,
      column(image(t, ph(t, 480, 360, 'Immagine'), { alt: '', radius: true }), { width: '42%', valign: 'middle' }) +
      column(
        text(t, o.title || 'Un argomento in evidenza', { kind: 'h3', pad: '12px 0px 8px 20px' }) +
        text(t, o.text || LOREM, { size: '15px', pad: '0px 0px 8px 20px' }) +
        text(t, a(t, 'Leggi tutto →'), { size: '15px', weight: '700', pad: '0px 0px 0px 20px' }),
        { width: '58%', valign: 'middle' }),
      { pad: '20px 32px' }),
  },
  {
    key: 'ti-img-dx', category: 'Testo + immagine', label: 'Immagine a destra',
    mjml: (t, o = {}) => section(t,
      column(
        text(t, o.title || 'Un secondo approfondimento', { kind: 'h3', pad: '12px 20px 8px 0px' }) +
        text(t, o.text || LOREM, { size: '15px', pad: '0px 20px 8px 0px' }) +
        text(t, a(t, 'Leggi tutto →'), { size: '15px', weight: '700', pad: '0px 20px 0px 0px' }),
        { width: '58%', valign: 'middle' }) +
      column(image(t, ph(t, 480, 360, 'Immagine'), { alt: '', radius: true }), { width: '42%', valign: 'middle' }),
      { pad: '20px 32px' }),
  },
  {
    key: 'ti-img-sopra', category: 'Testo + immagine', label: 'Immagine sopra, testo sotto',
    mjml: (t, o = {}) => section(t, column(
      image(t, ph(t, 1040, 520, 'Immagine articolo'), { alt: '', radius: true, pad: '0px 0px 20px 0px' }) +
      text(t, o.title || 'Il titolo dell’articolo', { kind: 'h2' }) +
      text(t, o.text || LOREM) +
      text(t, a(t, 'Continua a leggere →'), { weight: '700', pad: '0px' })),
      { pad: '28px 40px' }),
  },

  // ───────────── COLONNE ─────────────
  {
    key: 'colonne-1', category: 'Colonne', label: '1 colonna (riquadro)',
    mjml: (t) => section(t, column(
      text(t, 'Lo sapevi?', { kind: 'label', color: 'accentDark' }) +
      text(t, 'Un riquadro per mettere in risalto un’informazione', { kind: 'h3', color: 'accentDark' }) +
      text(t, LOREM, { color: 'accentDark', size: '15px', pad: '0px' }),
      { bg: 'accentSoft', radius: t.radiusCard, pad: '28px 28px' }, t), { pad: '16px 32px' }),
  },
  {
    key: 'colonne-2', category: 'Colonne', label: '2 colonne',
    mjml: (t) => section(t, ['Primo argomento', 'Secondo argomento'].map((title, i) => column(
      image(t, ph(t, 520, 320, `Immagine ${i + 1}`), { alt: '', radius: true, pad: '0px 0px 16px 0px' }) +
      text(t, title, { kind: 'h3', pad: '0px 0px 8px 0px' }) +
      text(t, 'Due righe di descrizione per presentare il contenuto.', { size: '15px', pad: '0px 0px 8px 0px' }) +
      text(t, a(t, 'Scopri →'), { size: '15px', weight: '700', pad: '0px' }),
      { width: '50%', pad: i ? '0px 0px 0px 12px' : '0px 12px 0px 0px' })).join(''), { pad: '24px 28px' }),
  },
  {
    key: 'colonne-3', category: 'Colonne', label: '3 colonne',
    mjml: (t) => section(t, [['Spedizione veloce', '24/48 ore in tutta Italia'], ['Reso gratuito', 'Entro 30 giorni'], ['Pagamenti sicuri', 'Carta, PayPal, bonifico']].map(([title, sub], i) => column(
      image(t, ph(t, 112, 112, `${i + 1}`, 'accentSoft', 'accent'), { alt: '', width: '56px', pad: '0px 0px 12px 0px' }) +
      text(t, title, { kind: 'h3', size: '16px', align: 'center', pad: '0px 8px 4px 8px' }) +
      text(t, sub, { size: '14px', align: 'center', pad: '0px 8px' }),
      { width: '33.33%' })).join(''), { pad: '28px 16px' }),
  },

  // ───────────── IMMAGINE ─────────────
  {
    key: 'immagine-piena', category: 'Immagine', label: 'Immagine a tutta larghezza',
    mjml: (t) => section(t, column(image(t, ph(t, 1200, 600, 'Immagine'), { alt: 'Immagine', href: URL })), { pad: '0px' }),
  },
  {
    key: 'immagine-didascalia', category: 'Immagine', label: 'Immagine con didascalia',
    mjml: (t) => section(t, column(
      image(t, ph(t, 1040, 640, 'Immagine'), { alt: '', radius: true, pad: '0px 0px 10px 0px' }) +
      text(t, 'Didascalia: una riga per descrivere l’immagine.', { kind: 'small', align: 'center', italic: true, pad: '0px' })),
      { pad: '24px 40px' }),
  },
  {
    key: 'immagine-doppia', category: 'Immagine', label: 'Due immagini',
    mjml: (t) => section(t,
      column(image(t, ph(t, 520, 520, 'Immagine 1'), { alt: '', radius: true, pad: '0px 8px 0px 0px' }), { width: '50%' }) +
      column(image(t, ph(t, 520, 520, 'Immagine 2'), { alt: '', radius: true, pad: '0px 0px 0px 8px' }), { width: '50%' }),
      { pad: '16px 32px' }),
  },

  // ───────────── LOGO ─────────────
  {
    key: 'logo-payoff', category: 'Logo', label: 'Logo con payoff',
    mjml: (t) => section(t, column(
      image(t, logo(t), { alt: 'Logo', width: '180px', href: URL, pad: '0px 0px 12px 0px' }) +
      text(t, 'Il tuo payoff in una riga', { kind: 'label', color: 'muted', align: 'center', pad: '0px' })),
      { pad: '40px 24px' }),
  },
  {
    key: 'logo-partner', category: 'Logo', label: 'Loghi partner',
    mjml: (t) => wrapper(t,
      section(t, column(text(t, 'Ci hanno scelto', { kind: 'label', color: 'muted', align: 'center', pad: '0px' })), { pad: '28px 24px 8px 24px' }) +
      section(t, [1, 2, 3, 4].map((n) => column(image(t, ph(t, 240, 100, `Partner ${n}`, 'bg', 'subtle'), { alt: `Partner ${n}`, width: '120px', pad: '8px' }), { width: '25%' })).join(''), { pad: '0px 16px 28px 16px' })),
  },

  // ───────────── PRODOTTO SINGOLO ─────────────
  {
    key: 'prodotto-centrato', category: 'Prodotto singolo', label: 'Prodotto centrato',
    mjml: (t, o = {}) => section(t, column(
      image(t, ph(t, 760, 760, o.img || 'Prodotto', 'bg', 'muted'), { alt: 'Prodotto', width: '380px', radius: true, href: URL, pad: '0px 0px 20px 0px' }) +
      text(t, o.name || 'Nome del prodotto', { kind: 'h2', align: 'center', pad: '0px 0px 8px 0px' }) +
      text(t, o.desc || 'Descrizione breve: materiale, misura, il motivo per sceglierlo.', { align: 'center', size: '15px', pad: '0px 32px 8px 32px' }) +
      text(t, price(t, o.price || '49,00 €'), { kind: 'h3', align: 'center', size: '22px', pad: '4px 0px 8px 0px' }) +
      button(t, o.cta || 'Acquista ora', { align: 'center' })),
      { pad: '36px 32px' }),
  },
  {
    key: 'prodotto-affiancato', category: 'Prodotto singolo', label: 'Prodotto affiancato (in sconto)',
    mjml: (t, o = {}) => section(t,
      column(image(t, ph(t, 560, 560, 'Prodotto', 'bg', 'muted'), { alt: 'Prodotto', radius: true, href: URL, pad: '0px 12px 0px 0px' }), { width: '50%', valign: 'middle' }) +
      column(
        text(t, badge(t, o.badge || '-30%'), { pad: '12px 0px 12px 12px' }) +
        text(t, o.name || 'Nome del prodotto', { kind: 'h2', pad: '0px 0px 6px 12px' }) +
        text(t, `<span style="color:${t.colors.accent};">★★★★★</span> 4,8 (126 recensioni)`, { kind: 'small', color: 'muted', pad: '0px 0px 10px 12px' }) +
        text(t, price(t, o.price || '59,00 €', o.before || '84,00 €'), { kind: 'h3', size: '22px', pad: '0px 0px 8px 12px' }) +
        button(t, o.cta || 'Aggiungi al carrello', { pad: '8px 0px 0px 12px' }),
        { width: '50%', valign: 'middle' }),
      { pad: '32px 24px' }),
  },
  {
    key: 'prodotto-evidenza', category: 'Prodotto singolo', label: 'Prodotto in evidenza',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.label || 'Prodotto del mese', { kind: 'label', align: 'center', color: 'accentDark' }) +
      text(t, o.name || 'Nome del prodotto', { kind: 'h1', align: 'center', size: '30px', color: 'accentDark' }) +
      image(t, ph(t, 1000, 640, 'Prodotto', 'surface', 'muted'), { alt: 'Prodotto', radius: true, href: URL, pad: '8px 0px 20px 0px' }) +
      text(t, price(t, o.price || '129,00 €', o.before || '159,00 €'), { kind: 'h3', align: 'center', size: '24px', pad: '0px 0px 8px 0px' }) +
      button(t, o.cta || 'Lo voglio', { align: 'center', width: '260px' })),
      { bg: 'accentSoft', pad: '40px 40px' }),
  },
  {
    key: 'prodotto-riga', category: 'Prodotto singolo', label: 'Riga ordine',
    mjml: (t, o = {}) => section(t,
      column(image(t, ph(t, 200, 200, 'Foto', 'bg', 'muted'), { alt: 'Prodotto', width: '88px', radius: true, align: 'left' }), { width: '25%', valign: 'middle' }) +
      column(
        text(t, o.name || 'Nome del prodotto', { kind: 'h3', size: '16px', pad: '0px 0px 4px 0px' }) +
        text(t, o.variant || 'Taglia M · Colore blu · Qtà 1', { kind: 'small', color: 'muted', pad: '0px' }),
        { width: '50%', valign: 'middle' }) +
      column(text(t, price(t, o.price || '49,00 €'), { kind: 'h3', size: '16px', align: 'right', pad: '0px' }), { width: '25%', valign: 'middle' }),
      { pad: '12px 40px' }),
  },

  // ───────────── PRODOTTI ─────────────
  {
    key: 'prodotti-2', category: 'Prodotti', label: '2 prodotti',
    mjml: (t) => section(t, [['Prodotto A', '39,00 €'], ['Prodotto B', '45,00 €']].map(([n, p], i) => column(
      image(t, ph(t, 520, 520, n, 'bg', 'muted'), { alt: n, radius: true, href: URL, pad: '0px 0px 14px 0px' }) +
      text(t, n, { kind: 'h3', align: 'center', pad: '0px 0px 4px 0px' }) +
      text(t, price(t, p), { align: 'center', weight: '700', pad: '0px 0px 4px 0px' }) +
      button(t, 'Acquista', { variant: 'outline', align: 'center', size: '14px' }),
      { width: '50%', pad: i ? '0px 0px 0px 10px' : '0px 10px 0px 0px' })).join(''), { pad: '28px 28px' }),
  },
  {
    key: 'prodotti-3', category: 'Prodotti', label: '3 prodotti',
    mjml: (t) => section(t, [['Prodotto A', '29,00 €'], ['Prodotto B', '35,00 €'], ['Prodotto C', '42,00 €']].map(([n, p]) => column(
      image(t, ph(t, 360, 360, n, 'bg', 'muted'), { alt: n, radius: true, href: URL, pad: '0px 8px 12px 8px' }) +
      text(t, n, { kind: 'h3', size: '15px', align: 'center', pad: '0px 8px 2px 8px' }) +
      text(t, price(t, p), { size: '15px', weight: '700', align: 'center', pad: '0px 8px 4px 8px' }) +
      text(t, a(t, 'Acquista →'), { size: '14px', weight: '700', align: 'center', pad: '0px 8px' }),
      { width: '33.33%' })).join(''), { pad: '28px 16px' }),
  },
  {
    key: 'prodotti-4-griglia', category: 'Prodotti', label: '4 prodotti (griglia 2×2)',
    mjml: (t, o = {}) => {
      const cell = ([n, p, b], i) => column(
        image(t, ph(t, 520, 520, n, 'bg', 'muted'), { alt: n, radius: true, href: URL, pad: '0px 0px 12px 0px' }) +
        text(t, n, { kind: 'h3', size: '16px', align: 'center', pad: '0px 0px 2px 0px' }) +
        text(t, price(t, p, b), { size: '15px', weight: '700', align: 'center', pad: '0px 0px 20px 0px' }),
        { width: '50%', pad: i % 2 ? '0px 0px 0px 10px' : '0px 10px 0px 0px' });
      const items = [['Prodotto A', '29,00 €', '39,00 €'], ['Prodotto B', '35,00 €'], ['Prodotto C', '42,00 €', '55,00 €'], ['Prodotto D', '24,00 €']];
      return wrapper(t,
        section(t, column(text(t, o.title || 'I più venduti', { kind: 'h2', align: 'center', pad: '0px' })), { pad: '32px 24px 16px 24px' }) +
        section(t, items.slice(0, 2).map(cell).join(''), { pad: '0px 28px' }) +
        section(t, items.slice(2).map((x, i) => cell(x, i)).join(''), { pad: '0px 28px 12px 28px' }));
    },
  },
  {
    key: 'prodotti-4-riga', category: 'Prodotti', label: '4 prodotti in riga',
    mjml: (t) => section(t, [['Articolo 1', '19 €'], ['Articolo 2', '24 €'], ['Articolo 3', '29 €'], ['Articolo 4', '32 €']].map(([n, p]) => column(
      image(t, ph(t, 280, 280, n.replace('Articolo ', '#'), 'bg', 'muted'), { alt: n, radius: true, href: URL, pad: '0px 6px 10px 6px' }) +
      text(t, n, { size: '14px', weight: '700', color: 'text', align: 'center', pad: '0px 6px 2px 6px' }) +
      text(t, price(t, p), { size: '14px', align: 'center', pad: '0px 6px' }),
      { width: '25%' })).join(''), { pad: '24px 18px' }),
  },
  {
    key: 'prodotti-riepilogo', category: 'Prodotti', label: 'Riepilogo ordine (totali)',
    mjml: (t) => {
      const row = (l, v, strong) => `<tr><td style="padding:6px 0;color:${strong ? t.colors.text : t.colors.muted};${strong ? 'font-weight:700;font-size:18px;' : ''}">${l}</td><td style="padding:6px 0;text-align:right;color:${t.colors.text};${strong ? 'font-weight:700;font-size:18px;' : ''}">${v}</td></tr>`;
      return section(t, column(
        divider(t, { pad: '0px 0px 12px 0px' }) +
        text(t, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${row('Subtotale', '98,00 €')}${row('Spedizione', 'Gratuita')}${row('IVA inclusa', '17,67 €')}${row('Totale', '98,00 €', true)}</table>`, { size: '15px', pad: '0px' })),
        { pad: '8px 40px 24px 40px' });
    },
  },

  // ───────────── CTA ─────────────
  {
    key: 'cta-bottone', category: 'CTA', label: 'Bottone centrato',
    mjml: (t, o = {}) => section(t, column(button(t, o.cta || 'Scopri l’offerta', { align: 'center', pad: '0px' })), { pad: '24px 24px' }),
  },
  {
    key: 'cta-riquadro', category: 'CTA', label: 'Riquadro con bottone',
    mjml: (t, o = {}) => section(t, column(
      text(t, o.title || 'Pronto a iniziare?', { kind: 'h2', align: 'center', color: 'accentDark' }) +
      text(t, o.text || 'Registrati in un minuto e ricevi subito il 10% di sconto sul primo ordine.', { align: 'center', color: 'accentDark', pad: '0px 16px 8px 16px' }) +
      button(t, o.cta || 'Crea il tuo account', { align: 'center', pad: '12px 0px 0px 0px' }),
      { bg: 'accentSoft', radius: t.radiusCard, pad: '36px 28px' }, t), { pad: '24px 32px' }),
  },
  {
    key: 'cta-doppio', category: 'CTA', label: 'Due bottoni',
    mjml: (t) => section(t,
      column(button(t, 'Acquista ora', { align: 'right', pad: '0px 8px 8px 0px' }), { width: '50%' }) +
      column(button(t, 'Scopri di più', { variant: 'outline', align: 'left', pad: '0px 0px 8px 8px' }), { width: '50%' }),
      { pad: '24px 24px 16px 24px' }),
  },
  {
    key: 'cta-codice', category: 'CTA', label: 'Codice sconto',
    mjml: (t, o = {}) => section(t, column(
      text(t, 'Il tuo codice', { kind: 'label', align: 'center', color: 'muted' }) +
      text(t, o.code || 'BENVENUTO10', { font: 'heading', size: '30px', weight: '700', color: 'accent', ls: '4px', align: 'center', pad: '18px 12px', bg: 'accentSoft' }) +
      text(t, o.note || 'Valido fino al 31/12 su un ordine minimo di 30 €.', { kind: 'small', align: 'center', pad: '12px 0px 8px 0px' }) +
      button(t, o.cta || 'Usa il codice', { align: 'center' }),
      { border: `2px dashed ${t.colors.accent}`, radius: t.radiusCard, pad: '24px 24px' }, t), { pad: '24px 48px' }),
  },
  {
    key: 'cta-app', category: 'CTA', label: 'Scarica l’app',
    mjml: (t) => section(t,
      column(
        text(t, 'Porta tutto sempre con te', { kind: 'h3', pad: '0px 0px 6px 0px' }) +
        text(t, 'Scarica l’app per ordini più veloci e offerte dedicate.', { size: '15px', pad: '0px' }),
        { width: '55%', valign: 'middle' }) +
      column(
        image(t, ph(t, 300, 90, 'App Store', 'text', 'surface'), { alt: 'App Store', width: '130px', href: URL, align: 'right', pad: '4px 0px' }) +
        image(t, ph(t, 300, 90, 'Google Play', 'text', 'surface'), { alt: 'Google Play', width: '130px', href: URL, align: 'right', pad: '4px 0px' }),
        { width: '45%', valign: 'middle' }),
      { pad: '28px 40px' }),
  },

  // ───────────── SOCIAL ─────────────
  {
    key: 'social-barra', category: 'Social', label: 'Barra social',
    mjml: (t) => section(t, column(
      text(t, 'Seguici', { kind: 'label', color: 'muted', align: 'center' }) + social(t, { pad: '0px' })),
      { pad: '24px 24px' }),
  },

  // ───────────── SEPARATORI ─────────────
  {
    key: 'sep-linea', category: 'Separatori', label: 'Linea',
    mjml: (t) => section(t, column(divider(t)), { pad: '12px 40px' }),
  },
  {
    key: 'sep-spazio', category: 'Separatori', label: 'Spazio',
    mjml: (t) => section(t, column(spacer('32px')), { pad: '0px' }),
  },
  {
    key: 'sep-accento', category: 'Separatori', label: 'Linea corta d’accento',
    mjml: (t) => section(t, column(divider(t, { color: 'accent', bw: '3px', width: '60px' })), { pad: '20px 24px' }),
  },

  // ───────────── FOOTER ─────────────
  {
    key: 'footer-semplice', category: 'Footer', label: 'Footer semplice',
    mjml: (t) => section(t, column(legal(t)), { bg: 'bg', pad: '28px 32px' }),
  },
  {
    key: 'footer-social', category: 'Footer', label: 'Footer con social',
    mjml: (t) => section(t, column(
      social(t, { pad: '0px 0px 16px 0px' }) +
      text(t, `${a(t, 'Shop', 'text')}&nbsp;&nbsp;·&nbsp;&nbsp;${a(t, 'Assistenza', 'text')}&nbsp;&nbsp;·&nbsp;&nbsp;${a(t, 'Chi siamo', 'text')}`, { size: '14px', align: 'center', pad: '0px 0px 16px 0px' }) +
      legal(t)), { bg: 'bg', pad: '32px 32px' }),
  },
  {
    key: 'footer-scuro', category: 'Footer', label: 'Footer scuro',
    mjml: (t) => section(t, column(
      image(t, logo(t, true), { alt: 'Logo', width: '120px', href: URL, pad: '0px 0px 16px 0px' }) +
      text(t, `${a(t, 'Shop', 'surface')}&nbsp;&nbsp;&nbsp;${a(t, 'Assistenza', 'surface')}&nbsp;&nbsp;&nbsp;${a(t, 'Resi', 'surface')}&nbsp;&nbsp;&nbsp;${a(t, 'Contatti', 'surface')}`, { size: '14px', align: 'center', pad: '0px 0px 16px 0px' }) +
      social(t, { pad: '0px 0px 20px 0px' }) +
      legal(t, 'onDark', 'onDark')), { bg: 'dark', pad: '36px 32px' }),
  },
  {
    key: 'footer-colonne', category: 'Footer', label: 'Footer a colonne',
    mjml: (t) => wrapper(t,
      section(t,
        column(
          image(t, logo(t), { alt: 'Logo', width: '110px', align: 'left', pad: '0px 0px 10px 0px' }) +
          text(t, 'Via Roma 1<br/>50100 Firenze', { size: '13px', lh: '1.6', pad: '0px 0px 16px 0px' }), { width: '34%' }) +
        column(
          text(t, 'Assistenza', { kind: 'label', color: 'text', pad: '0px 0px 8px 0px' }) +
          text(t, `${a(t, 'Contattaci', 'muted')}<br/>${a(t, 'Spedizioni', 'muted')}<br/>${a(t, 'Resi', 'muted')}`, { size: '13px', lh: '1.8', pad: '0px 0px 16px 0px' }), { width: '33%' }) +
        column(
          text(t, 'Seguici', { kind: 'label', color: 'text', pad: '0px 0px 8px 0px' }) +
          social(t, { align: 'left', size: '24px', pad: '0px 0px 16px 0px' }), { width: '33%' }),
        { bg: 'bg', pad: '32px 32px 8px 32px' }) +
      section(t, column(divider(t, { pad: '0px 0px 16px 0px' }) + legal(t)), { bg: 'bg', pad: '0px 32px 28px 32px' }),
      { bg: 'bg' }),
  },
];
