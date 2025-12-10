import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Garante que o app funcione independente do caminho (importante para APK/Cordova/Capacitor)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});