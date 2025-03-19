/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Define API base URL for production
const prodApiBaseUrl = 'https://jj99cpj221.execute-api.us-west-2.amazonaws.com/prod';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/frontend',
  server:{
    port: 4200,
    host: 'localhost',
  },
  preview:{
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Define environment variables based on mode
  define: {
    'import.meta.env.VITE_API_BASE_URL': mode === 'production'
      ? JSON.stringify(prodApiBaseUrl)
      : JSON.stringify('http://localhost:3001')
  }
}));
