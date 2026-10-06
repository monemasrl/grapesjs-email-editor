import { error } from '@sveltejs/kit';
import { deleteAsset } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
  if (!(await deleteAsset(params.name))) error(404, 'Immagine non trovata');
  return new Response(null, { status: 204 });
};
