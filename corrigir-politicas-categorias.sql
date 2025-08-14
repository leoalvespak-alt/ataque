-- Script para corrigir políticas de segurança das categorias no Supabase
-- Permite que gestores possam gerenciar disciplinas e assuntos

-- 1. Habilitar RLS nas tabelas de categorias
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para disciplinas
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de disciplinas para usuários autenticados" ON disciplinas;
CREATE POLICY "Permitir leitura de disciplinas para usuários autenticados"
ON disciplinas FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de disciplinas para gestores" ON disciplinas;
CREATE POLICY "Permitir CRUD de disciplinas para gestores"
ON disciplinas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 3. Políticas para assuntos
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de assuntos para usuários autenticados" ON assuntos;
CREATE POLICY "Permitir leitura de assuntos para usuários autenticados"
ON assuntos FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de assuntos para gestores" ON assuntos;
CREATE POLICY "Permitir CRUD de assuntos para gestores"
ON assuntos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 4. Políticas para bancas
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de bancas para usuários autenticados" ON bancas;
CREATE POLICY "Permitir leitura de bancas para usuários autenticados"
ON bancas FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de bancas para gestores" ON bancas;
CREATE POLICY "Permitir CRUD de bancas para gestores"
ON bancas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 5. Políticas para órgãos
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de orgaos para usuários autenticados" ON orgaos;
CREATE POLICY "Permitir leitura de orgaos para usuários autenticados"
ON orgaos FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de orgaos para gestores" ON orgaos;
CREATE POLICY "Permitir CRUD de orgaos para gestores"
ON orgaos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 6. Verificar se as políticas foram criadas corretamente
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

-- 7. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('disciplinas', 'assuntos', 'bancas', 'orgaos')
ORDER BY tablename;
