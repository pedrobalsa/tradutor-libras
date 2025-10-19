# useVideoRecorder

Composable para gravação de vídeo do canvas VLibras durante traduções.

## Funcionalidades

- **Gravação automática**: Captura o canvas do widget VLibras em formato WebM
- **FPS configurável**: Padrão 24 FPS (qualidade cinema)
- **Detecção automática**: Localiza o canvas automaticamente no DOM
- **Gerenciamento de estado**: Controla quando a gravação está ativa
- **Tratamento de erros**: Sistema robusto de fallback e logs
- **Compatibilidade**: Suporte para Chrome, Firefox e Edge

## Instalação

```typescript
import { useVideoRecorder } from '../utils/useVideoRecorder';
```

## API

### UseVideoRecorderOptions

```typescript
interface UseVideoRecorderOptions {
  /** FPS da gravação (padrão: 24) */
  fps?: number;
  /** Callback executado quando a gravação é iniciada */
  onRecordingStart?: () => void;
  /** Callback executado quando a gravação é parada */
  onRecordingStop?: (blob: Blob) => void;
  /** Callback executado quando ocorre um erro na gravação */
  onError?: (error: string) => void;
}
```

### UseVideoRecorderReturn

```typescript
interface UseVideoRecorderReturn {
  /** Estado indicando se a gravação está em andamento */
  isRecording: Ref<boolean>;
  /** Função para iniciar a gravação */
  startRecording: () => Promise<void>;
  /** Função para parar a gravação */
  stopRecording: () => Promise<Blob | null>;
}
```

## Como Funciona

### 1. Detecção do Canvas

O composable tenta localizar o canvas do VLibras usando múltiplos seletores:

```typescript
const selectors = [
  '#gameContainer canvas',
  'canvas[id="#canvas"]',
  '.emscripten canvas',
  'canvas[style*="cursor: default"]',
];
```

### 2. Captura de Stream

Usa a API `MediaRecorder` com `canvas.captureStream(fps)`:

```typescript
const stream = canvas.captureStream(fps);
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm; codecs=vp8',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
});
```

### 3. Coleta de Dados

Coleta chunks de dados durante a gravação:

```typescript
mediaRecorder.ondataavailable = event => {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data);
  }
};
```

### 4. Geração do Blob

Ao parar, combina os chunks em um Blob WebM:

```typescript
const blob = new Blob(recordedChunks, { type: 'video/webm' });
```

## Exemplos de Uso

### Uso Básico

```typescript
import { useVideoRecorder } from '../utils/useVideoRecorder';

const { isRecording, startRecording, stopRecording } = useVideoRecorder();

// Iniciar gravação
await startRecording();

// Parar gravação e obter vídeo
const videoBlob = await stopRecording();
```

### Com Callbacks

```typescript
const { isRecording, startRecording, stopRecording } = useVideoRecorder({
  fps: 30,
  onRecordingStart: () => {
    console.log('Gravação iniciada');
  },
  onRecordingStop: blob => {
    console.log('Vídeo gravado:', blob.size, 'bytes');
    // Salvar ou processar o vídeo
  },
  onError: error => {
    console.error('Erro na gravação:', error);
  },
});
```

### Integração com useTranslate

```typescript
import { useTranslate } from '../utils/useTranslate';

const { isTranslating, isRecording, translateText } = useTranslate({
  enableRecording: true, // Gravação automática habilitada
});

// A gravação é iniciada automaticamente com a tradução
await translateText('Olá mundo');
```

## Formatos Suportados

### WebM (Recomendado)

- **Codec**: VP8/VP9
- **Qualidade**: Alta
- **Tamanho**: ~500KB-2MB por vídeo
- **Compatibilidade**: Chrome, Firefox, Edge

### Fallback

Se WebM não for suportado, tenta formato mais básico:

- **Codec**: Padrão do navegador
- **Qualidade**: Média
- **Compatibilidade**: Universal

## Limitações

### Tamanho de Arquivo

- **Duração curta** (< 10s): ~500KB
- **Duração média** (10-30s): ~1-2MB
- **Duração longa** (> 30s): ~2-5MB

### Memória

- Vídeos são armazenados em memória (Blob)
- Perdidos ao recarregar a página
- Não persistem entre sessões

### Compatibilidade

- **Chrome**: Suporte completo
- **Firefox**: Suporte completo
- **Edge**: Suporte completo
- **Safari**: Suporte limitado (WebM)

