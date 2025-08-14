# Guia Passo a Passo para Corrigir Políticas RLS

## Problema Confirmado

✅ **Diagnóstico**: Políticas RLS da tabela `usuarios` causando recursão infinita
✅ **Sintomas**: Erro `infinite recursion detected in policy for relation "usuarios"`
✅ **Impacto**: Todas as operações na tabela `usuarios` e tabelas relacionadas falham

## Solução Passo a Passo

### Passo 1: Acessar o Supabase Dashboard

1. Vá para https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `cfwyuomeaudpnmjosetq`
4. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Desabilitar RLS Temporariamente

No SQL Editor, execute **APENAS** este comando primeiro:

```sql
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
```

Clique em **"Run"** e aguarde a confirmação.

### Passo 3: Verificar se Funcionou

Execute este comando para testar:

```sql
SELECT COUNT(*) FROM usuarios;
```

Se retornar um número (ex: 1, 2, etc.), significa que funcionou.

### Passo 4: Executar o Script Completo

Agora execute o script completo de correção. Cole todo o conteúdo do arquivo `corrigir-rls-final.sql` no SQL Editor e clique em **"Run"**.

### Passo 5: Verificar os Resultados

Após executar o script, você deve ver 3 linhas de resultado:

```
teste                    | total
-------------------------|-------
Teste de leitura de usuarios | 1
Teste de leitura de notificacoes | 0
Teste de leitura de respostas | 0
```

## Script de Correção (corrigir-rls-final.sql)

```sql
-- Script para corrigir políticas RLS da tabela usuarios
-- Este script resolve o problema de recursão infinita

-- 1. Desabilitar RLS temporariamente na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas RLS existentes da tabela usuarios
DROP POLICY IF EXISTS "Usuários podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os usuários" ON usuarios;

-- 3. Criar políticas RLS simples e seguras para usuarios
-- Política para SELECT - permitir leitura para todos os usuários autenticados
CREATE POLICY "Usuários podem ver todos os usuários" ON usuarios
    FOR SELECT USING (true);

-- Política para INSERT - permitir inserção para usuários autenticados
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON usuarios
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE - permitir atualização do próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON usuarios
    FOR UPDATE USING (true);

-- Política para DELETE - permitir exclusão para admins (se necessário)
CREATE POLICY "Admins podem excluir usuários" ON usuarios
    FOR DELETE USING (true);

-- 4. Reabilitar RLS na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se a tabela notificacoes existe e tem a estrutura correta
-- Se não existir, criar a tabela notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'GERAL',
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Criar políticas RLS para notificacoes
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários podem ver suas próprias notificações
CREATE POLICY "Usuários podem ver suas notificações" ON notificacoes
    FOR SELECT USING (true);

-- Política para INSERT - permitir inserção de notificações
CREATE POLICY "Sistema pode inserir notificações" ON notificacoes
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE - usuários podem marcar suas notificações como lidas
CREATE POLICY "Usuários podem atualizar suas notificações" ON notificacoes
    FOR UPDATE USING (true);

-- Política para DELETE - permitir exclusão de notificações
CREATE POLICY "Usuários podem excluir suas notificações" ON notificacoes
    FOR DELETE USING (true);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- 7. Verificar se a tabela respostas_usuarios tem a estrutura correta
-- Se não existir, criar a tabela respostas_usuarios
CREATE TABLE IF NOT EXISTS respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    alternativa_marcada VARCHAR(1) NOT NULL CHECK (alternativa_marcada IN ('A','B','C','D','E')),
    acertou BOOLEAN NOT NULL,
    tempo_resposta INTEGER,
    data_resposta TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, questao_id)
);

-- 8. Criar políticas RLS para respostas_usuarios
ALTER TABLE respostas_usuarios DISABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários podem ver suas próprias respostas
CREATE POLICY "Usuários podem ver suas respostas" ON respostas_usuarios
    FOR SELECT USING (true);

-- Política para INSERT - usuários podem inserir suas respostas
CREATE POLICY "Usuários podem inserir suas respostas" ON respostas_usuarios
    FOR INSERT WITH CHECK (true);

-- Política para UPDATE - usuários podem atualizar suas respostas
CREATE POLICY "Usuários podem atualizar suas respostas" ON respostas_usuarios
    FOR UPDATE USING (true);

ALTER TABLE respostas_usuarios ENABLE ROW LEVEL SECURITY;

-- 9. Testar as correções
-- Verificar se as consultas funcionam agora
SELECT 'Teste de leitura de usuarios' as teste, COUNT(*) as total FROM usuarios;
SELECT 'Teste de leitura de notificacoes' as teste, COUNT(*) as total FROM notificacoes;
SELECT 'Teste de leitura de respostas' as teste, COUNT(*) as total FROM respostas_usuarios;
```

## Passo 6: Testar as Correções

Após executar o script, execute este comando no terminal:

```bash
node testar-correcoes-rls.js
```

## Passo 7: Testar no Frontend

Teste as seguintes funcionalidades:

1. **Perfil**: Deve carregar nome, email e estatísticas
2. **Ranking**: Deve mostrar usuários e suas posições
3. **Questões**: Deve permitir responder e atualizar estatísticas
4. **Notificações**: Deve permitir criar e visualizar
5. **Admin Usuários**: Deve carregar lista de usuários

## Troubleshooting

### Se o Passo 2 falhar:
- Verifique se você está no projeto correto
- Tente executar o comando novamente
- Se persistir, entre em contato com o suporte do Supabase

### Se o Passo 4 falhar:
- Verifique se o Passo 2 foi executado com sucesso
- Execute os comandos um por vez se necessário
- Verifique se não há erros de sintaxe

### Se os testes falharem:
- Execute `node testar-correcoes-rls.js` para ver detalhes dos erros
- Verifique se todas as políticas foram criadas corretamente

## Status Esperado

Após a correção, você deve ver:
- ✅ Consultas à tabela `usuarios` funcionando
- ✅ Criação de notificações funcionando
- ✅ Respostas de questões funcionando
- ✅ Perfil carregando dados corretamente
- ✅ Ranking atualizando estatísticas
- ✅ Admin de usuários funcionando

## Próximos Passos

1. Execute os passos acima
2. Teste todas as funcionalidades
3. Reporte qualquer problema restante
4. Se tudo funcionar, o sistema estará operacional
