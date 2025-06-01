# Traduz Libras

Tradutor online gratuito para Libras (Língua Brasileira de Sinais) com tradução básica e simultânea.

## 🚀 Funcionalidades

- **Tradução Básica**: Digite texto em português e veja a tradução em Libras
- **Tradução Simultânea**: Fale no microfone e veja a tradução em tempo real
- **Interface Responsiva**: Funciona em desktop e mobile
- **Navegação Acessível**: Menu mobile com overlay e navegação por teclado
- **Analytics Completo**: Tracking detalhado de uso e performance

## 📊 Eventos de Analytics Implementados

### Eventos de Tradução

- `translation_completed`: Tradução básica concluída
- `simultaneous_translation_started`: Início da tradução simultânea
- `simultaneous_translation_stopped`: Fim da tradução simultânea
- `translation_queue_completed`: Processamento completo da fila de traduções

### Eventos de Navegação

- `page_navigation`: Mudança entre páginas
- `mobile_menu_opened`: Abertura do menu mobile

### Eventos de Performance

- `page_load_time`: Tempo de carregamento das páginas

### Eventos de Acessibilidade

- `accessibility_feature_used`: Uso de funcionalidades de acessibilidade

### Eventos de Erro

- `voice_recognition_error`: Erros no reconhecimento de voz
- `error_occurred`: Erros gerais da aplicação

### Eventos de Engajamento

- `feature_used`: Uso de funcionalidades específicas
- `clear_translation_queue`: Limpeza manual da fila de traduções

## 🛠️ Tecnologias

- **Vue 3** com Composition API
- **TypeScript** para tipagem
- **Tailwind CSS** para estilização
- **Vue Router** para navegação
- **Google Analytics** para tracking
- **VLibras** para tradução em Libras
- **Web Speech API** para reconhecimento de voz

## 📈 Parâmetros Customizados do Analytics

Cada evento inclui parâmetros customizados relevantes:

- `feature_used`: Identifica qual funcionalidade foi utilizada
- `translation_method`: Método de tradução (manual, enter_key)
- `text_length_category`: Categoria do tamanho do texto (short, medium, long)
- `session_duration`: Duração da sessão de tradução simultânea
- `words_translated`: Número de palavras traduzidas
- `error_type`: Tipo específico do erro
- `device_type`: Tipo de dispositivo (mobile, desktop)

## 🎯 Métricas Principais

O sistema de analytics permite acompanhar:

1. **Taxa de Uso**: Quantas traduções são realizadas
2. **Preferência de Funcionalidade**: Básica vs Simultânea
3. **Performance**: Tempos de carregamento
4. **Erros**: Problemas técnicos e de usabilidade
5. **Engajamento**: Tempo de sessão e interações
6. **Acessibilidade**: Uso de funcionalidades inclusivas

## 🔧 Configuração

O Google Analytics está configurado com ID: `G-M1Q6DCQJ38`

Todos os eventos são enviados automaticamente durante o uso da aplicação, permitindo análise detalhada do comportamento dos usuários e otimização contínua da experiência.

## 📱 Responsividade

- **Desktop**: Navegação horizontal no topo
- **Mobile**: Menu hambúrguer com slide-in lateral
- **Proteção VLibras**: Sistema robusto contra interferências do widget
- **Teclado Mobile**: Recolhimento automático ao traduzir para melhor visualização do resultado

## ♿ Acessibilidade

- Tags HTML5 semânticas
- ARIA labels e roles
- Navegação por teclado
- Contraste adequado
- Suporte a leitores de tela

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linter para qualidade de código
- **Prettier** - Formatador de código

## 📦 Instalação

```bash
npm install
```

## 🛠️ Scripts Disponíveis

```bash
# Executar em modo desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Visualizar build de produção
npm run preview

# Verificar tipos TypeScript
npm run type-check

# Executar linter e corrigir problemas
npm run lint

# Formatar código com Prettier
npm run format
```

## ⚙️ Configuração do VSCode

O projeto está configurado para:

- **Formatação automática ao salvar** (Ctrl+S)
- **Correção automática de ESLint** ao salvar
- **Suporte completo ao TypeScript**
- **Suporte ao Vue 3**

### Extensões Recomendadas

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- Prettier - Code formatter
- ESLint

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes Vue
├── assets/        # Recursos estáticos
├── main.ts        # Ponto de entrada da aplicação
├── App.vue        # Componente raiz
├── style.css      # Estilos globais
└── vue-shims.d.ts # Declarações de tipos para Vue
```

## 🎯 Funcionalidades

- ✅ TypeScript configurado
- ✅ Formatação automática ao salvar
- ✅ Linting automático
- ✅ Hot reload em desenvolvimento
- ✅ Build otimizado para produção
