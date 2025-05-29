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
  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = () => {
    new window.VLibras.Widget('https://vlibras.gov.br/app');

    // Observer para detectar quando o widget é criado/aberto
    const observer = new MutationObserver(() => {
      const widget = document.querySelector(
        '[vw-plugin-wrapper]'
      ) as HTMLElement;
      const button = document.querySelector(
        '[vw-access-button]'
      ) as HTMLElement;
      const tutorialDenyBtn = document.querySelector(
        '.vpw-guide__main__deny-btn'
      ) as HTMLElement;
      const avatarSelector = document.querySelector(
        '[vp-change-avatar]'
      ) as HTMLElement;
      const closeButton = document.querySelector(
        '.vpw-header-btn-close'
      ) as HTMLElement;
      const aboutButton = document.querySelector(
        '.vpw-header-btn-about'
      ) as HTMLElement;
      const settingsButton = document.querySelector(
        '.vpw-header-btn-settings'
      ) as HTMLElement;
      const helpButton = document.querySelector(
        '.vpw-help-button'
      ) as HTMLElement;
      const settingsContainer = document.querySelector(
        '[settings-btn]'
      ) as HTMLElement;
      const suggestionScreen = document.querySelector(
        '[vp-suggestion-screen]'
      ) as HTMLElement;
      const rateBox = document.querySelector('[vp-rate-box]') as HTMLElement;
      const translatorButton = document.querySelector(
        '.vpw-translator-button'
      ) as HTMLElement;
      const fullscreenButton = document.querySelector(
        '.vpw-controls-fullscreen'
      ) as HTMLElement;
      const vlibrasBox = document.querySelector('.vpw-box') as HTMLElement;

      // Se o botão existir mas ainda não foi clicado automaticamente
      if (button && !button.dataset.autoClicked) {
        button.dataset.autoClicked = 'true';
        button.click();
      }

      // Se a mensagem do tutorial aparecer, fechar automaticamente
      if (tutorialDenyBtn && !tutorialDenyBtn.dataset.autoClicked) {
        tutorialDenyBtn.dataset.autoClicked = 'true';
        setTimeout(() => {
          tutorialDenyBtn.click();
        }, 500);
      }

      // Ocultar elementos de interface
      [
        avatarSelector,
        closeButton,
        aboutButton,
        settingsButton,
        helpButton,
        settingsContainer,
        suggestionScreen,
        rateBox,
        translatorButton,
        fullscreenButton,
        vlibrasBox,
      ].forEach(element => {
        if (element && !element.dataset.hidden) {
          element.dataset.hidden = 'true';
          element.style.setProperty('display', 'none', 'important');
          element.style.setProperty('visibility', 'hidden', 'important');
          element.style.setProperty('opacity', '0', 'important');
        }
      });

      if (widget) {
        const applyWidgetStyles = () => {
          let screenWidth = window.innerWidth;
          let screenHeight = window.innerHeight;
          let widgetWidth = screenWidth * 0.9;
          let rightPosition = (screenWidth - widgetWidth - 20) / 2;
          if (screenWidth >= 1000) {
            rightPosition = 0;
            widgetWidth = screenWidth / 2;
          }
          let height = screenHeight * 0.98;
          if (screenWidth < 1000) height = height / 2;
          let bottomPosition = -(height / 2) + 30;
          if (screenWidth < 1000) bottomPosition = -height + 30;

          widget.style.setProperty('position', 'fixed', 'important');
          widget.style.setProperty('top', 'auto', 'important');
          widget.style.setProperty('right', `${rightPosition}px`, 'important');
          widget.style.setProperty('left', 'auto', 'important');
          widget.style.setProperty(
            'bottom',
            `${bottomPosition}px`,
            'important'
          );
          widget.style.setProperty(
            'min-width',
            `${widgetWidth}px`,
            'important'
          );
          widget.style.setProperty('min-height', `${height}px`, 'important');
          widget.style.setProperty('width', `${widgetWidth}px`, 'important');
          widget.style.setProperty('height', `${height}px`, 'important');
        };

        applyWidgetStyles();
        setInterval(applyWidgetStyles, 1000);
        window.addEventListener('resize', applyWidgetStyles);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };
  document.head.appendChild(script);

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
  <div
    class="relative w-full max-w-screen-xl flex flex-col p-4 max-xl:pt-8 xl:justify-center justify-start items-start mx-auto h-screen max-xl:h-[90vh]"
  >
    <!-- Input de texto para tradução -->
    <div
      class="z-10 flex flex-col xl:w-1/2 xl:px-20 xl:pt-10 xl:h-[400px] justify-start w-full gap-6 max-xl:gap-2 items-start"
    >
      <h1 class="xl:text-3xl text-2xl font-bold xl:mb-4">
        Tradutor para Libras
      </h1>
      <textarea
        ref="inputRef"
        v-model="inputText"
        placeholder="Digitar texto"
        class="w-full px-4 py-3 h-40 flex flex-col text-midnight items-start justify-start text-lg rounded-lg !outline-none bg-white-smoke resize-none"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      </textarea>
      <header
        @click="translateText"
        class="w-full h-10 cursor-pointer bg-primary text-white transition-all duration-300 rounded-md flex items-center justify-center select-none"
      >
        <span>Traduzir</span>
        <i class="mdi ml-3 text-xl mdi-hand-clap"></i>
      </header>
      <div class="text-sm text-right xl:-mt-4 w-full">
        <span class=""
          >ou pressione <strong>Enter </strong>
          <i class="mdi mdi-keyboard-return"></i> para traduzir</span
        >
      </div>
    </div>

    <!-- Widget VLibras -->
    <div vw class="enabled">
      <div vw-access-button class="active" />
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper !shrink-0" />
      </div>
    </div>

    <!-- Texto sendo traduzido -->
    <div
      v-if="traslatingText"
      class="fixed max-xl:hidden top-4 xl:right-[calc(50%-150px)] right-4 left-4 xl:left-auto xl:w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-[9999999999]"
    >
      <p class="text-sm text-gray-600 mb-1">Traduzindo:</p>
      <p class="text-midnight font-medium line-clamp-2 text-ellipsis">
        {{ traslatingText }}
      </p>
    </div>
  </div>
</template>
