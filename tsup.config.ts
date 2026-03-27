import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/configs/ts.ts', 'src/configs/vue.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
