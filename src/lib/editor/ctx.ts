import type { Theme } from '$lib/types';

/** Accesso agli attributi MJML dell'elemento selezionato, passato a ogni controllo dell'inspector */
export interface Ctx {
  get(name: string): string | undefined;
  /** true se il valore è quello predefinito di grapesjs-mjml (non impostato dall'utente) */
  isDefault(name: string): boolean;
  /** null = rimuove l'attributo (torna al valore predefinito di MJML) */
  set(name: string, value: string | null, opts?: { clear?: string[] }): void;
  theme: Theme | null;
  pickImage(cb: (src: string) => void): void;
}

export const parseNum = (v: string | undefined) => {
  const m = /^\s*(-?\d*\.?\d+)\s*(px|%|em)?\s*$/.exec(v || '');
  return m ? { n: m[1], u: m[2] || '' } : null;
};

export const COLOR_NAMES: Record<string, string> = {
  bg: 'Sfondo email', surface: 'Superficie', text: 'Testo', muted: 'Testo secondario', subtle: 'Note',
  border: 'Bordi', accent: 'Accento', accentSoft: 'Accento chiaro', accentDark: 'Accento scuro',
  dark: 'Scuro', onDark: 'Testo su scuro', sale: 'Sconto',
};

export const SAFE_FONTS: [string, string][] = [
  ['Arial, Helvetica, sans-serif', 'Arial'],
  ["'Helvetica Neue', Helvetica, Arial, sans-serif", 'Helvetica'],
  ['Georgia, serif', 'Georgia'],
  ["'Times New Roman', Times, serif", 'Times New Roman'],
  ['Verdana, Geneva, sans-serif', 'Verdana'],
  ["'Trebuchet MS', Helvetica, sans-serif", 'Trebuchet MS'],
  ["'Courier New', Courier, monospace", 'Courier New'],
];
