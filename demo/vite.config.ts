import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@engine': path.resolve(__dirname, '../engine'),
            '@demo': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173,
        host: true
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
});

