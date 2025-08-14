-- =====================================================
-- SCRIPT DE CORREÇÃO PARA TABELA DE QUESTÕES
-- Corrige incompatibilidades entre Sequelize e Supabase
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CORRIGIR ESTRUTURA DA TABELA QUESTOES
-- =====================================================

-- Remover colunas que não existem no modelo Sequelize
ALTER TABLE IF EXISTS questoes DROP COLUMN IF EXISTS ano_id;
ALTER TABLE IF EXISTS questoes DROP COLUMN IF EXISTS escolaridade_id;

-- Adicionar coluna 'ano' que existe no modelo Sequelize
ALTER TABLE IF EXISTS questoes ADD COLUMN IF NOT EXISTS ano INTEGER;

-- Adicionar coluna 'tipo' se não existir
ALTER TABLE IF EXISTS questoes ADD COLUMN IF NOT EXISTS tipo tipo_questao DEFAULT 'MULTIPLA_ESCOLHA';

-- Garantir que a coluna 'gabarito' aceite apenas valores válidos
ALTER TABLE IF EXISTS questoes DROP CONSTRAINT IF EXISTS questoes_gabarito_check;
ALTER TABLE IF EXISTS questoes ADD CONSTRAINT questoes_gabarito_check CHECK (gabarito IN ('A','B','C','D','E'));

-- =====================================================
-- 2. VERIFICAR E CRIAR DADOS INICIAIS
-- =====================================================

-- Inserir disciplinas se não existirem
INSERT INTO disciplinas (nome) VALUES 
    ('Matemática'),
    ('Português'),
    ('História'),
    ('Geografia'),
    ('Ciências'),
    ('Inglês'),
    ('Física'),
    ('Química'),
    ('Biologia'),
    ('Filosofia'),
    ('Sociologia'),
    ('Direito Constitucional'),
    ('Direito Administrativo'),
    ('Direito Penal'),
    ('Direito Civil')
ON CONFLICT (nome) DO NOTHING;

-- Inserir bancas se não existirem
INSERT INTO bancas (nome) VALUES 
    ('CESPE/CEBRASPE'),
    ('FGV'),
    ('VUNESP'),
    ('FCC'),
    ('IADES'),
    ('QUADRIX'),
    ('INSTITUTO AOCP'),
    ('FEPESE'),
    ('FUNDEP'),
    ('FUNDAÇÃO CESGRANRIO')
ON CONFLICT (nome) DO NOTHING;

-- Inserir órgãos se não existirem
INSERT INTO orgaos (nome) VALUES 
    ('Tribunal de Justiça'),
    ('Ministério Público'),
    ('Defensoria Pública'),
    ('Polícia Federal'),
    ('Polícia Civil'),
    ('Receita Federal'),
    ('Banco Central'),
    ('Tribunal Regional Federal'),
    ('Tribunal Regional do Trabalho'),
    ('Tribunal Superior do Trabalho'),
    ('Supremo Tribunal Federal'),
    ('Superior Tribunal de Justiça')
ON CONFLICT (nome) DO NOTHING;

-- Inserir assuntos se não existirem
INSERT INTO assuntos (nome, disciplina_id) VALUES 
    -- Matemática
    ('Álgebra', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
    ('Geometria', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
    ('Trigonometria', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
    ('Aritmética', (SELECT id FROM disciplinas WHERE nome = 'Matemática')),
    
    -- Português
    ('Concordância Verbal', (SELECT id FROM disciplinas WHERE nome = 'Português')),
    ('Regência Verbal', (SELECT id FROM disciplinas WHERE nome = 'Português')),
    ('Crase', (SELECT id FROM disciplinas WHERE nome = 'Português')),
    ('Pontuação', (SELECT id FROM disciplinas WHERE nome = 'Português')),
    ('Interpretação de Texto', (SELECT id FROM disciplinas WHERE nome = 'Português')),
    
    -- História
    ('História do Brasil', (SELECT id FROM disciplinas WHERE nome = 'História')),
    ('História Geral', (SELECT id FROM disciplinas WHERE nome = 'História')),
    ('História Contemporânea', (SELECT id FROM disciplinas WHERE nome = 'História')),
    
    -- Geografia
    ('Geografia do Brasil', (SELECT id FROM disciplinas WHERE nome = 'Geografia')),
    ('Geografia Geral', (SELECT id FROM disciplinas WHERE nome = 'Geografia')),
    ('Geografia Humana', (SELECT id FROM disciplinas WHERE nome = 'Geografia')),
    
    -- Direito Constitucional
    ('Direitos e Garantias Fundamentais', (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional')),
    ('Organização dos Poderes', (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional')),
    ('Controle de Constitucionalidade', (SELECT id FROM disciplinas WHERE nome = 'Direito Constitucional')),
    
    -- Direito Administrativo
    ('Princípios da Administração Pública', (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo')),
    ('Atos Administrativos', (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo')),
    ('Licitações', (SELECT id FROM disciplinas WHERE nome = 'Direito Administrativo')),
    
    -- Direito Penal
    ('Crimes contra a Pessoa', (SELECT id FROM disciplinas WHERE nome = 'Direito Penal')),
    ('Crimes contra o Patrimônio', (SELECT id FROM disciplinas WHERE nome = 'Direito Penal')),
    ('Crimes contra a Administração Pública', (SELECT id FROM disciplinas WHERE nome = 'Direito Penal')),
    
    -- Direito Civil
    ('Direito das Obrigações', (SELECT id FROM disciplinas WHERE nome = 'Direito Civil')),
    ('Direito das Coisas', (SELECT id FROM disciplinas WHERE nome = 'Direito Civil')),
    ('Direito de Família', (SELECT id FROM disciplinas WHERE nome = 'Direito Civil'))
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 3. CORRIGIR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Questões são visíveis para todos" ON questoes;
DROP POLICY IF EXISTS "Gestores podem inserir questões" ON questoes;
DROP POLICY IF EXISTS "Gestores podem atualizar questões" ON questoes;
DROP POLICY IF EXISTS "Gestores podem deletar questões" ON questoes;

-- Criar políticas corretas para questões
-- SELECT: Todos podem ver questões ativas
CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (ativo = true);

-- INSERT: Apenas gestores podem inserir questões
CREATE POLICY "Gestores podem inserir questões" ON questoes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- UPDATE: Apenas gestores podem atualizar questões
CREATE POLICY "Gestores podem atualizar questões" ON questoes FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- DELETE: Apenas gestores podem deletar questões
CREATE POLICY "Gestores podem deletar questões" ON questoes FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- =====================================================
-- 4. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Mostrar estrutura da tabela questões
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
    'Questões' as tabela,
    COUNT(*) as total
FROM questoes;

-- =====================================================
-- 5. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

SELECT 'Script de correção executado com sucesso!' as status;
