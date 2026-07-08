import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '127.0.0.1',
    // 统一走部署上下文 /settocbcBoServer，对齐旧系统真实路径
    // （解决 secID cookie path + 真实 servlet 路由对齐）
    proxy: {
      '/settocbcBoServer': {
        target: 'http://localhost:8080/',
        changeOrigin: true,
      },
    },
  },
})
