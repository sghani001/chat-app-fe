import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/channels': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/direct_conversations': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/notifications': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/cable': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
