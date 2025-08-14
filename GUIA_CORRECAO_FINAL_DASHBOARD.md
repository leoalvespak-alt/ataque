# Guia de Correção Final - Dashboard e Estatísticas

## Problemas Identificados

1. **Erros 400/404 nas funções RPC do Supabase**
2. **Problemas visuais** - páginas aparecendo apenas com texto
3. **Função `get_notificacoes_dashboard` com ambiguidade de colunas**

## Soluções Implementadas

### 1. Correção das Funções SQL

Execute o seguinte script SQL no painel do Supabase:

```sql
-- Script para corrigir a função get_notificacoes_dashboard
CREATE OR REPLACE FUNCTION get_notificacoes_dashboard()
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    mensagem TEXT,
    tipo VARCHAR(50),
    prioridade VARCHAR(20),
    lida BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    user_tipo VARCHAR(20);
BEGIN
    user_id := auth.uid();
    
    -- Obter tipo do usuário
    SELECT COALESCE(tipo_usuario, 'aluno') INTO user_tipo
    FROM usuarios
    WHERE id = user_id;
    
    -- Retornar dados vazios se a tabela notificacoes não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notificacoes'
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        notificacoes.id,
        notificacoes.titulo,
        notificacoes.mensagem,
        COALESCE(notificacoes.tipo, 'INFO') as tipo,
        COALESCE(notificacoes.prioridade, 'NORMAL') as prioridade,
        COALESCE(notificacoes.lida, false) as lida,
        notificacoes.created_at
    FROM notificacoes
    WHERE notificacoes.ativa = true
    AND (
        notificacoes.usuario_id = user_id OR
        notificacoes.destinatario_tipo = 'TODOS' OR
        (notificacoes.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
        (notificacoes.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
    )
    ORDER BY notificacoes.prioridade DESC, notificacoes.created_at DESC
    LIMIT 10;
END;
$$;
```

### 2. Arquivos CSS Criados

Foram criados dois arquivos CSS para resolver os problemas visuais:

1. **`client/src/styles/Dashboard.css`** - Estilos para o Dashboard
2. **`client/src/styles/Estatisticas.css`** - Estilos para a página de Estatísticas

### 3. Importações CSS Adicionadas

Os arquivos CSS foram importados nos respectivos componentes:

- `Dashboard.tsx`: `import '../styles/Dashboard.css';`
- `Estatisticas.tsx`: `import '../styles/Estatisticas.css';`

## Passos para Aplicar as Correções

### Passo 1: Executar o Script SQL

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole o script SQL acima
5. Clique em **Run** para executar

### Passo 2: Verificar as Correções

Execute o comando para testar se as funções estão funcionando:

```bash
node testar-correcoes-dashboard.js
```

### Passo 3: Reiniciar a Aplicação

Se a aplicação estiver rodando, reinicie-a para carregar os novos estilos:

```bash
# No diretório client
npm run dev
```

### Passo 4: Verificar o Resultado

1. Acesse a aplicação
2. Vá para a página do Dashboard
3. Vá para a página de Estatísticas
4. Verifique se os problemas foram resolvidos

## Resultados Esperados

### Dashboard
- ✅ Layout responsivo e moderno
- ✅ Cards de estatísticas com animações
- ✅ Seção de notificações funcional
- ✅ Dicas de estudo estilizadas
- ✅ Gráficos de progresso visualmente atrativos
- ✅ Tabelas com hover effects

### Estatísticas
- ✅ Header com gradiente
- ✅ Cards de estatísticas com efeitos visuais
- ✅ Seção de tópicos de dificuldade
- ✅ Tabela de percentuais por disciplina
- ✅ Design responsivo para mobile

## Verificação Final

Após aplicar todas as correções, verifique:

1. **Console do navegador**: Não deve haver erros 400/404
2. **Visual**: As páginas devem ter layout completo, não apenas texto
3. **Funcionalidade**: Todas as seções devem carregar dados corretamente
4. **Responsividade**: Teste em diferentes tamanhos de tela

## Arquivos Modificados

1. `corrigir-notificacoes-final.sql` - Script SQL para correção
2. `client/src/styles/Dashboard.css` - Estilos do Dashboard
3. `client/src/styles/Estatisticas.css` - Estilos das Estatísticas
4. `client/src/pages/Dashboard.tsx` - Importação do CSS
5. `client/src/pages/Estatisticas.tsx` - Importação do CSS

## Próximos Passos

Se ainda houver problemas após aplicar todas as correções:

1. Verifique se o script SQL foi executado com sucesso
2. Confirme se os arquivos CSS foram criados corretamente
3. Verifique se as importações CSS estão funcionando
4. Teste em um navegador diferente ou modo incógnito
5. Verifique se não há cache do navegador interferindo

## Suporte

Se precisar de ajuda adicional, forneça:
- Screenshots dos problemas visuais
- Logs de erro do console do navegador
- Resultado do comando de teste das funções
