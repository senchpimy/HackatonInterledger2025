import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        target: 'http://localhost:8080', // <-- CORREGIDO AL PUERTO 8080
        
        // Esta línea es importante, déjala como está
        changeOrigin: true,
      },
    },
  },
});
