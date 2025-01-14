import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dts: true, // generate TypeScript declaration
      // eslintrc: {
      //   enabled: true, // generate ESLint configuration
      // },
      imports: ['vue'],
      resolvers: [VantResolver()],
    }),
    Components({
      dirs: [
        'src/components',
        'src/components/tabs',
        'src/components/common',
      ],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
