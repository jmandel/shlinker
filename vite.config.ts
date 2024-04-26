import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SHLinker',
      fileName: 'shlinker',
      // formats: ['es'],
    },
    rollupOptions: {
      external: [],
      output: { },
    },
  },
  plugins: [preact()],
});
