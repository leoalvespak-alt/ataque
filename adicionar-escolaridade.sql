-- Adicionar categoria escolaridade
-- Primeiro, vamos verificar se a tabela escolaridades existe e tem dados

-- Inserir escolaridades se não existirem
INSERT INTO escolaridades (nivel) VALUES 
('FUNDAMENTAL'),
('MEDIO'), 
('SUPERIOR')
ON CONFLICT (nivel) DO NOTHING;

-- Verificar se a coluna escolaridade_id existe na tabela questoes
-- Se não existir, vamos adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questoes' AND column_name = 'escolaridade_id'
    ) THEN
        ALTER TABLE questoes ADD COLUMN escolaridade_id INTEGER REFERENCES escolaridades(id);
    END IF;
END $$;

-- Atualizar questões existentes para ter escolaridade_id (padrão: MEDIO)
UPDATE questoes 
SET escolaridade_id = (SELECT id FROM escolaridades WHERE nivel = 'MEDIO' LIMIT 1)
WHERE escolaridade_id IS NULL;

-- Tornar a coluna escolaridade_id obrigatória
ALTER TABLE questoes ALTER COLUMN escolaridade_id SET NOT NULL;
