    // frontend/vite.config.js
    import { defineConfig } from 'vite';
    import vue from '@vitejs/plugin-vue';
    import tailwindcss from '@tailwindcss/vite'; // Import the Tailwind CSS Vite plugin

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [
        vue(),
        tailwindcss(), // Add the Tailwind CSS plugin here
      ],
      // Add any other Vite configurations if needed, e.g., for proxying API calls
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000', // Your backend URL
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '/api'),
          },
        },
      },
    });
    