## Tratamento de Erros

### Erros Comuns

1. **Canvas não encontrado**

   ```typescript
   // Erro: "Canvas do VLibras não encontrado"
   // Solução: Verificar se o widget VLibras está carregado
   ```

2. **MediaRecorder não suportado**

   ```typescript
   // Erro: "MediaRecorder não é suportado neste navegador"
   // Solução: Usar navegador compatível
   ```

3. **Stream não capturado**
   ```typescript
   // Erro: "Não foi possível capturar stream do canvas"
   // Solução: Verificar se canvas tem conteúdo
   ```

### Estratégia de Fallback

```typescript
try {
  await startRecording();
} catch (error) {
  // Log de erro mas não bloquear funcionalidade principal
  console.warn('Falha ao iniciar gravação:', error);
  // Continuar com tradução normalmente
}
```

## Configurações Avançadas

### Qualidade de Vídeo

```typescript
// Alta qualidade (arquivo maior)
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm; codecs=vp9',
  videoBitsPerSecond: 5000000, // 5 Mbps
});

// Qualidade balanceada (padrão)
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm; codecs=vp8',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
});

// Baixa qualidade (arquivo menor)
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm; codecs=vp8',
  videoBitsPerSecond: 1000000, // 1 Mbps
});
```

### FPS Personalizado

```typescript
// 60 FPS (alta qualidade)
const { startRecording } = useVideoRecorder({ fps: 60 });

// 24 FPS (qualidade cinema, padrão)
const { startRecording } = useVideoRecorder({ fps: 24 });

// 15 FPS (baixa qualidade)
const { startRecording } = useVideoRecorder({ fps: 15 });
```

## Debugging

### Verificar Suporte

```typescript
// Verificar se MediaRecorder é suportado
if (typeof MediaRecorder === 'undefined') {
  console.error('MediaRecorder não suportado');
}

// Verificar se WebM é suportado
if (!MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
  console.warn('WebM não suportado, usando fallback');
}
```

### Logs de Debug

```typescript
const { startRecording, stopRecording } = useVideoRecorder({
  onRecordingStart: () => console.log('🎬 Gravação iniciada'),
  onRecordingStop: blob => console.log('✅ Vídeo gravado:', blob.size, 'bytes'),
  onError: error => console.error('❌ Erro:', error),
});
```

## Integração com Store

O composable é integrado automaticamente com `useTranslate` e `translationHistoryStore`:

```typescript
// useTranslate gerencia a gravação automaticamente
const { translateText } = useTranslate({
  enableRecording: true, // Padrão: true
});

// Vídeo é salvo automaticamente na store
await translateText('Texto para traduzir');
// Vídeo fica disponível em translation.videoBlob
```

## Exemplo Completo

```vue
<template>
  <div>
    <button @click="startTranslation" :disabled="isTranslating">
      {{ isTranslating ? 'Traduzindo...' : 'Traduzir' }}
    </button>

    <div v-if="isRecording" class="recording-indicator">
      🔴 Gravando vídeo...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslate } from '../utils/useTranslate';

const { isTranslating, isRecording, translateText } = useTranslate({
  enableRecording: true,
  onTranslationStart: () => console.log('Tradução iniciada'),
  onTranslationComplete: () => console.log('Tradução concluída'),
});

const startTranslation = async () => {
  await translateText('Olá mundo');
  // Vídeo será gravado automaticamente
  // E salvo na store quando tradução completar
};
</script>
```

## Troubleshooting

### Problema: Vídeo não é gravado

**Possíveis causas:**

1. Canvas não encontrado
2. MediaRecorder não suportado
3. Permissões de mídia negadas

**Soluções:**

1. Verificar se VLibras está carregado
2. Usar navegador compatível
3. Verificar console para erros

### Problema: Vídeo corrompido

**Possíveis causas:**

1. Gravação interrompida prematuramente
2. Canvas sem conteúdo
3. Erro na captura de stream

**Soluções:**

1. Aguardar tradução completar
2. Verificar se canvas tem animação
3. Verificar logs de erro

### Problema: Arquivo muito grande

**Soluções:**

1. Reduzir FPS: `{ fps: 15 }`
2. Reduzir bitrate: `videoBitsPerSecond: 1000000`
3. Limitar duração da gravação

## Changelog

### v1.0.0

- Gravação básica de canvas
- Suporte WebM
- Integração com useTranslate
- Tratamento de erros robusto
- Documentação completa
