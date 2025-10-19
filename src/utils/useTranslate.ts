import { ref, type Ref } from 'vue';
import {
  trackTranslation,
  trackAccessibilityFeature,
  trackError,
} from './analytics';
import { useTranslationHistoryStore } from '../stores/translationHistory';
import { useVideoRecorder } from './useVideoRecorder';

export interface UseTranslateOptions {
  /** Callback executado quando a tradução é iniciada */
  onTranslationStart?: () => void;
  /** Callback executado quando a tradução é concluída */
  onTranslationComplete?: () => void;
  /** Callback executado quando ocorre um erro na tradução */
  onTranslationError?: (error: string) => void;
  /** Tempo limite máximo para a tradução em milissegundos (padrão: 10000ms) - será usado como limite superior para timeout dinâmico */
  timeout?: number;
  /** Habilitar gravação automática de vídeo (padrão: true) */
  enableRecording?: boolean;
}

export interface UseTranslateReturn {
  /** Estado indicando se a tradução está em andamento */
  isTranslating: Ref<boolean>;
  /** Texto que está sendo traduzido atualmente */
  translatingText: Ref<string>;
  /** Estado indicando se a gravação de vídeo está em andamento */
  isRecording: Ref<boolean>;
  /** Função para traduzir um texto */
  translateText: (
    text: string,
    source?: 'manual' | 'enter_key'
  ) => Promise<void>;
  /** Função para parar a tradução atual */
  stopTranslation: () => void;
}

/**
 * Composable para tradução de texto usando VLibras
 * Responsável apenas pela lógica de tradução, não pelo gerenciamento de inputs
 *
 * Funcionalidades:
 * - Usa polling eficiente para detectar fim da tradução baseado na visibilidade dos controles
 * - Verifica se o botão restart está visível e o botão pause está oculto
 * - Timeout dinâmico baseado no tamanho do texto (2 segundos por caractere, mínimo 10 segundos)
 * - Sistema de timeout como fallback de segurança
 * - Controle automático de visibilidade dos controles VLibras durante a tradução (oculta/mostra automaticamente)
 * - Integração automática com store Pinia para histórico de traduções (gerencia estados automaticamente)
 *
 * @example
 * ```typescript
 * const {
 *   isTranslating,
 *   translatingText,
 *   translateText,
 *   stopTranslation,
 * } = useTranslate({
 *   onTranslationStart: () => console.log('Tradução iniciada'),
 *   onTranslationComplete: () => console.log('Tradução concluída'),
 *   onTranslationError: (error) => console.error('Erro:', error),
 *   timeout: 15000, // Este valor será usado como máximo, mas o timeout será dinâmico
 * });
 *
 * // Para traduzir um texto curto (10 chars) -> timeout = 10 segundos (mínimo)
 * await translateText('Olá mundo', 'manual');
 *
 * // Durante a tradução:
 * // - Controles VLibras ficam ocultos automaticamente (opacidade 0)
 * // - Usuário não pode interagir com os controles durante a tradução
 * // - Quando tradução termina, controles voltam a ser visíveis automaticamente
 * // - Tradução é automaticamente adicionada ao histórico com status 'traduzindo'
 * // - Status é atualizado para 'completa' ou 'erro' automaticamente
 * ```
 */
