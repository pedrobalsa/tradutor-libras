# Analytics

Este documento descreve os eventos, parâmetros e pontos de integração do sistema de Analytics do projeto. A implementação das funções está em `src/utils/analytics.ts` e é utilizada pelas views e composables.

## ID de Medição

- Google Analytics (GA4): `G-M1Q6DCQJ38`

## Eventos Principais

### Tradução

- `translation_completed`

  - Disparado ao concluir uma tradução de texto
  - Parâmetros: `text_length_category`, `translation_method`

- `translation_queue_completed`
  - Processamento completo da fila (tradução simultânea)
  - Parâmetros: `items_count`, `processing_duration`

### Tradução Simultânea

- `simultaneous_translation_started`

  - Início da sessão de tradução por voz

- `simultaneous_translation_stopped`
  - Fim da sessão de tradução por voz
  - Parâmetros: `session_duration`, `words_translated`

### Navegação

- `page_navigation`
  - Mudança entre páginas
  - Parâmetros: `from`, `to`

### Acessibilidade

- `accessibility_feature_used`
  - Uso de recursos como VLibras ou tradução simultânea
  - Parâmetros: `feature`

### Performance

- `page_load_time`
  - Tempo de carregamento por rota
  - Parâmetros: `page`, `ms`

### Erros

- `voice_recognition_error`

  - Erros do Web Speech API
  - Parâmetros: `error_code`

- `error_occurred`
  - Erros gerais
  - Parâmetros: `error_type`, `context`, `message`

### Engajamento

- `feature_used`

  - Uso de funcionalidades específicas
  - Parâmetros: `feature`, `metadata`

- `clear_translation_queue`
  - Limpeza manual da fila de traduções
  - Parâmetros: `items_cleared`, `user_action`

## Parâmetros Customizados

- `translation_method`: `manual` | `enter_key` | `history`
- `text_length_category`: `short` | `medium` | `long`
- `session_duration`: número de segundos
- `words_translated`: total de palavras
- `device_type`: `mobile` | `desktop`
- `error_type`: categoria do erro

## Pontos de Integração

- `src/views/Home.vue`

  - Carregamento de página: `trackLoadTime('home', ms)`
  - Tradução de texto via `useTranslate` dispara `translation_completed`

- `src/components/Historic.vue`

  - Retradução de um item: `trackRetranslate(textLength, 'history')`
  - Download de vídeo: `trackVideoDownload(size, id, textLength)`

- `src/views/TraducaoSimultanea.vue`
  - Início/Fim de sessão: `trackSimultaneousTranslationStart/Stop`
  - Fila processada: `trackTranslationQueueProcessed(count, duration)`
  - Erros de voz: `trackVoiceRecognitionError(code)`
  - Recurso de acessibilidade: `trackAccessibilityFeature('simultaneous_translation')`

## Boas Práticas

- Centralize apenas o mínimo de contexto necessário nos parâmetros
- Evite registrar dados sensíveis do usuário
- Versione mudanças de esquema (novos eventos ou parâmetros) neste arquivo

## Exemplo de Uso

```ts
import { trackFeatureUsage } from './analytics';

trackFeatureUsage('clear_translation_queue', {
  items_cleared: 3,
  user_action: 'manual_clear',
});
```
