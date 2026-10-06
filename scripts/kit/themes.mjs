// Temi del kit. Ogni blocco usa SOLO questi token, così cambiando tema cambia tutto in modo coerente.
//
// Per aggiungere un tema: copia uno degli oggetti, cambia id/label/valori e rilancia `npm run kit`.
// Regola: dentro un tema i colori devono essere tutti diversi tra loro e i due font devono essere
// stringhe diverse; serve al "Cambia stile" nell'editor, che converte un token nell'altro.

export const THEMES = [
  {
    id: 'pulito',
    label: 'Pulito',
    description: 'Neutro e moderno: bianco, grigi freddi, accento blu.',
    colors: {
      bg: '#f3f4f6',          // sfondo dell'email
      surface: '#ffffff',     // sfondo delle sezioni, testo su colore d'accento
      text: '#111827',        // testo principale e titoli
      muted: '#4b5563',       // testo secondario
      subtle: '#9ca3af',      // note, prezzi barrati
      border: '#e5e7eb',      // linee e bordi
      accent: '#2563eb',      // bottoni, link, evidenze
      accentSoft: '#eff6ff',  // riquadri evidenziati
      accentDark: '#1e40af',  // testo su accentSoft
      dark: '#0f172a',        // footer/sezioni scure
      onDark: '#cbd5e1',      // testo su sfondo scuro
      sale: '#dc2626',        // prezzi scontati, badge
    },
    fonts: {
      heading: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
      body: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    webFonts: [{ name: 'Inter', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }],
    headingWeight: '700',
    radiusBtn: '6px',
    radiusCard: '10px',
    placeholderFont: 'lato',
  },
  {
    id: 'editoriale',
    label: 'Editoriale',
    description: 'Da rivista: titoli serif, toni crema, accento ruggine.',
    colors: {
      bg: '#f4efe6',
      surface: '#fffdf8',
      text: '#1c1917',
      muted: '#57534e',
      subtle: '#a8a29e',
      border: '#e7e0d3',
      accent: '#9a3412',
      accentSoft: '#f6ebe0',
      accentDark: '#7c2d12',
      dark: '#292524',
      onDark: '#d6d3d1',
      sale: '#b91c1c',
    },
    fonts: {
      heading: "'Playfair Display', Georgia, 'Times New Roman', serif",
      body: "Georgia, 'Times New Roman', Times, serif",
    },
    webFonts: [{ name: 'Playfair Display', href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' }],
    headingWeight: '700',
    radiusBtn: '0px',
    radiusCard: '2px',
    placeholderFont: 'playfair-display',
  },
  {
    id: 'vivace',
    label: 'Vivace',
    description: 'E-commerce: corallo acceso, bottoni a pillola, angoli morbidi.',
    colors: {
      bg: '#fff4ee',
      surface: '#ffffff',
      text: '#231f20',
      muted: '#5b5555',
      subtle: '#a39e9e',
      border: '#f3e1d8',
      accent: '#f2542d',
      accentSoft: '#ffe4d9',
      accentDark: '#c2410c',
      dark: '#2b1d1a',
      onDark: '#f5d0c5',
      sale: '#e11d48',
    },
    fonts: {
      heading: 'Poppins, Arial, Helvetica, sans-serif',
      body: 'Arial, Helvetica, sans-serif',
    },
    webFonts: [{ name: 'Poppins', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap' }],
    headingWeight: '700',
    radiusBtn: '999px',
    radiusCard: '16px',
    placeholderFont: 'poppins',
  },
];

export function checkTheme(t) {
  const vals = Object.values(t.colors).map((v) => v.toLowerCase());
  const dup = vals.filter((v, i) => vals.indexOf(v) !== i);
  if (dup.length) throw new Error(`Tema ${t.id}: colori duplicati ${dup.join(', ')}`);
  if (vals.some((v) => !/^#[0-9a-f]{6}$/.test(v))) throw new Error(`Tema ${t.id}: usa colori #rrggbb`);
  if (t.fonts.heading === t.fonts.body) throw new Error(`Tema ${t.id}: heading e body devono essere stringhe diverse`);
}
