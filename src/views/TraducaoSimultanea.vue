<script setup lang="ts">
import { onMounted, ref, onUnmounted, watch, computed } from 'vue';
import '../types/speech.d.ts';

// ============================================================================
// ESTADOS REATIVOS
// ============================================================================

// Estados de reconhecimento de voz
const isRecording = ref(false);
const isSupported = ref(false);
const transcribedText = ref('');
const currentTranscript = ref('');
const finalTranscript = ref('');
const microphonePermission = ref<'granted' | 'denied' | 'prompt'>('prompt');

// Estados de controle contínuo
const shouldKeepRecording = ref(false);
const isRestarting = ref(false);

// Estados da fila de tradução
const translationQueue = ref<string[]>([]);
const isTranslating = ref(false);
const queueIndex = ref(0);

// Estado para controle de viewport
const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);

// Estado para controle do botão iniciar
const isButtonReady = ref(false);

// ============================================================================
// COMPUTEDS
// ============================================================================

const halfScreenMargin = computed(() => {
  // Aplicar margem apenas para desktop (xl breakpoint = 1280px)
  const isDesktop = windowWidth.value >= 1280;
  return isDesktop ? `${(windowHeight.value / 2) * 0.8}px` : '0px';
});

// ============================================================================
// VARIÁVEIS GLOBAIS E REFS
// ============================================================================

let recognition: SpeechRecognition | null = null;
let translationObserver: MutationObserver | null = null;

// Refs para controle de scroll
const scrollSection = ref<HTMLElement | null>(null);
const queueItems = ref<HTMLElement[]>([]);

// ============================================================================
// FUNÇÕES DE CONFIGURAÇÃO E VERIFICAÇÃO
// ============================================================================

const updateWindowHeight = () => {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
};

const checkSpeechSupport = () => {
  const SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  isSupported.value = !!SpeechRecognition;
  return SpeechRecognition;
};

const checkMicrophonePermission = async () => {
  try {
    const permission = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    microphonePermission.value = permission.state;

    permission.addEventListener('change', () => {
      microphonePermission.value = permission.state;
    });
  } catch (error) {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      microphonePermission.value = 'granted';
    } catch (err) {
      microphonePermission.value = 'denied';
    }
  }
};

const setupSpeechRecognition = () => {
  const SpeechRecognition = checkSpeechSupport();
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  if (!recognition) return;

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'pt-BR';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording.value = true;
    isRestarting.value = false;
    currentTranscript.value = '';
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalText += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    currentTranscript.value = interimTranscript;
    if (finalText) {
      finalTranscript.value += finalText;
      transcribedText.value = finalTranscript.value + interimTranscript;
    } else {
      transcribedText.value = finalTranscript.value + interimTranscript;
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    switch (event.error) {
      case 'not-allowed':
        microphonePermission.value = 'denied';
        shouldKeepRecording.value = false;
        alert(
          'Permissão para microfone negada. Por favor, permita o acesso ao microfone e tente novamente.'
        );
        break;
      case 'no-speech':
        if (shouldKeepRecording.value && !isRestarting.value) {
          setTimeout(() => {
            if (shouldKeepRecording.value && recognition) {
              startRecognition();
            }
          }, 500);
        }
        break;
      case 'audio-capture':
        shouldKeepRecording.value = false;
        alert(
          'Erro ao capturar áudio. Verifique se seu microfone está funcionando.'
        );
        break;
      case 'network':
        if (shouldKeepRecording.value && !isRestarting.value) {
          setTimeout(() => {
            if (shouldKeepRecording.value && recognition) {
              startRecognition();
            }
          }, 2000);
        }
        break;
      default:
        if (shouldKeepRecording.value && !isRestarting.value) {
          setTimeout(() => {
            if (shouldKeepRecording.value && recognition) {
              startRecognition();
            }
          }, 1000);
        }
    }
  };

  recognition.onend = () => {
    if (shouldKeepRecording.value && !isRestarting.value) {
      setTimeout(() => {
        if (shouldKeepRecording.value && recognition) {
          startRecognition();
        }
      }, 300);
    } else {
      isRecording.value = false;
    }
  };
};

// ============================================================================
// FUNÇÕES DE CONTROLE DE GRAVAÇÃO
// ============================================================================

const startRecognition = () => {
  if (!recognition || isRestarting.value || !shouldKeepRecording.value) return;

  isRestarting.value = true;

  try {
    recognition.start();
  } catch (error) {
    isRestarting.value = false;
    if (shouldKeepRecording.value) {
      setTimeout(() => {
        if (shouldKeepRecording.value && !isRestarting.value) {
          startRecognition();
        }
      }, 1000);
    }
  }
};

