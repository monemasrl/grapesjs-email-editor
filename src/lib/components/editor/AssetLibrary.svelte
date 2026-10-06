<!--
  Libreria immagini (Asset Manager di GrapesJS con interfaccia personalizzata).
  Le immagini caricate vanno al server (POST /api/assets) e restano in DATA_DIR/uploads.
-->
<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Asset, Editor } from 'grapesjs';
  import Icon from '$lib/components/Icon.svelte';
  import { ph } from '$lib/themes';
  import { toast } from '$lib/toast.svelte';
  import type { Theme, UploadedAsset } from '$lib/types';

  interface Props { editor: Editor; theme: Theme | null }
  let { editor, theme }: Props = $props();

  type Item = { src: string; name: string; kind: 'upload' | 'used' | 'url' | 'sample'; file?: string };
  interface CustomProps { open: boolean; close: () => void; select: (a: Asset, complete?: boolean) => void }

  let amProps = $state.raw<CustomProps | null>(null);
  let open = $state(false);
  let uploads = $state<UploadedAsset[]>([]);
  let used = $state<string[]>([]);
  let urls = $state<string[]>([]);
  let q = $state('');
  let url = $state('');
  let over = $state(false);
  let busy = $state(false);
  let dropEl = $state<HTMLDivElement>();
  let fileEl = $state<HTMLInputElement>();

  const samples = $derived<Item[]>(theme ? [
    ...([['Orizzontale', 1200, 600], ['Quadrata', 800, 800], ['Banner', 1200, 300], ['Prodotto', 600, 600]] as const)
      .map(([n, w, h]) => ({ src: ph(theme, w, h, n), name: `Segnaposto ${n.toLowerCase()} (${w}×${h})`, kind: 'sample' as const })),
    { src: ph(theme, 280, 80, 'LOGO', 'surface', 'accent'), name: 'Logo segnaposto', kind: 'sample' },
  ] : []);

  const items = $derived.by<Item[]>(() => {
    const seen = new Set<string>();
    const all: Item[] = [
      ...uploads.map((u) => ({ src: u.src, name: u.original, kind: 'upload' as const, file: u.name })),
      ...urls.map((s) => ({ src: s, name: s.split('/').pop() || s, kind: 'url' as const })),
      ...used.map((s) => ({ src: s, name: 'Nell’email', kind: 'used' as const })),
      ...samples,
    ];
    const ql = q.trim().toLowerCase();
    return all.filter((i) => !seen.has(i.src) && (seen.add(i.src), !ql || `${i.name} ${i.src}`.toLowerCase().includes(ql)));
  });

  async function loadUploads() {
    try { uploads = await (await fetch('/api/assets')).json(); } catch { toast('Impossibile caricare la libreria', 'err'); }
  }
  const collectUsed = () => {
    const mjml = editor.getHtml();
    used = [...new Set([...mjml.matchAll(/(?:src|background-url)="([^"]+)"/g)].map((m) => m[1]))];
  };

  onMount(() => {
    const onCustom = async (p: CustomProps) => {
      amProps = p;
      open = p.open;
      if (p.open) {
        collectUsed();
        loadUploads();
        await tick();
        dropEl?.focus();
      }
    };
    editor.on('asset:custom', onCustom);
    return () => editor.off('asset:custom', onCustom);
  });

  /** Apre la libreria e restituisce l'URL scelto (usato dall'inspector) */
  export function pickImage(cb: (src: string) => void) {
    editor.Assets.open({
      types: ['image'],
      select: (asset: Asset, complete: boolean) => { cb(asset.getSrc()); if (complete) editor.Assets.close(); },
    });
  }

  function choose(i: Item) {
    const am = editor.Assets;
    const asset = (am.get(i.src) as Asset | null) || (am.add({ type: 'image', src: i.src, name: i.name }) as Asset);
    amProps?.select(asset, true);
  }

  async function upload(files: File[]) {
    if (!files.length) return;
    busy = true;
    const fd = new FormData();
    files.forEach((f) => fd.append('file', f));
    try {
      const r = await fetch('/api/assets', { method: 'POST', body: fd });
      const res = await r.json().catch(() => ({}));
      if (res.saved?.length) { toast(`${res.saved.length} immagine/i caricate`); await loadUploads(); }
      if (res.errors?.length) toast(res.errors.join(' · '), 'err');
      else if (!r.ok) toast(res.message || 'Caricamento non riuscito', 'err');
    } catch {
      toast('Caricamento non riuscito', 'err');
    } finally {
      busy = false;
    }
  }

  async function removeUpload(i: Item) {
    if (!i.file || !confirm(`Eliminare "${i.name}" dal server?`)) return;
    const r = await fetch(`/api/assets/${i.file}`, { method: 'DELETE' });
    if (r.ok) { editor.Assets.remove(i.src); await loadUploads(); } else toast('Eliminazione non riuscita', 'err');
  }

  function addUrl(ev: SubmitEvent) {
    ev.preventDefault();
    const v = url.trim();
    if (v && !urls.includes(v)) urls = [v, ...urls];
    url = '';
  }

  const close = () => amProps?.close();
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="am-backdrop open" role="presentation" onmousedown={(e) => { if (e.target === e.currentTarget) close(); }}
    onkeydown={(e) => { if (e.key === 'Escape') close(); }}>
    <div class="am" role="dialog" aria-modal="true" aria-labelledby="am-title">
      <header class="am-head">
        <h2 id="am-title"><Icon name="image" size={18} /> Libreria immagini</h2>
        <button type="button" class="icon-btn" aria-label="Chiudi" onclick={close}><Icon name="x" size={18} /></button>
      </header>
      <div class="am-tools">
        <div class="am-drop" class:over role="button" tabindex="0" aria-label="Carica immagini" bind:this={dropEl}
          onclick={() => fileEl?.click()}
          ondragenter={(e) => { e.preventDefault(); over = true; }} ondragover={(e) => { e.preventDefault(); over = true; }}
          ondragleave={() => (over = false)}
          ondrop={(e) => { e.preventDefault(); over = false; upload([...(e.dataTransfer?.files ?? [])]); }}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileEl?.click(); } }}>
          <Icon name="upload" size={22} />
          <span>{#if busy}Caricamento…{:else}<strong>Trascina qui le immagini</strong> oppure <u>scegli i file</u>{/if}</span>
          <small>PNG, JPG, GIF, WebP · max 5 MB</small>
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden bind:this={fileEl}
            onclick={(e) => e.stopPropagation()}
            onchange={(e) => { upload([...(e.currentTarget.files ?? [])]); e.currentTarget.value = ''; }} />
        </div>
        <form class="am-url" onsubmit={addUrl}>
          <input type="url" class="in" placeholder="Incolla l’URL di un’immagine…" aria-label="URL immagine" required bind:value={url} />
          <button class="btn-sm" type="submit"><Icon name="plus" size={14} /> Aggiungi</button>
        </form>
        <div class="am-search"><Icon name="search" size={15} /><input type="search" class="in" placeholder="Cerca…" aria-label="Cerca immagini" bind:value={q} /></div>
      </div>
      <div class="am-grid" role="list">
        {#each items as i (i.src)}
          <div class="am-tile" role="listitem">
            <button type="button" class="am-pick" title="Usa: {i.name}" onclick={() => choose(i)}>
              <span class="am-img"><img src={i.src} alt="" loading="lazy" /></span>
              <span class="am-name">{i.name}</span>
            </button>
            {#if i.kind === 'upload'}
              <button type="button" class="icon-btn am-rm" title="Elimina dal server" aria-label="Elimina {i.name}" onclick={() => removeUpload(i)}><Icon name="trash" size={14} /></button>
            {/if}
          </div>
        {:else}
          <p class="empty">Nessuna immagine.</p>
        {/each}
      </div>
    </div>
  </div>
{/if}
