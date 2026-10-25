import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      external: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore']
    }
  }
})