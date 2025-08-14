-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- =====================================================

-- Verificar estrutura atual da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR SE EXISTE TABELA AUTH.USERS
-- =====================================================

-- Verificar se existe a tabela auth.users
SELECT 
    table_schema,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'auth' AND table_name = 'users';

-- =====================================================
-- 3. VERIFICAR ESTRUTURA DA TABELA AUTH.USERS
-- =====================================================

-- Verificar estrutura da tabela auth.users (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 4. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar se há usuários na tabela usuarios
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar alguns usuários para ver a estrutura
SELECT 
    id,
    nome,
    email,
    tipo_usuario,
    created_at
FROM usuarios 
LIMIT 5;

-- =====================================================
-- 5. VERIFICAR TIPO DE DADOS DO ID
-- =====================================================

-- Verificar o tipo de dados da coluna id
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'id';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Verificação da estrutura da tabela usuarios concluída!' as status;
