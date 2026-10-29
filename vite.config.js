import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/xlsx/')) return 'excel'
          if (id.includes('/node_modules/html2canvas/')) return 'html2canvas'
          if (id.includes('/node_modules/canvg/')) return 'canvg'
          if (id.includes('/node_modules/jspdf-autotable/')) return 'pdf-table'
          if (id.includes('/node_modules/jspdf/')) return 'jspdf'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react-vendor'
          if (id.includes('/node_modules/@tanstack/')) return 'data-vendor'
        },
      },
    },
  },
})
