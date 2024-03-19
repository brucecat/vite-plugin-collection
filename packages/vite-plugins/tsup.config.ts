import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/index.ts'],
  outDir: 'es',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    }
  },
  dts: true,
  format: ['esm'],
  sourcemap: false,
  target: 'esnext',
  ignoreWatch: ['**/*.js', '**/*.d.ts']
  // splitting: true
})
