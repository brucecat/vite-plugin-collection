import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import reactSwc from '@huang/vite-plugins/es/plugin-react-swc'
import calculateDistSizePlugin from '@huang/vite-plugins/es/plugin-calculate-dist-size'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactSwc(), calculateDistSizePlugin({ distPath: '' })]
})
