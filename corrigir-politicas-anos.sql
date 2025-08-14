-- Corrigir políticas RLS para a tabela anos
-- Permitir inserção para usuários autenticados

-- Remover políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON anos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON anos;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON anos;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON anos;

-- Criar novas políticas
CREATE POLICY "Enable read access for all users" ON anos
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON anos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON anos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON anos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Habilitar RLS
ALTER TABLE anos ENABLE ROW LEVEL SECURITY;
