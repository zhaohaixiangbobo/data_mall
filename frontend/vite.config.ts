import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 兼容 Chromium 69 及以上的政企浏览器；CSS 兼容由 Tailwind v3 负责。
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'chrome69',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})