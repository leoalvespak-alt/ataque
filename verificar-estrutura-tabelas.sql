-- =====================================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- 1. Listar todas as tabelas que podem ser relacionadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'planos', 'planos_assinatura', 'assinaturas')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 3. Verificar se existe tabela de planos
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('planos', 'planos_assinatura')
ORDER BY table_name, ordinal_position;

-- 4. Verificar se já existe tabela assinaturas_usuarios
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assinaturas_usuarios'
ORDER BY ordinal_position;

-- 5. Verificar constraints existentes
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('usuarios', 'planos', 'planos_assinatura', 'assinaturas_usuarios')
ORDER BY tc.table_name, tc.constraint_name;
