import { getCatalog } from './catalog';
import type { EditorDoc } from '$lib/types';

/** Dati necessari all'editor: blocchi, categorie, stili e il documento da aprire */
export function editorPayload(doc: EditorDoc) {
  const { blocks, categories, themes, sources, defaultTheme, templates } = getCatalog();
  const template = doc.templateId ? templates.find((t) => t.id === doc.templateId) ?? null : null;
  return { doc, blocks, categories, themes, sources, defaultTheme, template };
}
