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
