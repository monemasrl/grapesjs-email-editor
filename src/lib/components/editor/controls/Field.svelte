<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, full = false, hint = '', children }: { label?: string; full?: boolean; hint?: string; children: Snippet } = $props();
</script>

<div class="ctl" class:ctl-full={full}>
  {#if label}<span class="ctl-label" title={hint}>{label}</span>{/if}
  {@render children()}
</div>
