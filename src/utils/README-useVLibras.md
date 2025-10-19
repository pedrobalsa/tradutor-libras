# useVLibras - Composable Vue para VLibras

Composable Vue.js para integração e proteção do widget VLibras (tradutor de Libras).

## 📋 Sobre

O `useVLibras` é um composable que facilita a integração do widget VLibras em aplicações Vue.js, fornecendo:

- ✅ **Proteção automática** contra interferência do VLibras em botões e links
- ✅ **Configuração simplificada** do widget
- ✅ **Personalização de estilos** e posicionamento
- ✅ **TypeScript** com tipos completos
- ✅ **Reutilizável** em múltiplos projetos

## 🚀 Instalação Rápida

### 1. Copiar o Composable

Copie o arquivo `useVLibras.ts` para seu projeto Vue:

```
src/
  utils/
    useVLibras.ts
```

### 2. Adicionar Estilos CSS

Adicione ao seu arquivo CSS global (ex: `style.css`):

```css
/* Proteção Global contra Interferência do VLibras */
button,
[role='button'],
input[type='button'],
input[type='submit'],
a[href],
[data-vlib-ignore],
.translate-button {
  pointer-events: auto !important;
  position: relative !important;
  z-index: 99999999 !important;
  isolation: isolate !important;
  touch-action: manipulation !important;
}

button *,
[role='button'] *,
.translate-button * {
  pointer-events: none !important;
  user-select: none !important;
}
```

### 3. Usar no App.vue

```vue
<script setup lang="ts">
import { useVLibrasInComponent } from './utils/useVLibras';

// Inicializar VLibras com proteção automática
useVLibrasInComponent({
  enableDebugLogs: true,
});
</script>

<template>
  <div id="app">
    <!-- Widget VLibras -->
    <aside aria-label="Widget de tradução VLibras">
      <div vw class="enabled">
        <div vw-access-button class="active" />
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper" />
        </div>
      </div>
    </aside>

    <!-- Seu conteúdo aqui -->
    <router-view />
  </div>
</template>
```

## 📖 API

### `useVLibras(options)`

Hook principal que retorna funções de controle.

```typescript
const vlibras = useVLibras({
  scriptUrl: 'https://vlibras.gov.br/app/vlibras-plugin.js',
  appUrl: 'https://vlibras.gov.br/app',
  enableDebugLogs: true,
});

// Inicializar manualmente
vlibras.initialize();

// Forçar atualização de estilos
vlibras.ensureProtectionStyles();
```

### `useVLibrasInComponent(options)`

Hook Vue que inicializa automaticamente no `onMounted`.

```typescript
// Em App.vue ou qualquer componente
useVLibrasInComponent({
  enableDebugLogs: import.meta.env.DEV, // Logs apenas em dev
});
```

### Opções (UseVLibrasOptions)

```typescript
interface UseVLibrasOptions {
  /** URL do script do VLibras */
  scriptUrl?: string; // Default: 'https://vlibras.gov.br/app/vlibras-plugin.js'

  /** URL da aplicação VLibras */
  appUrl?: string; // Default: 'https://vlibras.gov.br/app'

  /** Habilitar logs de debug no console */
  enableDebugLogs?: boolean; // Default: true
}
```

## 🎯 Como Funciona

### 1. Interceptação de Event Listeners

O composable intercepta `EventTarget.prototype.addEventListener` globalmente para bloquear listeners do VLibras em elementos interativos:

```typescript
// O VLibras tenta adicionar listener
button.addEventListener('click', vlibrasHandler);

// ❌ BLOQUEADO! O composable detecta que é do VLibras e não adiciona
// ✅ Seus handlers funcionam normalmente
```

### 2. Proteção de Estilos

Garante que botões e links sempre tenham os estilos corretos:

```typescript
// Aplicado automaticamente a todos os botões
button.style.pointerEvents = 'auto';
button.style.cursor = 'pointer';
button.style.zIndex = '999999';
```

