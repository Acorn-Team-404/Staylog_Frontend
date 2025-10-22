import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {  // 프록시할 경로
        target: 'http://localhost:9090', // 백엔드 서버 주소
        changeOrigin: true, 
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 제거 
      },
    },
  },
})
