<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="loading err">
  <h1 style="font-size:20px;margin:0 0 8px">{page.status === 404 ? 'Pagina non trovata' : 'Si è verificato un errore'}</h1>
  <p>{page.error?.message}</p>
  <p><a href="/">← Torna ai template</a></p>
</div>
