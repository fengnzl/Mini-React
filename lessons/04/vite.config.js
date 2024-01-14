import { defineConfig } from "vite";

export default defineConfig({
  // https://esbuild.github.io/api/#jsx-factory
  esbuild: {
    jsxFactory: 'MyReact.createElement',
    jsxFragment: 'Fragment',
    jsxInject: `import MyReact from './core/React'`,
  },
})