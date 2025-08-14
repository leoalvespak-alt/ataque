-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuarios';

-- Agora você pode inserir usuários sem problemas
-- Execute o script: node insert-users-after-table.js
