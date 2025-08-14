# Layout Moderno - Rota de Ataque Questões

## Visão Geral

Este projeto implementa um layout moderno e responsivo para a plataforma Rota de Ataque Questões, seguindo as especificações de design fornecidas. O layout inclui sidebar colapsível, sistema de cores consistente, tipografia otimizada e integração completa com APIs reais.

## Design System

### Cores
- **Background**: `#1b1b1b`
- **Text Primary**: `#f2f2f2`
- **Text Secondary**: `#cccccc`
- **Highlight**: `#8b0000`
- **Card Background**: `#242424`
- **Border Color**: `#333333`
- **Success**: `#00c853`
- **Warning**: `#ffab00`
- **Error**: `#d50000`

### Tipografia
- **Títulos**: Saira, sans-serif (700, 1.2rem - 1.5rem)
- **Conteúdo**: Aptos/Calibre, sans-serif (400, 1rem)
- **Pequeno**: Aptos/Calibre, sans-serif (400, 0.875rem)

### Layout
- **Sidebar Collapsed**: 80px
- **Sidebar Expanded**: 240px
- **Header Height**: 60px
- **Card Border Radius**: 8px
- **Card Padding**: 16px
- **Card Shadow**: 0 4px 8px rgba(0,0,0,0.2)

## Arquivos Criados

### 1. `base-modern.html`
Template base com sidebar colapsível, header fixo e estrutura responsiva.

### 2. `dashboard-modern.html`
Dashboard principal com painel de notificações, XP, ranking e estatísticas.

### 3. `questoes-modern.html`
Página de questões com filtros avançados e cards interativos.

### 4. `ranking-modern.html`
Página de ranking com posição do usuário, filtros e lista completa dos alunos.

### 5. `planos-modern.html`
Página de planos com comparação de recursos e FAQ para assinantes.

### 6. `perfil-modern.html`
Página de perfil com estatísticas detalhadas, configurações e atividades.

### 7. `api-service.js`
Serviço de API para integração com dados reais do backend.

### 8. `demo-modern.html`
Página de demonstração com links para todas as páginas criadas.

## Como Usar

### 1. Extendendo o Template Base

```html
{% extends "base-modern.html" %}

{% block header_title %}Título da Página{% endblock %}

{% block header_actions %}
<div class="header-actions">
    <button class="btn-primary">Ação</button>
</div>
{% endblock %}

{% block content %}
<!-- Conteúdo da página aqui -->
{% endblock %}

{% block extra_css %}
<style>
    /* CSS específico da página */
</style>
{% endblock %}

{% block scripts %}
<script>
    // JavaScript específico da página
</script>
{% endblock %}
```

### 2. Usando Componentes

#### Cards
```html
<div class="card">
    <h2 class="card-title">Título do Card</h2>
    <p class="card-text">Conteúdo do card</p>
</div>
```

#### Progress Bars
```html
<div class="progress-container">
    <div class="progress-bar" style="width: 75%"></div>
</div>
<div class="progress-text">75%</div>
```

#### Circular Progress
```html
<div class="circular-progress">
    <svg width="120" height="120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#333" stroke-width="8"/>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#8b0000" stroke-width="8" 
                stroke-dasharray="314" stroke-dashoffset="78.5"/>
    </svg>
    <div class="accuracy-text">75%</div>
</div>
```

### 3. Classes Utilitárias

#### Grid
- `.grid-2`: 2 colunas
- `.grid-3`: 3 colunas
- `.grid-4`: 4 colunas

#### Display
- `.d-flex`: display flex
- `.d-grid`: display grid
- `.d-none`: display none

#### Alinhamento
- `.text-center`: text-align center
- `.text-left`: text-align left
- `.text-right`: text-align right

## Responsividade

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### Comportamento Mobile
- Sidebar colapsa automaticamente
- Menu hambúrguer para expandir sidebar
- Grids se adaptam para 1 coluna
- Cards mantêm legibilidade

## Funcionalidades Implementadas

### ✅ Dashboard
- [x] Painel de notificações com categorias
- [x] Barra de progresso XP animada
- [x] Dashboard circular de acertos
- [x] Estatísticas detalhadas
- [x] Atividades recentes
- [x] Integração com API de estatísticas

