# formatRelativeTime - Utilitário de Formatação de Tempo Relativo

Funções utilitárias para formatar timestamps em tempo relativo em português.

## 📋 Sobre

Este módulo fornece funções para converter timestamps em strings legíveis que representam o tempo decorrido, como "Há 5 min", "Há 2 dias", etc.

## 🚀 Uso Básico

### Importar

```typescript
import { formatRelativeTime } from '@/utils/formatRelativeTime';
```

### Exemplo Simples

```typescript
const timestamp = Date.now() - 300000; // 5 minutos atrás
const formatted = formatRelativeTime(timestamp);
console.log(formatted); // "Há 5 min"
```

## 📖 API

### `formatRelativeTime(timestamp)`

Formata um timestamp para tempo relativo no formato padrão.

**Parâmetros:**

- `timestamp` (number): Timestamp em milissegundos

**Retorna:**

- (string): Tempo formatado em português

**Formatos de Saída:**

| Tempo Decorrido | Formato de Saída |
| --------------- | ---------------- |
| 0-59 segundos   | `Há X seg`       |
| 1-59 minutos    | `Há X min`       |
| 1-23 horas      | `Há Xh`          |
| 1-29 dias       | `Há X dia(s)`    |
| 1-11 meses      | `Há X mês/meses` |
| 1+ anos         | `Há X ano(s)`    |
| Agora           | `Agora`          |

**Exemplos:**

```typescript
// Segundos
formatRelativeTime(Date.now() - 1000); // "Há 1 seg"
formatRelativeTime(Date.now() - 30000); // "Há 30 seg"

// Minutos
formatRelativeTime(Date.now() - 60000); // "Há 1 min"
formatRelativeTime(Date.now() - 300000); // "Há 5 min"

// Horas
formatRelativeTime(Date.now() - 3600000); // "Há 1h"
formatRelativeTime(Date.now() - 7200000); // "Há 2h"

// Dias
formatRelativeTime(Date.now() - 86400000); // "Há 1 dia"
formatRelativeTime(Date.now() - 259200000); // "Há 3 dias"

// Meses
formatRelativeTime(Date.now() - 2592000000); // "Há 1 mês"
formatRelativeTime(Date.now() - 5184000000); // "Há 2 meses"

// Anos
formatRelativeTime(Date.now() - 31536000000); // "Há 1 ano"
formatRelativeTime(Date.now() - 63072000000); // "Há 2 anos"

// Agora
formatRelativeTime(Date.now()); // "Agora"
```

### `formatRelativeTimeDetailed(timestamp)`

Formata tempo relativo de forma mais detalhada, incluindo duas unidades de tempo.

**Exemplos:**

```typescript
formatRelativeTimeDetailed(Date.now() - 90000);
// "Há 1 minuto e 30 segundos"

formatRelativeTimeDetailed(Date.now() - 9000000);
// "Há 2 horas e 30 minutos"

formatRelativeTimeDetailed(Date.now() - 100000000);
// "Há 1 dia e 3 horas"
```

### `formatRelativeTimeShort(timestamp)`

Formata tempo relativo de forma ultra abreviada.

**Exemplos:**

```typescript
formatRelativeTimeShort(Date.now() - 30000); // "30s"
formatRelativeTimeShort(Date.now() - 300000); // "5m"
formatRelativeTimeShort(Date.now() - 7200000); // "2h"
formatRelativeTimeShort(Date.now() - 86400000); // "1d"
```

## 🎯 Casos de Uso

### 1. Histórico de Traduções

```vue
<script setup lang="ts">
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const translations = [
  { id: 1, text: 'Olá', created_at: Date.now() - 120000 },
  { id: 2, text: 'Bom dia', created_at: Date.now() - 3600000 },
];
</script>

<template>
  <div v-for="translation in translations" :key="translation.id">
    <span>{{ translation.text }}</span>
    <small>{{ formatRelativeTime(translation.created_at) }}</small>
  </div>
</template>
```

### 2. Posts/Comentários

```vue
<script setup lang="ts">
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const posts = [
  { id: 1, content: 'Post 1', timestamp: Date.now() - 300000 },
  { id: 2, content: 'Post 2', timestamp: Date.now() - 86400000 },
];
</script>

<template>
  <article v-for="post in posts" :key="post.id">
    <p>{{ post.content }}</p>
    <time>{{ formatRelativeTime(post.timestamp) }}</time>
  </article>
</template>
```

### 3. Atualização em Tempo Real

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const lastUpdate = ref(Date.now());
const formattedTime = ref(formatRelativeTime(lastUpdate.value));

let interval: number;

