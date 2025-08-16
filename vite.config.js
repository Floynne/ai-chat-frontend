import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Добавляем эту секцию, чтобы явно указать, как работать с React
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})