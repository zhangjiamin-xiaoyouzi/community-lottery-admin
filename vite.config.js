import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/community-lottery-admin/',
  plugins: [vue()],
  server: {
    port: 5174,
    host: true
  }
})
