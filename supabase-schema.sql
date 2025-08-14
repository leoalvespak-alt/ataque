-- =====================================================
-- ESQUEMA DE BANCO DE DADOS - PLATAFORMA DE QUESTÕES
-- Supabase Project: cfwyuomeaudpnmjosetq
-- =====================================================

-- Criar enums
CREATE TYPE tipo_questao AS ENUM ('MULTIPLA_ESCOLHA', 'CERTO_ERRADO');
CREATE TYPE nivel_escolaridade AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR');
CREATE TYPE tipo_usuario AS ENUM ('ALUNO', 'GESTOR');
CREATE TYPE tipo_plano AS ENUM ('GRATUITO', 'PREMIUM');

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

-- Removida: backend usa colunas alternativa_a ... alternativa_e

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
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

-- Tabela respostas_usuarios (compatível com backend)
CREATE TABLE IF NOT EXISTS respostas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    alternativa_marcada VARCHAR(1) NOT NULL CHECK (alternativa_marcada IN ('A','B','C','D','E')),
    acertou BOOLEAN NOT NULL,
    tempo_resposta INTEGER,
    data_resposta TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, questao_id)
);

-- Tabela comentarios_alunos (compatível com backend)
CREATE TABLE IF NOT EXISTS comentarios_alunos (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'GERAL',
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    likes INTEGER NOT NULL DEFAULT 0,
    aprovado BOOLEAN NOT NULL DEFAULT FALSE,
    respondido BOOLEAN NOT NULL DEFAULT FALSE,
    resposta_admin TEXT,
    data_criacao TIMESTAMP DEFAULT NOW(),
    data_resposta TIMESTAMP
);

-- Tabela patentes (se não existir)
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

-- Tabela favoritos_questoes (nova, para bookmarks)
CREATE TABLE IF NOT EXISTS favoritos_questoes (
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    questao_id INTEGER NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, questao_id)
);

-- Tabela cadernos
CREATE TABLE IF NOT EXISTS cadernos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela cadernos_questoes
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

CREATE INDEX IF NOT EXISTS idx_respostas_usuario ON respostas_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_respostas_questao ON respostas_usuarios(questao_id);
CREATE INDEX IF NOT EXISTS idx_respostas_correta ON respostas_alunos(correta);

