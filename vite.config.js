import { defineConfig } from 'vite';
export default defineConfig({ base: '/sample-web3-viewer/', build: { outDir: 'docs', emptyOutDir: false, chunkSizeWarningLimit: 2200 } });
