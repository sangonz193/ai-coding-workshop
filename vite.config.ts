import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset URLs let the build be served from any path, such as inside another site.
  base: './',
  server: { port: 4313, strictPort: true },
  preview: { port: 4313, strictPort: true },
  build: { rollupOptions: { input: ['index.html', 'presenter.html'] } },
})
