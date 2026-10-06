import { json } from '@sveltejs/kit';
import { listEmails, saveEmail } from '$lib/server/storage';
import { readEmailBody } from '$lib/server/validate';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => json(await listEmails());

export const POST: RequestHandler = async ({ request }) => {
  const item = await saveEmail(await readEmailBody(request));
  return json(item, { status: 201 });
};
