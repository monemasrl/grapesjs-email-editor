import { getCatalog } from '$lib/server/catalog';
import { listEmails } from '$lib/server/storage';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const { templates, themes, sources, defaultTheme, blocks } = getCatalog();
  return {
    templates,
    themes,
    sources,
    defaultTheme,
    blockCount: blocks.length,
    saved: await listEmails(),
  };
};
