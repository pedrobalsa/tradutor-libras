# Traduz Libras

Tradutor online gratuito para Libras (Língua Brasileira de Sinais) com tradução de texto e tradução simultânea por voz.

## 🧰 Ferramentas do Projeto

As principais ferramentas ficam em `src/utils/` e são expostas como composables do Vue 3 (Composition API):

- **useTranslate** (`src/utils/useTranslate.ts`)

  - Gerencia o fluxo de tradução de texto, estado de "traduzindo" e integração com o histórico
  - Exposição de estados e ações: `isTranslating`, `translatingText`, `translateText(text, method)`
  - Integração com analytics e com a fila de histórico

- **useVLibras** (`src/utils/useVLibras.ts`)

  - Inicializa e protege o widget VLibras de interferências externas
  - Métodos utilitários para acionar a tradução e interação (subtítulos, velocidade, pular mensagem)
  - Boas práticas para mobile e acessibilidade

- **useVideoRecorder** (`src/utils/useVideoRecorder.ts`)

  - Grava e gera `Blob` de vídeos de traduções quando aplicável
  - Oferece hooks de ciclo de vida e compatibilidade com navegadores comuns

- **formatRelativeTime** (`src/utils/formatRelativeTime.ts`)

  - Formata datas relativas para exibir "há x minutos" no histórico

- **analytics** (`src/utils/analytics.ts`)
  - Funções de tracking desacopladas. A documentação completa de eventos e parâmetros está em `src/utils/analytics.md`.

## 🖥️ Fluxos Principais (Views)

- **Home** (`src/views/Home.vue`)

  - Campo de texto com envio por botão ou Enter
  - Uso de `useTranslate` para orquestrar a tradução e estado de UI
  - Comportamentos mobile: recolher teclado e foco não intrusivo
  - Acesso rápido ao histórico em mobile via `MobileDialog`

- **Historic** (`src/components/Historic.vue`)

  - Lista as últimas traduções com tempo relativo (`formatRelativeTime`)
  - Ações: traduzir novamente e baixar vídeo quando disponível
  - Integração com store de histórico (`stores/translationHistory.ts`)

- **Tradução Simultânea** (`src/views/TraducaoSimultanea.vue`)
  - Reconhecimento de voz contínuo (Web Speech API) com fila de tradução
  - Observadores de DOM para sincronizar com o VLibras (progresso, legendas, velocidade)
  - Controles de sessão: iniciar/parar, limpar fila, centralização de item atual

## 🎨 UI e Acessibilidade

- **Responsivo**: layout adaptado para desktop e mobile
- **Acessível**: ARIA, foco controlado, contraste e suporte a teclado
- **Proteção VLibras**: estilos e interações para impedir interferência do widget

## 📦 Instalação

```bash
npm install
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm run preview

# Qualidade
npm run type-check
npm run lint
npm run format
```

## ⚙️ Configuração do VSCode

O projeto está configurado para:

- Formatação automática ao salvar
- Correção automática do ESLint ao salvar
- Suporte a TypeScript e Vue 3

### Extensões Recomendadas

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- Prettier - Code formatter
- ESLint

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes Vue
├── assets/               # Recursos estáticos
├── stores/               # Pinia stores (ex.: translationHistory)
├── utils/                # Composables/utilitários (VLibras, Tradução, Vídeo, Analytics)
├── views/                # Páginas (Home e Tradução Simultânea)
├── main.ts               # Entrada da aplicação
├── App.vue               # Componente raiz
└── style.css             # Estilos globais
```

## 📊 Analytics

A documentação detalhada de eventos, parâmetros e exemplos está em `src/utils/analytics.md`. O ID configurado do Google Analytics é `G-M1Q6DCQJ38`.

## ✅ Status do Projeto

- TypeScript configurado
- Linting e formatação
- Hot reload em desenvolvimento
- Build otimizado para produção
