<script lang="ts">
  import Field from './Field.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();
  const on = $derived((ctx.get(def.attr) ?? '') === def.on);
</script>

<Field label={def.label} hint={def.hint}>
  <label class="switch">
    <input type="checkbox" checked={on} onchange={(e) => ctx.set(def.attr, e.currentTarget.checked ? def.on! : (def.off ?? null))} />
    <span class="switch-ui" aria-hidden="true"></span>
    <span class="switch-text">{def.text ?? ''}</span>
  </label>
</Field>
