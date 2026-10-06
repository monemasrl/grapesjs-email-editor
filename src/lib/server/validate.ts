import { error } from '@sveltejs/kit';

const MAX_MJML = 2 * 1024 * 1024;

/** Valida il corpo di una richiesta di salvataggio email */
export async function readEmailBody(request: Request) {
  let body: any;
  try { body = await request.json(); } catch { error(400, 'JSON non valido'); }
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const mjml = typeof body?.mjml === 'string' ? body.mjml : '';
  if (!mjml.trim().startsWith('<mjml')) error(400, 'Il campo "mjml" deve contenere un documento MJML');
  if (mjml.length > MAX_MJML) error(413, 'Email troppo grande');
  const opt = (v: unknown) => (typeof v === 'string' && v.length <= 200 ? v : null);
  return { name: name || 'Senza titolo', mjml, fromTemplate: opt(body.fromTemplate), theme: opt(body.theme) };
}
