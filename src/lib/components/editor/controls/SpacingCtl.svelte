<script lang="ts">
  import Field from './Field.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { parseNum, type Ctx } from '$lib/editor/ctx';
  import type { ControlDef } from '$lib/editor/schema';
  let { ctx, def }: { ctx: Ctx; def: ControlDef } = $props();

  const SIDES = ['top', 'right', 'bottom', 'left'] as const;
  const LABEL = { top: 'Sopra', right: 'Destra', bottom: 'Sotto', left: 'Sinistra' };
  const ARROW = { top: '↑', right: '→', bottom: '↓', left: '←' };

  function read(): string[] {
    const p = (ctx.get(def.attr) || '').trim().split(/\s+/).filter(Boolean).map((x) => parseNum(x)?.n ?? '0');
    const [t = '', r = t, b = t, l = r] = p;
    const out = [t, r, b, l];
    // i singoli lati contano solo se impostati esplicitamente (non i predefiniti di grapesjs-mjml)
    if (def.sides !== false) SIDES.forEach((s, i) => {
      const k = `${def.attr}-${s}`;
      const x = parseNum(ctx.get(k));
      if (x && !ctx.isDefault(k)) out[i] = x.n;
    });
    return out;
  }

  let vals = $state(['', '', '', '']);
  let linked = $state(false);
  $effect.pre(() => {
    const v = read(); // variabile locale: leggere `vals` qui creerebbe un ciclo
    vals = v;
    linked = v.every((x) => x === v[0]);
  });

  function commit(i: number) {
    if (linked) vals = vals.map(() => vals[i]);
    const px = vals.map((x) => `${x || 0}px`);
    const out = px.every((x) => x === px[0]) ? px[0] : px[0] === px[2] && px[1] === px[3] ? `${px[0]} ${px[1]}` : px.join(' ');
    ctx.set(def.attr, out, def.sides !== false ? { clear: SIDES.map((s) => `${def.attr}-${s}`) } : {});
  }
</script>

<Field label={def.label} hint={def.hint} full>
  <div class="spacing" class:linked>
    {#each SIDES as s, i (s)}
      <div class="sp sp-{s}">
        <input type="number" class="in" min="0" placeholder="0" aria-label="{def.label}: {LABEL[s]}" bind:value={vals[i]} onchange={() => commit(i)} />
        <span class="sp-l">{ARROW[s]}</span>
      </div>
    {/each}
    <button type="button" class="icon-btn sp-link" title="Valori uguali su tutti i lati" aria-pressed={linked} onclick={() => (linked = !linked)}>
      <Icon name={linked ? 'chain' : 'chainOff'} size={15} />
    </button>
  </div>
</Field>
