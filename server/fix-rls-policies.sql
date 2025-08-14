-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA TABELA USUARIOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON usuarios;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON usuarios FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" 
ON usuarios FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" 
ON usuarios FOR UPDATE 
USING (true);

-- Ou, se preferir desabilitar RLS temporariamente:
-- ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'usuarios';
