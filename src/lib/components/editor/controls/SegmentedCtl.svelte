<script lang="ts">
  import Field from './Field.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef, SegOption } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();
  const v = $derived(ctx.get(def.attr) ?? def.fallback ?? '');
</script>

<Field label={def.label} hint={def.hint}>
  <div class="seg" role="group" aria-label={def.label}>
    {#each def.options as SegOption[] as o (o.value)}
      <button type="button" class="seg-btn" class:on={o.value === v} title={o.title || o.label || ''} aria-pressed={o.value === v}
        onclick={() => ctx.set(def.attr, o.value)}>
        {#if o.icon}<Icon name={o.icon} size={16} />{:else}{o.label}{/if}
      </button>
    {/each}
  </div>
</Field>
