import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-tcbs': {
        target: 'https://apipubaws.tcbs.com.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-tcbs/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://tcinvest.tcbs.com.vn/',
          'Origin': 'https://tcinvest.tcbs.com.vn'
        }
      }
    }
  }
})
