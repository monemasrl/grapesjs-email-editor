// Piccoli helper DOM usati dai moduli imperativi (barra testo di GrapesJS)
export function h(tag: string, attrs: Record<string, string> = {}, html = ''): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'value') (el as HTMLInputElement).value = v;
    else el.setAttribute(k, v);
  }
  if (html) el.innerHTML = html;
  return el;
}

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
