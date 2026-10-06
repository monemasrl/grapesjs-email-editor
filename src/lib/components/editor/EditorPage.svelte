<!--
  Editor: GrapesJS + grapesjs-mjml con interfaccia in Svelte
    sinistra: Blocchi | Livelli      centro: canvas      destra: Inspector
-->
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { beforeNavigate, replaceState } from '$app/navigation';
  import type { Block as GjsBlock, Editor } from 'grapesjs';
  import 'grapesjs/dist/css/grapes.min.css';
  import 'font-awesome/css/font-awesome.min.css'; // usato da alcuni pulsanti interni di GrapesJS
  import '$lib/editor/editor.css';
  import Icon from '$lib/components/Icon.svelte';
  import BlocksPanel from './BlocksPanel.svelte';
  import Inspector from './Inspector.svelte';
  import AssetLibrary from './AssetLibrary.svelte';
  import { NAMES } from '$lib/editor/schema';
  import { ensureHead } from '$lib/editor/blocks';
  import { setupRte } from '$lib/editor/rte';
  import { reskin } from '$lib/themes';
  import { slugify } from '$lib/dom';
  import { toast } from '$lib/toast.svelte';
  import type { Block, EditorDoc, SourceInfo, Template, Theme } from '$lib/types';

  interface Props {
    doc: EditorDoc;
    blocks: Block[];
    categories: string[];
    themes: Theme[];
    sources: SourceInfo[];
    defaultTheme: string | null;
    template: Template | null;
  }
  let { doc, blocks, categories, themes, sources, defaultTheme, template }: Props = $props();

  const IMG_PLACEHOLDER = 'https://placehold.co/600x300/e4e4e7/71717a/png?text=Immagine';
  const DEVICES = [
    { id: 'Desktop', icon: 'desktop', label: 'Desktop' },
    { id: 'Tablet', icon: 'tablet', label: 'Tablet' },
    { id: 'Mobile portrait', icon: 'mobile', label: 'Mobile' },
  ];

  // svelte-ignore state_referenced_locally
  let name = $state(doc.name);
  // svelte-ignore state_referenced_locally
  let savedId = $state(doc.savedId ?? null);
  // svelte-ignore state_referenced_locally
  let themeId = $state(doc.theme || (themes.length ? defaultTheme : null));
  const theme = $derived(themes.find((t) => t.id === themeId) ?? null);

  let editor = $state.raw<Editor | null>(null);
  let bm = $state.raw<{ blocks: GjsBlock[]; dragStart: (b: GjsBlock, ev?: Event) => void; dragStop: (c?: boolean) => void } | null>(null);
  let dirty = $state(false);
  let saving = $state(false);
  let leftTab = $state<'blocks' | 'layers'>('blocks');
  let device = $state('Desktop');
  let outline = $state(true);
  let previewing = $state(false);
  let canUndo = $state(false);
  let canRedo = $state(false);

  let canvasEl: HTMLDivElement;
  let layersEl: HTMLDivElement;
  let inspector = $state<Inspector>();
  let assetLib = $state<AssetLibrary>();

  // Nomi italiani dei componenti (livelli, badge nel canvas)
  const MJML_I18N = {
    it: {
      'grapesjs-mjml': {
        components: {
          names: {
            body: NAMES['mj-body'], button: NAMES['mj-button'], column: NAMES['mj-column'], oneColumn: '1 colonna', twoColumn: '2 colonne',
            threeColumn: '3 colonne', divider: NAMES['mj-divider'], group: NAMES['mj-group'], hero: NAMES['mj-hero'], image: NAMES['mj-image'],
            navBar: NAMES['mj-navbar'], navLink: NAMES['mj-navbar-link'], section: NAMES['mj-section'], socialGroup: NAMES['mj-social'],
            socialElement: NAMES['mj-social-element'], spacer: NAMES['mj-spacer'], text: NAMES['mj-text'], wrapper: NAMES['mj-wrapper'], raw: NAMES['mj-raw'],
          },
        },
      },
    },
  };

  onMount(() => {
    let ed: Editor | null = null;
    let disposeRte: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: grapesjs }, { default: grapesjsMjml }, { default: it }] = await Promise.all([
        import('grapesjs'),
        import('grapesjs-mjml'),
        import('grapesjs/locale/it'),
      ]);
      if (cancelled) return;
      ed = grapesjs.init({
        container: canvasEl,
        height: '100%',
        fromElement: false,
        storageManager: false,
        panels: { defaults: [] },
        blockManager: { custom: true },
        assetManager: { custom: true, assets: [] },
        layerManager: { appendTo: layersEl, showWrapper: false },
        i18n: { locale: 'it', detectLocale: false, messages: { it } },
        plugins: [grapesjsMjml],
        pluginsOpts: { [grapesjsMjml as unknown as string]: { imagePlaceholderSrc: IMG_PLACEHOLDER, i18n: MJML_I18N } },
        canvasCss: `
          .gjs-selected { outline: 2px solid #2563eb !important; outline-offset: -2px; }
          .gjs-dashed *[data-gjs-highlightable] { outline: 1px dashed rgba(100,116,139,.35) !important; outline-offset: -1px; }`,
        components: doc.mjml,
      });
      if (import.meta.env.DEV) (window as any).__editor = ed;

      disposeRte = setupRte(ed, { getTheme: () => theme }).destroy;

      for (const b of blocks) {
        ed.Blocks.add(b.id, { label: b.label, category: b.category, content: b.content, activate: true, select: true, mjHead: b.head } as any);
      }
      ed.on('block:drag:stop', (component, block) => { if (component) ensureHead(ed!, block?.get('mjHead' as any) as any); });
      ed.on('block:custom', (props) => (bm = props));

      const updateUndo = () => { canUndo = ed!.UndoManager.hasUndo(); canRedo = ed!.UndoManager.hasRedo(); };
      ed.on('load', () => {
        const body = ed!.getWrapper()?.findType('mj-body')[0];
        if (body) ed!.Layers.setRoot(body);
        ed!.runCommand('core:component-outline');
        ed!.UndoManager.clear();
        setTimeout(() => (dirty = false), 0);
        ed!.on('update', () => (dirty = true));
        updateUndo();
      });
      ed.on('update undo redo change:changesCount', updateUndo);
      editor = ed;
    })();

    return () => {
      cancelled = true;
      disposeRte?.();
      ed?.destroy();
      editor = null;
    };
  });

  // Chiude la modifica del testo in corso, così il contenuto viene salvato nel modello
  async function commitText() {
    const c = editor?.getEditing();
    const v: any = c?.getView?.() || (c as any)?.view;
    if (v?.disableEditing) await v.disableEditing();
  }

  function setDevice(id: string) { editor?.setDevice(id); device = id; }

  function toggleOutline() {
    outline = !outline;
    if (outline) editor?.runCommand('core:component-outline'); else editor?.stopCommand('core:component-outline');
  }

  async function setPreview(on: boolean) {
    if (!editor) return;
    await commitText();
    if (on) { editor.select(undefined as any); editor.runCommand('core:preview'); } else editor.stopCommand('core:preview');
    previewing = on;
  }

  async function changeTheme(e: Event & { currentTarget: HTMLSelectElement }) {
    if (!editor) return;
    const value = e.currentTarget.value; // da leggere prima dell'await
    await commitText();
    const to = themes.find((t) => t.id === value);
    if (!to) return;
    const body = () => editor!.getWrapper()!.findType('mj-body')[0];
    let sel = editor.getSelected();
    while (sel && sel.parent() && sel.parent() !== body()) sel = sel.parent();
    const selIndex = sel && sel.parent() === body() ? sel.index() : -1;
    editor.setComponents(reskin(editor.runCommand('mjml-code'), theme, to));
    themeId = to.id;
    editor.Layers.setRoot(body());
    if (selIndex >= 0) editor.select(body().components().at(selIndex)); else editor.select(undefined as any);
    await tick();
    inspector?.reload();
    dirty = true;
    toast(`Stile "${to.label}" applicato`);
  }

  async function showCode() { await commitText(); editor?.runCommand('export-template'); }

  async function download() {
    if (!editor) return;
    await commitText();
    const { html, errors } = editor.runCommand('mjml-code-to-html');
    if (errors?.length) console.warn('Avvisi MJML', errors);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `${slugify(name) || 'email'}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function save() {
    if (!editor || saving) return;
    await commitText();
    saving = true;
    try {
      const body = JSON.stringify({ name: name.trim() || 'Senza titolo', mjml: editor.runCommand('mjml-code'), fromTemplate: doc.templateId ?? null, theme: themeId });
      const r = await fetch(savedId ? `/api/emails/${encodeURIComponent(savedId)}` : '/api/emails', {
        method: savedId ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.message || `HTTP ${r.status}`);
      const item = await r.json();
      if (!savedId) replaceState(`/email/${encodeURIComponent(item.id)}`, {}); // cambia l'URL senza ricaricare l'editor
      savedId = item.id;
      dirty = false;
      toast('Email salvata');
    } catch (e) {
      toast(`Salvataggio non riuscito: ${(e as Error).message}`, 'err');
    } finally {
      saving = false;
    }
  }

  function onKeydown(ev: KeyboardEvent) {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); save(); }
    if (ev.key === 'Escape' && previewing) setPreview(false);
  }

  beforeNavigate((nav) => {
    if (!dirty) return;
    if (nav.type === 'leave') { nav.cancel(); return; } // chiusura scheda: avviso del browser
    if (!confirm('Ci sono modifiche non salvate. Uscire comunque?')) nav.cancel();
  });

  const pickImage = (cb: (src: string) => void) => assetLib?.pickImage(cb);
</script>

<svelte:window onkeydown={onKeydown} />

<div class="editor-shell" class:previewing>
  <header class="ed-top">
    <div class="ed-top-l">
      <a class="icon-btn" href="/" title="Torna ai template" aria-label="Torna ai template"><Icon name="back" /></a>
      <input class="doc-name" aria-label="Nome dell'email" bind:value={name} oninput={() => (dirty = true)} />
      {#if dirty}<span class="dirty-flag">Non salvato</span>{/if}
    </div>
    <div class="ed-top-c">
      <div class="seg" role="group" aria-label="Dispositivo">
        {#each DEVICES as d (d.id)}
          <button type="button" class="seg-btn" class:on={device === d.id} title={d.label} aria-label={d.label} aria-pressed={device === d.id} onclick={() => setDevice(d.id)}>
            <Icon name={d.icon} size={17} />
          </button>
        {/each}
      </div>
    </div>
    <div class="ed-top-r">
      {#if themes.length}
        <label class="theme-pick" title="Stile dell'email">
          <Icon name="palette" size={16} />
          <select class="in theme-select" aria-label="Stile dell'email" value={themeId} onchange={changeTheme}>
            {#each themes as t (t.id)}<option value={t.id}>{t.label}</option>{/each}
          </select>
        </label>
        <span class="vsep"></span>
      {/if}
      <button type="button" class="icon-btn" title="Annulla (⌘Z)" aria-label="Annulla" disabled={!canUndo} onclick={async () => { await commitText(); editor?.UndoManager.undo(); }}><Icon name="undo" size={17} /></button>
      <button type="button" class="icon-btn" title="Ripeti (⇧⌘Z)" aria-label="Ripeti" disabled={!canRedo} onclick={async () => { await commitText(); editor?.UndoManager.redo(); }}><Icon name="redo" size={17} /></button>
      <span class="vsep"></span>
      <button type="button" class="icon-btn" class:on={outline} title="Mostra contorni" aria-label="Mostra contorni" aria-pressed={outline} onclick={toggleOutline}><Icon name="borders" size={17} /></button>
      <button type="button" class="icon-btn" class:on={previewing} title="Anteprima (Esc per uscire)" aria-label="Anteprima" aria-pressed={previewing} onclick={() => setPreview(!previewing)}><Icon name="eye" size={17} /></button>
      <button type="button" class="icon-btn" title="Codice MJML / HTML" aria-label="Codice" onclick={showCode}><Icon name="code" size={17} /></button>
      <button type="button" class="icon-btn" title="Scarica HTML" aria-label="Scarica HTML" onclick={download}><Icon name="download" size={17} /></button>
      <button type="button" class="btn-primary" disabled={saving || !editor} onclick={save}><Icon name="save" size={16} /> {saving ? 'Salvataggio…' : 'Salva'}</button>
    </div>
  </header>

  <div class="ed-body">
    <aside class="ed-left">
      <div class="tabs" role="tablist">
        <button type="button" role="tab" class="tab" class:on={leftTab === 'blocks'} aria-selected={leftTab === 'blocks'} onclick={() => (leftTab = 'blocks')}><Icon name="blocks" size={15} /> Blocchi</button>
        <button type="button" role="tab" class="tab" class:on={leftTab === 'layers'} aria-selected={leftTab === 'layers'} onclick={() => (leftTab = 'layers')}><Icon name="layers" size={15} /> Livelli</button>
      </div>
      <div class="tab-panel blocks-panel" hidden={leftTab !== 'blocks'}>
        {#if editor && bm}
          <BlocksPanel {editor} {bm} {blocks} {categories} {sources} {template} {theme} />
        {:else}
          <p class="empty" style="padding: 12px">Caricamento editor…</p>
        {/if}
      </div>
      <div class="tab-panel layers-panel" hidden={leftTab !== 'layers'}><div class="layers-host" bind:this={layersEl}></div></div>
    </aside>
    <main class="ed-canvas"><div class="gjs-root" bind:this={canvasEl}></div></main>
    <aside class="ed-right inspector" aria-label="Proprietà">
      {#if editor}<Inspector bind:this={inspector} {editor} {theme} {pickImage} />{/if}
    </aside>
  </div>
</div>

{#if editor}<AssetLibrary bind:this={assetLib} {editor} {theme} />{/if}
