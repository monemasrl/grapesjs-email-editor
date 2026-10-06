// Tipi condivisi tra client e server

export interface ThemeColors {
  bg: string; surface: string; text: string; muted: string; subtle: string; border: string;
  accent: string; accentSoft: string; accentDark: string; dark: string; onDark: string; sale: string;
}

export interface Theme {
  id: string;
  label: string;
  description: string;
  colors: ThemeColors;
  fonts: { heading: string; body: string };
  webFonts: { name: string; href: string }[];
  radiusBtn: string;
  radiusCard: string;
  placeholderFont: string;
}

export interface Template {
  id: string;
  name: string;
  group: string;
  sourceFile: string;
  sections: number;
  blocks: number;
  mjml: string;
  theme?: string;
  key?: string;
  source: string;
  sourceLabel: string;
}

export interface BlockHead { fonts: string[]; styles: string[] }

export interface Block {
  id: string;
  label: string;
  category: string;
  rule: string;
  templateId: string | null;
  content: string;
  bodyBg: string;
  head: BlockHead;
  theme?: string;
  key?: string;
  source: string;
  sourceLabel: string;
}

export interface SourceInfo {
  id: string;
  label: string;
  repo: string | null;
  sha?: string;
  license?: string;
  templates: number;
  blocks: number;
}

export interface Catalog {
  sources: SourceInfo[];
  categories: string[];
  themes: Theme[];
  defaultTheme: string | null;
  templates: Template[];
  blocks: Block[];
}

export interface SavedEmail {
  id: string;
  name: string;
  mjml: string;
  fromTemplate: string | null;
  theme: string | null;
  savedAt: string;
}

export interface UploadedAsset {
  name: string;      // nome file su disco
  src: string;       // URL pubblico
  original: string;  // nome originale del file
  size: number;
  addedAt: string;
}

/** Documento aperto nell'editor */
export interface EditorDoc {
  mjml: string;
  name: string;
  templateId?: string | null;
  savedId?: string | null;
  theme?: string | null;
}
