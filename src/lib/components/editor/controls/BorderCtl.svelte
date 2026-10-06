<script lang="ts">
  import Field from './Field.svelte';
  import type { Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();

  const STYLES: [string, string][] = [['solid', 'Continuo'], ['dashed', 'Tratteggio'], ['dotted', 'Punti'], ['double', 'Doppio']];
  const raw = $derived((ctx.get(def.attr) || '').trim());
  const m = $derived(/^(\d+(?:\.\d+)?)px\s+(solid|dashed|dotted|double)\s+(\S+)$/.exec(raw));
  const none = $derived(!raw || raw === 'none' || raw === '0' || raw === '0px');

  let w = $state('');
  let style = $state('solid');
  let color = $state('#dddddd');
  $effect.pre(() => {
    w = m ? m[1] : '';
    style = m?.[2] || 'solid';
    color = /^#[0-9a-f]{6}$/i.test(m?.[3] || '') ? m![3] : ctx.theme?.colors.border || '#dddddd';
  });
  const commit = () => ctx.set(def.attr, !w || w === '0' ? null : `${w}px ${style} ${color}`);
</script>

<Field label={def.label} hint={def.hint} full>
  <div class="border-ctl">
    <input type="number" class="in" min="0" placeholder="0" aria-label="{def.label}: spessore" bind:value={w} onchange={commit} />
    <span class="unit-fixed">px</span>
    <select class="in" aria-label="{def.label}: stile" bind:value={style} onchange={commit}>
      {#each STYLES as [v, l] (v)}<option value={v}>{l}</option>{/each}
    </select>
    <input type="color" class="color-native-sm" aria-label="{def.label}: colore" bind:value={color} onchange={commit} />
    {#if !m && !none}<div class="ctl-note">Attuale: {raw}</div>{/if}
  </div>
</Field>
