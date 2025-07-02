import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@heroicons/react', 'framer-motion'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['date-fns'],
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'rehype-raw']
        }
      }
    },
    // Increase chunk size warning limit or optimize chunks
    chunkSizeWarningLimit: 600
  }
})