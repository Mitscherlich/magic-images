import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      cli: './src/cli.ts',
      index: './src/index.ts',
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
    },
  ],
});
