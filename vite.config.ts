import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate core react packages
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          // Separate UI / Animation helpers
          if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/framer-motion/') || id.includes('node_modules/sonner/')) {
            return 'ui-vendor';
          }
          // Separate form validation dependencies
          if (id.includes('node_modules/react-hook-form/') || id.includes('node_modules/zod/') || id.includes('node_modules/@hookform/resolvers/')) {
            return 'form-vendor';
          }
          // Separate axios networking dependency
          if (id.includes('node_modules/axios/')) {
            return 'axios-vendor';
          }
        }
      }
    }
  }
})
