import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { listAssets, saveUpload } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => json(await listAssets());

/** Upload multipart: campo "file" (uno o più) */
export const POST: RequestHandler = async ({ request, url }) => {
  let form: FormData;
  try { form = await request.formData(); } catch { error(400, 'Richiesta non valida'); }
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) error(400, 'Nessun file');
  // PUBLIC_BASE_URL: indirizzo pubblico del sito (es. https://editor.example.com), usato negli URL delle immagini
  const base = env.PUBLIC_BASE_URL || url.origin;
  const saved = [];
  const errors = [];
  for (const f of files) {
    try { saved.push(await saveUpload(f, base)); } catch (e) { errors.push(`${f.name}: ${(e as Error).message}`); }
  }
  return json({ saved, errors }, { status: saved.length ? 201 : 400 });
};
