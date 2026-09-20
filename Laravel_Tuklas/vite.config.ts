import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import laravel from 'laravel-vite-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GOOGLE_AI_API_KEY) process.env.GOOGLE_AI_API_KEY = env.GOOGLE_AI_API_KEY
  if (env.atlas_URL || env.MONGODB_URI) process.env.atlas_URL = env.atlas_URL || env.MONGODB_URI
  if (env.MONGODB_DB_NAME) process.env.MONGODB_DB_NAME = env.MONGODB_DB_NAME
  if (env.MONGODB_DNS_SERVERS) process.env.MONGODB_DNS_SERVERS = env.MONGODB_DNS_SERVERS
  if (env.GEMINI_MODELS) process.env.GEMINI_MODELS = env.GEMINI_MODELS

  return {
    server: {
      host: true,
      port: 5173,
    },
    plugins: [react(), laravel({ input: ['resources/js/main.tsx', 'resources/css/app.css'], refresh: true })],
  }
})
