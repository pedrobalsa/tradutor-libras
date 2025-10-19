# MobileDialog Component

## 📱 Visão Geral

O `MobileDialog` é um componente reutilizável para criar dialogs modais responsivos, especialmente otimizados para dispositivos móveis. Ele fornece uma interface consistente e acessível para exibir conteúdo em overlay.

## 🎯 Características

- **Responsivo**: Visível apenas em telas menores que `xl` (1280px)
- **Animações Suaves**: Transições de entrada e saída fluidas
- **Acessível**: Suporte completo a ARIA e navegação por teclado
- **Customizável**: Props flexíveis para diferentes casos de uso
- **Reutilizável**: Pode ser usado em qualquer parte da aplicação

## 🛠️ API

### Props

| Prop              | Tipo      | Padrão   | Descrição                                |
| ----------------- | --------- | -------- | ---------------------------------------- |
| `isOpen`          | `boolean` | -        | **Obrigatório.** Se o dialog está aberto |
| `title`           | `string`  | `''`     | Título do dialog (opcional)              |
| `maxHeight`       | `string`  | `'80vh'` | Altura máxima do dialog                  |
| `showCloseButton` | `boolean` | `true`   | Se deve mostrar o botão de fechar        |
| `contentClass`    | `string`  | `''`     | Classe CSS adicional para o conteúdo     |

### Events

| Event   | Payload | Descrição                                |
| ------- | ------- | ---------------------------------------- |
| `close` | -       | Emitido quando o dialog deve ser fechado |

### Slots

| Slot      | Descrição                    |
| --------- | ---------------------------- |
| `default` | Conteúdo principal do dialog |

## 📝 Exemplos de Uso

### Uso Básico

```vue
<template>
  <MobileDialog
    :is-open="showDialog"
    title="Meu Dialog"
    @close="showDialog = false"
  >
    <p>Conteúdo do dialog aqui</p>
  </MobileDialog>
</template>

<script setup>
import { ref } from 'vue';
import MobileDialog from './components/MobileDialog.vue';

const showDialog = ref(false);
</script>
```

### Dialog Sem Título

```vue
<template>
  <MobileDialog
    :is-open="showDialog"
    :show-close-button="false"
    @close="showDialog = false"
  >
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-4">Título Personalizado</h3>
      <p>Conteúdo do dialog</p>
    </div>
  </MobileDialog>
</template>
```

### Dialog com Altura Customizada

```vue
<template>
  <MobileDialog
    :is-open="showDialog"
    title="Lista Longa"
    max-height="90vh"
    content-class="space-y-2"
    @close="showDialog = false"
  >
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </MobileDialog>
</template>
```

### Dialog com Conteúdo Complexo

```vue
<template>
  <MobileDialog
    :is-open="showDialog"
    title="Configurações"
    max-height="70vh"
    content-class="p-4 space-y-4"
    @close="showDialog = false"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2"> Nome </label>
          <input
            v-model="form.name"
            class="w-full p-2 border rounded"
            type="text"
          />
        </div>

        <div class="flex gap-2">
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Salvar
          </button>
          <button
            type="button"
            @click="showDialog = false"
            class="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  </MobileDialog>
</template>
```

## 🎨 Estilos e Customização

### Classes CSS Disponíveis

O componente usa as seguintes classes do Tailwind CSS:

- **Overlay**: `fixed inset-0 z-[9999999999] xl:hidden`
- **Background**: `absolute inset-0 bg-black/50 backdrop-blur-sm`
- **Dialog Container**: `absolute bottom-0 p-4 left-0 right-0 bg-midnight border-t border-primary rounded-t-2xl shadow-2xl overflow-hidden`
- **Header**: `flex items-center justify-between mb-4`
- **Content**: `overflow-y-auto` + `contentClass` personalizada

### Customização de Cores

O componente usa as cores do tema da aplicação:

- **Background**: `bg-midnight` (cor de fundo escura)
- **Border**: `border-primary` (cor primária da aplicação)
- **Text**: `text-white-smoke/80` (texto claro com opacidade)

