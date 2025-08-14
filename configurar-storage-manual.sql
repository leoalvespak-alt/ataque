-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO STORAGE SUPABASE
-- =====================================================
-- Execute este SQL no painel do Supabase > SQL Editor
-- =====================================================

-- 1. VERIFICAR SE O BUCKET "uploads" EXISTE
SELECT 
    name,
    public,
    created_at
FROM storage.buckets 
WHERE name = 'uploads';

-- 2. REMOVER POLÍTICAS EXISTENTES (se houver)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 3. CRIAR POLÍTICA PARA PERMITIR VISUALIZAÇÃO PÚBLICA DE ARQUIVOS
CREATE POLICY "Anyone can view files" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

-- 4. CRIAR POLÍTICA PARA PERMITIR UPLOAD DE ARQUIVOS AUTENTICADOS
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' 
        AND auth.role() = 'authenticated'
    );

-- 5. CRIAR POLÍTICA PARA PERMITIR ATUALIZAÇÃO DE ARQUIVOS PELO PROPRIETÁRIO
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'uploads' 
        AND auth.uid() = owner
    );

-- 6. CRIAR POLÍTICA PARA PERMITIR EXCLUSÃO DE ARQUIVOS PELO PROPRIETÁRIO
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' 
        AND auth.uid() = owner
    );

-- 7. VERIFICAR POLÍTICAS CRIADAS
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Execute este SQL no painel do Supabase
-- 2. Depois execute: node verificar-supabase.js
-- 3. Teste o upload no frontend
-- =====================================================
