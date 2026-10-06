<script lang="ts">
  import Field from './Field.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();

  const v = $derived(ctx.get(def.attr) || '');
  const open = () => ctx.pickImage((src) => ctx.set(def.attr, src));
</script>

<Field label={def.label} hint={def.hint} full>
  <div class="img-ctl">
    <button type="button" class="img-thumb" title="Scegli dalla libreria" aria-label="Scegli dalla libreria" onclick={open}>
      {#if v}<img src={v} alt="" />{:else}<Icon name="image" size={22} />{/if}
    </button>
    <div class="img-actions">
      <button type="button" class="btn-sm" onclick={open}><Icon name="image" size={14} /> Libreria</button>
      {#if def.clearable && v}
        <button type="button" class="btn-sm" onclick={() => ctx.set(def.attr, null)}><Icon name="x" size={14} /> Rimuovi</button>
      {/if}
    </div>
    <input type="text" class="in" aria-label="URL immagine" placeholder="https://…" value={v}
      onchange={(e) => ctx.set(def.attr, e.currentTarget.value.trim() || null)} />
  </div>
</Field>
