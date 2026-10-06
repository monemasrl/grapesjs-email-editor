<script lang="ts">
  import EditorPage from '$lib/components/editor/EditorPage.svelte';
  let { data } = $props();
</script>

<svelte:head><title>{data.doc.name} · Email Editor</title></svelte:head>

{#key data.doc}
  <EditorPage {...data} />
{/key}
