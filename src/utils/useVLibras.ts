/**
 * Composable para gerenciar a configuração e proteção do widget VLibras
 *
 * Funcionalidades:
 * - Interceptação do addEventListener para bloquear listeners do VLibras em botões
 * - Configuração automática do widget (posicionamento, ocultação de elementos)
 * - Proteção de estilos para elementos interativos
 * - Monitoramento de mudanças no DOM para aplicar proteção a novos elementos
 */

import { onMounted } from 'vue';

export interface UseVLibrasOptions {
  /** URL do script do VLibras (padrão: 'https://vlibras.gov.br/app/vlibras-plugin.js') */
  scriptUrl?: string;
  /** URL da aplicação VLibras (padrão: 'https://vlibras.gov.br/app') */
  appUrl?: string;
  /** Habilitar logs de debug (padrão: true) */
  enableDebugLogs?: boolean;
}

/**
 * Hook para inicializar e proteger o widget VLibras
 */
export function useVLibras(options: UseVLibrasOptions = {}) {
  const {
    scriptUrl = 'https://vlibras.gov.br/app/vlibras-plugin.js',
    appUrl = 'https://vlibras.gov.br/app',
    enableDebugLogs = true,
  } = options;

  /**
   * Intercepta o addEventListener globalmente para bloquear listeners do VLibras
   * em elementos interativos (botões, links, inputs)
   */
  const setupEventListenerInterception = () => {
    // Salvar a função original
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    // Sobrescrever addEventListener globalmente
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: any,
      options?: any
    ) {
      const element = this as HTMLElement;

      // Verificar se é um elemento interativo (botão, link, input)
      if (
        element instanceof HTMLElement &&
        (element.tagName === 'BUTTON' ||
          element.tagName === 'A' ||
          element.tagName === 'INPUT' ||
          element.hasAttribute('role') ||
          element.hasAttribute('data-vlib-ignore') ||
          element.hasAttribute('data-no-translate') ||
          element.classList.contains('translate-button')) &&
        (type === 'click' || type === 'mousedown' || type === 'touchstart')
      ) {
        // Detectar se o listener é do VLibras
        const listenerStr = listener?.toString() || '';
        const isVLibrasListener =
          listenerStr.includes('vlibras') ||
          listenerStr.includes('vLibras') ||
          listenerStr.includes('VLibras') ||
          listenerStr.includes('vpw') ||
          listenerStr.includes('vw-') ||
          // Detectar pela pilha de chamadas
          new Error().stack?.includes('vlibras');

        // Se for listener do VLibras, NÃO adicionar
        if (isVLibrasListener) {
          if (enableDebugLogs) {
            console.log(
              `🚫 Bloqueado listener VLibras em ${element.tagName}.${element.className}`
            );
          }
          return; // Bloqueia o VLibras!
        }
      }

      // Para todos os outros casos, usar a função original
      return originalAddEventListener.call(this, type, listener, options);
    };

    if (enableDebugLogs) {
      console.log('✅ Interceptação de addEventListener configurada');
    }
  };

  /**
   * Garante que todos os elementos interativos tenham estilos de proteção
   */
  const ensureProtectionStyles = () => {
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], input[type="button"], input[type="submit"], a[href], [data-vlib-ignore], [data-no-translate], .translate-button'
    );

    interactiveElements.forEach(element => {
      const htmlElement = element as HTMLElement;

      // Garantir que o elemento seja sempre clicável
      htmlElement.style.setProperty('pointer-events', 'auto', 'important');
      htmlElement.style.setProperty('cursor', 'pointer', 'important');
      htmlElement.style.setProperty('position', 'relative', 'important');
      htmlElement.style.setProperty('z-index', '999999', 'important');

      // Adicionar atributos de proteção
      if (!htmlElement.hasAttribute('data-vlib-ignore')) {
        htmlElement.setAttribute('data-vlib-ignore', 'true');
      }
    });

    if (enableDebugLogs) {
      console.log(
        `🔒 ${interactiveElements.length} elementos protegidos com estilos`
      );
    }
  };

  /**
   * Configura o monitoramento de mudanças no DOM para aplicar proteção a novos elementos
   */
  const setupProtectionObserver = () => {
    const protectionObserver = new MutationObserver(() => {
      ensureProtectionStyles();
    });

    protectionObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    if (enableDebugLogs) {
      console.log('👀 MutationObserver configurado para novos elementos');
    }

    return protectionObserver;
  };

  /**
   * Configura e estiliza o widget VLibras
   */
  const setupWidgetConfiguration = () => {
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
      const animationDenyBtn = document.querySelector(
        '.vpw-skip-welcome-message'
      ) as HTMLElement;

      // Elementos a serem ocultados
      const elementsToHide = [
        document.querySelector('[vp-change-avatar]'),
        document.querySelector('.vpw-header-btn-close'),
        document.querySelector('.vpw-header-btn-about'),
        document.querySelector('.vpw-header-btn-settings'),
        document.querySelector('.vpw-help-button'),
        document.querySelector('[settings-btn]'),
        document.querySelector('[vp-suggestion-screen]'),
        document.querySelector('[vp-rate-box]'),
        document.querySelector('.vpw-translator-button'),
        document.querySelector('.vpw-controls-fullscreen'),
        document.querySelector('.vpw-box'),
        document.querySelector('.vpw-more-options-button'),
      ];

      // Clicar no botão VLibras automaticamente
      setTimeout(() => {
        if (button && !button.dataset.autoClicked) {
          button.dataset.autoClicked = 'true';
          button.click();
          if (enableDebugLogs) {
            console.log('✅ Botão VLibras clicado automaticamente');
          }
        }
      }, 300);

      // Fechar tutorial automaticamente
      if (tutorialDenyBtn && !tutorialDenyBtn.dataset.autoClicked) {
        tutorialDenyBtn.dataset.autoClicked = 'true';
        setTimeout(() => {
          tutorialDenyBtn.click();
        }, 500);
      }
      if (animationDenyBtn && !animationDenyBtn.dataset.autoClicked) {
        animationDenyBtn.dataset.autoClicked = 'true';
        setTimeout(() => {
          animationDenyBtn.click();
        }, 1500);
      }

      // Ocultar elementos de interface
      elementsToHide.forEach(element => {
        if (element && !(element as HTMLElement).dataset.hidden) {
          const htmlElement = element as HTMLElement;
          htmlElement.dataset.hidden = 'true';
          htmlElement.style.setProperty('display', 'none', 'important');
          htmlElement.style.setProperty('visibility', 'hidden', 'important');
          htmlElement.style.setProperty('opacity', '0', 'important');
        }
      });

      // Estilizar widget
      if (widget) {
        const applyWidgetStyles = () => {
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          let widgetWidth = screenWidth * 0.9;
          let rightPosition = (screenWidth - widgetWidth - 20) / 2;

          if (screenWidth >= 1280) {
            rightPosition = 10;
            widgetWidth = screenWidth / 2;
          }

          let height = screenHeight * 0.95;
          if (screenWidth < 1280) height = height / 2;

          let bottomPosition = -(height / 2) + 20;
          if (screenWidth < 1280) bottomPosition = -height + 15;

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

    if (enableDebugLogs) {
      console.log('⚙️ Configuração do widget VLibras ativa');
    }

    return observer;
  };

  /**
   * Carrega o script do VLibras
   */
  const loadVLibrasScript = () => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => {
      new (window as any).VLibras.Widget(appUrl);

      // Re-executar proteção de estilos após VLibras carregar
      setTimeout(() => {
        if (enableDebugLogs) {
          console.log(
            '🔒 Reaplicando estilos de proteção após VLibras carregar'
          );
        }
        ensureProtectionStyles();
      }, 1000);
    };
    document.head.appendChild(script);

    if (enableDebugLogs) {
      console.log('📥 Script VLibras carregado');
    }
  };

  /**
   * Inicializa o VLibras com todas as proteções
   */
  const initialize = () => {
    if (enableDebugLogs) {
      console.log('🚀 Inicializando VLibras com proteção...');
    }

    // 1. Configurar interceptação de event listeners (DEVE SER PRIMEIRO!)
    setupEventListenerInterception();

    // 2. Aplicar proteção de estilos inicial
    ensureProtectionStyles();

    // 3. Configurar observador de proteção para novos elementos
    setupProtectionObserver();

    // 4. Carregar script do VLibras
    loadVLibrasScript();

    // 5. Configurar widget após carregamento
    setupWidgetConfiguration();

    if (enableDebugLogs) {
      console.log('✅ VLibras inicializado com sucesso');
    }
  };

  // Retornar funções para uso externo (se necessário)
  return {
    initialize,
    ensureProtectionStyles,
  };
}

/**
 * Hook Vue para usar VLibras em componentes
 * Inicializa automaticamente no onMounted
 */
export function useVLibrasInComponent(options: UseVLibrasOptions = {}) {
  const vlibras = useVLibras(options);

  onMounted(() => {
    vlibras.initialize();
  });

  return vlibras;
}
