import { error, json } from '@sveltejs/kit';
import { deleteEmail, getEmail, saveEmail } from '$lib/server/storage';
import { readEmailBody } from '$lib/server/validate';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const item = await getEmail(params.id);
  if (!item) error(404, 'Email non trovata');
  return json(item);
};

export const PUT: RequestHandler = async ({ params, request }) => {
  if (!(await getEmail(params.id))) error(404, 'Email non trovata');
  return json(await saveEmail({ ...(await readEmailBody(request)), id: params.id }));
};

export const DELETE: RequestHandler = async ({ params }) => {
  if (!(await deleteEmail(params.id))) error(404, 'Email non trovata');
  return new Response(null, { status: 204 });
};