### Customização de Animações

As animações são controladas via classes Tailwind:

```css
/* Entrada do overlay */
.enter-active-class: transition-all duration-300 ease-out
.enter-from-class: opacity-0
.enter-to-class: opacity-100

/* Saída do overlay */
.leave-active-class: transition-all duration-200 ease-in
.leave-from-class: opacity-100
.leave-to-class: opacity-0

/* Entrada do dialog */
.enter-active-class: transition-all duration-300 ease-out
.enter-from-class: transform translate-y-full
.enter-to-class: transform translate-y-0

/* Saída do dialog */
.leave-active-class: transition-all duration-200 ease-in
.leave-from-class: transform translate-y-0
.leave-to-class: transform translate-y-full
```

## ♿ Acessibilidade

### Recursos de Acessibilidade

- **ARIA Labels**: Botões têm `aria-label` apropriados
- **Foco**: Gerenciamento automático de foco
- **Teclado**: Suporte a navegação por teclado
- **Screen Readers**: Texto alternativo para ícones
- **Semântica**: Estrutura HTML semântica

### Atributos de Proteção

O componente inclui atributos para proteção contra interferência do VLibras:

```html
data-vlib-ignore="true" data-no-translate="true"
```

## 🔧 Integração com VLibras

### Proteção de Eventos

O componente protege contra interferência do VLibras usando:

```typescript
@mousedown.prevent="handleClose"
@touchstart.prevent="handleClose"
```

### Eventos de Fechamento

Múltiplas formas de fechar o dialog:

1. **Clique no overlay** (fora do dialog)
2. **Botão de fechar** (se habilitado)
3. **Evento `close`** emitido programaticamente

## 📱 Responsividade

### Breakpoints

- **Mobile/Tablet**: `< 1280px` - Dialog visível
- **Desktop**: `≥ 1280px` - Dialog oculto (`xl:hidden`)

### Comportamento Responsivo

- **Mobile**: Dialog ocupa toda a largura com bordas arredondadas no topo
- **Tablet**: Mesmo comportamento do mobile
- **Desktop**: Componente não é renderizado

## 🚀 Performance

### Otimizações

- **Lazy Rendering**: Só renderiza quando `isOpen` é `true`
- **Transitions Otimizadas**: Animações CSS nativas
- **Event Delegation**: Eventos eficientemente gerenciados
- **Memory Management**: Cleanup automático de event listeners

### Bundle Size

O componente é leve e não adiciona dependências externas:

- **Tamanho**: ~2KB minificado
- **Dependências**: Apenas Vue 3 Composition API
- **Tree Shaking**: Totalmente compatível

## 🧪 Testes

### Casos de Teste Recomendados

1. **Abertura/Fechamento**: Verificar se abre e fecha corretamente
2. **Responsividade**: Testar em diferentes tamanhos de tela
3. **Acessibilidade**: Navegação por teclado e screen readers
4. **Eventos**: Clique no overlay e botão de fechar
5. **Slots**: Conteúdo personalizado renderiza corretamente
6. **Props**: Todas as props funcionam como esperado

### Exemplo de Teste

```typescript
import { mount } from '@vue/test-utils';
import MobileDialog from '@/components/MobileDialog.vue';

describe('MobileDialog', () => {
  it('should emit close when overlay is clicked', async () => {
    const wrapper = mount(MobileDialog, {
      props: { isOpen: true },
      slots: { default: 'Test content' },
    });

    await wrapper.find('.fixed.inset-0').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
```

## 🔄 Migração

### De Dialog Inline para MobileDialog

**Antes:**

```vue
<template>
  <div v-if="showDialog" class="fixed inset-0 z-50">
    <!-- Código do dialog inline -->
  </div>
</template>
```

**Depois:**

```vue
<template>
  <MobileDialog
    :is-open="showDialog"
    title="Meu Dialog"
    @close="showDialog = false"
  >
    <!-- Conteúdo do dialog -->
  </MobileDialog>
</template>
```

### Benefícios da Migração

