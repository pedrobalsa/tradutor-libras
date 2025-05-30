<script setup lang="ts">
import { onMounted } from 'vue';

// App.vue agora funciona como layout principal

// Configuração e inicialização do VLibras
onMounted(() => {
  console.log('🚀 Inicializando VLibras no App.vue');

  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = () => {
    new window.VLibras.Widget('https://vlibras.gov.br/app');

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
        console.log('✅ Botão VLibras clicado automaticamente (App.vue)');
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
          if (screenWidth >= 1280) {
            rightPosition = 10;
            widgetWidth = screenWidth / 2;
          }
          let height = screenHeight * 0.95;
          if (screenWidth < 1280) height = height / 2;
          let bottomPosition = -(height / 2) + 20;
          if (screenWidth < 1280) bottomPosition = -height + 30;

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

    <!-- Router view para renderizar os componentes das rotas -->
    <router-view />
  </div>
</template>

<style>
/* Estilos globais podem ser adicionados aqui se necessário */
</style>
