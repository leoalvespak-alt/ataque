-- 🔧 CORRIGIR POLÍTICAS RLS DA TABELA USUARIOS
-- Execute este SQL no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "usuarios_select_all" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_own" ON usuarios;

-- 3. Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "usuarios_select_all" ON usuarios
FOR SELECT USING (true);

CREATE POLICY "usuarios_insert_own" ON usuarios
FOR INSERT WITH CHECK (true);

CREATE POLICY "usuarios_update_own" ON usuarios
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "usuarios_delete_own" ON usuarios
FOR DELETE USING (true);

-- 4. Reabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas
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
WHERE tablename = 'usuarios';

-- 6. Testar acesso
-- Execute esta query para verificar se funciona:
-- SELECT * FROM usuarios WHERE email = 'admin@rotadeataque.com';
