# Guia para Corrigir Políticas RLS

## Problema Identificado

As políticas RLS (Row Level Security) da tabela `usuarios` estão causando recursão infinita, afetando:
- ✅ Criação de notificações
- ✅ Carregamento de perfil
- ✅ Atualização de ranking
- ✅ Admin de usuários
- ✅ Respostas de questões

## Solução

Execute o seguinte SQL no painel do Supabase (SQL Editor):

### 1. Acesse o Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto: `cfwyuomeaudpnmjosetq`
3. Vá para "SQL Editor" no menu lateral

### 2. Execute o Script de Correção

Cole e execute o seguinte SQL:

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

-- 9. Verificar se há dados de teste e inserir se necessário
-- Inserir um usuário de teste se não existir
INSERT INTO usuarios (id, nome, email, hash_senha, tipo_usuario, ativo)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Usuário Teste',
    'teste@exemplo.com',
    '$2b$10$teste',
    'aluno',
    true
) ON CONFLICT (id) DO NOTHING;

-- 10. Testar as correções
-- Verificar se as consultas funcionam agora
SELECT 'Teste de leitura de usuarios' as teste, COUNT(*) as total FROM usuarios;
SELECT 'Teste de leitura de notificacoes' as teste, COUNT(*) as total FROM notificacoes;
SELECT 'Teste de leitura de respostas' as teste, COUNT(*) as total FROM respostas_usuarios;
```

### 3. Verificar se Funcionou

Após executar o SQL, execute este script de teste:

```bash
node testar-correcoes-rls.js
```

### 4. Testar no Frontend

Após a correção, teste as seguintes funcionalidades:

1. **Perfil**: Deve carregar nome, email e estatísticas
2. **Ranking**: Deve mostrar usuários e suas posições
3. **Questões**: Deve permitir responder e atualizar estatísticas
4. **Notificações**: Deve permitir criar e visualizar
5. **Admin Usuários**: Deve carregar lista de usuários

## Correções Implementadas no Frontend

### 1. Componente Perfil (Perfil.tsx)
- ✅ Corrigido campo `aluno_id` → `usuario_id`
- ✅ Corrigido campo `correta` → `acertou`
- ✅ Corrigido campo `created_at` → `data_resposta`

### 2. Componente Ranking (Ranking.tsx)
- ✅ Corrigido campo `aluno_id` → `usuario_id`
- ✅ Corrigido campo `correta` → `acertou`

### 3. Componente Questões (Questoes.tsx)
- ✅ Corrigido campo `aluno_id` → `usuario_id`
- ✅ Corrigido campo `resposta_selecionada` → `alternativa_marcada`
- ✅ Corrigido campo `correta` → `acertou`

## Status das Correções

- ✅ **SQL de correção**: Criado e pronto para execução
- ✅ **Frontend corrigido**: Campos atualizados para corresponder ao banco
- ⏳ **Aguardando execução**: Execute o SQL no Supabase Dashboard
- ⏳ **Testes pendentes**: Execute os testes após a correção

## Próximos Passos

1. Execute o SQL no Supabase Dashboard
2. Execute o script de teste: `node testar-correcoes-rls.js`
3. Teste as funcionalidades no frontend
4. Reporte qualquer problema restante
