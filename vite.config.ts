import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  server: {
    // ...existing code...
    proxy: {
      '/api/allbridge': {
        target: 'https://core.api.allbridgecoreapi.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/allbridge/, ''),
        secure: true,
      },
    },
  }
})