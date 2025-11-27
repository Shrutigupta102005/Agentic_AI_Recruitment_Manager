import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/rank': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/generate-jd': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
