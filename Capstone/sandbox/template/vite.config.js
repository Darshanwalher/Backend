import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
    hmr: {
      // Browser connects via ingress on port 80 at {sandboxId}.preview.localhost
      // Vite must tell its client JS to open the HMR WebSocket back to that same host/port
      clientPort: 80,
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['node_modules']
    }
  }
})

