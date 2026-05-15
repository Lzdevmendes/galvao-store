import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/schema/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
  outDir: 'dist',
  external: ['@libsql/client', 'drizzle-orm', 'libsql'],
  esbuildOptions(opts) {
    opts.conditions = ['module', 'import', 'default']
  },
})
