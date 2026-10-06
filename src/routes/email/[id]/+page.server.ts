import { error } from '@sveltejs/kit';
import { getCatalog } from '$lib/server/catalog';
import { editorPayload } from '$lib/server/editor-data';
import { getEmail } from '$lib/server/storage';
import { detectTheme } from '$lib/themes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const s = await getEmail(params.id);
  if (!s) error(404, 'Email non trovata');
  return editorPayload({
    mjml: s.mjml, name: s.name, templateId: s.fromTemplate, savedId: s.id,
    theme: s.theme || detectTheme(s.mjml, getCatalog().themes),
  });
};
