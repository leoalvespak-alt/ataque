-- Script para verificar a estrutura da tabela themes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela themes existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'themes'
) as table_exists;

-- 2. Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'themes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM themes;

-- 4. Verificar se há registros com nome duplicado
SELECT name, COUNT(*) as quantidade
FROM themes 
GROUP BY name 
HAVING COUNT(*) > 1;

-- 5. Verificar se há mais de um tema ativo
SELECT COUNT(*) as temas_ativos
FROM themes 
WHERE is_active = true;

-- 6. Verificar se há mais de um tema padrão
SELECT COUNT(*) as temas_padrao
FROM themes 
WHERE is_default = true;

-- 7. Listar todos os temas existentes
SELECT 
    id,
    name,
    description,
    is_active,
    is_default,
    created_at,
    updated_at
FROM themes
ORDER BY created_at;
