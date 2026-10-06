<script lang="ts">
  import Field from './Field.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { COLOR_NAMES, type Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();

  const v = $derived((ctx.get(def.attr) || '').trim());
  const isHex = $derived(/^#[0-9a-f]{6}$/i.test(v));
  const empty = $derived(!v || v === 'transparent' || v === 'none');
  let live = $state<string | null>(null); // anteprima mentre si trascina nel selettore
  $effect.pre(() => { void v; live = null; });
</script>

<Field label={def.label} hint={def.hint} full>
  <div class="color">
    <div class="color-row">
      <label class="color-pick">
        <span class="color-swatch" class:is-empty={empty && !live} style:background={live || (empty ? undefined : v)}></span>
        <input type="color" class="color-native" aria-label="{def.label}: scegli colore" value={isHex ? v : '#ffffff'}
          oninput={(e) => (live = e.currentTarget.value)} onchange={(e) => ctx.set(def.attr, e.currentTarget.value)} />
      </label>
      <input type="text" class="in color-hex" aria-label="{def.label}: codice colore" spellcheck="false" placeholder="nessuno"
        value={live || v} onchange={(e) => ctx.set(def.attr, e.currentTarget.value.trim() || null)} />
      <button type="button" class="icon-btn" title="Nessun colore" aria-label="Nessun colore" onclick={() => ctx.set(def.attr, null)}>
        <Icon name="ban" size={15} />
      </button>
    </div>
    {#if ctx.theme}
      <div class="palette" role="group" aria-label="Colori dello stile">
        {#each Object.entries(ctx.theme.colors) as [k, c] (k)}
          <button type="button" class="pal" class:on={c.toLowerCase() === v.toLowerCase()} style:background={c}
            title="{COLOR_NAMES[k] || k} · {c}" aria-label="{COLOR_NAMES[k] || k} {c}" onclick={() => ctx.set(def.attr, c)}></button>
        {/each}
      </div>
    {/if}
  </div>
</Field>
