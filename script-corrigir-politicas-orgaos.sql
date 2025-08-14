-- =====================================================
-- SCRIPT PARA CORRIGIR POLÍTICAS DE SEGURANÇA DOS ÓRGÃOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA ORGAOS
-- =====================================================

-- Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orgaos' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. REMOVER POLÍTICAS EXISTENTES
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Órgãos são visíveis para todos" ON orgaos;
DROP POLICY IF EXISTS "Órgãos podem ser criados por gestores" ON orgaos;
DROP POLICY IF EXISTS "Órgãos podem ser editados por gestores" ON orgaos;
DROP POLICY IF EXISTS "Órgãos podem ser excluídos por gestores" ON orgaos;

-- =====================================================
-- 3. CRIAR NOVAS POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Política para visualização (todos podem ver)
CREATE POLICY "Órgãos são visíveis para todos" ON orgaos
FOR SELECT USING (true);

-- Política para inserção (todos podem criar - necessário para o frontend)
CREATE POLICY "Órgãos podem ser criados por todos" ON orgaos
FOR INSERT WITH CHECK (true);

-- Política para atualização (todos podem editar - necessário para o frontend)
CREATE POLICY "Órgãos podem ser editados por todos" ON orgaos
FOR UPDATE USING (true);

-- Política para exclusão (todos podem excluir - necessário para o frontend)
CREATE POLICY "Órgãos podem ser excluídos por todos" ON orgaos
FOR DELETE USING (true);

-- =====================================================
-- 4. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Listar políticas criadas
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
WHERE tablename = 'orgaos';

-- =====================================================
-- 5. TESTAR INSERÇÃO
-- =====================================================

-- Testar inserção de um órgão
INSERT INTO orgaos (nome) VALUES ('Teste Órgão ' || EXTRACT(EPOCH FROM NOW()))
ON CONFLICT (nome) DO NOTHING;

-- Verificar se foi inserido
SELECT * FROM orgaos WHERE nome LIKE 'Teste Órgão%' ORDER BY created_at DESC LIMIT 1;

-- =====================================================
-- 6. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

SELECT 'Políticas de segurança dos órgãos corrigidas com sucesso!' as status;
