import { error } from '@sveltejs/kit';
import { getCatalog } from '$lib/server/catalog';
import { editorPayload } from '$lib/server/editor-data';
import { blankMjml } from '$lib/themes';
import type { PageServerLoad } from './$types';

// /edit/blank, /edit/blank:<stile> oppure /edit/<id template>
export const load: PageServerLoad = async ({ params }) => {
  const { themes, defaultTheme, templates } = getCatalog();
  if (params.id === 'blank' || params.id.startsWith('blank:')) {
    const theme = themes.find((t) => t.id === params.id.split(':')[1]) || themes.find((t) => t.id === defaultTheme) || null;
    return editorPayload({ mjml: blankMjml(theme), name: 'Nuova email', theme: theme?.id ?? null });
  }
  const t = templates.find((x) => x.id === params.id);
  if (!t) error(404, 'Template non trovato');
  return editorPayload({ mjml: t.mjml, name: t.name, templateId: t.id, theme: t.theme ?? null });
};
