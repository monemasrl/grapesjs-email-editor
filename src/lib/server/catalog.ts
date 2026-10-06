// Catalogo di template, blocchi e stili, letto una volta sola dai JSON in static/data
import { SOURCES, DEFAULT_THEME } from '$lib/config';
import type { Block, Catalog, SourceInfo, Template, Theme } from '$lib/types';

// Vite include i JSON nel bundle del server (funziona sia in dev sia con `node build`)
const files = import.meta.glob('/static/data/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const json = (id: string) => files[`/static/data/${id}.json`];

let cache: Catalog | null = null;

export function getCatalog(): Catalog {
  if (cache) return cache;
  const index = json('index') || { sources: [], categories: [] };
  const meta = new Map<string, any>(index.sources.map((s: any) => [s.id, s]));
  const sources: SourceInfo[] = [];
  const categories: string[] = [];
  const themes: Theme[] = [];
  const templates: Template[] = [];
  const blocks: Block[] = [];

  for (const id of SOURCES) {
    const pack = json(id);
    if (!pack) throw new Error(`Raccolta "${id}" non trovata in static/data (lancia "pnpm kit" o "pnpm extract")`);
    const m = meta.get(id) || {};
    const label = pack.label || m.label || id;
    sources.push({ id, label, repo: pack.repo ?? m.repo ?? null, sha: m.sha, license: pack.license || m.license, templates: pack.templates.length, blocks: pack.blocks.length });
    (pack.themes || []).forEach((t: Theme) => themes.push(t));
    for (const c of pack.categories || index.categories) if (!categories.includes(c)) categories.push(c);
    pack.templates.forEach((t: any) => templates.push({ ...t, source: id, sourceLabel: label }));
    pack.blocks.forEach((b: any) => blocks.push({ ...b, source: id, sourceLabel: label }));
  }
  cache = {
    sources,
    categories,
    themes,
    defaultTheme: themes.find((t) => t.id === DEFAULT_THEME) ? DEFAULT_THEME : themes[0]?.id || null,
    templates,
    blocks,
  };
  return cache;
}
