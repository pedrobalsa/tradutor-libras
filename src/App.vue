<script setup lang="ts">
import { useVLibrasInComponent } from './utils/useVLibras';

/**
 * App.vue - Componente raiz da aplicação
 *
 * Responsabilidades:
 * - Inicializar o widget VLibras com proteção global
 * - Renderizar navegação e rotas
 */

// Inicializar VLibras com proteção automática
useVLibrasInComponent({
  enableDebugLogs: true,
});
</script>

<template>
  <div id="app">
    <!-- Widget VLibras (compartilhado entre todas as páginas) -->
    <aside aria-label="Widget de tradução VLibras" role="complementary">
      <div vw class="enabled">
        <div vw-access-button class="active" />
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper !shrink-0" />
        </div>
      </div>
    </aside>

    <!-- Componente de navegação -->

    <router-view />
  </div>
</template>

<style>
/* Estilos globais podem ser adicionados aqui se necessário */
</style>