- **Código Mais Limpo**: Menos HTML repetitivo
- **Consistência**: Interface padronizada
- **Manutenibilidade**: Mudanças centralizadas
- **Reutilização**: Fácil uso em outros componentes
- **Testabilidade**: Componente isolado e testável

## 📚 Casos de Uso Comuns

### 1. Histórico de Traduções

```vue
<MobileDialog
  :is-open="showHistory"
  title="Histórico de Traduções"
  @close="showHistory = false"
>
  <Historic :on-close-dialog="() => showHistory = false" />
</MobileDialog>
```

### 2. Configurações

```vue
<MobileDialog
  :is-open="showSettings"
  title="Configurações"
  max-height="70vh"
  @close="showSettings = false"
>
  <SettingsForm />
</MobileDialog>
```

### 3. Confirmação

```vue
<MobileDialog
  :is-open="showConfirm"
  :show-close-button="false"
  @close="showConfirm = false"
>
  <ConfirmDialog 
    :message="confirmMessage"
    @confirm="handleConfirm"
    @cancel="showConfirm = false"
  />
</MobileDialog>
```

### 4. Formulário

```vue
<MobileDialog
  :is-open="showForm"
  title="Novo Item"
  max-height="90vh"
  content-class="p-4"
  @close="showForm = false"
>
  <ItemForm @submit="handleSubmit" @cancel="showForm = false" />
</MobileDialog>
```

## 🎯 Boas Práticas

### 1. Sempre Use o Event `close`

```vue
<!-- ✅ Bom -->
<MobileDialog :is-open="show" @close="show = false"></MobileDialog>
```

### 2. Título Descritivo

```vue
<!-- ✅ Bom -->
<MobileDialog title="Histórico de Traduções"></MobileDialog>
```

### 3. Altura Apropriada

```vue
<!-- ✅ Bom -->
<MobileDialog max-height="80vh"></MobileDialog>
```

### 4. Conteúdo Estruturado

```vue
<!-- ✅ Bom -->
<MobileDialog>
  <div class="space-y-4">
    <h3>Título da Seção</h3>
    <p>Conteúdo...</p>
  </div>
</MobileDialog>

<!-- ❌ Evitar -->
<MobileDialog>
  <p>Conteúdo sem estrutura</p>
</MobileDialog>
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Dialog Não Abre

- Verifique se `isOpen` está sendo passado corretamente
- Confirme se o componente está sendo importado

#### Animações Não Funcionam

- Verifique se o Tailwind CSS está configurado
- Confirme se as classes de transição estão disponíveis

#### Conteúdo Não Aparece

- Verifique se o slot está sendo usado corretamente
- Confirme se `maxHeight` não está muito pequeno

#### Botão de Fechar Não Funciona

- Verifique se o evento `close` está sendo escutado
- Confirme se `showCloseButton` não está como `false`

### Debug

```vue
<template>
  <MobileDialog :is-open="showDialog" title="Debug Dialog" @close="handleClose">
    <div>
      <p>isOpen: {{ showDialog }}</p>
      <p>Timestamp: {{ Date.now() }}</p>
    </div>
  </MobileDialog>
</template>

<script setup>
const showDialog = ref(false);

const handleClose = () => {
  console.log('Dialog fechado');
  showDialog.value = false;
};
</script>
```

## 📈 Roadmap

### Funcionalidades Futuras

- [ ] **Backdrop Customizável**: Diferentes estilos de overlay
- [ ] **Posicionamento**: Dialog no topo, centro, etc.
- [ ] **Tamanhos Pré-definidos**: `sm`, `md`, `lg`, `xl`
- [ ] **Drag to Close**: Arrastar para fechar
- [ ] **Keyboard Shortcuts**: ESC para fechar
- [ ] **Focus Trap**: Gerenciamento automático de foco
- [ ] **Portal**: Renderização fora do DOM tree
- [ ] **Themes**: Diferentes temas visuais

### Contribuições

Para contribuir com melhorias no componente:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Abra um Pull Request

## 📄 Licença

Este componente é parte do projeto Tradutor Libras e segue a mesma licença do projeto principal.