const startRecording = async () => {
  if (!isButtonReady.value) return;

  if (!isSupported.value) {
    alert(
      'Reconhecimento de voz não é suportado neste navegador. Use Chrome, Safari ou Edge.'
    );
    return;
  }

  if (microphonePermission.value === 'denied') {
    alert(
      'Permissão para microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.'
    );
    return;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    microphonePermission.value = 'granted';

    transcribedText.value = '';
    currentTranscript.value = '';
    finalTranscript.value = '';

    shouldKeepRecording.value = true;
    isRestarting.value = false;

    if (recognition) {
      recognition.start();
    }
  } catch (error) {
    microphonePermission.value = 'denied';
    alert(
      'Não foi possível acessar o microfone. Verifique as permissões do navegador.'
    );
  }
};

const stopRecording = () => {
  shouldKeepRecording.value = false;
  isRestarting.value = false;

  if (recognition && isRecording.value) {
    recognition.stop();
  }

  isRecording.value = false;
};

// ============================================================================
// FUNÇÕES DE TRADUÇÃO E FILA
// ============================================================================

const translateText = (text: string) => {
  if (!text.trim()) return;

  const tempElement = document.createElement('span');
  tempElement.textContent = text;
  tempElement.style.position = 'absolute';
  tempElement.style.left = '-9999px';
  tempElement.style.top = '-9999px';
  tempElement.style.pointerEvents = 'auto';
  tempElement.style.cursor = 'pointer';

  document.body.appendChild(tempElement);

  setTimeout(() => {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    tempElement.dispatchEvent(clickEvent);

    // Ativar legendas automaticamente
    setTimeout(() => {
      const subtitlesButton = document.querySelector(
        '.vpw-controls-subtitles'
      ) as HTMLElement;
      if (subtitlesButton && !subtitlesButton.dataset.autoClicked) {
        subtitlesButton.dataset.autoClicked = 'true';
        subtitlesButton.click();
      }
    }, 1500);

    setTimeout(() => {
      if (tempElement.parentNode) {
        document.body.removeChild(tempElement);
      }
    }, 1000);
  }, 100);
};

const setupTranslationObserver = () => {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'style'
      ) {
        const target = mutation.target as HTMLElement;

        if (
          target.classList.contains('noUi-origin') &&
          target.closest('.vpw-controls-slider')
        ) {
          const leftValue = target.style.left;

          if (leftValue === '100%') {
            processNextInQueue();
          }
        }
      }

      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (
              element.querySelector &&
              element.querySelector('.vpw-controls-slider')
            ) {
              // Novo slider detectado
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style'],
  });

  return observer;
};

const processNextInQueue = () => {
  queueIndex.value++;

  if (queueIndex.value < translationQueue.value.length) {
    const nextText = translationQueue.value[queueIndex.value];

    setTimeout(() => {
      translateText(nextText);
    }, 1000);
  } else {
    isTranslating.value = false;
  }
};

const clearTranslationQueue = () => {
  translationQueue.value = [];
  queueIndex.value = 0;
  isTranslating.value = false;
};

// ============================================================================
// FUNÇÕES DE SCROLL
// ============================================================================

const centerCurrentTranslation = () => {
  if (!scrollSection.value || queueItems.value.length === 0) return;

  const currentItem = queueItems.value[queueIndex.value];
  if (!currentItem) return;

  const sectionRect = scrollSection.value.getBoundingClientRect();
  const itemRect = currentItem.getBoundingClientRect();

  // Detectar se é mobile (largura menor que 1280px que é xl breakpoint)
  const isMobile = window.innerWidth < 1280;

  // Para mobile: posicionar em 3/4 do topo, para desktop: centralizar
  const sectionPosition = isMobile
    ? sectionRect.height * 0.25
    : sectionRect.height / 2;
  const itemCenter = itemRect.height / 2;
  const targetScrollTop = currentItem.offsetTop - sectionPosition + itemCenter;

  // Scroll suave para a posição calculada
  scrollSection.value.scrollTo({
    top: targetScrollTop,
    behavior: 'smooth',
  });
};

// ============================================================================
// WATCHERS E LIFECYCLE HOOKS
// ============================================================================

watch(finalTranscript, (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    const newText = newValue.slice(oldValue?.length || 0).trim();

    if (newText) {
      translationQueue.value.push(newText);

      if (!isTranslating.value) {
        isTranslating.value = true;

        if (queueIndex.value >= translationQueue.value.length - 1) {
          queueIndex.value = translationQueue.value.length - 1;
        }

        translateText(translationQueue.value[queueIndex.value]);

        if (!translationObserver) {
          translationObserver = setupTranslationObserver();
        }
      }
    }
  }
});

