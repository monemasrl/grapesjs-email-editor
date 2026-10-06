// Compilazione MJML → HTML nel browser per le anteprime (mjml-browser caricato solo lato client)
const cache = new Map<string, string>();
let compiler: Promise<(mjml: string, o?: Record<string, unknown>) => { html: string }> | null = null;

const load = () => (compiler ??= import('mjml-browser').then((m) => m.default));

export async function compileMjml(key: string, mjml: string): Promise<string> {
  const hit = cache.get(key);
  if (hit) return hit;
  let html: string;
  try {
    html = (await load())(mjml, { validationLevel: 'skip', keepComments: false }).html;
  } catch (e) {
    html = `<p style="font:13px sans-serif;color:#b91c1c;padding:16px">Anteprima non disponibile: ${(e as Error).message}</p>`;
  }
  cache.set(key, html);
  return html;
}
