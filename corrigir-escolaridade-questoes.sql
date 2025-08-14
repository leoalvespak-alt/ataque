-- Script para corrigir o problema da escolaridade_id nas questões
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existem escolaridades
SELECT * FROM escolaridades;

-- 2. Se não existirem, inserir as escolaridades padrão
INSERT INTO escolaridades (nivel) VALUES 
('FUNDAMENTAL'),
('MEDIO'),
('SUPERIOR')
ON CONFLICT (nivel) DO NOTHING;

-- 3. Verificar se a coluna escolaridade_id existe na tabela questoes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questoes' AND column_name = 'escolaridade_id';

-- 4. Se a coluna não existir, adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questoes' AND column_name = 'escolaridade_id'
    ) THEN
        ALTER TABLE questoes ADD COLUMN escolaridade_id INTEGER REFERENCES escolaridades(id);
    END IF;
END $$;

-- 5. Atualizar questões existentes para ter escolaridade_id (padrão: MEDIO)
UPDATE questoes 
SET escolaridade_id = (SELECT id FROM escolaridades WHERE nivel = 'MEDIO' LIMIT 1)
WHERE escolaridade_id IS NULL;

-- 6. Tornar a coluna escolaridade_id obrigatória
ALTER TABLE questoes ALTER COLUMN escolaridade_id SET NOT NULL;

-- 7. Verificar se as questões agora têm escolaridade_id
SELECT id, enunciado, escolaridade_id FROM questoes LIMIT 5;

-- 8. Verificar a estrutura final da tabela questoes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;
