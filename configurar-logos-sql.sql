-- Script para configurar as logos da plataforma no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela configuracoes_logo existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'configuracoes_logo') THEN
        -- Criar tabela se não existir
        CREATE TABLE IF NOT EXISTS configuracoes_logo (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL UNIQUE,
            url TEXT NOT NULL,
            nome_arquivo VARCHAR(255) NOT NULL,
            tamanho_bytes BIGINT,
            tipo_mime VARCHAR(100),
            ativo BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Habilitar RLS
        ALTER TABLE configuracoes_logo ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        DROP POLICY IF EXISTS "Configurações de logo são visíveis para todos" ON configuracoes_logo;
        DROP POLICY IF EXISTS "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo;

        CREATE POLICY "Configurações de logo são visíveis para todos" ON configuracoes_logo
            FOR SELECT USING (true);

        CREATE POLICY "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM usuarios 
                    WHERE id = auth.uid() 
                    AND tipo_usuario = 'gestor'
                )
            );

        RAISE NOTICE 'Tabela configuracoes_logo criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela configuracoes_logo já existe!';
    END IF;
END $$;

-- 2. Limpar configurações existentes
DELETE FROM configuracoes_logo WHERE tipo IN ('logo', 'favicon');

-- 3. Inserir novas configurações
INSERT INTO configuracoes_logo (tipo, url, nome_arquivo, ativo) VALUES
('logo', 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png', 'ATAQUE.png', true),
('favicon', 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico', 'favicon-1755150122840.ico', true);

-- 4. Verificar as configurações inseridas
SELECT 
    id,
    tipo,
    url,
    nome_arquivo,
    ativo,
    created_at
FROM configuracoes_logo 
WHERE ativo = true 
ORDER BY tipo;

-- 5. Verificar se o bucket 'uploads' existe (isso deve ser feito via Dashboard do Supabase)
-- Vá para Storage > Buckets e verifique se existe um bucket chamado 'uploads'
-- Se não existir, crie-o com as seguintes configurações:
-- - Nome: uploads
-- - Public: true
-- - File size limit: 5MB
-- - Allowed MIME types: image/*

-- 6. Verificar se a pasta 'logos' existe no bucket 'uploads'
-- Vá para Storage > uploads e verifique se existe uma pasta chamada 'logos'
-- Se não existir, crie-a

-- 7. Upload dos arquivos
-- Faça upload dos seguintes arquivos para uploads/logos/:
-- - ATAQUE.png (logo principal)
-- - favicon-1755150122840.ico (favicon)

-- 8. Verificar URLs públicas
-- Teste as seguintes URLs no navegador:
-- https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png
-- https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico

RAISE NOTICE 'Configuração das logos concluída! Verifique se os arquivos foram uploadados corretamente no Storage.';
