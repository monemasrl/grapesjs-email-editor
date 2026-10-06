// Serve le immagini caricate dalla cartella DATA_DIR/uploads
import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FILE_RE, UPLOAD_DIR } from '$lib/server/storage';
import type { RequestHandler } from './$types';

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' };

export const GET: RequestHandler = async ({ params }) => {
  if (!FILE_RE.test(params.file)) error(404, 'Non trovato');
  try {
    const data = await readFile(join(UPLOAD_DIR, params.file));
    return new Response(new Uint8Array(data), {
      headers: {
        'content-type': TYPES[params.file.split('.').pop()!],
        'cache-control': 'public, max-age=31536000, immutable',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    error(404, 'Non trovato');
  }
};
