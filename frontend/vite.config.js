import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL
    ? env.VITE_API_URL.replace('/api', '').replace(/\/+$/, '')
    : 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Proxy all /api/* requests to the backend in development
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
