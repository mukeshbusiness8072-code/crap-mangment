import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        search: resolve(__dirname, 'search.html'),
        checkout: resolve(__dirname, 'checkout.html'),
      },
    },
  },
  server: {
    host: true,
    open: '/catalog.html',
  },
});
