<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import { trackMobileMenuUsage } from '../utils/analytics';

const route = useRoute();
const router = useRouter();

// Estados para controle mobile
const isMobile = ref(false);
const isMenuOpen = ref(false);

// Detectar se é dispositivo móvel
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg breakpoint
};

// Toggle do menu mobile
const toggleMenu = (event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  // Usar setTimeout para garantir que execute mesmo com interferência
  setTimeout(() => {
    const wasOpening = !isMenuOpen.value;
    isMenuOpen.value = !isMenuOpen.value;

    // Track apenas quando abre o menu
    if (wasOpening && isMenuOpen.value) {
      trackMobileMenuUsage();
    }
  }, 0);
};

// Fechar menu ao clicar fora
const closeMenu = () => {
  isMenuOpen.value = false;
};

// Funções de navegação que previnem interferência do VLibras
const navigateToHome = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Fechar menu mobile após navegação
  closeMenu();

  // Forçar navegação mesmo com interferência
  setTimeout(() => {
    router.push('/');
  }, 0);
};

const navigateToSimultaneo = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Fechar menu mobile após navegação
  closeMenu();

  // Forçar navegação mesmo com interferência
  setTimeout(() => {
    router.push('/traducao-simultanea');
  }, 0);
};

onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);

  // Fallback para garantir que o botão do menu sempre funcione
  setTimeout(() => {
    const menuButton = document.querySelector('.menu-button') as HTMLElement;
    if (menuButton) {
      // Adicionar listener direto no DOM como backup
      const forceToggle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleMenu();
      };

      menuButton.addEventListener('mousedown', forceToggle, { capture: true });
      menuButton.addEventListener('touchstart', forceToggle, { capture: true });
      menuButton.addEventListener('click', forceToggle, { capture: true });
    }
  }, 1000);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
});
</script>

<template>
  <!-- Navegação Desktop -->
  <nav
    v-if="!isMobile"
    class="w-full z-50 h-14 fixed top-10 gap-6 px-16 left-0 flex flex-row items-center justify-start"
    data-vlib-ignore="true"
  >
    <h1
      class="text-white text-xl font-bold w-20 leading-5"
      data-vlib-ignore="true"
    >
      Traduz <strong class="text-secondary">Libras</strong>
    </h1>
    <div class="h-full w-1 border-l border-secondary"></div>
    <header
      class="flex flex-row items-center justify-center gap-6"
      data-vlib-ignore="true"
    >
      <a
        href="/"
        class="text-white cursor-pointer text-sm flex flex-row items-center gap-2 nav-link"
        :class="route.path === '/' ? 'text-secondary' : ''"
        data-vlib-ignore="true"
        @mousedown="navigateToHome"
        @click="navigateToHome"
      >
        Tradutor
        <i class="mdi mdi-hand-clap"></i>
      </a>
      <a
        href="/traducao-simultanea"
        class="text-white cursor-pointer text-sm nav-link"
        :class="
          route.path === '/traducao-simultanea'
            ? 'underline decoration-secondary decoration-2 font-bold'
            : ''
        "
        data-vlib-ignore="true"
        @mousedown="navigateToSimultaneo"
        @click="navigateToSimultaneo"
      >
        Tradutor Simultâneo
        <i class="mdi mdi-microphone"></i>
      </a>
    </header>
  </nav>

  <!-- Navegação Mobile -->
  <div v-if="isMobile" class="mobile-navigation">
    <!-- Botão Menu Fixo -->
    <button
      @mousedown="toggleMenu"
      @click="toggleMenu"
      @touchstart="toggleMenu"
      class="fixed top-4 right-4 z-[9999999999992] w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg menu-button"
      data-vlib-ignore="true"
      data-no-translate="true"
      aria-label="Menu de navegação"
      style="
        pointer-events: auto !important;
        position: fixed !important;
        z-index: 9999999 !important;
      "
    >
      <i
        :class="[
          'text-white text-xl transition-transform duration-300',
          isMenuOpen ? 'mdi mdi-close rotate-180' : 'mdi mdi-menu',
        ]"
        data-vlib-ignore="true"
        style="pointer-events: none !important"
      ></i>
    </button>

    <!-- Overlay -->
    <div
      v-if="isMenuOpen"
      @click="closeMenu"
      class="fixed inset-0 bg-black/50 z-[9999999990] backdrop-blur-sm"
    ></div>

    <!-- Menu Mobile -->
    <nav
      v-if="isMenuOpen"
      class="fixed bottom-0 right-0 h-full w-80 max-w-[90vw] bg-midnight/50 border border-secondary backdrop-blur-md z-[9999999999999999999999999999] transform transition-transform duration-300 ease-in-out shadow-2xl"
      data-vlib-ignore="true"
    >
      <div class="p-6 pt-20">
        <!-- Logo Mobile -->
        <header class="mb-8 text-center" data-vlib-ignore="true">
          <h1 class="text-white text-2xl font-bold">
            Traduz <strong class="text-secondary">Libras</strong>
          </h1>
          <p class="text-white-smoke/70 text-sm mt-2">
            Tradução em Língua Brasileira de Sinais
          </p>
        </header>

        <!-- Links de Navegação Mobile -->
        <div class="space-y-4" data-vlib-ignore="true">
          <a
            href="/"
            :class="[
              'w-full p-4 rounded-lg flex items-center gap-4 transition-all duration-200 nav-link-mobile',
              route.path === '/'
                ? 'bg-secondary text-white'
                : 'text-white hover:bg-white/10',
            ]"
            data-vlib-ignore="true"
            @mousedown="navigateToHome"
            @click="navigateToHome"
          >
            <i class="mdi mdi-hand-clap text-2xl"></i>
            <div>
              <div class="font-medium">Tradutor</div>
              <div class="text-sm opacity-70">Tradução básica</div>
            </div>
          </a>

          <a
            href="/traducao-simultanea"
            :class="[
              'w-full p-4 rounded-lg flex items-center gap-4 transition-all duration-200 nav-link-mobile',
              route.path === '/traducao-simultanea'
                ? 'bg-secondary text-white'
                : 'text-white hover:bg-white/10',
            ]"
            data-vlib-ignore="true"
            @mousedown="navigateToSimultaneo"
            @click="navigateToSimultaneo"
          >
            <i class="mdi mdi-microphone text-2xl"></i>
            <div>
              <div class="font-medium">Tradutor Simultâneo</div>
              <div class="text-sm opacity-70">Com reconhecimento de voz</div>
            </div>
          </a>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Garantir que os links de navegação funcionem corretamente */
