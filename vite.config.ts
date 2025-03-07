import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(),
    AutoImport({
      imports: ['vue'],
      resolvers: [VantResolver()],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      dirs: [
        'src/components',
        'src/components/tabs',
        'src/components/common',
        'src/components/hashTags',
        'src/components/search',
      ],
      dts: 'components.d.ts.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3033,
  },
})