// Watcher para centralizar o scroll quando muda a tradução atual
watch(queueIndex, () => {
  // Aguardar o próximo tick para garantir que o DOM foi atualizado
  setTimeout(() => {
    centerCurrentTranslation();
  }, 100);
});

onMounted(() => {
  checkSpeechSupport();
  checkMicrophonePermission();
  setupSpeechRecognition();
  updateWindowHeight();

  // Listener para atualizar altura da tela quando redimensionar
  window.addEventListener('resize', updateWindowHeight);

  // Habilitar botão após 5 segundos
  setTimeout(() => {
    isButtonReady.value = true;
  }, 5000);

  // Clicar no botão "Pular" do VLibras após 6 segundos
  setTimeout(() => {
    const skipButton = document.querySelector(
      '.vpw-skip-welcome-message'
    ) as HTMLElement;
    if (skipButton) {
      skipButton.click();
    }
  }, 6000);

  // Observador para detectar o botão de velocidade e clicar nele
  const speedButtonObserver = new MutationObserver(() => {
    const speedButton = document.querySelector(
      '.vpw-button-speed'
    ) as HTMLElement;
    if (speedButton && !speedButton.dataset.autoClicked) {
      speedButton.dataset.autoClicked = 'true';
      speedButton.click();
      speedButtonObserver.disconnect(); // Parar de observar após clicar
    }
  });

  // Observar mudanças no DOM para detectar o botão de velocidade
  speedButtonObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

onUnmounted(() => {
  if (recognition && isRecording.value) {
    recognition.stop();
  }

  if (translationObserver) {
    translationObserver.disconnect();
    translationObserver = null;
  }

  // Remover listener de resize
  window.removeEventListener('resize', updateWindowHeight);
});
</script>

<template>
  <main
    class="w-full flex flex-col xl:justify-center justify-start items-start mx-auto h-screen max-xl:h-[90vh]"
    role="main"
    aria-label="Tradutor simultâneo para Libras"
  >
    <!-- Interface de reconhecimento de voz -->
    <section
      ref="scrollSection"
      class="w-full xl:w-[48%] max-xl:h-[50%] flex xl:h-full relative flex-col gap-8 p-4 pt-0 xl:pb-64 items-center justify-start overflow-y-auto custom-scrollbar"
      aria-label="Seção de reconhecimento de voz"
    >
      <!-- Controles sticky -->
      <div
        class="sticky max-w-[500px] top-0 backdrop-blur-sm bg-midnight/20 z-20 py-4 w-full flex flex-col gap-4 pb-4 border-b border-primary/20"
        :style="{ marginTop: halfScreenMargin }"
      >
        <div class="flex flex-col gap-4">
          <h1 class="xl:text-3xl text-xl font-bold" id="main-title">
            Tradutor simultâneo para
            <strong class="text-secondary">Libras</strong>
          </h1>
          <p class="max-md:hidden text-sm max-xl:text-xs">
            Fale no microfone e veja a tradução em Libras em tempo real.
          </p>
        </div>

        <!-- Controles principais -->
        <div class="w-full flex gap-3">
          <!-- Botão gravar/parar -->
          <header
            @click="isRecording ? stopRecording() : startRecording()"
            :disabled="
              !isSupported ||
              microphonePermission === 'denied' ||
              !isButtonReady
            "
            :class="[
              'flex-1 h-12 max-xl:h-10 hover:brightness-110 cursor-pointer rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3',
              !isButtonReady
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-secondary text-white disabled:bg-gray-300 disabled:cursor-not-allowed',
            ]"
            :aria-label="
              !isButtonReady
                ? 'Carregando...'
                : isRecording
                  ? 'Parar gravação'
                  : 'Iniciar gravação de voz'
            "
          >
            <!-- Loading durante os primeiros 5 segundos -->
            <template v-if="!isButtonReady">
              <i class="mdi mdi-loading mdi-spin text-xl text-gray-700"></i>
              <span class="text-gray-700">Carregando...</span>
            </template>

            <!-- Estado normal após carregamento -->
            <template v-else>
              <i
                :class="[
                  'text-xl',
                  isRecording ? 'mdi mdi-stop' : 'mdi mdi-microphone',
                ]"
              ></i>
              <span>{{ isRecording ? 'Parar' : 'Começar' }}</span>

              <!-- Indicador de gravação ativa -->
              <div
                v-if="isRecording"
                class="w-2 h-2 bg-white rounded-full animate-pulse"
              ></div>
            </template>
          </header>

          <!-- Botão limpar fila -->
          <header
            @click="clearTranslationQueue"
            :disabled="translationQueue.length === 0"
            :class="[
              'px-4 h-12 max-xl:h-10 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200',
              translationQueue.length > 0
                ? 'border-red-300 text-red-600 hover:border-red-500 hover:text-red-700 hover:bg-red-600/20'
                : 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50',
            ]"
            aria-label="Limpar lista de traduções"
            :title="`Limpar lista de traduções (${translationQueue.length} ${translationQueue.length === 1 ? 'item' : 'itens'})`"
          >
            <i class="mdi mdi-delete text-xl"></i>
          </header>
        </div>
      </div>
      <div
        class="z-10 flex top-10 flex-col w-full pt-4 max-w-[500px] justify-start gap-8 max-xl:gap-2 items-start"
      >
        <!-- Conteúdo scrollável -->
        <div class="w-full flex flex-col gap-6">
          <!-- Área de transcrição e fila -->
          <div v-if="finalTranscript || currentTranscript" class="w-full">
            <label
              class="text-sm font-bold px-4 py-2 rounded-full border-secondary border w-48 flex items-center justify-center mb-8"
            >
              Transcrição da fala
            </label>
            <div
              class="w-full min-h-40 p-4 px-6 border-x-2 border-primary focus-within:border-blue-500 transition-colors"
            >
              <div class="space-y-2">
                <!-- Fila de traduções -->
                <div v-if="translationQueue.length > 0" class="space-y-2">
                  <p
                    v-for="(text, index) in translationQueue"
                    :key="text"
                    :ref="
                      el => {
                        if (el) queueItems[index] = el as HTMLElement;
                      }
                    "
                    :class="[
                      'p-2  transition-all',
                      index === queueIndex
                        ? 'text-white'
                        : index < queueIndex
                          ? 'text-white-smoke/60'
                          : 'text-white-smoke',
                    ]"
                  >
                    <span
                      v-if="index === queueIndex"
                      class="bg-secondary/30 font-medium px-2 -ml-2 py-1"
                    >
                      {{ text }}
                    </span>
                    <span v-else>
                      {{ text }}
                    </span>
                  </p>
                </div>

                <!-- Transcrição em tempo real -->
                <p
                  v-if="currentTranscript"
                  class="text-white-smoke/60 ml-2 italic leading-relaxed"
                >
                  {{ currentTranscript }}
                  <span
                    class="inline-block w-1 h-4 bg-secondary ml-1 animate-pulse"
                  ></span>
                </p>
              </div>
            </div>

            <!-- Status da fila de tradução -->
            <div
              v-if="translationQueue.length > 0"
              class="mt-4 text-xs text-white-smoke/75"
            >
              <div class="flex items-center justify-between">
                <span>
                  Fila: {{ queueIndex }}/{{ translationQueue.length }}
                </span>
                <span v-if="isTranslating" class="text-secondary">
                  <i class="mdi mdi-translate mdi-spin mr-1"></i>
                  Traduzindo...
                </span>
                <span
                  v-else-if="queueIndex >= translationQueue.length"
                  class="text-green-400"
                >
                  <i class="mdi mdi-check mr-1"></i>
                  Concluído
                </span>
              </div>
            </div>
          </div>

          <!-- Instruções iniciais -->
          <div
            v-if="!finalTranscript && !currentTranscript"
            class="w-full text-sm text-white-smoke"
          >
            <div
              class="border border-primary flex flex-col gap-4 rounded-lg p-4"
            >
              <div class="flex items-center flex-row gap-4">
                <i class="mdi mdi-information text-secondary text-lg"></i>
                <p class="font-medium">Como usar:</p>
              </div>

              <ul class="text-xs space-y-1 pl-4">
                <li>• Clique em "Falar" para começar</li>
                <li>• Fale claramente em português</li>
                <li>• A transcrição aparece em tempo real</li>
                <li>• A tradução aparece em tempo real</li>
                <li>• Clique em "Parar" quando terminar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 12px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
  background-clip: content-box;
}

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 transparent;
}
</style>

<style>
/* Ocultar elementos do widget VLibras */
.vpw-controls-slider {
  opacity: 0 !important;
  transition: opacity 0.3s ease;
}

.vpw-controls-button {
  opacity: 0 !important;
  transition: opacity 0.3s ease;
}
</style>
