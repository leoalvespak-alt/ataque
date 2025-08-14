const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cfwyuomeaudpnmjosetq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY não encontrada no arquivo .env');
  console.log('📋 Adicione a chave de serviço no arquivo .env:');
  console.log('SUPABASE_SERVICE_KEY=sua_chave_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQL() {
  try {
    console.log('🚀 Executando SQL no Supabase...\n');

    // SQL para criar as tabelas
    const sql = `
    -- Criar enums
    CREATE TYPE IF NOT EXISTS tipo_questao AS ENUM ('MULTIPLA_ESCOLHA', 'CERTO_ERRADO');
    CREATE TYPE IF NOT EXISTS nivel_escolaridade AS ENUM ('FUNDAMENTAL', 'MEDIO', 'SUPERIOR');
    CREATE TYPE IF NOT EXISTS tipo_usuario AS ENUM ('ALUNO', 'GESTOR');
    CREATE TYPE IF NOT EXISTS tipo_plano AS ENUM ('GRATUITO', 'PREMIUM');

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

    -- Tabela questoes (com ID único de 8 dígitos)
    CREATE TABLE IF NOT EXISTS questoes (
        id VARCHAR(8) PRIMARY KEY,
        enunciado TEXT NOT NULL,
        alternativa_a TEXT NOT NULL,
        alternativa_b TEXT NOT NULL,
        alternativa_c TEXT NOT NULL,
        alternativa_d TEXT NOT NULL,
        alternativa_e TEXT,
        gabarito VARCHAR(1) NOT NULL CHECK (gabarito IN ('A','B','C','D','E')),
        tipo tipo_questao NOT NULL DEFAULT 'MULTIPLA_ESCOLHA',
        comentario_professor TEXT,
        ano INTEGER NOT NULL,
        disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
        assunto_id INTEGER NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
        banca_id INTEGER NOT NULL REFERENCES bancas(id) ON DELETE CASCADE,
        orgao_id INTEGER NOT NULL REFERENCES orgaos(id) ON DELETE CASCADE,
        escolaridade_id INTEGER NOT NULL REFERENCES escolaridades(id) ON DELETE CASCADE,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Tabela usuarios
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        hash_senha VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'gratuito',
        xp INTEGER NOT NULL DEFAULT 0,
        tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'aluno',
        questoes_respondidas INTEGER NOT NULL DEFAULT 0,
        ultimo_login TIMESTAMP,
        profile_picture_url VARCHAR(255),
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Tabela respostas_usuarios
    CREATE TABLE IF NOT EXISTS respostas_usuarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        questao_id VARCHAR(8) NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
        alternativa_marcada VARCHAR(1) NOT NULL CHECK (alternativa_marcada IN ('A','B','C','D','E')),
        acertou BOOLEAN NOT NULL,
        tempo_resposta INTEGER,
        data_resposta TIMESTAMP DEFAULT NOW(),
        UNIQUE(usuario_id, questao_id)
    );

    -- Tabela comentarios_alunos
    CREATE TABLE IF NOT EXISTS comentarios_alunos (
        id SERIAL PRIMARY KEY,
        texto TEXT NOT NULL,
        tipo VARCHAR(20) NOT NULL DEFAULT 'GERAL',
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        questao_id VARCHAR(8) NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
        likes INTEGER NOT NULL DEFAULT 0,
        aprovado BOOLEAN NOT NULL DEFAULT FALSE,
        respondido BOOLEAN NOT NULL DEFAULT FALSE,
        resposta_admin TEXT,
        data_criacao TIMESTAMP DEFAULT NOW(),
        data_resposta TIMESTAMP
    );

    -- Tabela planos
    CREATE TABLE IF NOT EXISTS planos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        descricao TEXT,
        preco DECIMAL(10,2) NOT NULL,
        duracao_dias INTEGER NOT NULL,
        questoes_por_dia INTEGER,
        recursos_especiais TEXT[],
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
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

    -- Tabela favoritos_questoes
    CREATE TABLE IF NOT EXISTS favoritos_questoes (
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        questao_id VARCHAR(8) NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
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
        questao_id VARCHAR(8) NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (caderno_id, questao_id)
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_questoes_disciplina ON questoes(disciplina_id);
    CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto_id);
    CREATE INDEX IF NOT EXISTS idx_questoes_banca ON questoes(banca_id);
    CREATE INDEX IF NOT EXISTS idx_questoes_orgao ON questoes(orgao_id);
    CREATE INDEX IF NOT EXISTS idx_questoes_escolaridade ON questoes(escolaridade_id);
    CREATE INDEX IF NOT EXISTS idx_questoes_tipo ON questoes(tipo);
    CREATE INDEX IF NOT EXISTS idx_questoes_ano ON questoes(ano);

    -- Habilitar RLS
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
    ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE patentes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cadernos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cadernos_questoes ENABLE ROW LEVEL SECURITY;

    -- Políticas de segurança
    CREATE POLICY "Disciplinas são visíveis para todos" ON disciplinas FOR SELECT USING (true);
    CREATE POLICY "Assuntos são visíveis para todos" ON assuntos FOR SELECT USING (true);
    CREATE POLICY "Bancas são visíveis para todos" ON bancas FOR SELECT USING (true);
    CREATE POLICY "Anos são visíveis para todos" ON anos FOR SELECT USING (true);
    CREATE POLICY "Escolaridades são visíveis para todos" ON escolaridades FOR SELECT USING (true);
    CREATE POLICY "Órgãos são visíveis para todos" ON orgaos FOR SELECT USING (true);
    CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (true);
    CREATE POLICY "Planos são visíveis para todos" ON planos FOR SELECT USING (true);
    CREATE POLICY "Patentes são visíveis para todos" ON patentes FOR SELECT USING (true);

    -- Inserir dados iniciais
    INSERT INTO disciplinas (nome) VALUES 
        ('Matemática'), ('Português'), ('História'), ('Geografia'), ('Ciências'),
        ('Inglês'), ('Física'), ('Química'), ('Biologia'), ('Filosofia'),
        ('Sociologia'), ('Direito Constitucional'), ('Direito Administrativo'),
        ('Direito Penal'), ('Direito Civil')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO bancas (nome) VALUES 
        ('CESPE/CEBRASPE'), ('FGV'), ('VUNESP'), ('FCC'), ('IADES'),
        ('QUADRIX'), ('INSTITUTO AOCP'), ('FEPESE'), ('FUNDEP'), ('FUNDAÇÃO CESGRANRIO')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO anos (ano) VALUES 
        (2024), (2023), (2022), (2021), (2020), (2019), (2018), (2017), (2016), (2015)
    ON CONFLICT (ano) DO NOTHING;

    INSERT INTO escolaridades (nivel) VALUES 
        ('FUNDAMENTAL'), ('MEDIO'), ('SUPERIOR')
    ON CONFLICT (nivel) DO NOTHING;

    INSERT INTO orgaos (nome) VALUES 
        ('Tribunal de Justiça'), ('Ministério Público'), ('Defensoria Pública'),
        ('Polícia Federal'), ('Polícia Civil'), ('Receita Federal'),
        ('Banco Central'), ('Tribunal Regional Federal'), ('Tribunal Regional do Trabalho'),
        ('Tribunal Superior do Trabalho'), ('Supremo Tribunal Federal'), ('Superior Tribunal de Justiça')
    ON CONFLICT (nome) DO NOTHING;

    INSERT INTO planos (nome, descricao, preco, duracao_dias, questoes_por_dia, recursos_especiais) VALUES 
        ('Gratuito', 'Acesso básico à plataforma', 0.00, 30, 10, ARRAY['Questões básicas', 'Ranking simples']),
        ('Premium', 'Acesso completo à plataforma', 29.90, 30, 50, ARRAY['Questões premium', 'Ranking detalhado', 'Relatórios avançados', 'Suporte prioritário']),
        ('Anual', 'Acesso completo por 1 ano', 299.90, 365, 100, ARRAY['Todas as funcionalidades', 'Suporte 24/7', 'Conteúdo exclusivo'])
    ON CONFLICT (nome) DO NOTHING;
    `;

    // Executar o SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      throw error;
    }

    console.log('✅ SQL executado com sucesso!');
    console.log('📋 Tabelas criadas:');
    console.log('   - disciplinas');
    console.log('   - assuntos');
    console.log('   - bancas');
    console.log('   - anos');
    console.log('   - escolaridades');
    console.log('   - orgaos');
    console.log('   - questoes');
    console.log('   - usuarios');
    console.log('   - respostas_usuarios');
    console.log('   - comentarios_alunos');
    console.log('   - planos');
    console.log('   - patentes');
    console.log('   - cadernos');
    console.log('   - cadernos_questoes');

    // Inserir assuntos
    console.log('\n📝 Inserindo assuntos...');
    const assuntos = [
      { nome: 'Álgebra', disciplina: 'Matemática' },
      { nome: 'Geometria', disciplina: 'Matemática' },
      { nome: 'Trigonometria', disciplina: 'Matemática' },
      { nome: 'Concordância Verbal', disciplina: 'Português' },
      { nome: 'Regência Verbal', disciplina: 'Português' },
      { nome: 'Crase', disciplina: 'Português' },
      { nome: 'História do Brasil', disciplina: 'História' },
      { nome: 'História Geral', disciplina: 'História' },
      { nome: 'Geografia do Brasil', disciplina: 'Geografia' },
      { nome: 'Geografia Geral', disciplina: 'Geografia' }
    ];

    for (const assunto of assuntos) {
      const { error } = await supabase
        .from('assuntos')
        .upsert({
          nome: assunto.nome,
          disciplina_id: supabase
            .from('disciplinas')
            .select('id')
            .eq('nome', assunto.disciplina)
            .single()
        }, { onConflict: 'nome' });

      if (error) {
        console.log(`⚠️  Erro ao inserir assunto ${assunto.nome}:`, error.message);
      } else {
        console.log(`✅ Assunto ${assunto.nome} inserido`);
      }
    }

    console.log('\n🎉 Configuração do banco concluída!');
    console.log('📋 Agora você pode testar o sistema.');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

executeSQL();
