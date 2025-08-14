# Sistema de Temas Dinâmicos - Rota de Ataque Questões

## Visão Geral

Este sistema permite personalizar completamente o visual da plataforma através de temas dinâmicos armazenados no Supabase, com suporte a Realtime, cache local e fallback offline.

## Características Principais

- ✅ **Temas Dinâmicos**: Cores, tipografia, espaçamentos e sombras configuráveis
- ✅ **Integração Supabase**: Persistência e sincronização em tempo real
- ✅ **Cache Local**: Funcionamento offline com localStorage
- ✅ **Preview ao Vivo**: Visualização instantânea das mudanças
- ✅ **Interface Administrativa**: Página dedicada para gestores
- ✅ **Fallback Seguro**: Tema padrão quando Supabase não está acessível
- ✅ **Codemod Automático**: Migração automática de cores hardcoded

## Estrutura do Sistema

### 1. Contexto de Tema (`ThemeContext.tsx`)

Gerencia o estado global dos temas com:
- Carregamento de temas do Supabase
- Cache local com localStorage
- Aplicação de CSS variables no DOM
- Sincronização Realtime
- Fallback para tema padrão

### 2. Página de Configuração (`AdminDesign.tsx`)

Interface administrativa com:
- Editor visual de cores, tipografia e espaçamentos
- Preview ao vivo das mudanças
- Gerenciamento de múltiplos temas
- Ativação/desativação de temas
- Export/import de configurações

### 3. Schema do Banco (`supabase-theme-schema.sql`)

Tabela `themes` com:
- Tokens JSONB para flexibilidade
- Triggers para garantir apenas um tema ativo
- RLS (Row Level Security) configurado
- Índices otimizados

## Como Usar

### Para Desenvolvedores

#### 1. Acessar a Página de Design

```bash
# Navegar para a página de configuração (apenas gestores)
http://localhost:3000/admin/design
```

#### 2. Usar o Hook `useTheme`

```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { currentTheme, applyTheme, updateTheme } = useTheme();
  
  // Acessar tokens do tema atual
  const primaryColor = currentTheme?.tokens.colors['primary-500'].hex;
  
  // Aplicar tema programaticamente
  const handleThemeChange = (newTheme) => {
    applyTheme(newTheme);
  };
  
  return (
    <div style={{ backgroundColor: primaryColor }}>
      Conteúdo com tema dinâmico
    </div>
  );
};
```

#### 3. Usar CSS Variables

```css
/* As variáveis CSS são aplicadas automaticamente */
.my-component {
  background-color: var(--color-primary-500);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Para Administradores

#### 1. Configurar Supabase

Execute o schema SQL no painel do Supabase:

```sql
-- Executar o arquivo supabase-theme-schema.sql
-- Isso criará a tabela themes com o tema padrão
```

#### 2. Acessar Configurações

1. Faça login como gestor
2. Navegue para `/admin/design`
3. Use a interface para personalizar o tema

#### 3. Gerenciar Temas

- **Criar Novo Tema**: Clique em "Novo Tema"
- **Editar Tema**: Selecione um tema e modifique os valores
- **Ativar Tema**: Clique em "Ativar" no tema desejado
- **Deletar Tema**: Clique em "Deletar" (não disponível para tema padrão)

## Scripts de Automação

### Auditoria de Cores

```bash
# Executar auditoria completa
node scripts/theme-audit.js

# Resultado: theme-audit.json
```

### Geração de Proposta

```bash
# Gerar proposta baseada na auditoria
node scripts/generate-theme-proposal.js

# Resultado: theme-proposal.json
```

### Codemod de Refatoração

```bash
# Simular mudanças (dry run)
node scripts/theme-codemod.js

# Aplicar mudanças
node scripts/theme-codemod.js --apply

