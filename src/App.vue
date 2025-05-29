<script setup lang="ts">
import { onMounted, ref } from 'vue';

const inputText = ref('');
const traslatingText = ref('');
const inputRef = ref<HTMLTextAreaElement | null>(null);

const translateText = () => {
  if (!inputText.value.trim()) return;

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

    // Limpar o input e voltar o foco
    traslatingText.value = inputText.value;
    inputText.value = '';
    inputRef.value?.focus();
  }, 100);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    translateText();
  }
};

const handleBlur = () => {
  // Apenas retornar foco se realmente perdeu o foco
  setTimeout(() => {
    if (document.activeElement !== inputRef.value) {
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
          const widgetWidth = 300;
          const screenWidth = window.innerWidth;
          let rightPosition = (screenWidth - widgetWidth) / 2;
          if (screenWidth >= 1280) rightPosition -= 300;
          let bottomPosition = -180;
          if (screenWidth <= 1280) bottomPosition = 0;

          widget.style.setProperty('position', 'fixed', 'important');
          widget.style.setProperty('top', 'auto', 'important');
          widget.style.setProperty('right', `${rightPosition}px`, 'important');
          widget.style.setProperty('left', 'auto', 'important');
          widget.style.setProperty(
            'bottom',
            `${bottomPosition}px`,
            'important'
          );
          widget.style.setProperty('min-width', '300px', 'important');
          widget.style.setProperty('min-height', '400px', 'important');
          widget.style.setProperty('width', '400px', 'important');
          widget.style.setProperty('height', '300px', 'important');
        };

        applyWidgetStyles();
        setInterval(applyWidgetStyles, 1000);
        window.addEventListener('resize', applyWidgetStyles);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };
  document.head.appendChild(script);

  // Configurar foco inicial
  setTimeout(() => {
    inputRef.value?.focus();
  }, 500);

  // Manter foco apenas quando necessário
  document.addEventListener('click', e => {
    // Só redirecionar foco se não clicou no próprio input
    if (e.target !== inputRef.value) {
      setTimeout(() => inputRef.value?.focus(), 50);
    }
  });

  // Foco apenas em teclas especiais (não caracteres normais)
  document.addEventListener('keydown', e => {
    // Só redirecionar foco se não está no input E é uma tecla especial
    if (
      document.activeElement !== inputRef.value &&
      (e.key === 'Tab' || e.key === 'Escape' || e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      inputRef.value?.focus();
    }
  });
});
</script>

<template>
  <div
    class="relative w-full max-w-screen-xl flex flex-col p-4 max-xl:pb-8 xl:justify-center justify-end items-start mx-auto h-screen"
  >
    <!-- Input de texto para tradução -->
    <div
      class="z-10 flex flex-col xl:w-1/2 xl:pl-20 xl:h-[400px] justify-start w-full gap-6 items-start"
    >
      <h1 class="text-3xl font-bold xl:mb-4">Tradutor para Libras</h1>
      <textarea
        ref="inputRef"
        v-model="inputText"
        placeholder="Digitar texto"
        class="w-full px-4 py-3 h-40 flex flex-col text-midnight items-start justify-start text-lg rounded-lg !outline-none bg-white-smoke resize-none"
        @keydown="handleKeyDown"
        @blur="handleBlur"
      >
      </textarea>
      <header
        @click="translateText"
        class="w-full h-10 cursor-pointer transition-all duration-300 rounded-md flex items-center justify-center select-none"
        :class="{
          'bg-primary text-white': inputText.trim(),
          'bg-gray-300 hover:brightness-110 text-gray-500': !inputText.trim(),
        }"
      >
        <a>Traduzir</a>
        <i class="mdi ml-3 text-xl mdi-hand-clap"></i>
      </header>
      <div class="text-sm text-right -mt-4 w-full">
        <span class=""
          >ou pressione <strong>Enter </strong>
          <i class="mdi mdi-keyboard-return"></i> para traduzir</span
        >
      </div>
    </div>

    <!-- Widget VLibras -->
    <div vw class="enabled">
      <div vw-access-button class="active fixed bg-black bottom-0 right-0" />
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper !shrink-0" />
      </div>
    </div>

    <!-- Texto sendo traduzido -->
    <div
      v-if="traslatingText"
      class="fixed top-4 xl:right-[calc(50%-150px)] right-4 left-4 xl:left-auto xl:w-80 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-[9999999999]"
    >
      <p class="text-sm text-gray-600 mb-1">Traduzindo:</p>
      <p class="text-midnight font-medium line-clamp-2 text-ellipsis">
        {{ traslatingText }}
      </p>
    </div>
  </div>
</template>
