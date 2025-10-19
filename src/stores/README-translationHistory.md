# translationHistory Store

Store Pinia para gerenciar o histórico de traduções da aplicação.

## 📋 Funcionalidades

- ✅ **Adicionar traduções** ao histórico
- ✅ **Atualizar status** de traduções (traduzindo → completa/erro)
- ✅ **Evitar duplicatas** - Atualiza `created_at` de traduções repetidas
- ✅ **Remover traduções** individuais
- ✅ **Limpar todo o histórico**
- ✅ **Persistência em cookies** (30 dias)
- ✅ **Carregamento automático** ao inicializar
- ✅ **Validação de dados** ao carregar dos cookies

## 🚀 Uso Básico

### Importar a Store

```typescript
import { useTranslationHistoryStore } from '@/stores/translationHistory';

// No setup de um componente
const translationHistoryStore = useTranslationHistoryStore();
```

### Adicionar Tradução

```typescript
// Adicionar nova tradução
const id = translationHistoryStore.addTranslation('Olá mundo', 'traduzindo');

// Se a mesma tradução for adicionada novamente, apenas atualiza o created_at
const sameId = translationHistoryStore.addTranslation(
  'Olá mundo',
  'traduzindo'
);
// id === sameId (retorna o ID da tradução existente)
```

### Atualizar Status

```typescript
// Quando a tradução completar
translationHistoryStore.updateTranslationStatus(id, 'completa');

// Se houver erro
translationHistoryStore.updateTranslationStatus(id, 'erro');
```

### Buscar Traduções

```typescript
// Todas as traduções
const allTranslations = translationHistoryStore.getTranslations;

// Tradução específica por ID
const translation = translationHistoryStore.getTranslationById(id);

// Últimas 10 traduções
const recent = translationHistoryStore.getRecentTranslations(10);

// Traduções por status
const completed = translationHistoryStore.getTranslationsByStatus('completa');
const errors = translationHistoryStore.getTranslationsByStatus('erro');
const inProgress =
  translationHistoryStore.getTranslationsByStatus('traduzindo');
```

### Remover e Limpar

```typescript
// Remover tradução específica
translationHistoryStore.removeTranslation(id);

// Limpar todo o histórico
translationHistoryStore.clearHistory();
```

## 📖 API Completa

### Estado

```typescript
interface TranslationHistoryItem {
  id: string;
  text: string;
  created_at: number; // timestamp
  status: 'traduzindo' | 'completa' | 'erro';
}

// Estado da store
translations: Ref<TranslationHistoryItem[]>;
```

### Getters

#### `getTranslations`

```typescript
const allTranslations = translationHistoryStore.getTranslations;
// Retorna: TranslationHistoryItem[]
```

#### `getTranslationById(id)`

```typescript
const translation = translationHistoryStore.getTranslationById(id);
// Retorna: TranslationHistoryItem | undefined
```

#### `getRecentTranslations(limit?)`

```typescript
const recent = translationHistoryStore.getRecentTranslations(5);
// Retorna: TranslationHistoryItem[] (ordenado por data, mais recente primeiro)
// Default limit: 10
```

#### `getTranslationsByStatus(status)`

```typescript
const completed = translationHistoryStore.getTranslationsByStatus('completa');
// Retorna: TranslationHistoryItem[]
```

### Actions

#### `addTranslation(text, status?)`

Adiciona uma tradução ao histórico ou atualiza uma existente.

**Comportamento:**

- Se o texto **já existe**: Atualiza `created_at`, `status` e move para o topo
- Se o texto **não existe**: Cria nova entrada

```typescript
const id = translationHistoryStore.addTranslation(
  'Olá mundo',
  'traduzindo' // opcional, default: 'traduzindo'
);

// Retorna: string (ID da tradução)
```

**Exemplo de evitar duplicatas:**

```typescript
// Primeira vez
const id1 = store.addTranslation('Olá mundo'); // Nova entrada

// Segunda vez (mesmo texto)
const id2 = store.addTranslation('Olá mundo'); // Atualiza a existente

console.log(id1 === id2); // true
console.log(store.getTranslations.length); // 1 (não duplicou)
```

#### `updateTranslationStatus(id, status)`

Atualiza o status de uma tradução específica.

```typescript
translationHistoryStore.updateTranslationStatus(id, 'completa');
// Status: 'traduzindo' | 'completa' | 'erro'
```

#### `removeTranslation(id)`

Remove uma tradução específica do histórico.

```typescript
translationHistoryStore.removeTranslation(id);
```

#### `clearHistory()`

Remove todas as traduções do histórico.

```typescript
translationHistoryStore.clearHistory();
```

## 💾 Persistência

### Automática

A store salva automaticamente em cookies sempre que há mudanças:

- Adição de tradução
- Atualização de status
- Remoção de tradução
- Limpeza do histórico

