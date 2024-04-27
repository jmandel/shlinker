import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SHLinker',
      fileName: 'shlinker',
    },
    rollupOptions: {
      output: {
        format: 'es',
        sourcemap: true,
        minifyInternalExports: false,
        compact: false,
        
        globals: {},
      },
    },

  },
  plugins: [preact(), 
  ],
});
