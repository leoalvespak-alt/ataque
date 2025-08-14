-- =====================================================
-- SCRIPT PARA ADICIONAR ESCOLARIDADES E ANOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA ESCOLARIDADES
-- =====================================================

-- Criar tabela escolaridades se não existir
CREATE TABLE IF NOT EXISTS escolaridades (
    id SERIAL PRIMARY KEY,
    nivel VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CRIAR TABELA ANOS
-- =====================================================

-- Criar tabela anos se não existir
CREATE TABLE IF NOT EXISTS anos (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ADICIONAR COLUNAS NA TABELA QUESTOES
-- =====================================================

-- Adicionar coluna escolaridade_id se não existir
ALTER TABLE IF EXISTS questoes ADD COLUMN IF NOT EXISTS escolaridade_id INTEGER REFERENCES escolaridades(id);

-- Adicionar coluna ano_id se não existir
ALTER TABLE IF EXISTS questoes ADD COLUMN IF NOT EXISTS ano_id INTEGER REFERENCES anos(id);

-- =====================================================
-- 4. INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir escolaridades
INSERT INTO escolaridades (nivel, descricao) VALUES 
    ('Fundamental', 'Ensino Fundamental'),
    ('Médio', 'Ensino Médio'),
    ('Superior', 'Ensino Superior'),
    ('Pós-Graduação', 'Pós-Graduação'),
    ('Técnico', 'Ensino Técnico')
ON CONFLICT (nivel) DO NOTHING;

-- Inserir anos (últimos 20 anos)
INSERT INTO anos (ano, descricao) VALUES 
    (2024, 'Ano atual'),
    (2023, 'Ano anterior'),
    (2022, 'Ano anterior'),
    (2021, 'Ano anterior'),
    (2020, 'Ano anterior'),
    (2019, 'Ano anterior'),
    (2018, 'Ano anterior'),
    (2017, 'Ano anterior'),
    (2016, 'Ano anterior'),
    (2015, 'Ano anterior'),
    (2014, 'Ano anterior'),
    (2013, 'Ano anterior'),
    (2012, 'Ano anterior'),
    (2011, 'Ano anterior'),
    (2010, 'Ano anterior'),
    (2009, 'Ano anterior'),
    (2008, 'Ano anterior'),
    (2007, 'Ano anterior'),
    (2006, 'Ano anterior'),
    (2005, 'Ano anterior')
ON CONFLICT (ano) DO NOTHING;

-- =====================================================
-- 5. CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Políticas para escolaridades
DROP POLICY IF EXISTS "Escolaridades são visíveis para todos" ON escolaridades;
CREATE POLICY "Escolaridades são visíveis para todos" ON escolaridades FOR SELECT USING (true);

-- Políticas para anos
DROP POLICY IF EXISTS "Anos são visíveis para todos" ON anos;
CREATE POLICY "Anos são visíveis para todos" ON anos FOR SELECT USING (true);

-- =====================================================
-- 6. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar estrutura da tabela questões
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT 
    'Disciplinas' as tabela,
    COUNT(*) as total
FROM disciplinas
UNION ALL
SELECT 
    'Assuntos' as tabela,
    COUNT(*) as total
FROM assuntos
UNION ALL
SELECT 
    'Bancas' as tabela,
    COUNT(*) as total
FROM bancas
UNION ALL
SELECT 
    'Órgãos' as tabela,
    COUNT(*) as total
FROM orgaos
UNION ALL
SELECT 
    'Escolaridades' as tabela,
    COUNT(*) as total
FROM escolaridades
UNION ALL
SELECT 
    'Anos' as tabela,
    COUNT(*) as total
FROM anos
UNION ALL
SELECT 
    'Questões' as tabela,
    COUNT(*) as total
FROM questoes;

-- =====================================================
-- 7. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

SELECT 'Tabelas escolaridades e anos criadas com sucesso!' as status;
