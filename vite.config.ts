import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      '/BOAppLoginServlet': {
        target: 'http://127.0.0.1:8080/settocbcBoServer',
        changeOrigin: true,
      },
      '/BOAppPullServlet': {
        target: 'http://127.0.0.1:8080/settocbcBoServer',
        changeOrigin: true,
      },
      '/FOAdminPushServlet': {
        target: 'http://127.0.0.1:8080/settocbcBoServer',
        changeOrigin: true,
      },
    },
  },
})
