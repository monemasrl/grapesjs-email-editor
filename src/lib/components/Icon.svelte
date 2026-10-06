<script lang="ts">
  import { icon } from '$lib/editor/icons';
  let { name, size = 18, class: cls = '' }: { name: string; size?: number; class?: string } = $props();
</script>

{@html icon(name, size, cls)}
