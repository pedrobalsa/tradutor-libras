// Tipos para os eventos de analytics
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Declarar o gtag global
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Função para verificar se o Google Analytics está disponível
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Função principal para enviar eventos
export const trackEvent = (event: AnalyticsEvent): void => {
  if (!isGtagAvailable()) {
    console.warn('Google Analytics não está disponível');
    return;
  }

  try {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });

    console.log('📊 Analytics Event:', event);
  } catch (error) {
    console.error('Erro ao enviar evento para Analytics:', error);
  }
};

// Função para track de páginas
export const trackPage = (page_title: string, page_location: string): void => {
  if (!isGtagAvailable()) return;

  try {
    window.gtag('config', 'G-M1Q6DCQJ38', {
      page_title,
      page_location,
    });

    console.log('📊 Analytics Page:', { page_title, page_location });
  } catch (error) {
    console.error('Erro ao enviar page view para Analytics:', error);
  }
};

// ============================================================================
// EVENTOS ESPECÍFICOS DO TRADUZ LIBRAS
// ============================================================================

// Eventos da página Home
export const trackTranslation = (
  textLength: number,
  method: 'manual' | 'enter_key' = 'manual'
): void => {
  trackEvent({
    action: 'translation_completed',
    category: 'translation',
    label: 'basic_translation',
    value: textLength,
    custom_parameters: {
      translation_method: method,
      feature_used: 'basic_translator',
      text_length_category:
        textLength < 50 ? 'short' : textLength < 200 ? 'medium' : 'long',
    },
  });
};

// Eventos da página Tradução Simultânea
export const trackSimultaneousTranslationStart = (): void => {
  trackEvent({
    action: 'simultaneous_translation_started',
    category: 'translation',
    label: 'voice_recognition',
    custom_parameters: {
      feature_used: 'simultaneous_translator',
      user_action: 'start_recording',
    },
  });
};

export const trackSimultaneousTranslationStop = (
  duration: number,
  wordsTranslated: number
): void => {
  trackEvent({
    action: 'simultaneous_translation_stopped',
    category: 'translation',
    label: 'voice_recognition',
    value: duration,
    custom_parameters: {
      feature_used: 'simultaneous_translator',
      user_action: 'stop_recording',
      session_duration: duration,
      words_translated: wordsTranslated,
      session_category:
        duration < 30 ? 'short' : duration < 120 ? 'medium' : 'long',
    },
  });
};

export const trackVoiceRecognitionError = (errorType: string): void => {
  trackEvent({
    action: 'voice_recognition_error',
    category: 'error',
    label: errorType,
    custom_parameters: {
      feature_used: 'simultaneous_translator',
      error_type: errorType,
    },
  });
};

export const trackTranslationQueueProcessed = (
  queueLength: number,
  totalDuration: number
): void => {
  trackEvent({
    action: 'translation_queue_completed',
    category: 'translation',
    label: 'queue_processing',
    value: queueLength,
    custom_parameters: {
      feature_used: 'simultaneous_translator',
      queue_length: queueLength,
      processing_duration: totalDuration,
      efficiency: queueLength / totalDuration, // itens por segundo
    },
  });
};

// Eventos de navegação
export const trackNavigation = (from: string, to: string): void => {
  trackEvent({
    action: 'page_navigation',
    category: 'navigation',
    label: `${from}_to_${to}`,
    custom_parameters: {
      navigation_from: from,
      navigation_to: to,
      user_action: 'page_change',
    },
  });
};

// Eventos de UI/UX
export const trackMobileMenuUsage = (): void => {
  trackEvent({
    action: 'mobile_menu_opened',
    category: 'ui_interaction',
    label: 'mobile_navigation',
    custom_parameters: {
      device_type: 'mobile',
      ui_element: 'hamburger_menu',
    },
  });
};

export const trackFeatureUsage = (
  featureName: string,
  details?: Record<string, any>
): void => {
  trackEvent({
    action: 'feature_used',
    category: 'engagement',
    label: featureName,
    custom_parameters: {
      feature_name: featureName,
      ...details,
    },
  });
};

// Eventos de acessibilidade
export const trackAccessibilityFeature = (feature: string): void => {
  trackEvent({
    action: 'accessibility_feature_used',
    category: 'accessibility',
    label: feature,
    custom_parameters: {
      accessibility_feature: feature,
      feature_category: 'libras_translation',
    },
  });
};

// Eventos de performance
export const trackLoadTime = (pageType: string, loadTime: number): void => {
  trackEvent({
    action: 'page_load_time',
    category: 'performance',
    label: pageType,
    value: loadTime,
    custom_parameters: {
      load_time: loadTime,
      page_type: pageType,
      performance_category:
        loadTime < 1000 ? 'fast' : loadTime < 3000 ? 'medium' : 'slow',
    },
  });
};

// Eventos de erro
export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: string
): void => {
  trackEvent({
    action: 'error_occurred',
    category: 'error',
    label: errorType,
    custom_parameters: {
      error_type: errorType,
      error_message: errorMessage,
      error_context: context || 'unknown',
    },
  });
};

// Eventos de histórico de traduções
export const trackRetranslate = (
  textLength: number,
  source: 'history' | 'mobile_dialog' = 'history'
): void => {
  trackEvent({
    action: 'retranslate_clicked',
    category: 'translation',
    label: 'history_retranslate',
    value: textLength,
    custom_parameters: {
      feature_used: 'history_retranslate',
      text_length_category:
        textLength < 50 ? 'short' : textLength < 200 ? 'medium' : 'long',
      retranslate_source: source,
      user_action: 'retranslate_from_history',
    },
  });
};

export const trackVideoDownload = (
  videoSize: number,
  translationId: string,
  textLength: number
): void => {
  trackEvent({
    action: 'video_downloaded',
    category: 'translation',
    label: 'video_download',
    value: videoSize,
    custom_parameters: {
      feature_used: 'video_download',
      video_size_bytes: videoSize,
      video_size_mb: Math.round((videoSize / (1024 * 1024)) * 100) / 100,
      translation_id: translationId,
      text_length: textLength,
      text_length_category:
        textLength < 50 ? 'short' : textLength < 200 ? 'medium' : 'long',
      user_action: 'download_translation_video',
    },
  });
};

export const trackHistoryDialogOpen = (): void => {
  trackEvent({
    action: 'history_dialog_opened',
    category: 'ui_interaction',
    label: 'mobile_history_dialog',
    custom_parameters: {
      feature_used: 'mobile_history_dialog',
      device_type: 'mobile',
      ui_element: 'history_dialog',
      user_action: 'open_history',
    },
  });
};

export const trackHistoryDialogClose = (
  method: 'button' | 'overlay' | 'retranslate' = 'button'
): void => {
  trackEvent({
    action: 'history_dialog_closed',
    category: 'ui_interaction',
    label: 'mobile_history_dialog',
    custom_parameters: {
      feature_used: 'mobile_history_dialog',
      device_type: 'mobile',
      ui_element: 'history_dialog',
      close_method: method,
      user_action: 'close_history',
    },
  });
};
