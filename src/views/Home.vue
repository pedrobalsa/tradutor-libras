<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  trackLoadTime,
  trackHistoryDialogOpen,
  trackHistoryDialogClose,
} from '../utils/analytics';
import { useTranslate } from '../utils/useTranslate';
import Historic from '../components/Historic.vue';
import MobileDialog from '../components/MobileDialog.vue';

const inputText = ref('');
const inputRef = ref<HTMLTextAreaElement | null>(null);
const showHistoryDialog = ref(false);

// Usar o composable para tradução (histórico gerenciado automaticamente pelo composable)
const {
  isTranslating,
  translatingText,
  translateText: handleTranslateText,
} = useTranslate({
  onTranslationStart: () => {
    // Callback opcional para ações quando tradução inicia
  },
  onTranslationComplete: () => {
    // Callback opcional para ações quando tradução completa
  },
  onTranslationError: error => {
    console.error('Erro na tradução:', error);
  },
});

// Track do tempo de carregamento da página
const pageLoadStart = Date.now();

// Função para detectar dispositivos móveis
const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  const isSmallScreen = window.innerWidth < 1024;
  return isMobile || isSmallScreen;
};

// Função para recolher teclado mobile
const hideKeyboardOnMobile = () => {
  if (isMobileDevice() && inputRef.value) {
    // Remover foco do input para esconder teclado
    inputRef.value.blur();

    // Prevenir que o auto-focus aconteça imediatamente
    setTimeout(() => {
      // Scroll para o topo para garantir que o VLibras seja visível
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
};

const translateText = (event?: Event) => {
  if (!inputText.value.trim()) return;

  // Prevenir interferência do VLibras
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  // Usar setTimeout para garantir execução mesmo com interferência
  setTimeout(async () => {
    if (!inputText.value.trim()) return;

    // Recolher teclado mobile antes de iniciar tradução
    hideKeyboardOnMobile();

    try {
      // Usar o composable para realizar a tradução
      await handleTranslateText(inputText.value, 'manual');

      // Limpar o input após iniciar a tradução
      inputText.value = '';
    } catch (error) {
      console.error('Erro na tradução:', error);
    }
  }, 0);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    // Recolher teclado mobile ao pressionar Enter
    hideKeyboardOnMobile();

    translateText();
  }
};

const handleFocus = () => {
  // Limpar o texto de tradução e desativar modo de tradução quando o usuário focar no input novamente
  if (translatingText.value) {
    translatingText.value = '';
    isTranslating.value = false;
  }

  // Em mobile, quando o usuário toca no input após tradução, permitir nova edição
  if (isMobileDevice() && isTranslating.value) {
    isTranslating.value = false;
  }
};

const handleBlur = () => {
  // Não fazer nada durante o modo de tradução
  if (isTranslating.value) {
    return;
  }

  // Em dispositivos móveis, não retornar foco automaticamente
  if (isMobileDevice()) {
    return;
  }

  // Apenas retornar foco se não há texto sendo traduzido e o foco realmente foi perdido
  setTimeout(() => {
    if (
      !translatingText.value &&
      !isTranslating.value &&
      document.activeElement !== inputRef.value
    ) {
      inputRef.value?.focus();
    }
  }, 100);
};

const openHistoryDialog = () => {
  showHistoryDialog.value = true;
  trackHistoryDialogOpen();
};

const closeHistoryDialog = (
  method: 'button' | 'overlay' | 'retranslate' = 'button'
) => {
  showHistoryDialog.value = false;
  trackHistoryDialogClose(method);
};

onMounted(() => {
  // Track do tempo de carregamento da página
  const loadTime = Date.now() - pageLoadStart;
  trackLoadTime('home', loadTime);

  // Configurar foco inicial apenas se não há tradução e não é mobile
  setTimeout(() => {
    if (!translatingText.value && !isTranslating.value && !isMobileDevice()) {
      inputRef.value?.focus();
    }
  }, 500);

  // Manter foco apenas quando necessário (não em mobile)
  document.addEventListener('click', e => {
    // Só redirecionar foco se não clicou no próprio input E não há tradução em andamento E não é mobile
    if (
      e.target !== inputRef.value &&
      !translatingText.value &&
      !isTranslating.value &&
      !isMobileDevice()
    ) {
      setTimeout(() => {
        // Verificar novamente antes de focar
        if (
          !isTranslating.value &&
          !translatingText.value &&
          !isMobileDevice()
        ) {
          inputRef.value?.focus();
        }
      }, 50);
    }
  });

  // Foco apenas em teclas especiais (não caracteres normais) e não em mobile
  document.addEventListener('keydown', e => {
    // Fechar dialog de histórico com Escape
    if (e.key === 'Escape' && showHistoryDialog.value) {
      closeHistoryDialog();
      return;
    }

    // Só redirecionar foco se não está no input E é uma tecla especial E não há tradução em andamento E não é mobile
    if (
      document.activeElement !== inputRef.value &&
      !translatingText.value &&
      !isTranslating.value &&
      !isMobileDevice() &&
      (e.key === 'Tab' || e.key === 'Escape' || e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      // Verificar novamente antes de focar
      if (!isTranslating.value && !translatingText.value && !isMobileDevice()) {
        inputRef.value?.focus();
      }
    }
  });
});
</script>

<template>
  <main
    class="relative w-full flex flex-col xl:justify-center justify-end items-start mx-auto h-screen"
    role="main"
    aria-label="Aplicativo Tradutor para Libras"
  >
    <!-- Input de texto para tradução -->
    <section
      class="w-full xl:w-1/2 flex xl:h-full p-4 items-center justify-center"
      aria-label="Seção de tradução de texto"
    >
      <div
        class="z-10 flex flex-col w-full pt-4 max-w-[500px] justify-start gap-4 max-xl:gap-2 items-start"
      >
        <h1 class="xl:text-3xl text-2xl font-bold" id="main-title">
          Traduz <strong class="text-secondary">Libras</strong>
        </h1>
        <p class="text-sm max-xl:text-xs">
          Converta texto em português para linguagem de sinais de forma rápida e
          gratuita.
        </p>

        <div class="w-full mt-2">
          <label for="text-input" class="sr-only">
            Digite o texto que deseja traduzir para Libras
          </label>
          <textarea
            id="text-input"
            ref="inputRef"
            v-model="inputText"
            placeholder="Digite o texto que você quer traduzir para Libras"
            class="w-full px-4 py-3 h-40 max-2xl:h-32 max-lg:text-sm flex flex-col text-midnight items-start justify-start text-lg rounded-lg !outline-none bg-white-smoke resize-none"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            aria-describedby="input-instructions"
            aria-label="Campo de texto para tradução"
          >
          </textarea>
        </div>

        <div class="w-full flex flex-row items-center gap-2">
          <button
            @click="openHistoryDialog"
            @mousedown.prevent="openHistoryDialog"
            @touchstart.prevent="openHistoryDialog"
            class="h-10 w-10 xl:hidden flex bg-primary text-white rounded-full shrink-0 items-center justify-center hover:bg-primary/90 transition-colors duration-200"
            aria-label="Abrir histórico de traduções"
            data-vlib-ignore="true"
            data-no-translate="true"
          >
            <i class="mdi mdi-history" aria-hidden="true"></i>
          </button>
          <button
            @mousedown="translateText"
            @click="translateText"
            @touchstart="translateText"
            class="w-full h-10 cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-secondary text-white transition-all duration-300 rounded-md flex items-center justify-center select-none hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 translate-button"
            aria-label="Traduzir texto para Libras"
            :disabled="!inputText.trim() || isTranslating"
            data-vlib-ignore="true"
            data-no-translate="true"
          >
            <span data-vlib-ignore="true">{{
              isTranslating ? 'Traduzindo...' : 'Traduzir'
            }}</span>
            <i
              :class="
                isTranslating ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-hand-clap'
              "
              class="mdi ml-3 text-xl"
              aria-hidden="true"
              data-vlib-ignore="true"
            ></i>
          </button>
        </div>

        <div class="text-sm text-right xl:-mt-2 w-full" id="input-instructions">
          <span class="max-lg:text-xs"
            >ou pressione <strong>Enter </strong>
            <i class="mdi mdi-keyboard-return" aria-hidden="true"></i> para
            traduzir</span
          >
        </div>
        <Historic data-vlib-ignore="true" class="max-xl:hidden" />
      </div>
    </section>

    <!-- Dialog de histórico para mobile -->
    <MobileDialog
      :is-open="showHistoryDialog"
      title="Histórico de Traduções"
      max-height="80vh"
      content-class="pr-1"
      @close="closeHistoryDialog"
    >
      <Historic
        data-vlib-ignore="true"
        :on-close-dialog="() => closeHistoryDialog('retranslate')"
      />
    </MobileDialog>

    <!-- Texto sendo traduzido -->
    <div
      v-if="translatingText"
      class="fixed max-xl:hidden top-4 xl:right-[calc(50%-150px)] right-4 left-4 xl:left-auto xl:w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-[9999999999]"
      role="status"
      aria-live="polite"
      aria-label="Status da tradução"
    >
      <p class="text-sm text-gray-600 mb-1">Traduzindo:</p>
      <p
        class="text-midnight font-medium line-clamp-2 text-ellipsis"
        aria-label="Texto sendo traduzido"
      >
        {{ translatingText }}
      </p>
    </div>
  </main>
</template>

<style scoped>
/* Estilos específicos do componente Home (proteção VLibras é global em style.css) */
</style>
