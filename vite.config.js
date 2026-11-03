import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
    })
  ],
  // En desarrollo la app se sirve en el 5173 y la API corre en el backend
  // (puerto definido en backend/.env). Sin este proxy las llamadas a /api
  // se quedan en Vite y responden 404.
  server: {
    proxy: {
      '/api': 'http://localhost:4900'
    }
  }
})