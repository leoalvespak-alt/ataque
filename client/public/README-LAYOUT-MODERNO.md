# Layout Moderno - Rota de Ataque Questões

## 📋 Visão Geral

Este layout moderno foi desenvolvido seguindo exatamente as especificações fornecidas, criando uma interface clean, moderna e motivadora para a plataforma Rota de Ataque Questões.

## 🎨 Sistema de Design

### Cores
```css
:root {
    --background: #1b1b1b;        /* Fundo principal */
    --text-primary: #f2f2f2;      /* Texto principal */
    --text-secondary: #cccccc;    /* Texto secundário */
    --highlight: #8b0000;         /* Destaque/vermelho */
    --card-background: #242424;   /* Fundo dos cards */
    --border-color: #333333;      /* Bordas */
    --success: #00c853;           /* Verde sucesso */
    --warning: #ffab00;           /* Amarelo aviso */
    --error: #d50000;             /* Vermelho erro */
}
```

### Tipografia
- **Títulos**: Saira (700, 600) - 1.5rem, 1.2rem
- **Corpo**: Aptos/Calibre (400) - 1rem
- **Pequeno**: Aptos/Calibre (400) - 0.875rem

### Layout
- **Sidebar**: 80px recolhida, 240px expandida
- **Header**: 60px de altura
- **Cards**: 8px border-radius, 16px padding
- **Transições**: 0.3s ease-in-out

## 📁 Arquivos Criados

### 1. `base-modern.html`
Template base com:
- Sidebar colapsável com hover expand
- Header fixo com ações
- Sistema de grid responsivo
- Componentes reutilizáveis
- Menu mobile responsivo

### 2. `dashboard-modern.html`
Dashboard completo com:
- Painel de notificações estilo Rota de Ataque
- XP com barra de progresso animada
- Ranking com posição do usuário
- Dashboard circular de acertos
- Atividades recentes
- Estatísticas detalhadas

### 3. `questoes-modern.html`
Página de questões com:
- Filtros avançados (disciplina, banca, dificuldade)
- Cards de questões interativos
- Sistema de marcação para revisão
- Estatísticas por questão
- Paginação responsiva

### 4. `demo-modern.html`
Página de demonstração com:
- Visão geral dos componentes
- Links para todas as páginas
- Características do layout
- Exemplos de uso

## 🚀 Como Usar

### 1. Estrutura Base
```html
{% extends "base-modern.html" %}

{% block title %}Título da Página{% endblock %}
{% block header_title %}Título do Header{% endblock %}

{% block content %}
<!-- Seu conteúdo aqui -->
{% endblock %}
```

### 2. Componentes Disponíveis

#### Cards
```html
<div class="card">
    <h3 class="card-title">Título do Card</h3>
    <div class="card-subtitle">Subtítulo</div>
    <div class="card-text">Texto do conteúdo</div>
</div>
```

#### Grid System
```html
<div class="grid grid-2">    <!-- 2 colunas -->
<div class="grid grid-3">    <!-- 3 colunas -->
<div class="grid grid-4">    <!-- 4 colunas -->
```

#### Progress Bar
```html
<div class="progress-container">
    <div class="progress-bar" style="width: 65%;"></div>
</div>
<div class="progress-text">65% do nível atual</div>
```

#### Circular Progress
```html
<div class="circular-progress">
    <svg>
        <circle class="bg" cx="60" cy="60" r="52"></circle>
        <circle class="progress" cx="60" cy="60" r="52"></circle>
    </svg>
    <div class="percentage">70%</div>
</div>
```

#### Notification Cards
```html
<div class="notification-card" style="border-left-color: var(--highlight);">
    <div class="notification-category">Motivacional</div>
    <div class="notification-title">Mantenha o Foco!</div>
    <div class="notification-text">Mensagem motivacional...</div>
</div>
```

### 3. Classes Utilitárias
```css
.text-center, .text-right
.mb-0, .mb-1, .mb-2, .mb-3
.mt-0, .mt-1, .mt-2, .mt-3
.d-flex, .d-grid
.align-center, .justify-center, .justify-between
.gap-1, .gap-2, .gap-3
```

## 📱 Responsividade

O layout é totalmente responsivo com breakpoints em:
- **Desktop**: > 768px
- **Mobile**: ≤ 768px

### Comportamento Mobile
- Sidebar fica oculta e abre via botão
- Grids se tornam coluna única
- Header se adapta ao tamanho da tela
- Cards mantêm legibilidade

## 🎯 Características Implementadas

### ✅ Sidebar
- [x] Logo no topo
- [x] Lista de páginas com ícones
- [x] Expansão no hover (80px → 240px)
- [x] Transição suave de 0.3s
- [x] Cores conforme especificação
- [x] Responsivo para mobile

### ✅ Header
- [x] Altura de 60px
- [x] Fundo #1b1b1b
- [x] Texto #f2f2f2
- [x] Botão mobile menu
- [x] Área para ações

### ✅ Painel de Notificações
- [x] Cards retangulares
- [x] Cores por categoria
- [x] Estilo Rota de Ataque
- [x] Hover effects

### ✅ Gamificação
- [x] XP com barra de progresso
- [x] Posição no ranking
- [x] Dashboard circular de acertos
- [x] Animações suaves

### ✅ Cards e Elementos
- [x] Fundo #242424
- [x] Bordas #333333
- [x] Border-radius 8px
- [x] Sombras leves
- [x] Tipografia conforme especificação

## 🔧 Customização

### Alterar Cores
Modifique as variáveis CSS no `:root`:
```css
:root {
    --highlight: #sua-cor;
    --background: #sua-cor;
    /* etc */
}
```

### Alterar Fontes
Substitua os links das fontes no `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@400;600;700&display=swap" rel="stylesheet">
```

### Adicionar Novas Páginas
1. Crie um novo arquivo HTML
2. Estenda o `base-modern.html`
3. Implemente os blocos necessários
4. Adicione o link na sidebar

## 📊 Performance

- CSS otimizado com variáveis
- Transições suaves mas leves
- Fontes carregadas via CDN
- Ícones via Font Awesome CDN
- Sem dependências pesadas

## 🎨 Animações

- Hover effects nos cards
- Transições suaves no sidebar
- Progress bars animadas
- Circular progress com preenchimento
- Micro-interações nos botões

## 🔗 Navegação

Para testar o layout:
1. Abra `demo-modern.html` no navegador
2. Navegue pelos links para ver cada página
3. Teste a responsividade redimensionando a janela
4. Interaja com os elementos para ver as animações

## 📝 Próximos Passos

1. **Integração com Backend**: Conectar com APIs existentes
2. **Mais Páginas**: Criar páginas de ranking, planos, perfil
3. **Funcionalidades**: Implementar filtros reais, sistema de XP
4. **Otimizações**: Lazy loading, cache de assets
5. **Acessibilidade**: Melhorar suporte a leitores de tela

## 🤝 Contribuição

Para contribuir com melhorias:
1. Mantenha a estrutura de variáveis CSS
2. Siga o padrão de nomenclatura
3. Teste a responsividade
4. Documente novas funcionalidades

---

**Desenvolvido seguindo as especificações do Rota de Ataque Questões**
**Layout moderno, clean e motivador para maximizar o engajamento dos usuários**
