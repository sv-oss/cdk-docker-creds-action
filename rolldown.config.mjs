import { defineConfig } from 'rolldown';

export default defineConfig({
  input: './lib/index.js',
  output: {
    file: './dist/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  platform: 'node',
  resolve: {
    conditionNames: ['node', 'require', 'import', 'default'],
  },
});
