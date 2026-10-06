<!-- Pannello blocchi (Block Manager di GrapesJS con interfaccia personalizzata) -->
<script lang="ts" module>
  import { SvelteSet } from 'svelte/reactivity';
  // stato del pannello ricordato tra un'apertura dell'editor e l'altra
  const ui = { source: 'all', onlyTemplate: false, q: '', open: new SvelteSet(['Header']) };
</script>

<script lang="ts">
  import type { Block as GjsBlock, Editor } from 'grapesjs';
  import Icon from '$lib/components/Icon.svelte';
  import Preview from '$lib/components/Preview.svelte';
  import { blockMjml } from '$lib/themes';
  import { insertBlock } from '$lib/editor/blocks';
  import type { Block, SourceInfo, Template, Theme } from '$lib/types';

  interface BmProps { blocks: GjsBlock[]; dragStart: (b: GjsBlock, ev?: Event) => void; dragStop: (cancel?: boolean) => void }
  interface Props {
    editor: Editor;
    bm: BmProps;
    blocks: Block[];
    categories: string[];
    sources: SourceInfo[];
    template: Template | null;
    theme: Theme | null;
  }
  let { editor, bm, blocks, categories, sources, template, theme }: Props = $props();

  const BASE = 'Elementi base';
  let source = $state(ui.source);
  let q = $state(ui.q);
  let only = $state(ui.onlyTemplate);
  $effect(() => { ui.source = source; ui.q = q; ui.onlyTemplate = only; });

  const multiSource = $derived(sources.length > 1);
  const showOnly = $derived(!!template && !template.theme);
  const query = $derived(q.trim().toLowerCase());

  const filtered = $derived(blocks.filter((b) =>
    (!b.theme || b.theme === theme?.id) &&
    (!multiSource || source === 'all' || b.source === source) &&
    (!only || b.templateId === template?.id) &&
    (!query || `${b.label} ${b.category} ${b.sourceLabel}`.toLowerCase().includes(query))));
  const byCat = $derived.by(() => {
    const m = new Map<string, Block[]>();
    for (const b of filtered) { if (!m.has(b.category)) m.set(b.category, []); m.get(b.category)!.push(b); }
    return categories.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as const);
  });
  // elementi base di grapesjs-mjml (colonne, testo, bottone…): sono quelli senza mjHead
  const base = $derived(bm.blocks.filter((b) => !b.get('mjHead' as any)));

  const isOpen = (name: string) => ui.open.has(name) || !!query;
  const toggle = (name: string, open: boolean) => (open ? ui.open.add(name) : ui.open.delete(name));
  const drag = (id: string) => (ev: DragEvent) => { const b = editor.Blocks.get(id); if (b) bm.dragStart(b, ev); };
</script>

<div class="bp-head">
  {#if multiSource}
    <select class="in bp-source" aria-label="Raccolta" bind:value={source}>
      <option value="all">Tutte le raccolte ({blocks.length})</option>
      {#each sources as s (s.id)}<option value={s.id}>{s.label} ({s.blocks})</option>{/each}
    </select>
  {/if}
  <div class="bp-search"><Icon name="search" size={15} /><input type="search" class="in" placeholder="Cerca blocchi…" aria-label="Cerca blocchi" bind:value={q} /></div>
  {#if showOnly}<label class="bp-only"><input type="checkbox" bind:checked={only} /> Solo da questo template</label>{/if}
</div>

<div class="bp-list">
  {#if !query && !only && base.length}
    <details class="bp-cat" open={isOpen(BASE)} ontoggle={(e) => toggle(BASE, e.currentTarget.open)}>
      <summary><span>{BASE}</span><span class="count">{base.length}</span><Icon name="chevronDown" size={14} class="chev" /></summary>
      <div class="bp-cat-body">
        <div class="bp-base-grid">
          {#each base as b (b.getId())}
            <div class="bp-base" draggable="true" title={b.getLabel()} role="button" tabindex="-1"
              ondragstart={(ev) => bm.dragStart(b, ev)} ondragend={() => bm.dragStop(false)}>
              <div class="bp-base-media">{@html b.getMedia() || ''}</div>
              <div class="bp-base-label">{b.getLabel()}</div>
            </div>
          {/each}
        </div>
      </div>
    </details>
  {/if}

  {#each byCat as [cat, items] (cat)}
    <details class="bp-cat" open={isOpen(cat)} ontoggle={(e) => toggle(cat, e.currentTarget.open)}>
      <summary><span>{cat}</span><span class="count">{items.length}</span><Icon name="chevronDown" size={14} class="chev" /></summary>
      {#if isOpen(cat)}
        <div class="bp-cat-body">
          {#each items as b (b.id)}
            <div class="bp-item" draggable="true" tabindex="0" role="button" title="{b.label} — {b.category}"
              ondragstart={drag(b.id)} ondragend={() => bm.dragStop(false)}
              onclick={() => insertBlock(editor, b.id)}
              onkeydown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); insertBlock(editor, b.id); } }}>
              <Preview key="blk:{b.id}" mjml={() => blockMjml(b)} maxHeight={200} />
              <div class="bp-item-label"><span>{b.label}</span>{#if multiSource}<span class="src">{b.sourceLabel}</span>{/if}</div>
            </div>
          {/each}
        </div>
      {/if}
    </details>
  {:else}
    {#if !base.length || query || only}<p class="empty">Nessun blocco trovato.</p>{/if}
  {/each}
</div>
<p class="bp-hint">Trascina nel canvas o clicca per inserire dopo la sezione selezionata.</p>
