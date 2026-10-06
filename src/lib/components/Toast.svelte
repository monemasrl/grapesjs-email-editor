<script lang="ts">
  import { toastState } from '$lib/toast.svelte';
</script>

<div id="toast" role="status" aria-live="polite" class:show={toastState.visible} class:err={toastState.kind === 'err'}>{toastState.msg}</div>
