-- =====================================================
-- SCRIPT PARA REMOVER REFERÊNCIAS À TABELA ANOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE A COLUNA ANO_ID EXISTE
-- =====================================================

-- Verificar estrutura atual da tabela questões
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. REMOVER COLUNA ANO_ID SE EXISTIR
-- =====================================================

-- Remover coluna ano_id se existir
ALTER TABLE IF EXISTS questoes DROP COLUMN IF EXISTS ano_id;

-- =====================================================
-- 3. VERIFICAR SE A TABELA ANOS EXISTE
-- =====================================================

-- Verificar se a tabela anos existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'anos'
) as anos_existe;

-- =====================================================
-- 4. REMOVER TABELA ANOS SE EXISTIR
-- =====================================================

-- Remover tabela anos se existir (CUIDADO: isso vai remover todos os dados)
-- DROP TABLE IF EXISTS anos CASCADE;

-- =====================================================
-- 5. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar estrutura final da tabela questões
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 6. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar dados existentes
SELECT 
    'Disciplinas' as tabela,
    COUNT(*) as total
FROM disciplinas
UNION ALL
SELECT 
    'Assuntos' as tabela,
    COUNT(*) as total
FROM assuntos
UNION ALL
SELECT 
    'Bancas' as tabela,
    COUNT(*) as total
FROM bancas
UNION ALL
SELECT 
    'Órgãos' as tabela,
    COUNT(*) as total
FROM orgaos
UNION ALL
SELECT 
    'Questões' as tabela,
    COUNT(*) as total
FROM questoes;

-- =====================================================
-- 7. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

SELECT 'Referências à tabela anos removidas com sucesso!' as status;
