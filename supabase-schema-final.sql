-- =====================================================
-- ESQUEMA DE BANCO DE DADOS - PLATAFORMA DE QUESTÕES
-- Supabase Project: cfwyuomeaudpnmjosetq
-- VERSÃO FINAL - Sem políticas duplicadas
-- =====================================================

-- Criar enums
DO $$ BEGIN
    CREATE TYPE tipo_questao AS ENUM ('MULTIPLA_ESCOLHA', 'CERTO_ERRADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nivel_escolaridade AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_usuario AS ENUM ('ALUNO', 'GESTOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_plano AS ENUM ('GRATUITO', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela assuntos
CREATE TABLE IF NOT EXISTS assuntos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela bancas
CREATE TABLE IF NOT EXISTS bancas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela anos
CREATE TABLE IF NOT EXISTS anos (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela escolaridades
CREATE TABLE IF NOT EXISTS escolaridades (
    id SERIAL PRIMARY KEY,
    nivel nivel_escolaridade NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela orgaos
CREATE TABLE IF NOT EXISTS orgaos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela patentes
CREATE TABLE IF NOT EXISTS patentes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    xp_necessario INTEGER NOT NULL DEFAULT 0,
    icone VARCHAR(50),
    cor VARCHAR(7) DEFAULT '#c1121f',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela planos
CREATE TABLE IF NOT EXISTS planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duracao_dias INTEGER NOT NULL DEFAULT 30,
    questoes_por_dia INTEGER,
    recursos_especiais TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela questoes (compatível com frontend e backend)
CREATE TABLE IF NOT EXISTS questoes (
    id SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT NOT NULL,
    alternativa_d TEXT NOT NULL,
    alternativa_e TEXT,
    gabarito VARCHAR(1) NOT NULL CHECK (gabarito IN ('A','B','C','D','E')),
    tipo tipo_questao NOT NULL DEFAULT 'MULTIPLA_ESCOLHA',
    comentario_professor TEXT,
    ano_id INTEGER NOT NULL REFERENCES anos(id) ON DELETE CASCADE,
    escolaridade_id INTEGER NOT NULL REFERENCES escolaridades(id) ON DELETE CASCADE,
    disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
    assunto_id INTEGER NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
    banca_id INTEGER NOT NULL REFERENCES bancas(id) ON DELETE CASCADE,
    orgao_id INTEGER NOT NULL REFERENCES orgaos(id) ON DELETE CASCADE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela usuarios (compatível com auth.users do Supabase)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hash_senha VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'gratuito',
    xp INTEGER NOT NULL DEFAULT 0,
    patente_id INTEGER REFERENCES patentes(id),
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'aluno',
    questoes_respondidas INTEGER NOT NULL DEFAULT 0,
    ultimo_login TIMESTAMP,
    profile_picture_url VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela respostas_usuarios (compatível com UUID)
CREATE TABLE IF NOT EXISTS respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    alternativa_marcada VARCHAR(1) NOT NULL CHECK (alternativa_marcada IN ('A','B','C','D','E')),
    acertou BOOLEAN NOT NULL,
    tempo_resposta INTEGER,
    data_resposta TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, questao_id)
);

-- Tabela comentarios_alunos (compatível com UUID)
CREATE TABLE IF NOT EXISTS comentarios_alunos (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'GERAL',
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    likes INTEGER NOT NULL DEFAULT 0,
    aprovado BOOLEAN NOT NULL DEFAULT FALSE,
    respondido BOOLEAN NOT NULL DEFAULT FALSE,
    resposta_admin TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_resposta TIMESTAMP
);

-- Tabela favoritos_questoes (compatível com UUID)
CREATE TABLE IF NOT EXISTS favoritos_questoes (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, questao_id)
);

-- Tabela cadernos (compatível com UUID)
CREATE TABLE IF NOT EXISTS cadernos (
    id SERIAL PRIMARY KEY,
    aluno_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela cadernos_questoes (compatível com INTEGER)
CREATE TABLE IF NOT EXISTS cadernos_questoes (
    caderno_id INTEGER NOT NULL REFERENCES cadernos(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (caderno_id, questao_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para questões
CREATE INDEX IF NOT EXISTS idx_questoes_disciplina ON questoes(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto_id);
CREATE INDEX IF NOT EXISTS idx_questoes_banca ON questoes(banca_id);
CREATE INDEX IF NOT EXISTS idx_questoes_orgao ON questoes(orgao_id);
CREATE INDEX IF NOT EXISTS idx_questoes_tipo ON questoes(tipo);

-- Índices para respostas
CREATE INDEX IF NOT EXISTS idx_respostas_usuario ON respostas_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_respostas_questao ON respostas_usuarios(questao_id);

-- Índices para comentários
CREATE INDEX IF NOT EXISTS idx_comentarios_questao ON comentarios_alunos(questao_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios_alunos(usuario_id);

-- Índices para cadernos
CREATE INDEX IF NOT EXISTS idx_cadernos_aluno ON cadernos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_caderno ON cadernos_questoes(caderno_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_questao ON cadernos_questoes(questao_id);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE anos ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolaridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgaos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadernos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadernos_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- REMOVER POLÍTICAS EXISTENTES (se houver)
-- =====================================================

-- Remover políticas de disciplinas
DROP POLICY IF EXISTS "Disciplinas são visíveis para todos" ON disciplinas;
DROP POLICY IF EXISTS "Assuntos são visíveis para todos" ON assuntos;
DROP POLICY IF EXISTS "Bancas são visíveis para todos" ON bancas;
DROP POLICY IF EXISTS "Anos são visíveis para todos" ON anos;
DROP POLICY IF EXISTS "Escolaridades são visíveis para todos" ON escolaridades;
DROP POLICY IF EXISTS "Órgãos são visíveis para todos" ON orgaos;
DROP POLICY IF EXISTS "Questões são visíveis para todos" ON questoes;
DROP POLICY IF EXISTS "Patentes são visíveis para todos" ON patentes;

-- Remover políticas de usuários
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON usuarios;

-- Remover políticas de respostas
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias respostas" ON respostas_usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias respostas" ON respostas_usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias respostas" ON respostas_usuarios;

-- Remover políticas de comentários
DROP POLICY IF EXISTS "Comentários são visíveis para todos" ON comentarios_alunos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios comentários" ON comentarios_alunos;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios comentários" ON comentarios_alunos;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios comentários" ON comentarios_alunos;

-- Remover políticas de cadernos
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios cadernos" ON cadernos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios cadernos" ON cadernos;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios cadernos" ON cadernos;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios cadernos" ON cadernos;

-- Remover políticas de cadernos_questoes
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias associações de cadernos" ON cadernos_questoes;
DROP POLICY IF EXISTS "Usuários podem inserir associações em seus próprios cadernos" ON cadernos_questoes;
DROP POLICY IF EXISTS "Usuários podem deletar associações de seus próprios cadernos" ON cadernos_questoes;

-- Remover políticas de favoritos
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios favoritos" ON favoritos_questoes;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios favoritos" ON favoritos_questoes;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios favoritos" ON favoritos_questoes;

-- Remover políticas de planos
DROP POLICY IF EXISTS "Planos são visíveis para todos" ON planos;

-- =====================================================
-- CRIAR NOVAS POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Políticas para tabelas de referência (leitura pública)
CREATE POLICY "Disciplinas são visíveis para todos" ON disciplinas FOR SELECT USING (true);
CREATE POLICY "Assuntos são visíveis para todos" ON assuntos FOR SELECT USING (true);
CREATE POLICY "Bancas são visíveis para todos" ON bancas FOR SELECT USING (true);
CREATE POLICY "Anos são visíveis para todos" ON anos FOR SELECT USING (true);
CREATE POLICY "Escolaridades são visíveis para todos" ON escolaridades FOR SELECT USING (true);
CREATE POLICY "Órgãos são visíveis para todos" ON orgaos FOR SELECT USING (true);
CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (true);
CREATE POLICY "Patentes são visíveis para todos" ON patentes FOR SELECT USING (true);

-- Políticas para usuários
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuarios FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Usuários podem inserir seus próprios dados" ON usuarios FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Políticas para respostas de usuários
CREATE POLICY "Usuários podem ver apenas suas próprias respostas" ON respostas_usuarios FOR SELECT USING (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem inserir suas próprias respostas" ON respostas_usuarios FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem atualizar apenas suas próprias respostas" ON respostas_usuarios FOR UPDATE USING (auth.uid()::text = usuario_id::text);

-- Políticas para comentários
CREATE POLICY "Comentários são visíveis para todos" ON comentarios_alunos FOR SELECT USING (true);
CREATE POLICY "Usuários podem inserir seus próprios comentários" ON comentarios_alunos FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem atualizar apenas seus próprios comentários" ON comentarios_alunos FOR UPDATE USING (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem deletar apenas seus próprios comentários" ON comentarios_alunos FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Políticas para cadernos
CREATE POLICY "Usuários podem ver apenas seus próprios cadernos" ON cadernos FOR SELECT USING (auth.uid()::text = aluno_id::text);
CREATE POLICY "Usuários podem inserir seus próprios cadernos" ON cadernos FOR INSERT WITH CHECK (auth.uid()::text = aluno_id::text);
CREATE POLICY "Usuários podem atualizar apenas seus próprios cadernos" ON cadernos FOR UPDATE USING (auth.uid()::text = aluno_id::text);
CREATE POLICY "Usuários podem deletar apenas seus próprios cadernos" ON cadernos FOR DELETE USING (auth.uid()::text = aluno_id::text);

-- Políticas para cadernos_questoes
CREATE POLICY "Usuários podem ver apenas suas próprias associações de cadernos" ON cadernos_questoes FOR SELECT USING (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id::text = auth.uid()::text)
);
CREATE POLICY "Usuários podem inserir associações em seus próprios cadernos" ON cadernos_questoes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id::text = auth.uid()::text)
);
CREATE POLICY "Usuários podem deletar associações de seus próprios cadernos" ON cadernos_questoes FOR DELETE USING (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id::text = auth.uid()::text)
);

-- Políticas para favoritos
CREATE POLICY "Usuários podem ver apenas seus próprios favoritos" ON favoritos_questoes FOR SELECT USING (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem inserir seus próprios favoritos" ON favoritos_questoes FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);
CREATE POLICY "Usuários podem deletar apenas seus próprios favoritos" ON favoritos_questoes FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Políticas para planos
CREATE POLICY "Planos são visíveis para todos" ON planos FOR SELECT USING (true);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_disciplinas_updated_at ON disciplinas;
DROP TRIGGER IF EXISTS update_assuntos_updated_at ON assuntos;
DROP TRIGGER IF EXISTS update_bancas_updated_at ON bancas;
DROP TRIGGER IF EXISTS update_anos_updated_at ON anos;
DROP TRIGGER IF EXISTS update_escolaridades_updated_at ON escolaridades;
DROP TRIGGER IF EXISTS update_orgaos_updated_at ON orgaos;
DROP TRIGGER IF EXISTS update_questoes_updated_at ON questoes;
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_cadernos_updated_at ON cadernos;
DROP TRIGGER IF EXISTS update_cadernos_questoes_updated_at ON cadernos_questoes;

CREATE TRIGGER update_disciplinas_updated_at BEFORE UPDATE ON disciplinas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assuntos_updated_at BEFORE UPDATE ON assuntos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bancas_updated_at BEFORE UPDATE ON bancas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anos_updated_at BEFORE UPDATE ON anos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escolaridades_updated_at BEFORE UPDATE ON escolaridades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orgaos_updated_at BEFORE UPDATE ON orgaos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questoes_updated_at BEFORE UPDATE ON questoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cadernos_updated_at BEFORE UPDATE ON cadernos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cadernos_questoes_updated_at BEFORE UPDATE ON cadernos_questoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir disciplinas
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

-- Inserir bancas
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

-- Inserir anos
INSERT INTO anos (ano) VALUES 
    (2024), (2023), (2022), (2021), (2020),
    (2019), (2018), (2017), (2016), (2015)
ON CONFLICT (ano) DO NOTHING;

-- Inserir escolaridades
INSERT INTO escolaridades (nivel) VALUES 
    ('FUNDAMENTAL'),
    ('MEDIO'),
    ('SUPERIOR')
ON CONFLICT (nivel) DO NOTHING;

-- Inserir orgaos
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

-- Inserir assuntos
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

-- Inserir planos padrão
INSERT INTO planos (nome, descricao, preco, duracao_dias, questoes_por_dia, recursos_especiais, ativo) VALUES 
    ('Gratuito', 'Acesso básico à plataforma', 0.00, 30, 10, ARRAY['Questões básicas', 'Ranking básico'], true),
    ('Premium', 'Acesso completo à plataforma', 29.90, 30, NULL, ARRAY['Questões ilimitadas', 'Ranking completo', 'Relatórios detalhados', 'Suporte prioritário'], true),
    ('Anual', 'Plano anual com desconto', 299.90, 365, NULL, ARRAY['Questões ilimitadas', 'Ranking completo', 'Relatórios detalhados', 'Suporte prioritário', 'Desconto anual'], true)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- FIM DO ESQUEMA
-- =====================================================
