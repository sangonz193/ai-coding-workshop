import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 4313, strictPort: true },
  preview: { port: 4313, strictPort: true },
  build: { rollupOptions: { input: ['index.html', 'presenter.html'] } },
})
