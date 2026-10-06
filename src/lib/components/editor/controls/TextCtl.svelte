<script lang="ts">
  import Field from './Field.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();
</script>

<Field label={def.label} hint={def.hint}>
  <input type="text" class="in" aria-label={def.label} placeholder={def.placeholder ?? ''} value={ctx.get(def.attr) ?? ''}
    onchange={(e) => ctx.set(def.attr, e.currentTarget.value.trim() || null)} />
</Field>
