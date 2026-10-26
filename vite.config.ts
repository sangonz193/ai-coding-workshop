import { defineConfig } from 'vite'

export default defineConfig({
  // The tunnel reaches the host over IPv4, while Vite's default localhost can bind to IPv6 only.
  server: { host: '127.0.0.1', port: 4313, strictPort: true, allowedHosts: ['harness-training.sgonzalez.dev'] },
  preview: { host: '127.0.0.1', port: 4313, strictPort: true, allowedHosts: ['harness-training.sgonzalez.dev'] },
  build: { rollupOptions: { input: ['index.html', 'presenter.html'] } },
})
