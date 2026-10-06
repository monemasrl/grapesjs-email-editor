// Barra di formattazione del testo (Rich Text Editor di GrapesJS con azioni personalizzate)
import type { Editor } from 'grapesjs';
import type { Theme } from '$lib/types';
import { h, esc } from '$lib/dom';
import { icon } from './icons';

// API interne del Rich Text Editor di GrapesJS non tipizzate in modo completo
type Rte = any;

// Il browser scrive i colori come rgb(): li riporto in #rrggbb (più leggibile, e il cambio stile li riconosce)
const hex2 = (n: string) => Number(n).toString(16).padStart(2, '0');
export const rgbToHexStr = (s: string) => s.replace(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/g, (_m, r, g, b) => `#${hex2(r)}${hex2(g)}${hex2(b)}`);
function rgbToHex(root: HTMLElement | undefined) {
  root?.querySelectorAll?.('[style*="rgb("]').forEach((el) => el.setAttribute('style', rgbToHexStr(el.getAttribute('style') || '')));
}

export function setupRte(editor: Editor, { getTheme }: { getTheme: () => Theme | null }) {
  const rte = editor.RichTextEditor;
  ['bold', 'italic', 'underline', 'strikethrough', 'link', 'wrap'].forEach((n) => rte.remove(n));

  let pop: HTMLElement | null = null;
  const closePop = () => { pop?.remove(); pop = null; };
  let savedRange: Range | null = null;
  const saveRange = (r: Rte) => { const s = r.selection(); savedRange = s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null; };
  const restoreRange = (r: Rte) => { r.el?.focus(); const s = r.selection(); if (s && savedRange) { s.removeAllRanges(); s.addRange(savedRange); } };

  // Il popover sta DENTRO la toolbar RTE: un clic altrove disattiverebbe la modifica del testo
  function openPop(anchor: HTMLElement, content: HTMLElement) {
    closePop();
    const bar = rte.getToolbarEl();
    pop = h('div', { class: 'rte-pop', role: 'dialog' });
    pop.appendChild(content);
    bar.appendChild(pop);
    pop.style.left = `${Math.max(0, Math.min(anchor.offsetLeft, bar.clientWidth - 260))}px`;
    setTimeout(() => (pop?.querySelector('input') as HTMLInputElement | null)?.focus(), 0);
  }
  const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape' && pop) { ev.stopPropagation(); closePop(); } };
  document.addEventListener('keydown', onKey, true);

  const cmd = (name: string, ic: string, title: string, exec: (r: Rte) => void, state?: (r: Rte, doc: Document) => number) => rte.add(name, {
    icon: icon(ic, 16),
    attributes: { title, 'aria-label': title },
    result: exec,
    ...(state ? { state } : {}),
  });
  const active = (command: string) => (r: Rte, doc: Document) => { try { return (doc || r.doc).queryCommandState(command) ? 1 : 0; } catch { return 0; } };

  cmd('bold', 'bold', 'Grassetto (⌘B)', (r: Rte) => r.exec('bold'), active('bold'));
  cmd('italic', 'italic', 'Corsivo (⌘I)', (r: Rte) => r.exec('italic'), active('italic'));
  cmd('underline', 'underline', 'Sottolineato (⌘U)', (r: Rte) => r.exec('underline'), active('underline'));
  cmd('strike', 'strike', 'Barrato', (r: Rte) => r.exec('strikeThrough'), active('strikeThrough'));

  // Link con popover (niente prompt del browser)
  rte.add('link', {
    icon: icon('link', 16),
    attributes: { title: 'Inserisci link', 'aria-label': 'Inserisci link' },
    result: (r: Rte, action: any) => {
      saveRange(r);
      const box = h('form', { class: 'rte-link' });
      const cur = savedRange?.commonAncestorContainer?.parentElement?.closest('a')?.getAttribute('href') || '';
      box.innerHTML = `<input type="url" class="in" placeholder="https://…" value="${esc(cur)}" aria-label="URL del link" required>
        <label class="rte-chk"><input type="checkbox" checked> Nuova scheda</label>
        <button class="btn-sm primary" type="submit">${icon('check', 14)} Applica</button>`;
      box.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const url = box.querySelector<HTMLInputElement>('input[type=url]')!.value.trim();
        const blank = box.querySelector<HTMLInputElement>('input[type=checkbox]')!.checked;
        restoreRange(r);
        r.el?.focus();
        r.exec('createLink', url);
        // aggiunge target e colore del tema al link appena creato
        const sel: Selection | null = r.selection();
        const a = sel?.anchorNode?.parentElement?.closest('a') || sel?.focusNode?.parentElement?.closest('a');
        if (a) {
          if (blank) a.setAttribute('target', '_blank'); else a.removeAttribute('target');
          const t = getTheme();
          if (t && !a.getAttribute('style')) a.setAttribute('style', `color:${t.colors.accent};text-decoration:underline;`);
        }
        closePop();
      });
      openPop(action.btn, box);
    },
  });
  cmd('unlink', 'unlink', 'Rimuovi link', (r: Rte) => r.exec('unlink'));

  // Colore testo: palette dello stile + selettore libero
  rte.add('color', {
    icon: icon('palette', 16),
    attributes: { title: 'Colore testo', 'aria-label': 'Colore testo' },
    result: (r: Rte, action: any) => {
      saveRange(r);
      const t = getTheme();
      const box = h('div', { class: 'rte-colors' });
      const apply = (c: string) => {
        restoreRange(r);
        r.exec('styleWithCSS', true); r.exec('foreColor', c); r.exec('styleWithCSS', false);
        rgbToHex(r.el);
        closePop();
      };
      if (t) {
        const pal = h('div', { class: 'palette' });
        Object.values(t.colors).forEach((c) => {
          const b = h('button', { type: 'button', class: 'pal', style: `background:${c}`, title: c, 'aria-label': c });
          b.addEventListener('click', () => apply(c));
          pal.appendChild(b);
        });
        box.appendChild(pal);
      }
      const native = h('input', { type: 'color', class: 'color-native-sm', value: '#000000', 'aria-label': 'Altro colore' }) as HTMLInputElement;
      native.addEventListener('change', () => apply(native.value));
      const row = h('label', { class: 'rte-chk' }, 'Altro colore ');
      row.appendChild(native);
      box.appendChild(row);
      openPop(action.btn, box);
    },
  });

  cmd('ul', 'list', 'Elenco puntato', (r: Rte) => r.exec('insertUnorderedList'), active('insertUnorderedList'));
  cmd('ol', 'listOrdered', 'Elenco numerato', (r: Rte) => r.exec('insertOrderedList'), active('insertOrderedList'));

  // Allineamento: è un attributo MJML del blocco di testo, non dell'HTML interno
  [['left', 'alignLeft', 'Allinea a sinistra'], ['center', 'alignCenter', 'Centra'], ['right', 'alignRight', 'Allinea a destra']].forEach(([v, ic, title]) =>
    rte.add(`align-${v}`, {
      icon: icon(ic, 16),
      attributes: { title, 'aria-label': title },
      result: () => editor.getSelected()?.addAttributes({ align: v }),
      state: () => ((editor.getSelected()?.getAttributes().align || 'left') === v ? 1 : 0),
    }));

  cmd('clear', 'eraser', 'Rimuovi formattazione', (r: Rte) => { r.exec('removeFormat'); r.exec('unlink'); });

  editor.on('rte:disable', closePop);
  return { destroy: () => { closePop(); document.removeEventListener('keydown', onKey, true); } };
}
