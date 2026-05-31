import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      // Stabilise HMR — prevents reloads triggered by unrelated socket errors.
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