### Cookie Details

- **Nome**: `translation_history`
- **Duração**: 30 dias
- **Path**: `/` (disponível em toda a aplicação)
- **Formato**: JSON encodado

### Carregamento

O histórico é carregado automaticamente dos cookies quando a store é inicializada:

```typescript
// Não precisa fazer nada, é automático!
const store = useTranslationHistoryStore(); // Já carrega dos cookies
```

### Manual (se necessário)

```typescript
// Forçar reload dos cookies
store.loadFromCookies();

// Forçar save nos cookies
store.saveToCookies();
```

## 🎯 Exemplos Práticos

### Exemplo 1: Fluxo Completo de Tradução

```typescript
const store = useTranslationHistoryStore();

// 1. Usuário inicia tradução
const id = store.addTranslation('Bom dia', 'traduzindo');

// 2. Tradução é processada...
// (useTranslate.ts faz isso automaticamente)

// 3. Tradução completa
store.updateTranslationStatus(id, 'completa');
```

### Exemplo 2: Exibir Histórico em Componente

```vue
<script setup lang="ts">
import { useTranslationHistoryStore } from '@/stores/translationHistory';

const store = useTranslationHistoryStore();

// Computed que atualiza automaticamente
const recentTranslations = computed(() => store.getRecentTranslations(10));

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('pt-BR');
};
</script>

<template>
  <div>
    <h2>Histórico</h2>
    <ul>
      <li v-for="translation in recentTranslations" :key="translation.id">
        <span>{{ translation.text }}</span>
        <span>{{ translation.status }}</span>
        <span>{{ formatDate(translation.created_at) }}</span>
      </li>
    </ul>
  </div>
</template>
```

### Exemplo 3: Traduzir Novamente (sem duplicar)

```vue
<script setup lang="ts">
const store = useTranslationHistoryStore();
const { translateText } = useTranslate();

const translateAgain = async (text: string) => {
  // addTranslation vai atualizar o created_at se já existir
  const id = store.addTranslation(text, 'traduzindo');

  await translateText(text);

  // Status será atualizado automaticamente pelo useTranslate
};
</script>

<template>
  <button @click="translateAgain(translation.text)">
    <i class="mdi mdi-refresh"></i>
  </button>
</template>
```

### Exemplo 4: Filtrar por Status

```vue
<script setup lang="ts">
const store = useTranslationHistoryStore();

const completedTranslations = computed(() =>
  store.getTranslationsByStatus('completa')
);

const errorTranslations = computed(() => store.getTranslationsByStatus('erro'));
</script>

<template>
  <div>
    <section>
      <h3>Completas ({{ completedTranslations.length }})</h3>
      <!-- Lista de completas -->
    </section>

    <section>
      <h3>Erros ({{ errorTranslations.length }})</h3>
      <!-- Lista de erros -->
    </section>
  </div>
</template>
```

## 🔍 Validação de Dados

A store valida os dados ao carregar dos cookies:

```typescript
// Verifica se cada item tem:
-id(string) -
  text(string) -
  created_at(number) -
  status('traduzindo' | 'completa' | 'erro');

// Itens inválidos são automaticamente descartados
```

## ⚠️ Notas Importantes

1. **Duplicatas**: O sistema compara pelo texto exato. Diferenças de capitalização ou espaços criam entradas separadas.
2. **Persistência**: Os dados são salvos automaticamente, mas dependem de cookies estar habilitado.
3. **Limite**: Não há limite de entradas, mas considere performance com muitos itens.
4. **Ordenação**: `getRecentTranslations` sempre retorna ordenado por `created_at` (mais recente primeiro).

## 🎓 Integração com useTranslate

A store é integrada automaticamente com o composable `useTranslate`:

```typescript
// useTranslate.ts faz isso automaticamente:

// 1. Ao iniciar tradução
const id = translationHistoryStore.addTranslation(text, 'traduzindo');

// 2. Ao completar
translationHistoryStore.updateTranslationStatus(id, 'completa');

// 3. Ao dar erro
translationHistoryStore.updateTranslationStatus(id, 'erro');
```

Você **não precisa** fazer isso manualmente nos componentes!

## 📊 Estrutura de Dados

```typescript
// Exemplo de histórico salvo
[
  {
    id: 'lp3k5m7n9',
    text: 'Olá mundo',
    created_at: 1703001234567,
    status: 'completa',
  },
  {
    id: 'mp4k6n8o0',
    text: 'Bom dia',
    created_at: 1703001234000,
    status: 'traduzindo',
  },
  {
    id: 'np5k7o9p1',
    text: 'Boa noite',
    created_at: 1703001233000,
    status: 'erro',
  },
];
```

---

**Dúvidas?** Consulte o código-fonte em `src/stores/translationHistory.ts` para mais detalhes.
