// Inserimento dei blocchi e dipendenze dall'head (font/stili del template d'origine)
import type { Editor } from 'grapesjs';
import type { BlockHead } from '$lib/types';

export function ensureHead(editor: Editor, head?: BlockHead | null) {
  if (!head || (!head.fonts?.length && !head.styles?.length)) return;
  const wrapper = editor.getWrapper()!;
  const root = wrapper.findType('mjml')[0] || wrapper;
  let mjHead = wrapper.findType('mj-head')[0];
  if (!mjHead) mjHead = root.append('<mj-head></mj-head>', { at: 0 })[0];
  const fonts = new Set(mjHead.findType('mj-font').map((f) => f.getAttributes().name));
  for (const f of head.fonts || []) {
    const name = /name="([^"]+)"/.exec(f)?.[1];
    if (name && !fonts.has(name)) { mjHead.append(f); fonts.add(name); }
  }
  const norm = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, '');
  for (const s of head.styles || []) {
    if (!norm(mjHead.toHTML()).includes(norm(s))) mjHead.append(s);
  }
}

/** Inserisce un blocco dopo la sezione selezionata (o in fondo) */
export function insertBlock(editor: Editor, blockId: string) {
  const block = editor.Blocks.get(blockId);
  const body = editor.getWrapper()?.findType('mj-body')[0];
  if (!block || !body) return;
  let cur = editor.getSelected();
  while (cur && cur.parent() && cur.parent() !== body) cur = cur.parent();
  const at = cur && cur.parent() === body ? cur.index() + 1 : undefined;
  const added = body.append(block.get('content') as string, at !== undefined ? { at } : {});
  ensureHead(editor, block.get('mjHead' as any));
  if (added[0]) {
    editor.select(added[0]);
    editor.Canvas.scrollTo(added[0], { behavior: 'smooth', block: 'center' });
  }
}
