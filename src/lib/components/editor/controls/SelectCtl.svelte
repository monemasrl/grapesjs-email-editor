<script lang="ts">
  import Field from './Field.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def, options }: { ctx: Ctx; def: ControlDef; options?: [string, string][] } = $props();

  const v = $derived(ctx.get(def.attr) ?? '');
  const opts = $derived<[string, string][]>([['', def.defaultLabel || 'Predefinito'], ...((options ?? def.options) as [string, string][])]);
  const known = $derived(opts.some(([val]) => val === v));
</script>

<Field label={def.label} hint={def.hint}>
  <select class="in" aria-label={def.label} value={v} onchange={(e) => ctx.set(def.attr, e.currentTarget.value || null)}>
    {#each opts as [val, lab] (val)}<option value={val}>{lab}</option>{/each}
    {#if !known}<option value={v}>{v}</option>{/if}
  </select>
</Field>