onMounted(() => {
  // Atualizar a cada 10 segundos
  interval = setInterval(() => {
    formattedTime.value = formatRelativeTime(lastUpdate.value);
  }, 10000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div>Última atualização: {{ formattedTime }}</div>
</template>
```

### 4. Comparação de Versões

```typescript
const versions = [
  { version: '1.0.0', released: Date.now() - 31536000000 }, // 1 ano
  { version: '1.1.0', released: Date.now() - 15768000000 }, // 6 meses
  { version: '1.2.0', released: Date.now() - 2592000000 }, // 1 mês
];

versions.forEach(v => {
  console.log(`${v.version}: ${formatRelativeTime(v.released)}`);
});
// Output:
// 1.0.0: Há 1 ano
// 1.1.0: Há 6 meses
// 1.2.0: Há 1 mês
```

## 🔧 Personalização

### Criar Formato Customizado

```typescript
function formatRelativeTimeCustom(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Acabou de acontecer';
  if (minutes < 60) return `${minutes} minutos atrás`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} horas atrás`;

  return `${Math.floor(minutes / 1440)} dias atrás`;
}
```

### Adicionar Emojis

```typescript
function formatRelativeTimeWithEmoji(timestamp: number): string {
  const formatted = formatRelativeTime(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return `🟢 ${formatted}`;
  if (diff < 3600000) return `🟡 ${formatted}`;
  if (diff < 86400000) return `🟠 ${formatted}`;
  return `🔴 ${formatted}`;
}
```

## 📊 Tabela de Conversão

| Unidade          | Milissegundos  | Exemplo                    |
| ---------------- | -------------- | -------------------------- |
| 1 segundo        | 1,000          | `Date.now() - 1000`        |
| 1 minuto         | 60,000         | `Date.now() - 60000`       |
| 1 hora           | 3,600,000      | `Date.now() - 3600000`     |
| 1 dia            | 86,400,000     | `Date.now() - 86400000`    |
| 1 mês (30 dias)  | 2,592,000,000  | `Date.now() - 2592000000`  |
| 1 ano (365 dias) | 31,536,000,000 | `Date.now() - 31536000000` |

## ⚙️ Configuração de Intervalos

Para atualizar automaticamente os tempos relativos:

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { useTranslationHistoryStore } from '@/stores/translationHistory';

const store = useTranslationHistoryStore();
const updateKey = ref(0);

let interval: number;

onMounted(() => {
  // Forçar re-render a cada minuto para atualizar os tempos
  interval = setInterval(() => {
    updateKey.value++;
  }, 60000); // 1 minuto
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div :key="updateKey">
    <div
      v-for="translation in store.getRecentTranslations()"
      :key="translation.id"
    >
      {{ formatRelativeTime(translation.created_at) }}
    </div>
  </div>
</template>
```

## 🧪 Testes

### Teste Manual

```typescript
// Criar timestamps de teste
const now = Date.now();

console.log(formatRelativeTime(now - 30000)); // "Há 30 seg"
console.log(formatRelativeTime(now - 300000)); // "Há 5 min"
console.log(formatRelativeTime(now - 7200000)); // "Há 2h"
console.log(formatRelativeTime(now - 86400000)); // "Há 1 dia"
console.log(formatRelativeTime(now - 2592000000)); // "Há 1 mês"
console.log(formatRelativeTime(now - 31536000000)); // "Há 1 ano"
console.log(formatRelativeTime(now)); // "Agora"
```

## 🎨 Integração com Componentes

### Composable Reativo

```typescript
// useRelativeTime.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { formatRelativeTime } from './formatRelativeTime';

export function useRelativeTime(timestamp: number, updateInterval = 60000) {
  const formatted = ref(formatRelativeTime(timestamp));
  let interval: number;

  onMounted(() => {
    interval = setInterval(() => {
      formatted.value = formatRelativeTime(timestamp);
    }, updateInterval);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return formatted;
}

// Uso em componente
const relativeTime = useRelativeTime(translation.created_at);
```

## 📝 Notas Importantes

1. **Precisão**: A função usa aproximações (30 dias/mês, 365 dias/ano)
2. **Atualização**: Para tempos que mudam (ex: "Há 30 seg"), considere atualizar periodicamente
3. **Fuso Horário**: Usa o horário local do dispositivo
4. **Performance**: Função leve, segura para usar em loops

## 🌍 Internacionalização (i18n)

Para suporte multi-idioma:

```typescript
const translations = {
  'pt-BR': {
    sec: 'seg',
    min: 'min',
    hour: 'h',
    day: 'dia',
    days: 'dias',
    month: 'mês',
    months: 'meses',
    year: 'ano',
    years: 'anos',
    ago: 'Há',
    now: 'Agora',
  },
  'en-US': {
    sec: 's',
    min: 'm',
    hour: 'h',
    day: 'day',
    days: 'days',
    month: 'month',
    months: 'months',
    year: 'year',
    years: 'years',
    ago: '',
    now: 'Now',
  },
};
```

---

**Dúvidas?** Consulte o código-fonte em `src/utils/formatRelativeTime.ts` para mais detalhes.
