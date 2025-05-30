import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  // Otimizações de build para SEO e performance
  build: {
    // Usar esbuild (padrão do Vite) - mais rápido e já incluído
    minify: 'esbuild',

    // Chunking estratégico para melhor cache
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
        },
      },
    },

    // Otimizações de assets
    assetsInlineLimit: 4096, // Inline assets pequenos
    cssCodeSplit: true, // Separar CSS em chunks

    // Otimizações adicionais para produção
    reportCompressedSize: false, // Acelera o build
    chunkSizeWarningLimit: 1000, // Tamanho de chunk em KB
  },

  // Otimizações de servidor de desenvolvimento
  server: {
    host: true,
  },

  // Configurações de PWA e SEO
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
