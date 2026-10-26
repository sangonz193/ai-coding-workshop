import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 4313, strictPort: true, allowedHosts: ['harness-training.sgonzalez.dev'] },
  preview: { port: 4313, strictPort: true, allowedHosts: ['harness-training.sgonzalez.dev'] },
  build: { rollupOptions: { input: ['index.html', 'presenter.html'] } },
})
