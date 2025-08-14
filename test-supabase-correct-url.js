const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com a URL correta
const SUPABASE_URL = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o Supabase (URL correta)...\n');

    // Teste 1: Verificar se conseguimos conectar
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('disciplinas')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro na conexão:', testError.message);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Teste 2: Verificar tabelas existentes
    console.log('2️⃣ Verificando tabelas existentes...');
    const tables = [
      'disciplinas', 'assuntos', 'bancas', 'anos', 'escolaridades', 'orgaos',
      'questoes', 'alternativas', 'usuarios', 'respostas_alunos', 
      'comentarios_questoes', 'cadernos', 'cadernos_questoes'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar tabela ${table}:`, error.message);
      }
    }

    console.log('\n3️⃣ Verificando dados iniciais...');

    // Teste 3: Verificar dados iniciais
    const { data: disciplinas, error: discError } = await supabase
      .from('disciplinas')
      .select('*')
      .limit(5);

    if (discError) {
      console.log('❌ Erro ao buscar disciplinas:', discError.message);
    } else {
      console.log(`✅ Encontradas ${disciplinas.length} disciplinas`);
      disciplinas.forEach(disc => console.log(`   - ${disc.nome}`));
    }

    const { data: bancas, error: bancasError } = await supabase
      .from('bancas')
      .select('*')
      .limit(5);

    if (bancasError) {
      console.log('❌ Erro ao buscar bancas:', bancasError.message);
    } else {
      console.log(`✅ Encontradas ${bancas.length} bancas`);
      bancas.forEach(banca => console.log(`   - ${banca.nome}`));
    }

    const { data: anos, error: anosError } = await supabase
      .from('anos')
      .select('*')
      .order('ano', { ascending: false })
      .limit(5);

    if (anosError) {
      console.log('❌ Erro ao buscar anos:', anosError.message);
    } else {
      console.log(`✅ Encontrados ${anos.length} anos`);
      anos.forEach(ano => console.log(`   - ${ano.ano}`));
    }

    console.log('\n🎉 Teste de conexão concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testConnection();
