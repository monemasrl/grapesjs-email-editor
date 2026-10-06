<!-- Inspector: controlli specifici del tipo di elemento selezionato (attributi MJML) -->
<script lang="ts" module>
  // gruppi aperti/chiusi, ricordati tra una selezione e l'altra
  const openGroups = new Map<string, boolean>();
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { Component, Editor } from 'grapesjs';
  import Icon from '$lib/components/Icon.svelte';
  import { SCHEMA, tagOf, nameOf, type ControlDef } from '$lib/editor/schema';
  import { SAFE_FONTS, type Ctx } from '$lib/editor/ctx';
  import type { Theme } from '$lib/types';
  import TextCtl from './controls/TextCtl.svelte';
  import NumberCtl from './controls/NumberCtl.svelte';
  import SelectCtl from './controls/SelectCtl.svelte';
  import SegmentedCtl from './controls/SegmentedCtl.svelte';
  import ToggleCtl from './controls/ToggleCtl.svelte';
  import ColorCtl from './controls/ColorCtl.svelte';
  import SpacingCtl from './controls/SpacingCtl.svelte';
  import BorderCtl from './controls/BorderCtl.svelte';
  import ImageCtl from './controls/ImageCtl.svelte';

  interface Props { editor: Editor; theme: Theme | null; pickImage: (cb: (src: string) => void) => void }
  let { editor, theme, pickImage }: Props = $props();

  const CONTROLS = { text: TextCtl, number: NumberCtl, select: SelectCtl, segmented: SegmentedCtl, toggle: ToggleCtl, color: ColorCtl, spacing: SpacingCtl, border: BorderCtl, image: ImageCtl };

  let comp = $state.raw<Component | null>(null);
  let rev = $state(0);
  let scroller = $state<HTMLDivElement>();

  const body = () => editor.getWrapper()?.findType('mj-body')[0] ?? null;
  const refresh = () => { comp = editor.getSelected() || body(); rev++; };

  onMount(() => {
    const onSel = () => { refresh(); if (scroller) scroller.scrollTop = 0; };
    const onAttrs = (c: Component) => { if (c === comp) rev++; };
    const onAny = () => rev++;
    editor.on('component:selected component:deselected', onSel);
    editor.on('component:update:attributes', onAttrs);
    editor.on('undo redo', onAny);
    editor.on('load', refresh);
    refresh();
    return () => {
      editor.off('component:selected component:deselected', onSel);
      editor.off('component:update:attributes', onAttrs);
      editor.off('undo redo', onAny);
      editor.off('load', refresh);
    };
  });

  // dopo "cambia stile" i componenti vengono ricreati: il chiamante può forzare il refresh
  export function reload() { refresh(); }

  const tag = $derived(tagOf(comp));
  const isBody = $derived(tag === 'mj-body');
  const groups = $derived(SCHEMA[tag]);

  const path = $derived.by(() => {
    void rev;
    const out: Component[] = [];
    let c = comp;
    while (c && tagOf(c) !== 'mjml' && c !== editor.getWrapper()) { out.unshift(c); c = c.parent() ?? null; }
    return out;
  });

  const textBlock = $derived.by(() => {
    let c = comp?.parent();
    while (c && !['mj-text', 'mj-button', 'mj-navbar-link'].includes(tagOf(c))) c = c.parent();
    return c ?? null;
  });

  function set(c: Component, name: string, value: string | null, opts: { clear?: string[] } = {}) {
    if (opts.clear?.length) c.removeAttributes(opts.clear.filter((k) => k in c.getAttributes()));
    if (value === null || value === undefined || value === '') c.removeAttributes(name);
    else c.addAttributes({ [name]: value });
    // le immagini tengono src anche come proprietà del componente (usata per render ed export)
    if (name === 'src' && 'src' in c.attributes) c.set('src', value || '');
    rev++;
  }

  const ctx = $derived.by<Ctx>(() => {
    void rev;
    const c = comp;
    const attrs = (c?.getAttributes() ?? {}) as Record<string, string>;
    const defaults = (c?.get('style-default') ?? {}) as Record<string, string>;
    return {
      get: (k) => attrs[k],
      isDefault: (k) => defaults[k] !== undefined && attrs[k] === defaults[k],
      set: (k, v, o) => c && set(c, k, v, o),
      theme,
      pickImage,
    };
  });

  const fontOptions = $derived.by<[string, string][]>(() => {
    const opts: [string, string][] = [];
    if (theme) {
      const first = (f: string) => f.split(',')[0].replace(/'/g, '');
      opts.push([theme.fonts.heading, `Titoli dello stile (${first(theme.fonts.heading)})`]);
      opts.push([theme.fonts.body, `Testo dello stile (${first(theme.fonts.body)})`]);
    }
    return [...opts, ...SAFE_FONTS.filter(([v]) => !opts.some(([o]) => o === v))];
  });

  // azioni
  const siblings = $derived.by(() => { void rev; const p = comp?.parent(); return p ? { p, coll: p.components(), idx: p.components().indexOf(comp!) } : null; });
  function move(delta: number) {
    if (!comp || !siblings) return;
    const c = comp;
    c.remove({ temporary: true });
    siblings.p.components().add(c, { at: siblings.idx + delta });
    editor.select(c);
  }
  function duplicate() {
    if (!comp || !siblings) return;
    const cl = comp.clone();
    siblings.p.components().add(cl, { at: siblings.idx + 1 });
    editor.select(cl);
  }
  function remove() { const c = comp; editor.select(undefined as unknown as Component); c?.remove(); }
  const selectParent = () => { const p = comp?.parent(); editor.select(p && tagOf(p) !== 'mj-body' ? p : (undefined as unknown as Component)); };
  const selectPath = (p: Component) => editor.select(tagOf(p) === 'mj-body' ? (undefined as unknown as Component) : p);
  const isOpen = (g: { title: string; collapsed?: boolean }) => openGroups.get(`${tag}:${g.title}`) ?? !g.collapsed;
</script>

{#if comp}
  <div class="insp-head">
    <nav class="insp-crumbs" aria-label="Percorso selezione">
      {#each path as p, i (i)}
        {#if i}<span class="sep"><Icon name="chevronRight" size={12} /></span>{/if}
        {#if i === path.length - 1}
          <span class="crumb on">{nameOf(p)}</span>
        {:else}
          <button type="button" class="crumb" onclick={() => selectPath(p)}>{nameOf(p)}</button>
        {/if}
      {/each}
    </nav>
    <div class="insp-title-row">
      <div class="insp-title">{isBody ? 'Impostazioni email' : nameOf(comp)}</div>
      {#if !isBody}
        <div class="insp-actions">
          <button type="button" class="icon-btn" title="Seleziona contenitore" aria-label="Seleziona contenitore" onclick={selectParent} disabled={!siblings || tagOf(siblings.p) === 'mjml'}><Icon name="parent" size={16} /></button>
          <button type="button" class="icon-btn" title="Sposta su" aria-label="Sposta su" onclick={() => move(-1)} disabled={!siblings || siblings.idx <= 0}><Icon name="up" size={16} /></button>
          <button type="button" class="icon-btn" title="Sposta giù" aria-label="Sposta giù" onclick={() => move(1)} disabled={!siblings || siblings.idx >= siblings.coll.length - 1}><Icon name="down" size={16} /></button>
          <button type="button" class="icon-btn" title="Duplica" aria-label="Duplica" onclick={duplicate} disabled={!comp.get('copyable')}><Icon name="copy" size={16} /></button>
          <button type="button" class="icon-btn" title="Elimina" aria-label="Elimina" onclick={remove} disabled={!comp.get('removable')}><Icon name="trash" size={16} /></button>
        </div>
      {/if}
    </div>
  </div>

  <div class="insp-scroll" bind:this={scroller}>
    {#if groups}
      {#key comp}
        {#each groups as g (g.title)}
          <details class="insp-group" open={isOpen(g)} ontoggle={(e) => openGroups.set(`${tag}:${g.title}`, e.currentTarget.open)}>
            <summary>{g.title}<Icon name="chevronDown" size={14} class="chev" /></summary>
            <div class="insp-group-body">
              {#each g.items as def (def.attr + def.type)}
                {#if def.type === 'font'}
                  <SelectCtl {ctx} def={def as ControlDef} options={fontOptions} />
                {:else}
                  {@const Ctl = CONTROLS[def.type as keyof typeof CONTROLS]}
                  <Ctl {ctx} {def} />
                {/if}
              {/each}
            </div>
          </details>
        {/each}
      {/key}
      {#if isBody}<p class="insp-tip">Seleziona un elemento nel canvas o nei livelli per modificarne le proprietà.</p>{/if}
    {:else if tag === 'mj-raw'}
      <p class="insp-empty">Blocco HTML grezzo: si modifica dal codice (pulsante &lt;/&gt; in alto).</p>
    {:else if textBlock}
      <p class="insp-empty">Questo elemento fa parte del testo: fai doppio clic sul testo per modificarlo con la barra di formattazione.</p>
      <button type="button" class="btn-sm" style="margin: 0 12px" onclick={() => editor.select(textBlock)}>Seleziona il blocco "{nameOf(textBlock)}"</button>
    {:else}
      <p class="insp-empty">Nessuna proprietà modificabile per questo elemento.</p>
    {/if}
  </div>
{/if}
