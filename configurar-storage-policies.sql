-- Script para configurar políticas RLS do bucket de storage
-- Execute este SQL diretamente no painel do Supabase

-- 1. Verificar se o bucket "uploads" existe
SELECT 
    name,
    public,
    created_at
FROM storage.buckets 
WHERE name = 'uploads';

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;

-- 3. Criar política para permitir visualização pública de arquivos
CREATE POLICY "Anyone can view files" ON storage.objects
    FOR SELECT USING (bucket_id = 'uploads');

-- 4. Criar política para permitir upload de arquivos autenticados
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' 
        AND auth.role() = 'authenticated'
    );

-- 5. Criar política para permitir atualização de arquivos pelo proprietário
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'uploads' 
        AND auth.uid() = owner
    );

-- 6. Criar política para permitir exclusão de arquivos pelo proprietário
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' 
        AND auth.uid() = owner
    );

-- 7. Verificar políticas criadas
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

-- 8. Testar inserção de arquivo de teste (opcional)
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata)
-- VALUES ('uploads', 'test.txt', auth.uid(), '{"size": 0, "mimetype": "text/plain"}');
