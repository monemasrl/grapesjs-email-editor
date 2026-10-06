import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // GrapesJS + mjml-browser sono pesanti: per l'editor va bene un chunk grande
  build: { chunkSizeWarningLimit: 4000 },
});
