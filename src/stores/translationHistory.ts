import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TranslationHistoryItem } from '../types/translation';

const TRANSLATION_HISTORY_COOKIE_KEY = 'translation_history';

export const useTranslationHistoryStore = defineStore(
  'translationHistory',
  () => {
    // Estado
    const translations = ref<TranslationHistoryItem[]>([]);

    // Getters
    const getTranslations = computed(() => translations.value);

    const getTranslationById = computed(() => {
      return (id: string) =>
        translations.value.find((t: TranslationHistoryItem) => t.id === id);
    });

    const getRecentTranslations = computed(() => {
      return (limit: number = 10) =>
        translations.value
          .sort(
            (a: TranslationHistoryItem, b: TranslationHistoryItem) =>
              b.created_at - a.created_at
          )
          .slice(0, limit);
    });

    const getTranslationsByStatus = computed(() => {
      return (status: TranslationHistoryItem['status']) =>
        translations.value.filter(
          (t: TranslationHistoryItem) => t.status === status
        );
    });

    // Actions
    /**
     * Adiciona uma nova tradução ao histórico ou atualiza uma existente.
     *
     * Se já existir uma tradução com o mesmo texto:
     * - Atualiza o created_at para a data/hora atual
     * - Atualiza o status
     * - Move para o início da lista (mais recente)
     *
     * Se não existir:
     * - Cria uma nova entrada no histórico
     *
     * @param text - Texto da tradução
     * @param status - Status inicial da tradução
     * @returns ID da tradução (existente ou nova)
     */
    const addTranslation = (
      text: string,
      status: TranslationHistoryItem['status'] = 'traduzindo'
    ) => {
      // Verificar se já existe uma tradução com o mesmo texto
      const existingTranslation = translations.value.find(
        (t: TranslationHistoryItem) => t.text === text
      );

      if (existingTranslation) {
        // Atualizar created_at e status da tradução existente
        existingTranslation.created_at = Date.now();
        existingTranslation.status = status;

        // Mover para o início da lista (mais recente)
        const index = translations.value.indexOf(existingTranslation);
        if (index > 0) {
          translations.value.splice(index, 1);
          translations.value.unshift(existingTranslation);
        }

        saveToCookies();
        return existingTranslation.id;
      }

      // Se não existe, criar nova tradução
      const newTranslation: TranslationHistoryItem = {
        id: generateId(),
        text,
        created_at: Date.now(),
        status,
      };

      translations.value.unshift(newTranslation);
      saveToCookies();

      return newTranslation.id;
    };

    const updateTranslationStatus = (
      id: string,
      status: TranslationHistoryItem['status']
    ) => {
      const translation = translations.value.find(
        (t: TranslationHistoryItem) => t.id === id
      );
      if (translation) {
        translation.status = status;
        saveToCookies();
      }
    };

    const removeTranslation = (id: string) => {
      const index = translations.value.findIndex(
        (t: TranslationHistoryItem) => t.id === id
      );
      if (index > -1) {
        translations.value.splice(index, 1);
        saveToCookies();
      }
    };

    const clearHistory = () => {
      translations.value = [];
      saveToCookies();
    };

    const updateTranslationVideo = (id: string, videoBlob: Blob) => {
      const translation = translations.value.find(
        (t: TranslationHistoryItem) => t.id === id
      );
      if (translation) {
        translation.videoBlob = videoBlob;
        // NÃO chamar saveToCookies aqui (Blob não vai para cookies)
      }
    };

    // Funções auxiliares
    const generateId = (): string => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const saveToCookies = () => {
      try {
        // Remover videoBlob antes de salvar (não serializar Blob em cookies)
        const dataToSave = translations.value.map(
          ({ videoBlob, ...rest }) => rest
        );
        const data = JSON.stringify(dataToSave);
        document.cookie = `${TRANSLATION_HISTORY_COOKIE_KEY}=${encodeURIComponent(data)}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 dias
      } catch (error) {
        console.error('Erro ao salvar histórico em cookies:', error);
      }
    };

    const loadFromCookies = () => {
      try {
        const cookies = document.cookie.split(';');
        const historyCookie = cookies.find(cookie =>
          cookie.trim().startsWith(`${TRANSLATION_HISTORY_COOKIE_KEY}=`)
        );

        if (historyCookie) {
          const data = decodeURIComponent(historyCookie.split('=')[1]);
          const parsed = JSON.parse(data);

          if (Array.isArray(parsed)) {
            // Validar estrutura dos dados
            const validTranslations = parsed.filter(
              (item: any) =>
                item &&
                typeof item.id === 'string' &&
                typeof item.text === 'string' &&
                typeof item.created_at === 'number' &&
                ['completa'].includes(item.status)
            ) as TranslationHistoryItem[];

            translations.value = validTranslations;
          }
        }
      } catch (error) {
        console.error('Erro ao carregar histórico dos cookies:', error);
        translations.value = [];
      }
    };

    // Inicialização
    loadFromCookies();

    return {
      // Estado
      translations,

      // Getters
      getTranslations,
      getTranslationById,
      getRecentTranslations,
      getTranslationsByStatus,

      // Actions
      addTranslation,
      updateTranslationStatus,
      updateTranslationVideo,
      removeTranslation,
      clearHistory,

      // Utils
      saveToCookies,
      loadFromCookies,
    };
  }
);