### 3. Configuração Automática

- Clica automaticamente no botão VLibras
- Fecha o tutorial automaticamente
- Oculta elementos de interface desnecessários
- Ajusta posicionamento e tamanho do widget

### 4. Monitoramento Dinâmico

MutationObserver monitora o DOM e aplica proteção a novos elementos:

```typescript
// Novos botões adicionados dinamicamente são protegidos automaticamente
document.body.appendChild(newButton); // ✅ Já está protegido
```

## 📝 Exemplos de Uso

### Básico

```typescript
// App.vue
import { useVLibrasInComponent } from './utils/useVLibras';

useVLibrasInComponent();
```

### Com Opções Personalizadas

```typescript
useVLibrasInComponent({
  scriptUrl: 'https://vlibras.gov.br/app/vlibras-plugin.js',
  appUrl: 'https://vlibras.gov.br/app',
  enableDebugLogs: false, // Desabilitar logs em produção
});
```

### Controle Manual

```typescript
import { useVLibras } from './utils/useVLibras';

const vlibras = useVLibras({
  enableDebugLogs: true,
});

// Inicializar quando necessário
onMounted(() => {
  vlibras.initialize();
});

// Atualizar proteção manualmente
const updateProtection = () => {
  vlibras.ensureProtectionStyles();
};
```

### Logs Apenas em Desenvolvimento

```typescript
useVLibrasInComponent({
  enableDebugLogs: import.meta.env.DEV,
});
```

## 🐛 Solução de Problemas

### Botões não funcionam

1. Verifique se o CSS de proteção foi adicionado
2. Verifique se `useVLibrasInComponent` foi chamado em `App.vue`
3. Ative `enableDebugLogs: true` para ver logs no console

### VLibras não aparece

1. Verifique se o HTML do widget está no template
2. Verifique o console para erros de carregamento
3. Verifique se o script do VLibras está carregando corretamente

### Estilos incorretos

O composable reaplica estilos automaticamente. Se mesmo assim houver problemas:

```typescript
const vlibras = useVLibras();
vlibras.ensureProtectionStyles(); // Forçar aplicação
```

## 🔧 Customização

### Desabilitar Logs de Debug

```typescript
useVLibrasInComponent({
  enableDebugLogs: false,
});
```

### Usar CDN Diferente

```typescript
useVLibrasInComponent({
  scriptUrl: 'https://seu-cdn.com/vlibras-plugin.js',
  appUrl: 'https://seu-cdn.com/vlibras-app',
});
```

### Adicionar Elementos Protegidos

Adicione classes ou atributos aos seus elementos:

```vue
<button class="translate-button">Meu Botão</button>
<button data-vlib-ignore="true">Outro Botão</button>
<button data-no-translate="true">Mais Um</button>
```

## 📊 Performance

- **Tamanho**: ~10KB (não minificado)
- **Overhead**: Mínimo - apenas intercepta `addEventListener`
- **Compatibilidade**: Vue 3+ e navegadores modernos
- **SSR**: Compatível (use apenas no cliente)

## ⚠️ Notas Importantes

1. **Ordem de Inicialização**: O composable deve ser inicializado ANTES do VLibras carregar
2. **SSR**: Use apenas no cliente (`onMounted` ou guards de cliente)
3. **Performance**: O MutationObserver tem overhead mínimo mas monitora todo o `document.body`

## 🤝 Contribuindo

Este composable foi desenvolvido para o projeto [tradutor-libras](https://github.com/seu-usuario/tradutor-libras).

## 📄 Licença

Mesma licença do projeto principal.

## 🙏 Créditos

- Widget VLibras: [vlibras.gov.br](https://vlibras.gov.br)
- Desenvolvido para melhorar a acessibilidade em aplicações Vue.js

---

**Dúvidas?** Consulte a [documentação completa](../../../VLIBRAS-PROTECTION.md) para mais detalhes sobre como a proteção funciona.
