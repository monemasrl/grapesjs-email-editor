<!--
  Anteprima scalata di un MJML: compilata nel browser e caricata in un iframe
  solo quando entra nel viewport.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { compileMjml } from '$lib/preview';

  interface Props {
    key: string;
    mjml: () => string;
    /** altezza fissa in px; se assente usa l'altezza naturale fino a maxHeight */
    height?: number;
    maxHeight?: number;
  }
  let { key, mjml, height, maxHeight = 260 }: Props = $props();

  const RENDER_W = 640;
  let box: HTMLDivElement;
  let srcdoc = $state<string | null>(null);
  let scale = $state(0.4);
  let natural = $state<number | null>(null);

  const boxHeight = $derived(height ?? (natural === null ? 90 : Math.max(24, Math.min(natural * scale, maxHeight))));
  const cut = $derived(!height && natural !== null && natural * scale > maxHeight);
  const frameHeight = $derived(height ? height / scale : natural ?? 1);

  onMount(() => {
    const io = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      scale = (box.clientWidth || 240) / RENDER_W;
      const html = await compileMjml(key, mjml());
      srcdoc = html.replace('</head>', '<style>html,body{overflow:hidden!important;margin:0}</style></head>');
    }, { rootMargin: '300px' });
    io.observe(box);
    return () => io.disconnect();
  });

  function measure(ev: Event) {
    if (height) return;
    try { natural = (ev.currentTarget as HTMLIFrameElement).contentDocument!.documentElement.scrollHeight; } catch { /* ignore */ }
  }
</script>

<div class="preview" class:is-loaded={srcdoc} class:is-cut={cut} bind:this={box} style:height="{boxHeight}px">
  {#if srcdoc}
    <!-- niente script nell'anteprima; allow-same-origin serve solo a misurarne l'altezza -->
    <iframe
      title=""
      sandbox="allow-same-origin"
      tabindex="-1"
      aria-hidden="true"
      {srcdoc}
      onload={measure}
      style:width="{RENDER_W}px"
      style:height="{frameHeight}px"
      style:transform="scale({scale})"
    ></iframe>
  {/if}
</div>

<style>
  .preview { position: relative; overflow: hidden; background: #fff; flex: none; width: 100%; }
  .preview:not(.is-loaded) { background: linear-gradient(90deg, #f4f4f5, #fafafa, #f4f4f5); }
  iframe { border: 0; transform-origin: 0 0; pointer-events: none; display: block; background: #fff; }
  .is-cut::after { content: ''; position: absolute; inset: auto 0 0 0; height: 28px; background: linear-gradient(transparent, #fff); }
</style>
