import { defineConfig } from "vite";

export default defineConfig({
  // https://esbuild.github.io/api/#jsx-factory
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'Fragment',
    jsxInject: `import React from './core/React'`,
  },
})