# Resultado: design/refactor-report.md
```

## Estrutura de Tokens

### Cores

```json
{
  "colors": {
    "primary-500": {
      "hex": "#3b82f6",
      "hsl": { "h": 217, "s": 91, "l": 60 },
      "variants": ["#3b82f6", "#2563eb", "#1d4ed8"]
    }
  }
}
```

### Tipografia

```json
{
  "typography": {
    "font-family-sans": "Inter, system-ui, -apple-system, sans-serif",
    "font-size-base": "16px",
    "font-weight-medium": "500"
  }
}
```

### Espaçamentos

```json
{
  "spacing": {
    "spacing-md": "16px",
    "spacing-lg": "24px",
    "spacing-xl": "32px"
  }
}
```

### Bordas e Sombras

```json
{
  "borders": {
    "border-radius-lg": "8px",
    "border-width-base": "2px"
  },
  "shadows": {
    "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
  }
}
```

## Cache e Performance

### Estratégia de Cache

1. **Carregamento Inicial**: Tenta Supabase → Cache → Fallback
2. **Cache Local**: `localStorage.app_theme_cache_v1`
3. **Sincronização**: Realtime + atualizações manuais
4. **Fallback**: `design/default-theme.json`

### Otimizações

- CSS variables aplicadas via `<style>` tag
- Cache com timestamp para invalidação
- Lazy loading de temas não ativos
- Debounce em mudanças de preview

## Troubleshooting

### Problemas Comuns

#### 1. Tema não carrega

```bash
# Verificar conexão Supabase
# Verificar cache local
# Verificar fallback
```

#### 2. Mudanças não aplicam

```bash
# Verificar permissões RLS
# Verificar se tema está ativo
# Verificar console para erros
```

#### 3. Performance lenta

```bash
# Verificar tamanho do JSON de tokens
# Verificar frequência de atualizações
# Verificar cache local
```

### Logs de Debug

```javascript
// Habilitar logs detalhados
localStorage.setItem('theme_debug', 'true');

// Verificar no console:
// - Carregamento de temas
// - Aplicação de CSS variables
// - Sincronização Realtime
```

## Migração de Código Existente

### 1. Executar Auditoria

```bash
node scripts/theme-audit.js
```

### 2. Revisar Proposta

```bash
node scripts/generate-theme-proposal.js
# Revisar theme-proposal.json
```

### 3. Aplicar Codemod

```bash
# Dry run primeiro
node scripts/theme-codemod.js

# Aplicar mudanças
node scripts/theme-codemod.js --apply
```

### 4. Verificar Resultado

```bash
# Revisar design/refactor-report.md
# Testar aplicação
# Fazer ajustes manuais se necessário
```

## Rollback

### Desativar Sistema de Temas

1. **Remover ThemeProvider** do App.tsx
2. **Restaurar cores hardcoded** se necessário
3. **Limpar cache local**:
   ```javascript
   localStorage.removeItem('app_theme_cache_v1');
   ```

### Restaurar Tema Padrão

```bash
# Executar SQL para restaurar tema padrão
UPDATE themes SET is_active = false WHERE is_active = true;
UPDATE themes SET is_active = true WHERE is_default = true;
```

## Contribuição

### Adicionar Novos Tokens

1. **Atualizar tipos** em `ThemeContext.tsx`
2. **Adicionar ao schema** em `supabase-theme-schema.sql`
3. **Atualizar interface** em `AdminDesign.tsx`
4. **Testar aplicação** e cache

### Adicionar Novas Funcionalidades

1. **Criar branch** `feat/theme-[feature]`
2. **Implementar funcionalidade**
3. **Adicionar testes** se aplicável
4. **Atualizar documentação**
5. **Criar PR** com descrição detalhada

## Segurança

### RLS (Row Level Security)

- **Leitura**: Pública (todos podem ver temas)
- **Escrita**: Apenas usuários autenticados
- **Atualização**: Apenas gestores ou criador do tema
- **Exclusão**: Apenas gestores ou criador do tema

### Validação

- **JSON Schema**: Validação de estrutura de tokens
- **Cores**: Validação de formato hex/hsl
- **Valores**: Validação de ranges e tipos
- **Sanitização**: Escape de valores perigosos

## Performance

### Métricas Esperadas

- **Carregamento inicial**: < 100ms
- **Aplicação de tema**: < 50ms
- **Sincronização Realtime**: < 200ms
- **Cache hit ratio**: > 95%

### Monitoramento

```javascript
// Métricas de performance
console.log('Theme load time:', performance.now() - startTime);
console.log('Cache hit:', cacheHit);
console.log('Realtime updates:', realtimeUpdates);
```

## Roadmap

### Próximas Funcionalidades

- [ ] **Temas por usuário**: Personalização individual
- [ ] **Import/Export**: Backup e restauração de temas
- [ ] **Histórico**: Versionamento de temas
- [ ] **Preview avançado**: Simulação de diferentes páginas
- [ ] **Acessibilidade**: Validação WCAG automática
- [ ] **Temas sazonais**: Mudança automática por data

### Melhorias Técnicas

- [ ] **Web Workers**: Processamento em background
- [ ] **Service Worker**: Cache offline avançado
- [ ] **Compressão**: Otimização de JSON de tokens
- [ ] **Lazy loading**: Carregamento sob demanda
- [ ] **TypeScript**: Tipagem mais rigorosa

## Suporte

### Contato

- **Issues**: GitHub Issues
- **Documentação**: Este README
- **Exemplos**: `/examples` directory

### Recursos

- **Supabase Docs**: https://supabase.com/docs
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Context**: https://react.dev/reference/react/createContext

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024  
**Mantenedor**: Equipe Rota de Ataque Questões
