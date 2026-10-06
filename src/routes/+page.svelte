<!-- Galleria: scelta del template di partenza o di un'email salvata -->
<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Preview from '$lib/components/Preview.svelte';
  import { toast } from '$lib/toast.svelte';
  import type { Theme } from '$lib/types';

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  let theme = $state<string>(data.themes.length ? (data.defaultTheme ?? 'all') : 'all');
  let source = $state('all');
  let q = $state('');

  const themeById = $derived(new Map(data.themes.map((t) => [t.id, t])));
  const current = $derived(theme !== 'all' ? themeById.get(theme) : undefined);
  const blankTheme = $derived(current?.id || data.defaultTheme);
  const list = $derived(
    data.templates.filter((t) =>
      (source === 'all' || t.source === source) &&
      (theme === 'all' || !t.theme || t.theme === theme) &&
      (!q.trim() || `${t.name} ${t.group} ${t.sourceLabel}`.toLowerCase().includes(q.trim().toLowerCase()))),
  );
  const fmt = (iso: string) => new Date(iso).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

  async function remove(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"?`)) return;
    const r = await fetch(`/api/emails/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (r.ok) { toast('Email eliminata'); await invalidateAll(); } else toast('Eliminazione non riuscita', 'err');
  }
</script>

{#snippet swatches(t: Theme)}
  <span class="swatches" aria-hidden="true">{#each ['accent', 'accentSoft', 'dark'] as k (k)}<i style:background={t.colors[k as 'accent']}></i>{/each}</span>
{/snippet}

<div class="gallery">
  <header class="topbar">
    <div class="brand"><span class="logo" aria-hidden="true">✉</span> Email Editor</div>
    <div class="topbar-meta">
      {data.templates.length} template · {data.blockCount} blocchi{data.themes.length ? ` · ${data.themes.length} stili` : ''}
    </div>
  </header>

  <main class="gallery-main">
    {#if data.saved.length}
      <section class="gallery-section">
        <h2>Le mie email <span class="count">{data.saved.length}</span></h2>
        <div class="grid">
          {#each data.saved as s (s.id + s.savedAt)}
            {@const th = s.theme ? themeById.get(s.theme) : undefined}
            <a class="card" href="/email/{encodeURIComponent(s.id)}" data-sveltekit-preload-data="off">
              <Preview key="saved:{s.id}:{s.savedAt}" mjml={() => s.mjml} height={300} />
              <div class="card-body">
                <div class="card-title">{s.name}</div>
                <div class="card-meta">{th ? `${th.label} · ` : ''}Salvata {fmt(s.savedAt)}</div>
              </div>
              <button class="card-delete" title="Elimina" aria-label="Elimina {s.name}"
                onclick={(ev) => { ev.preventDefault(); remove(s.id, s.name); }}>✕</button>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <section class="gallery-section">
      <h2>Scegli un template</h2>
      <div class="filters">
        <div class="filter-groups">
          {#if data.themes.length}
            <div class="chips" role="group" aria-label="Stile">
              <span class="chips-label">Stile</span>
              <button class="chip" class:is-active={theme === 'all'} aria-pressed={theme === 'all'} onclick={() => (theme = 'all')}>Tutti</button>
              {#each data.themes as t (t.id)}
                <button class="chip" class:is-active={theme === t.id} aria-pressed={theme === t.id} title={t.description} onclick={() => (theme = t.id)}>
                  {@render swatches(t)}{t.label}
                </button>
              {/each}
            </div>
          {/if}
          {#if data.sources.length > 1}
            <div class="chips" role="group" aria-label="Raccolta">
              <span class="chips-label">Raccolta</span>
              <button class="chip" class:is-active={source === 'all'} aria-pressed={source === 'all'} onclick={() => (source = 'all')}>Tutte <span>{data.templates.length}</span></button>
              {#each data.sources as s (s.id)}
                <button class="chip" class:is-active={source === s.id} aria-pressed={source === s.id} onclick={() => (source = s.id)}>{s.label} <span>{s.templates}</span></button>
              {/each}
            </div>
          {/if}
        </div>
        <input type="search" class="search" placeholder="Cerca template…" aria-label="Cerca template" bind:value={q} />
      </div>

      {#if current}
        <p class="theme-desc">{@render swatches(current)} <strong>{current.label}</strong> — {current.description}</p>
      {/if}

      <div class="grid">
        {#if !q.trim()}
          <a class="card card-blank" href="/edit/blank{blankTheme ? `:${blankTheme}` : ''}">
            <div class="blank-plus" aria-hidden="true">+</div>
            <div class="card-body">
              <div class="card-title">Email vuota</div>
              <div class="card-meta">{blankTheme && themeById.get(blankTheme) ? `Stile ${themeById.get(blankTheme)!.label} · ` : ''}parti da zero con i blocchi</div>
            </div>
          </a>
        {/if}
        {#each list as t (t.id)}
          {@const th = t.theme ? themeById.get(t.theme) : undefined}
          <a class="card" href="/edit/{encodeURIComponent(t.id)}">
            <Preview key="tpl:{t.id}" mjml={() => t.mjml} height={300} />
            <div class="card-body">
              <div class="card-title">{t.name}</div>
              <div class="card-meta">
                {th ? `Stile ${th.label} · ${t.sections} sezioni` : `${t.sourceLabel}${t.group ? ` · ${t.group}` : ''} · ${t.blocks} blocchi`}
              </div>
            </div>
          </a>
        {:else}
          <p class="empty">Nessun template corrisponde alla ricerca.</p>
        {/each}
      </div>
    </section>

    <section class="gallery-section sources">
      <h2>Fonti</h2>
      <table class="sources-table">
        <thead><tr><th>Raccolta</th><th>Template</th><th>Blocchi</th><th>Licenza / origine</th></tr></thead>
        <tbody>
          {#each data.sources as s (s.id)}
            <tr>
              <td>{#if s.repo}<a href="https://github.com/{s.repo}/tree/{s.sha}" target="_blank" rel="noopener">{s.repo}</a>{:else}{s.label}{/if}</td>
              <td>{s.templates}</td><td>{s.blocks}</td><td>{s.license || ''}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  </main>
</div>
