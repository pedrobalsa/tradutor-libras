<script setup lang="ts">
import { onMounted, ref } from 'vue';

const inputText = ref('');
const traslatingText = ref('');
const inputRef = ref<HTMLTextAreaElement | null>(null);
const isTranslating = ref(false); // Controle para desabilitar foco automático

const translateText = () => {
  if (!inputText.value.trim()) return;

  // Ativar modo de tradução
  isTranslating.value = true;

  // Fazer o teclado recuar em dispositivos móveis
  if (inputRef.value) {
    inputRef.value.blur();
  }

  // Aguardar um pouco para garantir que o blur foi processado
  setTimeout(() => {
    // Criar um elemento temporário com o texto para ser "clicado"
    const tempElement = document.createElement('span');
    tempElement.textContent = inputText.value;
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px'; // Esconder fora da tela
    tempElement.style.top = '-9999px';
    tempElement.style.pointerEvents = 'auto';
    tempElement.style.cursor = 'pointer';

    // Adicionar ao body temporariamente
    document.body.appendChild(tempElement);

    // Simular um clique no elemento para ativar a tradução VLibras
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
    }, 100);

    // Limpar o input e definir o texto de tradução imediatamente
    traslatingText.value = inputText.value;
    inputText.value = '';

    // Desativar modo de tradução após 10 segundos automaticamente
    setTimeout(() => {
      isTranslating.value = false;
    }, 10000);
  }, 200); // Delay para garantir que o blur foi processado
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    translateText();
  }
};

const handleFocus = () => {
  // Limpar o texto de tradução e desativar modo de tradução quando o usuário focar no input novamente
  if (traslatingText.value) {
    traslatingText.value = '';
    isTranslating.value = false;
  }
};

const handleBlur = () => {
  // Não fazer nada durante o modo de tradução
  if (isTranslating.value) {
    return;
  }

  // Apenas retornar foco se não há texto sendo traduzido e o foco realmente foi perdido
  setTimeout(() => {
    if (
      !traslatingText.value &&
      !isTranslating.value &&
      document.activeElement !== inputRef.value
    ) {
      inputRef.value?.focus();
    }
  }, 100);
};

onMounted(() => {
  // Configurar foco inicial apenas se não há tradução
  setTimeout(() => {
    if (!traslatingText.value && !isTranslating.value) {
      inputRef.value?.focus();
    }
  }, 500);

  // Manter foco apenas quando necessário
  document.addEventListener('click', e => {
    // Só redirecionar foco se não clicou no próprio input E não há tradução em andamento
    if (
      e.target !== inputRef.value &&
      !traslatingText.value &&
      !isTranslating.value
    ) {
      setTimeout(() => {
        // Verificar novamente antes de focar
        if (!isTranslating.value && !traslatingText.value) {
          inputRef.value?.focus();
        }
      }, 50);
    }
  });

  // Foco apenas em teclas especiais (não caracteres normais)
  document.addEventListener('keydown', e => {
    // Só redirecionar foco se não está no input E é uma tecla especial E não há tradução em andamento
    if (
      document.activeElement !== inputRef.value &&
      !traslatingText.value &&
      !isTranslating.value &&
      (e.key === 'Tab' || e.key === 'Escape' || e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      // Verificar novamente antes de focar
      if (!isTranslating.value && !traslatingText.value) {
        inputRef.value?.focus();
      }
    }
  });
});
</script>

<template>
  <main
    class="relative w-full flex flex-col xl:justify-center justify-start items-start mx-auto h-screen max-xl:h-[90vh]"
    role="main"
    aria-label="Aplicativo Tradutor para Libras"
  >
    <!-- Input de texto para tradução -->
    <section
      class="w-full xl:w-1/2 flex xl:h-full p-4 items-center justify-center"
      aria-label="Seção de tradução de texto"
    >
      <div
        class="z-10 flex flex-col w-full pt-4 max-w-[500px] xl:h-[430px] justify-start gap-6 max-xl:gap-2 items-start"
      >
        <h1 class="xl:text-3xl text-2xl font-bold" id="main-title">
          Tradutor para Libras
        </h1>
        <p class="text-sm max-xl:text-xs">
          Converta texto em português para linguagem de sinais de forma rápida e
          acessível
        </p>

        <div class="w-full">
          <label for="text-input" class="sr-only">
            Digite o texto que deseja traduzir para Libras
          </label>
          <textarea
            id="text-input"
            ref="inputRef"
            v-model="inputText"
            placeholder="Digite o texto que você quer traduzir para Libras"
            class="w-full px-4 py-3 h-40 max-lg:h-32 max-lg:text-sm flex flex-col text-midnight items-start justify-start text-lg rounded-lg !outline-none bg-white-smoke resize-none"
            @keydown="handleKeyDown"
            @focus="handleFocus"
            @blur="handleBlur"
            aria-describedby="input-instructions"
            aria-label="Campo de texto para tradução"
          >
          </textarea>
        </div>

        <button
          @click="translateText"
          class="w-full h-10 cursor-pointer bg-primary text-white transition-all duration-300 rounded-md flex items-center justify-center select-none hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Traduzir texto para Libras"
          :disabled="!inputText.trim()"
        >
          <span>Traduzir</span>
          <i class="mdi ml-3 text-xl mdi-hand-clap" aria-hidden="true"></i>
        </button>

        <div class="text-sm text-right xl:-mt-4 w-full" id="input-instructions">
          <span class="max-lg:text-xs"
            >ou pressione <strong>Enter </strong>
            <i class="mdi mdi-keyboard-return" aria-hidden="true"></i> para
            traduzir</span
          >
        </div>
      </div>
    </section>

    <!-- Texto sendo traduzido -->
    <div
      v-if="traslatingText"
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
        {{ traslatingText }}
      </p>
    </div>
  </main>
</template>