nav {
  pointer-events: auto !important;
  z-index: 99999999999999999999999999 !important;
  position: relative !important;
}

nav .nav-link {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 99999999999999999999999999 !important;
  display: flex !important;
  cursor: pointer !important;
  user-select: none !important;
}

nav .nav-link:hover {
  text-decoration: underline !important;
}

/* Estilos para navegação mobile */
.mobile-navigation {
  pointer-events: auto !important;
}

.nav-link-mobile {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 99999999999999999999999999 !important;
  cursor: pointer !important;
  user-select: none !important;
  touch-action: manipulation !important;
}

/* Botão menu mobile */
.mobile-navigation button,
.menu-button {
  pointer-events: auto !important;
  touch-action: manipulation !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: fixed !important;
  z-index: 99999999999999999999999999999999999 !important;
  isolation: isolate !important;
}

.menu-button * {
  pointer-events: none !important;
  user-select: none !important;
}

/* Forçar botão sempre funcionar */
.menu-button {
  -webkit-appearance: none !important;
  appearance: none !important;
  border: none !important;
  outline: none !important;
}

.menu-button:active,
.menu-button:focus,
.menu-button:hover {
  pointer-events: auto !important;
  z-index: 999999999999999999999999999 !important;
}

/* Animações para menu mobile */
.mobile-navigation nav {
  transform: translateX(0);
}

/* Prevenir interferência do VLibras */
nav [data-vlib-ignore] {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 99999999999999999999999999 !important;
}

/* Forçar que elementos com data-vlib-ignore sejam clicáveis */
[data-vlib-ignore] {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 99999999999999999999999999 !important;
}

/* Desabilitar seleção de texto nos links */
nav a,
nav a * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* Mobile specific styles */
.mobile-navigation a,
.mobile-navigation a * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* Garantir que overlay seja clicável */
.mobile-navigation div[class*='fixed inset-0'] {
  pointer-events: auto !important;
  touch-action: manipulation !important;
}
</style>

<style>
/* "SS Global par" desabilitar completamente VLibras na navegação */
nav[data-vlib-ignore],
nav[data-vlib-ignore] *,
[data-vlib-ignore],
[data-vlib-ignore] * {
  pointer-events: auto !important;
  z-index: 99999999999999999999999999 !important;
  position: relative !important;
}

/* Prevenir que o VLibras capture eventos na navegação */
nav {
  isolation: isolate !important;
}

/* Forçar navegação sempre funcionar */
.nav-link {
  touch-action: manipulation !important;
}

/* Botão menu mobile - proteção máxima */
.menu-button,
button.menu-button,
[data-vlib-ignore].menu-button {
  pointer-events: auto !important;
  position: fixed !important;
  z-index: 9999999 !important;
  isolation: isolate !important;
  touch-action: manipulation !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}

/* Forçar que o botão seja sempre clicável */
.mobile-navigation .menu-button {
  display: flex !important;
  cursor: pointer !important;
}

/* Prevenir VLibras de capturar eventos do botão */
.menu-button[data-vlib-ignore] {
  pointer-events: auto !important;
}
</style>
