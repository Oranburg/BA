import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is set to /BA/ for GitHub Pages project deployment at oranburg.github.io/BA/
export default defineConfig({
  plugins: [react()],
  base: '/BA/',
})
