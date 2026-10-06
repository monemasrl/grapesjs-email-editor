<script lang="ts">
  import Field from './Field.svelte';
  import { parseNum, type Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();

  const units = $derived(def.units ?? ['px']);
  const cur = $derived(parseNum(ctx.get(def.attr)));
  let num = $state('');
  let unit = $state('px');
  $effect.pre(() => { num = cur?.n ?? ''; unit = cur?.u || units[0]; });

  const commit = () => ctx.set(def.attr, num === '' || num === null ? null : `${num}${unit}`);
</script>

<Field label={def.label} hint={def.hint}>
  <div class="num">
    <input type="number" class="in" aria-label={def.label} min={def.min} max={def.max} step={def.step ?? 1}
      placeholder={def.placeholder ?? 'auto'} bind:value={num} onchange={commit} />
    {#if units.length > 1}
      <select class="in unit" aria-label="Unità" bind:value={unit} onchange={commit}>
        {#each units as u (u)}<option>{u}</option>{/each}
      </select>
    {:else}
      <span class="unit-fixed">{units[0]}</span>
    {/if}
  </div>
</Field>
