<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTranslationHistoryStore } from '../stores/translationHistory';
import { useTranslate } from '../utils/useTranslate';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { trackRetranslate, trackVideoDownload } from '../utils/analytics';
import type { TranslationHistoryItem } from '../types/translation';

/**
 * Componente para exibir o histórico de traduções
 *
 * Funcionalidades:
 * - Exibe as últimas 10 traduções realizadas
 * - Mostra texto e tempo relativo de cada tradução
 * - Interface responsiva com ícone de refresh
 * - Estado vazio quando não há traduções
 * - Integração automática com store Pinia
 */

interface Props {
  onCloseDialog?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  onCloseDialog: undefined,
});

const { isTranslating, translateText: handleTranslateText } = useTranslate({
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

// Store para acessar o histórico
const translationHistoryStore = useTranslationHistoryStore();

// Obter traduções recentes (últimas 10)
const recentTranslations = computed(() =>
  translationHistoryStore.getRecentTranslations(10)
);

const translateAgain = (event: Event, text: string) => {
  console.log('translateAgain', text);
  // Prevenir interferência do VLibras
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  // Track retranslate action
  trackRetranslate(text.length, 'history');

  // Usar setTimeout para garantir execução
  setTimeout(() => {
    if (!isTranslating.value) {
      handleTranslateText(text, 'manual');
      // Fechar dialog mobile se a função estiver disponível
      props.onCloseDialog?.();
    }
  }, 0);
};

const downloadVideo = (translation: TranslationHistoryItem) => {
  if (!translation.videoBlob) return;

  // Track video download
  trackVideoDownload(
    translation.videoBlob.size,
    translation.id,
    translation.text.length
  );

  // Determinar extensão baseada no tipo MIME
  const mimeType = translation.videoBlob.type;
  let extension = 'mp4'; // Padrão MP4

  if (mimeType.includes('webm')) {
    extension = 'webm';
  } else if (mimeType.includes('mp4')) {
    extension = 'mp4';
  }

  console.log('🎬 Iniciando download de vídeo...', {
    size: translation.videoBlob.size,
    type: mimeType,
    extension,
  });

  const url = URL.createObjectURL(translation.videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traducao-${translation.text.substring(0, 20)}-${translation.id}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('✅ Download concluído:', {
    size: translation.videoBlob.size,
    format: mimeType,
    extension,
  });
};

const controlsDelay = ref(true);
onMounted(() => {
  setTimeout(() => {
    controlsDelay.value = false;
  }, 3000);
});
</script>

<template>
  <div data-vlib-ignore="true" class="w-full">
    <h2 class="text-lg font-semibold mb-4 text-white-smoke">
      Histórico de Traduções
    </h2>

    <div
      v-if="recentTranslations.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <p>Nenhuma tradução realizada ainda.</p>
    </div>

    <div
      v-else
      data-vlib-ignore="true"
      class="space-y-3 pr-1 2xl:max-h-[300px] xl:max-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar"
    >
      <div
        v-for="translation in recentTranslations"
        :class="translation.status === 'traduzindo' ? 'bg-primary/20' : ''"
        class="border-x border-primary transition-all duration-300 rounded-lg p-4 shadow-sm hover:shadow-md ease-in-out"
      >
        <div class="flex items-start gap-4 justify-between mb-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white-smoke/80">
              {{ translation.text }}
            </p>
          </div>
          <div class="flex flex-col items-end justify-end gap-2">
            <div class="flex gap-2">
              <button
                v-if="translation.videoBlob"
                class="translate-button text-base disabled:opacity-50 disabled:cursor-not-allowed text-white-smoke/80 hover:text-white-smoke transition-colors duration-300"
                @click="downloadVideo(translation)"
                @mousedown.prevent="downloadVideo(translation)"
                @touchstart.prevent="downloadVideo(translation)"
                data-vlib-ignore="true"
                data-no-translate="true"
                :disabled="controlsDelay"
                type="button"
                aria-label="Baixar vídeo da tradução"
              >
                <i class="mdi mdi-download" aria-hidden="true"></i>
              </button>
              <button
                class="translate-button text-base disabled:opacity-50 disabled:cursor-not-allowed text-white-smoke/80 hover:text-white-smoke transition-colors duration-300"
                @click="translateAgain($event, translation.text)"
                @mousedown.prevent="translateAgain($event, translation.text)"
                @touchstart.prevent="translateAgain($event, translation.text)"
                data-vlib-ignore="true"
                data-no-translate="true"
                type="button"
                :disabled="isTranslating || controlsDelay"
                aria-label="Traduzir novamente"
              >
                <i
                  :class="
                    translation.status === 'traduzindo'
                      ? 'mdi mdi-loading mdi-spin'
                      : 'mdi mdi-refresh'
                  "
                  aria-hidden="true"
                ></i>
              </button>
            </div>
            <span class="text-xs text-white-smoke/60">{{
              formatRelativeTime(translation.created_at)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="recentTranslations.length > 0"
      class="mt-4 pt-4 border-t border-primary"
    >
      <p class="text-xs text-white-smoke/60 text-center">
        Mostrando {{ recentTranslations.length }}
        {{
          recentTranslations.length === 1
            ? 'tradução recente'
            : 'traduções recentes'
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionais podem ser adicionados aqui se necessário */
.custom-scrollbar {
  scrollbar-width: thin;

  scrollbar-color: var(--color-white-smoke) var(--color-midnight);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-midnight);
}
</style>
