import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones que empiezan por /api al servidor backend
      '/api': {
        target: 'http://localhost:8080', // La URL de nuestro backend en Go
        changeOrigin: true, // Necesario para vhosts
        // No reescribimos la ruta, ya que tanto el frontend como el backend usan /api
      },
    },
  },
})