-- Índices para comentários
CREATE INDEX IF NOT EXISTS idx_comentarios_questao ON comentarios_questoes(questao_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_aluno ON comentarios_questoes(aluno_id);

-- Índices para cadernos
CREATE INDEX IF NOT EXISTS idx_cadernos_aluno ON cadernos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_caderno ON cadernos_questoes(caderno_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_questao ON cadernos_questoes(questao_id);

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_plano ON usuarios(tipo_plano);

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
ALTER TABLE alternativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadernos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadernos_questoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Políticas para tabelas de referência (leitura pública)
CREATE POLICY "Disciplinas são visíveis para todos" ON disciplinas FOR SELECT USING (true);
CREATE POLICY "Assuntos são visíveis para todos" ON assuntos FOR SELECT USING (true);
CREATE POLICY "Bancas são visíveis para todos" ON bancas FOR SELECT USING (true);
CREATE POLICY "Anos são visíveis para todos" ON anos FOR SELECT USING (true);
CREATE POLICY "Escolaridades são visíveis para todos" ON escolaridades FOR SELECT USING (true);
CREATE POLICY "Órgãos são visíveis para todos" ON orgaos FOR SELECT USING (true);

-- Políticas para questões e alternativas (leitura pública)
CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (true);
CREATE POLICY "Alternativas são visíveis para todos" ON alternativas FOR SELECT USING (true);

-- Políticas para usuários
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuarios FOR SELECT USING (auth.uid()::integer = id);
CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid()::integer = id);
CREATE POLICY "Usuários podem inserir seus próprios dados" ON usuarios FOR INSERT WITH CHECK (auth.uid()::integer = id);

-- Políticas para respostas de alunos
CREATE POLICY "Alunos podem ver apenas suas próprias respostas" ON respostas_alunos FOR SELECT USING (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem inserir suas próprias respostas" ON respostas_alunos FOR INSERT WITH CHECK (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem atualizar apenas suas próprias respostas" ON respostas_alunos FOR UPDATE USING (auth.uid()::integer = aluno_id);

-- Políticas para comentários
CREATE POLICY "Comentários são visíveis para todos" ON comentarios_questoes FOR SELECT USING (true);
CREATE POLICY "Alunos podem inserir seus próprios comentários" ON comentarios_questoes FOR INSERT WITH CHECK (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem atualizar apenas seus próprios comentários" ON comentarios_questoes FOR UPDATE USING (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem deletar apenas seus próprios comentários" ON comentarios_questoes FOR DELETE USING (auth.uid()::integer = aluno_id);

-- Políticas para cadernos
CREATE POLICY "Alunos podem ver apenas seus próprios cadernos" ON cadernos FOR SELECT USING (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem inserir seus próprios cadernos" ON cadernos FOR INSERT WITH CHECK (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem atualizar apenas seus próprios cadernos" ON cadernos FOR UPDATE USING (auth.uid()::integer = aluno_id);
CREATE POLICY "Alunos podem deletar apenas seus próprios cadernos" ON cadernos FOR DELETE USING (auth.uid()::integer = aluno_id);

-- Políticas para cadernos_questoes
CREATE POLICY "Alunos podem ver apenas suas próprias associações de cadernos" ON cadernos_questoes FOR SELECT USING (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()::integer)
);
CREATE POLICY "Alunos podem inserir associações em seus próprios cadernos" ON cadernos_questoes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()::integer)
);
CREATE POLICY "Alunos podem deletar associações de seus próprios cadernos" ON cadernos_questoes FOR DELETE USING (
    EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()::integer)
);

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
CREATE TRIGGER update_disciplinas_updated_at BEFORE UPDATE ON disciplinas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assuntos_updated_at BEFORE UPDATE ON assuntos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bancas_updated_at BEFORE UPDATE ON bancas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anos_updated_at BEFORE UPDATE ON anos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escolaridades_updated_at BEFORE UPDATE ON escolaridades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orgaos_updated_at BEFORE UPDATE ON orgaos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questoes_updated_at BEFORE UPDATE ON questoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alternativas_updated_at BEFORE UPDATE ON alternativas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_respostas_alunos_updated_at BEFORE UPDATE ON respostas_alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comentarios_questoes_updated_at BEFORE UPDATE ON comentarios_questoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE disciplinas IS 'Armazena as disciplinas para categorização de questões';
COMMENT ON TABLE assuntos IS 'Armazena os assuntos relacionados a disciplinas para categorização de questões';
COMMENT ON TABLE bancas IS 'Armazena as bancas examinadoras para categorização de questões';
COMMENT ON TABLE anos IS 'Armazena os anos para categorização de questões';
COMMENT ON TABLE escolaridades IS 'Armazena os níveis de escolaridade para categorização de questões';
COMMENT ON TABLE orgaos IS 'Armazena os órgãos para categorização de questões';
COMMENT ON TABLE questoes IS 'Armazena as questões da plataforma, incluindo seus detalhes e categorizações';
COMMENT ON TABLE alternativas IS 'Armazena as alternativas para questões de múltipla escolha';
COMMENT ON TABLE usuarios IS 'Armazena os dados dos usuários da plataforma (alunos e gestores)';
COMMENT ON TABLE respostas_alunos IS 'Registra as respostas dos alunos às questões, incluindo se a resposta foi correta';
COMMENT ON TABLE comentarios_questoes IS 'Armazena os comentários feitos pelos alunos nas questões';
COMMENT ON TABLE cadernos IS 'Armazena os cadernos personalizados de questões criados pelos alunos';
COMMENT ON TABLE cadernos_questoes IS 'Tabela de junção para associar questões a cadernos personalizados';

COMMENT ON COLUMN questoes.id IS 'ID único alfanumérico de 6 dígitos para a questão';
COMMENT ON COLUMN questoes.enunciado IS 'Enunciado da questão';
COMMENT ON COLUMN questoes.texto_questao IS 'Corpo principal da questão';
COMMENT ON COLUMN questoes.gabarito IS 'Gabarito oficial da questão';
COMMENT ON COLUMN questoes.comentario_gabarito_professor IS 'Comentário opcional do professor sobre o gabarito';
COMMENT ON COLUMN questoes.tipo_questao IS 'Tipo da questão: Múltipla Escolha ou Certo ou Errado';

COMMENT ON COLUMN alternativas.letra IS 'Letra da alternativa (A, B, C, D, E)';
COMMENT ON COLUMN alternativas.texto IS 'Texto da alternativa';

COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de perfil do usuário (Aluno ou Gestor)';
COMMENT ON COLUMN usuarios.tipo_plano IS 'Tipo de plano do usuário (Gratuito ou Premium)';

COMMENT ON COLUMN respostas_alunos.resposta_selecionada IS 'Resposta selecionada pelo aluno (ex: A, Certo, Errado)';
COMMENT ON COLUMN respostas_alunos.correta IS 'Indica se a resposta do aluno estava correta';

COMMENT ON COLUMN comentarios_questoes.texto_comentario IS 'Conteúdo do comentário do aluno';

COMMENT ON COLUMN cadernos.nome IS 'Nome do caderno personalizado';

-- =====================================================
-- FIM DO ESQUEMA
-- =====================================================
