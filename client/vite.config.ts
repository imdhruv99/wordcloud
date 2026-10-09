import { defineConfig } from 'vite'

// Dev-only: forward API calls to the local Node backend (`npm --prefix server start`).
export default defineConfig({
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
})
