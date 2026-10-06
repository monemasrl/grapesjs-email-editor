// Notifiche brevi in basso (stato globale Svelte 5)
export const toastState = $state({ msg: '', kind: 'ok' as 'ok' | 'err', visible: false });
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string, kind: 'ok' | 'err' = 'ok') {
  toastState.msg = msg;
  toastState.kind = kind;
  toastState.visible = true;
  clearTimeout(timer);
  timer = setTimeout(() => (toastState.visible = false), 2600);
}
