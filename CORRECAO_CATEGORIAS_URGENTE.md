# 🔴 CORREÇÃO URGENTE - Categorias não funcionando

## Problema Identificado
1. **Chave da API inválida** - Não conseguimos acessar o Supabase via script
2. **Políticas RLS não configuradas** - As operações CRUD estão sendo bloqueadas
3. **Tabela assinaturas_usuarios não existe** - Causando erro 404

## Solução Imediata

### 1. Acessar o Painel do Supabase
1. Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql
2. Faça login com suas credenciais

### 2. Executar Script de Correção
Copie e cole o seguinte script no SQL Editor:

```sql
-- =====================================================
-- CORREÇÃO URGENTE - POLÍTICAS DE SEGURANÇA DAS CATEGORIAS
-- =====================================================

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE disciplinas DISABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bancas DISABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se as tabelas existem e têm dados
SELECT 'disciplinas' as tabela, COUNT(*) as total FROM disciplinas
UNION ALL
SELECT 'assuntos' as tabela, COUNT(*) as total FROM assuntos
UNION ALL
SELECT 'bancas' as tabela, COUNT(*) as total FROM bancas
UNION ALL
SELECT 'orgaos' as tabela, COUNT(*) as total FROM orgaos;

-- 3. Testar inserção de disciplina
INSERT INTO disciplinas (nome) VALUES ('Teste Disciplina - ' || NOW())
ON CONFLICT (nome) DO NOTHING;

-- 4. Verificar se foi inserida
SELECT * FROM disciplinas WHERE nome LIKE 'Teste Disciplina%';

-- 5. Testar atualização
UPDATE disciplinas 
SET nome = 'Teste Atualizada - ' || NOW()
WHERE nome LIKE 'Teste Disciplina%';

-- 6. Testar exclusão
DELETE FROM disciplinas WHERE nome LIKE 'Teste%';

-- 7. Verificar se foi deletada
SELECT * FROM disciplinas WHERE nome LIKE 'Teste%';

-- 8. Se tudo funcionou, habilitar RLS com políticas corretas
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas que permitem todas as operações para usuários autenticados
-- (Temporariamente para resolver o problema)

-- Políticas para disciplinas
DROP POLICY IF EXISTS "Permitir todas operações disciplinas" ON disciplinas;
CREATE POLICY "Permitir todas operações disciplinas"
ON disciplinas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para assuntos
DROP POLICY IF EXISTS "Permitir todas operações assuntos" ON assuntos;
CREATE POLICY "Permitir todas operações assuntos"
ON assuntos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para bancas
DROP POLICY IF EXISTS "Permitir todas operações bancas" ON bancas;
CREATE POLICY "Permitir todas operações bancas"
ON bancas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para órgãos
DROP POLICY IF EXISTS "Permitir todas operações orgaos" ON orgaos;
CREATE POLICY "Permitir todas operações orgaos"
ON orgaos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 10. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('disciplinas', 'assuntos', 'bancas', 'orgaos')
ORDER BY tablename, policyname;
```

### 3. Verificar se Funcionou
Após executar o script, teste na página de admin:
1. Tente criar uma disciplina
2. Tente editar uma disciplina
3. Tente excluir uma disciplina
4. Tente criar um assunto
5. Tente editar um assunto
6. Tente excluir um assunto

### 4. Se Ainda Não Funcionar
Execute este script adicional para verificar a estrutura:

```sql
-- Verificar estrutura das tabelas
\d disciplinas
\d assuntos
\d bancas
\d orgaos

-- Verificar se há dados
SELECT 'disciplinas' as tabela, COUNT(*) as total FROM disciplinas
UNION ALL
SELECT 'assuntos' as tabela, COUNT(*) as total FROM assuntos
UNION ALL
SELECT 'bancas' as tabela, COUNT(*) as total FROM bancas
UNION ALL
SELECT 'orgaos' as tabela, COUNT(*) as total FROM orgaos;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('disciplinas', 'assuntos', 'bancas', 'orgaos')
ORDER BY tablename;
```

## Problema da Tabela assinaturas_usuarios

O erro 404 indica que a tabela `assinaturas_usuarios` não existe. Execute este script para criar:

```sql
-- Criar tabela assinaturas_usuarios se não existir
CREATE TABLE IF NOT EXISTS assinaturas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
    asaas_subscription_id VARCHAR(100),
    data_inicio TIMESTAMP DEFAULT NOW(),
    data_expiracao TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'inadimplente', 'expirada')),
    valor_pago DECIMAL(10,2) NOT NULL,
    proxima_cobranca TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Desabilitar RLS temporariamente
ALTER TABLE assinaturas_usuarios DISABLE ROW LEVEL SECURITY;

-- Criar política permissiva
DROP POLICY IF EXISTS "Permitir todas operações assinaturas" ON assinaturas_usuarios;
CREATE POLICY "Permitir todas operações assinaturas"
ON assinaturas_usuarios FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## Próximos Passos

1. **Execute os scripts** no painel do Supabase
2. **Teste as operações** na página de admin
3. **Verifique se os erros 404** desapareceram
4. **Reporte o resultado** para ajustarmos as políticas de segurança

## Observações Importantes

- As políticas criadas são **temporariamente permissivas** para resolver o problema
- Depois que funcionar, podemos ajustar para ser mais restritivas
- O problema principal era que as políticas RLS estavam bloqueando todas as operações
- A tabela `assinaturas_usuarios` não existia, causando o erro 404