export function useTranslate(
  options: UseTranslateOptions = {}
): UseTranslateReturn {
  const {
    onTranslationStart,
    onTranslationComplete,
    onTranslationError,
    timeout = 10000, // Tempo limite máximo (usado como limite superior para timeout dinâmico)
    enableRecording = true, // Gravação habilitada por padrão
  } = options;

  // Store para histórico de traduções
  const translationHistoryStore = useTranslationHistoryStore();

  const isTranslating = ref(false);
  const translatingText = ref('');

  // Configurar gravação de vídeo
  const { isRecording, startRecording, stopRecording } = useVideoRecorder({
    fps: 60, // 60 FPS para capturar animações 3D fluidas do Unity
    onRecordingStart: () => {
      // Callback opcional para início da gravação
    },
    onRecordingStop: blob => {
      console.log('🎬 Callback onRecordingStop executado:', blob.size, 'bytes');
      // Nota: O vídeo é salvo diretamente no callback de parada da tradução
      // Este callback é apenas para logs de debug
    },
    onError: error => {
      // Log de erro mas não bloquear tradução
      console.warn('Erro na gravação de vídeo:', error);
    },
  });

  /**
   * Calcula o timeout dinâmico baseado no tamanho do texto
   */
  const calculateDynamicTimeout = (
    textLength: number,
    maxTimeout = 10000
  ): number => {
    const baseTimeout = 10000; // 10 segundos mínimo
    const charMultiplier = 2000; // 2 segundos por caractere
    const calculatedTimeout = textLength * charMultiplier;
    return Math.max(baseTimeout, Math.min(calculatedTimeout, maxTimeout));
  };

  /**
   * Traduz um texto usando o widget VLibras
   */
  const translateText = async (
    text: string,
    source: 'manual' | 'enter_key' = 'manual'
  ): Promise<void> => {
    if (!text.trim()) return;

    const textLength = text.length;
    const dynamicTimeout = calculateDynamicTimeout(textLength, timeout);

    // Adicionar tradução ao histórico quando iniciada
    const translationId = translationHistoryStore.addTranslation(
      text,
      'traduzindo'
    );

    try {
      // Ativar modo de tradução
      isTranslating.value = true;
      translatingText.value = text;

      // Ocultar controles VLibras durante a tradução
      setVlibrasControlsVisibility(false);

      // Callback de início da tradução
      onTranslationStart?.();

      // Track do início da tradução
      trackAccessibilityFeature('basic_translation');

      // Iniciar gravação de vídeo se habilitada (iniciar antes da tradução)
      if (enableRecording) {
        try {
          setTimeout(async () => {
            await startRecording();
          }, 500);
        } catch (error) {
          // Log de erro mas continuar tradução
          console.warn('Falha ao iniciar gravação:', error);
        }
      }

      // Criar um elemento temporário com o texto para ser "clicado"
      const tempElement = document.createElement('span');
      tempElement.textContent = text;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px'; // Esconder fora da tela
      tempElement.style.top = '-9999px';
      tempElement.style.pointerEvents = 'auto';
      tempElement.style.cursor = 'pointer';

      // Adicionar ao body temporariamente
      document.body.appendChild(tempElement);

      // Simular um clique no elemento para ativar a tradução VLibras
      await new Promise<void>(resolve => {
        setTimeout(() => {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });

          tempElement.dispatchEvent(clickEvent);

          // Ativar legendas automaticamente após iniciar tradução
          setTimeout(() => {
            const subtitlesButton = document.querySelector(
              '.vpw-controls-subtitles'
            ) as HTMLElement;
            if (subtitlesButton && !subtitlesButton.dataset.autoClicked) {
              subtitlesButton.dataset.autoClicked = 'true';
              subtitlesButton.click();
            }
          }, 1500);

          // Remover o elemento após um tempo
          setTimeout(() => {
            if (tempElement.parentNode) {
              document.body.removeChild(tempElement);
            }
          }, 1000);

          // Configurar detecção do fim da tradução via polling com timeout dinâmico
          setupTranslationDetection(dynamicTimeout, translationId, source);

          resolve();
        }, 100);
      });

      // Fallback timeout caso o polling não detecte o fim da tradução
      setTimeout(() => {
        if (isTranslating.value) {
          stopTranslation();
        }
      }, dynamicTimeout);
    } catch (error) {
      const errorMessage = error?.toString() || 'Erro desconhecido';

      // Track de erro na tradução
      trackError('translation_error', errorMessage, 'basic_translation');

      // Atualizar status no histórico para 'erro'
      translationHistoryStore.updateTranslationStatus(translationId, 'erro');

      // Callback de erro
      onTranslationError?.(errorMessage);

      stopTranslation();
    }
  };

  /**
   * Verifica se um elemento está visível (display: flex)
   */
  const isElementVisible = (element: Element | null): boolean => {
    if (!element) return false;
    const styles = window.getComputedStyle(element);
    return styles.display === 'flex';
  };

  /**
   * Controla a visibilidade dos controles VLibras
   */
  const setVlibrasControlsVisibility = (visible: boolean): void => {
    const controlsButton = document.querySelector(
      '.vpw-controls-button'
    ) as HTMLElement;
    if (controlsButton) {
      if (visible) {
        controlsButton.style.opacity = '1';
        controlsButton.style.pointerEvents = 'auto';
      } else {
        controlsButton.style.opacity = '0';
        controlsButton.style.pointerEvents = 'none';
      }
    }
  };

  /**
   * Configura o sistema de detecção do fim da tradução via polling
   */
  const setupTranslationDetection = (
    dynamicTimeout: number,
    translationId: string,
    source: 'manual' | 'enter_key'
  ): void => {
    // Sistema de polling para detectar fim da tradução (método que funcionou)
    setTimeout(() => {
      const pollTimer = setInterval(() => {
        const restartBtn = document.querySelector(
          '.vpw-component-restart'
        ) as HTMLElement;
        const pauseBtn = document.querySelector(
          '.vpw-component-pause'
        ) as HTMLElement;

        if (restartBtn && pauseBtn) {
          const restartVisible = isElementVisible(restartBtn);
          const pauseVisible = isElementVisible(pauseBtn);

          if (restartVisible && !pauseVisible) {
            clearInterval(pollTimer);
            // Atualizar status no histórico para 'completa'
            translationHistoryStore.updateTranslationStatus(
              translationId,
              'completa'
            );

            // Track da tradução bem-sucedida
            trackTranslation(translatingText.value.length, source);

            // Parar gravação de vídeo se estiver gravando
            if (enableRecording && isRecording.value) {
              console.log('🛑 Parando gravação de vídeo...');
              stopRecording()
                .then(blob => {
                  if (blob) {
                    console.log(
                      '✅ Vídeo gravado com sucesso:',
                      blob.size,
                      'bytes'
                    );
                    // Salvar vídeo diretamente na tradução atual
                    translationHistoryStore.updateTranslationVideo(
                      translationId,
                      blob
                    );
                    console.log(
                      '💾 Vídeo salvo na store para tradução:',
                      translationId
                    );
                  } else {
                    console.log('⚠️ Nenhum vídeo foi gravado');
                  }
                })
                .catch(error => {
                  console.warn('Falha ao parar gravação:', error);
                });
            }

            onTranslationComplete?.();
            stopTranslation();
          }
        }
      }, 1000);

      // Parar polling após timeout dinâmico como fallback
      setTimeout(() => {
        clearInterval(pollTimer);
      }, dynamicTimeout - 2000);
    }, 3000);
  };

  /**
   * Para a tradução atual
   */
  const stopTranslation = (): void => {
    // Restaurar visibilidade dos controles VLibras
    setVlibrasControlsVisibility(true);

    isTranslating.value = false;
    translatingText.value = '';
  };

  return {
    isTranslating,
    translatingText,
    isRecording,
    translateText,
    stopTranslation,
  };
}
