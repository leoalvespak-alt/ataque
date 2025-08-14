const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (mesmo projeto do frontend)
// IMPORTANTE: use as variáveis de ambiente locais para não vazar chaves
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cfwyuomeaudpnmjosetq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados Supabase...\n');

    // 1. Criar enums
    console.log('📝 Criando enums...');
    await createEnums();
    
    // 2. Criar tabelas
    console.log('📋 Criando tabelas...');
    await createTables();
    
    // 3. Criar índices
    console.log('🔍 Criando índices...');
    await createIndexes();
    
    // 4. Configurar políticas RLS
    console.log('🔐 Configurando políticas de segurança...');
    await setupRLSPolicies();
    
    // 5. Inserir dados iniciais
    console.log('📊 Inserindo dados iniciais...');
    await insertInitialData();
    
    console.log('\n✅ Configuração do banco de dados concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

async function createEnums() {
  const enums = [
    {
      name: 'tipo_questao',
      values: ['MULTIPLA_ESCOLHA', 'CERTO_OU_ERRADO']
    },
    {
      name: 'nivel_escolaridade',
      values: ['FUNDAMENTAL', 'MEDIO', 'SUPERIOR']
    },
    {
      name: 'tipo_usuario',
      values: ['ALUNO', 'GESTOR']
    },
    {
      name: 'tipo_plano',
      values: ['GRATUITO', 'PREMIUM']
    }
  ];

  for (const enumDef of enums) {
    try {
      const { error } = await supabase.rpc('create_enum_if_not_exists', {
        enum_name: enumDef.name,
        enum_values: enumDef.values
      });
      
      if (error) {
        console.log(`⚠️  Enum ${enumDef.name} já existe ou erro:`, error.message);
      } else {
        console.log(`✅ Enum ${enumDef.name} criado`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao criar enum ${enumDef.name}:`, error.message);
    }
  }
}

async function createTables() {
  const tables = [
    // Tabela disciplinas
    `
    CREATE TABLE IF NOT EXISTS disciplinas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela assuntos
    `
    CREATE TABLE IF NOT EXISTS assuntos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL UNIQUE,
      disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela bancas
    `
    CREATE TABLE IF NOT EXISTS bancas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela anos
    `
    CREATE TABLE IF NOT EXISTS anos (
      id SERIAL PRIMARY KEY,
      ano INTEGER NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela escolaridades
    `
    CREATE TABLE IF NOT EXISTS escolaridades (
      id SERIAL PRIMARY KEY,
      nivel nivel_escolaridade NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela orgaos
    `
    CREATE TABLE IF NOT EXISTS orgaos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela questoes
    `
    CREATE TABLE IF NOT EXISTS questoes (
      id VARCHAR(6) PRIMARY KEY,
      enunciado TEXT NOT NULL,
      texto_questao TEXT NOT NULL,
      gabarito TEXT NOT NULL,
      comentario_gabarito_professor TEXT,
      tipo_questao tipo_questao NOT NULL,
      disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
      assunto_id INTEGER NOT NULL REFERENCES assuntos(id),
      banca_id INTEGER NOT NULL REFERENCES bancas(id),
      ano_id INTEGER NOT NULL REFERENCES anos(id),
      escolaridade_id INTEGER NOT NULL REFERENCES escolaridades(id),
      orgao_id INTEGER NOT NULL REFERENCES orgaos(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela alternativas
    `
    CREATE TABLE IF NOT EXISTS alternativas (
      id SERIAL PRIMARY KEY,
      questao_id VARCHAR(6) NOT NULL REFERENCES questoes(id),
      letra VARCHAR(1) NOT NULL,
      texto TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(questao_id, letra)
    );
    `,
    
    // Tabela usuarios
    `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      numero_celular VARCHAR(20),
      senha VARCHAR(255) NOT NULL,
      tipo_usuario tipo_usuario NOT NULL,
      tipo_plano tipo_plano NOT NULL DEFAULT 'GRATUITO',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela respostas_alunos
    `
    CREATE TABLE IF NOT EXISTS respostas_alunos (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES usuarios(id),
      questao_id VARCHAR(6) NOT NULL REFERENCES questoes(id),
      resposta_selecionada TEXT NOT NULL,
      correta BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela comentarios_questoes
    `
    CREATE TABLE IF NOT EXISTS comentarios_questoes (
      id SERIAL PRIMARY KEY,
      questao_id VARCHAR(6) NOT NULL REFERENCES questoes(id),
      aluno_id INTEGER NOT NULL REFERENCES usuarios(id),
      texto_comentario TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela cadernos
    `
    CREATE TABLE IF NOT EXISTS cadernos (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES usuarios(id),
      nome VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    `,
    
    // Tabela cadernos_questoes
    `
    CREATE TABLE IF NOT EXISTS cadernos_questoes (
      caderno_id INTEGER NOT NULL REFERENCES cadernos(id),
      questao_id VARCHAR(6) NOT NULL REFERENCES questoes(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (caderno_id, questao_id)
    );
    `
  ];

  for (let i = 0; i < tables.length; i++) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: tables[i] });
      if (error) {
        console.log(`⚠️  Erro ao criar tabela ${i + 1}:`, error.message);
      } else {
        console.log(`✅ Tabela ${i + 1} criada/verificada`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao executar SQL ${i + 1}:`, error.message);
    }
  }
}

async function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_questoes_disciplina ON questoes(disciplina_id);',
    'CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto_id);',
    'CREATE INDEX IF NOT EXISTS idx_questoes_banca ON questoes(banca_id);',
    'CREATE INDEX IF NOT EXISTS idx_questoes_ano ON questoes(ano_id);',
    'CREATE INDEX IF NOT EXISTS idx_questoes_escolaridade ON questoes(escolaridade_id);',
    'CREATE INDEX IF NOT EXISTS idx_questoes_orgao ON questoes(orgao_id);',
    'CREATE INDEX IF NOT EXISTS idx_respostas_aluno ON respostas_alunos(aluno_id);',
    'CREATE INDEX IF NOT EXISTS idx_respostas_questao ON respostas_alunos(questao_id);',
    'CREATE INDEX IF NOT EXISTS idx_comentarios_questao ON comentarios_questoes(questao_id);',
    'CREATE INDEX IF NOT EXISTS idx_comentarios_aluno ON comentarios_questoes(aluno_id);',
    'CREATE INDEX IF NOT EXISTS idx_cadernos_aluno ON cadernos(aluno_id);',
    'CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_caderno ON cadernos_questoes(caderno_id);',
    'CREATE INDEX IF NOT EXISTS idx_cadernos_questoes_questao ON cadernos_questoes(questao_id);'
  ];

  for (const index of indexes) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: index });
      if (error) {
        console.log(`⚠️  Erro ao criar índice:`, error.message);
      } else {
        console.log(`✅ Índice criado/verificado`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao executar índice:`, error.message);
    }
  }
}

async function setupRLSPolicies() {
  console.log('🔐 Configurando políticas RLS...');
  
  // Habilitar RLS em todas as tabelas
  const tables = [
    'disciplinas', 'assuntos', 'bancas', 'anos', 'escolaridades', 'orgaos',
    'questoes', 'alternativas', 'usuarios', 'respostas_alunos', 
    'comentarios_questoes', 'cadernos', 'cadernos_questoes'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;` 
      });
      if (error) {
        console.log(`⚠️  Erro ao habilitar RLS em ${table}:`, error.message);
      } else {
        console.log(`✅ RLS habilitado em ${table}`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao configurar RLS em ${table}:`, error.message);
    }
  }

  // Políticas específicas
  const policies = [
    // Política para disciplinas (leitura pública)
    `CREATE POLICY "Disciplinas são visíveis para todos" ON disciplinas FOR SELECT USING (true);`,
    
    // Política para assuntos (leitura pública)
    `CREATE POLICY "Assuntos são visíveis para todos" ON assuntos FOR SELECT USING (true);`,
    
    // Política para bancas (leitura pública)
    `CREATE POLICY "Bancas são visíveis para todos" ON bancas FOR SELECT USING (true);`,
    
    // Política para anos (leitura pública)
    `CREATE POLICY "Anos são visíveis para todos" ON anos FOR SELECT USING (true);`,
    
    // Política para escolaridades (leitura pública)
    `CREATE POLICY "Escolaridades são visíveis para todos" ON escolaridades FOR SELECT USING (true);`,
    
    // Política para orgaos (leitura pública)
    `CREATE POLICY "Órgãos são visíveis para todos" ON orgaos FOR SELECT USING (true);`,
    
    // Política para questões (leitura pública)
    `CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (true);`,
    
    // Política para alternativas (leitura pública)
    `CREATE POLICY "Alternativas são visíveis para todos" ON alternativas FOR SELECT USING (true);`,
    
    // Política para usuários (cada usuário vê apenas seus dados)
    `CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON usuarios FOR SELECT USING (auth.uid() = id);`,
    `CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON usuarios FOR UPDATE USING (auth.uid() = id);`,
    
    // Política para respostas de alunos (cada aluno vê apenas suas respostas)
    `CREATE POLICY "Alunos podem ver apenas suas próprias respostas" ON respostas_alunos FOR SELECT USING (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem inserir suas próprias respostas" ON respostas_alunos FOR INSERT WITH CHECK (auth.uid() = aluno_id);`,
    
    // Política para comentários (todos podem ver, apenas o autor pode modificar)
    `CREATE POLICY "Comentários são visíveis para todos" ON comentarios_questoes FOR SELECT USING (true);`,
    `CREATE POLICY "Alunos podem inserir seus próprios comentários" ON comentarios_questoes FOR INSERT WITH CHECK (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem atualizar apenas seus próprios comentários" ON comentarios_questoes FOR UPDATE USING (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem deletar apenas seus próprios comentários" ON comentarios_questoes FOR DELETE USING (auth.uid() = aluno_id);`,
    
    // Política para cadernos (cada aluno vê apenas seus cadernos)
    `CREATE POLICY "Alunos podem ver apenas seus próprios cadernos" ON cadernos FOR SELECT USING (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem inserir seus próprios cadernos" ON cadernos FOR INSERT WITH CHECK (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem atualizar apenas seus próprios cadernos" ON cadernos FOR UPDATE USING (auth.uid() = aluno_id);`,
    `CREATE POLICY "Alunos podem deletar apenas seus próprios cadernos" ON cadernos FOR DELETE USING (auth.uid() = aluno_id);`,
    
    // Política para cadernos_questoes (cada aluno vê apenas suas associações)
    `CREATE POLICY "Alunos podem ver apenas suas próprias associações de cadernos" ON cadernos_questoes FOR SELECT USING (EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()));`,
    `CREATE POLICY "Alunos podem inserir associações em seus próprios cadernos" ON cadernos_questoes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()));`,
    `CREATE POLICY "Alunos podem deletar associações de seus próprios cadernos" ON cadernos_questoes FOR DELETE USING (EXISTS (SELECT 1 FROM cadernos WHERE cadernos.id = cadernos_questoes.caderno_id AND cadernos.aluno_id = auth.uid()));`
  ];

  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.log(`⚠️  Erro ao criar política:`, error.message);
      } else {
        console.log(`✅ Política criada/verificada`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao executar política:`, error.message);
    }
  }
}

async function insertInitialData() {
  console.log('📊 Inserindo dados iniciais...');
  
  // Inserir dados básicos
  const initialData = {
    disciplinas: [
      { nome: 'Matemática' },
      { nome: 'Português' },
      { nome: 'História' },
      { nome: 'Geografia' },
      { nome: 'Ciências' },
      { nome: 'Inglês' },
      { nome: 'Física' },
      { nome: 'Química' },
      { nome: 'Biologia' },
      { nome: 'Filosofia' },
      { nome: 'Sociologia' },
      { nome: 'Direitos e Garantias Fundamentais', disciplina_id: 12 },
      { nome: 'Organização dos Poderes', disciplina_id: 12 },
      { nome: 'Princípios da Administração Pública', disciplina_id: 13 },
      { nome: 'Atos Administrativos', disciplina_id: 13 },
      { nome: 'Crimes contra a Pessoa', disciplina_id: 14 },
      { nome: 'Crimes contra o Patrimônio', disciplina_id: 14 },
      { nome: 'Direito das Obrigações', disciplina_id: 15 },
      { nome: 'Direito das Coisas', disciplina_id: 15 }
    ],
    
    bancas: [
      { nome: 'CESPE/CEBRASPE' },
      { nome: 'FGV' },
      { nome: 'VUNESP' },
      { nome: 'FCC' },
      { nome: 'IADES' },
      { nome: 'QUADRIX' },
      { nome: 'INSTITUTO AOCP' },
      { nome: 'FEPESE' },
      { nome: 'FUNDEP' },
      { nome: 'FUNDAÇÃO CESGRANRIO' }
    ],
    
    anos: [
      { ano: 2024 },
      { ano: 2023 },
      { ano: 2022 },
      { ano: 2021 },
      { ano: 2020 },
      { ano: 2019 },
      { ano: 2018 },
      { ano: 2017 },
      { ano: 2016 },
      { ano: 2015 }
    ],
    
    escolaridades: [
      { nivel: 'FUNDAMENTAL' },
      { nivel: 'MEDIO' },
      { nivel: 'SUPERIOR' }
    ],
    
    orgaos: [
      { nome: 'Tribunal de Justiça' },
      { nome: 'Ministério Público' },
      { nome: 'Defensoria Pública' },
      { nome: 'Polícia Federal' },
      { nome: 'Polícia Civil' },
      { nome: 'Receita Federal' },
      { nome: 'Banco Central' },
      { nome: 'Tribunal Regional Federal' },
      { nome: 'Tribunal Regional do Trabalho' },
      { nome: 'Tribunal Superior do Trabalho' },
      { nome: 'Supremo Tribunal Federal' },
      { nome: 'Superior Tribunal de Justiça' }
    ]
  };

  // Inserir disciplinas
  for (const disciplina of initialData.disciplinas) {
    try {
      const { error } = await supabase
        .from('disciplinas')
        .upsert(disciplina, { onConflict: 'nome' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir disciplina ${disciplina.nome}:`, error.message);
      } else {
        console.log(`✅ Disciplina ${disciplina.nome} inserida/atualizada`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir disciplina ${disciplina.nome}:`, error.message);
    }
  }

  // Inserir bancas
  for (const banca of initialData.bancas) {
    try {
      const { error } = await supabase
        .from('bancas')
        .upsert(banca, { onConflict: 'nome' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir banca ${banca.nome}:`, error.message);
      } else {
        console.log(`✅ Banca ${banca.nome} inserida/atualizada`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir banca ${banca.nome}:`, error.message);
    }
  }

  // Inserir anos
  for (const ano of initialData.anos) {
    try {
      const { error } = await supabase
        .from('anos')
        .upsert(ano, { onConflict: 'ano' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir ano ${ano.ano}:`, error.message);
      } else {
        console.log(`✅ Ano ${ano.ano} inserido/atualizado`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir ano ${ano.ano}:`, error.message);
    }
  }

  // Inserir escolaridades
  for (const escolaridade of initialData.escolaridades) {
    try {
      const { error } = await supabase
        .from('escolaridades')
        .upsert(escolaridade, { onConflict: 'nivel' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir escolaridade ${escolaridade.nivel}:`, error.message);
      } else {
        console.log(`✅ Escolaridade ${escolaridade.nivel} inserida/atualizada`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir escolaridade ${escolaridade.nivel}:`, error.message);
    }
  }

  // Inserir orgaos
  for (const orgao of initialData.orgaos) {
    try {
      const { error } = await supabase
        .from('orgaos')
        .upsert(orgao, { onConflict: 'nome' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir órgão ${orgao.nome}:`, error.message);
      } else {
        console.log(`✅ Órgão ${orgao.nome} inserido/atualizado`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir órgão ${orgao.nome}:`, error.message);
    }
  }

  // Inserir assuntos para algumas disciplinas
  const assuntos = [
    { nome: 'Álgebra', disciplina_id: 1 },
    { nome: 'Geometria', disciplina_id: 1 },
    { nome: 'Trigonometria', disciplina_id: 1 },
    { nome: 'Concordância Verbal', disciplina_id: 2 },
    { nome: 'Regência Verbal', disciplina_id: 2 },
    { nome: 'Crase', disciplina_id: 2 },
    { nome: 'História do Brasil', disciplina_id: 3 },
    { nome: 'História Geral', disciplina_id: 3 },
    { nome: 'Geografia do Brasil', disciplina_id: 4 },
    { nome: 'Geografia Geral', disciplina_id: 4 },
    { nome: 'Direitos e Garantias Fundamentais', disciplina_id: 12 },
    { nome: 'Organização dos Poderes', disciplina_id: 12 },
    { nome: 'Princípios da Administração Pública', disciplina_id: 13 },
    { nome: 'Atos Administrativos', disciplina_id: 13 },
    { nome: 'Crimes contra a Pessoa', disciplina_id: 14 },
    { nome: 'Crimes contra o Patrimônio', disciplina_id: 14 },
    { nome: 'Direito das Obrigações', disciplina_id: 15 },
    { nome: 'Direito das Coisas', disciplina_id: 15 }
  ];

  for (const assunto of assuntos) {
    try {
      const { error } = await supabase
        .from('assuntos')
        .upsert(assunto, { onConflict: 'nome' });
      
      if (error) {
        console.log(`⚠️  Erro ao inserir assunto ${assunto.nome}:`, error.message);
      } else {
        console.log(`✅ Assunto ${assunto.nome} inserido/atualizado`);
      }
    } catch (error) {
      console.log(`⚠️  Erro ao inserir assunto ${assunto.nome}:`, error.message);
    }
  }
}

// Executar a configuração
setupDatabase();