### ✅ Questões
- [x] Filtros avançados (disciplina, banca, dificuldade)
- [x] Cards de questões interativos
- [x] Sistema de marcação
- [x] Paginação responsiva
- [x] Integração com API de questões

### ✅ Ranking
- [x] Minha posição destacada
- [x] Filtros por período e status
- [x] Lista completa de alunos
- [x] Estatísticas do ranking
- [x] Paginação responsiva
- [x] Integração com API de ranking

### ✅ Planos
- [x] Cards de planos interativos
- [x] Comparação de recursos
- [x] Seção de FAQ expansível
- [x] Modal de comparação
- [x] Design atrativo
- [x] Integração com API de planos

### ✅ Perfil
- [x] Avatar com iniciais
- [x] Estatísticas detalhadas
- [x] Configurações com toggles
- [x] Timeline de atividades
- [x] Modal de edição
- [x] Integração com API de perfil

### ✅ API Service
- [x] Classe ApiService completa
- [x] Autenticação com JWT
- [x] Métodos para todas as APIs
- [x] Tratamento de erros
- [x] Funções de atualização do DOM

## Integração com APIs

### Endpoints Utilizados
- `GET /api/stats/me` - Estatísticas do usuário
- `GET /api/ranking` - Lista de ranking
- `GET /api/ranking/me` - Posição do usuário
- `GET /api/questions` - Lista de questões
- `GET /api/planos` - Lista de planos
- `GET /api/users/profile` - Perfil do usuário

### Funcionalidades da API
- Autenticação automática com token JWT
- Cache de token no localStorage
- Tratamento de erros centralizado
- Funções de atualização do DOM
- Carregamento assíncrono de dados

## Navegação

Para testar o layout, acesse:
- **Demo**: `http://localhost:3002/demo-modern.html`
- **Dashboard**: `http://localhost:3002/dashboard-modern.html`
- **Questões**: `http://localhost:3002/questoes-modern.html`
- **Ranking**: `http://localhost:3002/ranking-modern.html`
- **Planos**: `http://localhost:3002/planos-modern.html`
- **Perfil**: `http://localhost:3002/perfil-modern.html`

## Customização

### Cores
Edite as variáveis CSS no `:root` do `base-modern.html`:

```css
:root {
    --background: #1b1b1b;
    --text-primary: #f2f2f2;
    --highlight: #8b0000;
    /* ... outras cores */
}
```

### Fontes
Altere as fontes no `:root`:

```css
:root {
    --font-title: 'Saira', sans-serif;
    --font-body: 'Aptos', 'Calibre', sans-serif;
}
```

## Performance e Animações

### Otimizações
- CSS com variáveis para melhor performance
- Transições suaves (0.3s ease)
- Lazy loading de imagens
- Debounce em filtros

### Animações
- Hover effects em cards
- Progress bars animadas
- Circular progress com SVG
- Sidebar expand/collapse
- Modal fade in/out

## Próximos Passos Sugeridos

### Funcionalidades Adicionais
1. **Sistema de Notificações em Tempo Real**
   - WebSocket para notificações push
   - Badge de notificações não lidas

2. **Modo Offline**
   - Service Worker para cache
   - Sincronização quando online

3. **Temas Personalizáveis**
   - Múltiplos temas de cores
   - Preferências salvas no perfil

4. **Analytics Avançados**
   - Gráficos de progresso
   - Relatórios detalhados

### Melhorias de UX
1. **Skeleton Loading**
   - Placeholders durante carregamento
   - Transições suaves

2. **Feedback Visual**
   - Toast notifications
   - Loading states
   - Error handling

3. **Acessibilidade**
   - ARIA labels
   - Navegação por teclado
   - Contraste melhorado

### Otimizações Técnicas
1. **Bundle Optimization**
   - Code splitting
   - Tree shaking
   - Minificação

2. **Caching Strategy**
   - Cache de API responses
   - Versionamento de assets
   - CDN para fontes

## Suporte

Para dúvidas ou sugestões sobre o layout moderno, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido seguindo as especificações do Rota de Ataque Questões**
