const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchemaExecution() {
  console.log('🔍 Testando execução do schema...\n');

  try {
    // Testar tabelas principais
    console.log('📋 Testando tabelas principais...');
    
    const tables = [
      'disciplinas',
      'assuntos', 
      'bancas',
      'anos',
      'escolaridades',
      'orgaos',
      'patentes',
      'planos',
      'questoes',
      'usuarios',
      'respostas_usuarios',
      'comentarios_alunos',
      'favoritos_questoes',
      'cadernos',
      'cadernos_questoes'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n📊 Testando dados iniciais...');
    
    // Testar dados de disciplinas
    const { data: disciplinas, error: discError } = await supabase
      .from('disciplinas')
      .select('*')
      .limit(5);
    
    if (discError) {
      console.log(`❌ Erro ao carregar disciplinas: ${discError.message}`);
    } else {
      console.log(`✅ Disciplinas carregadas: ${disciplinas?.length || 0} registros`);
    }

    // Testar dados de planos
    const { data: planos, error: planosError } = await supabase
      .from('planos')
      .select('*')
      .limit(5);
    
    if (planosError) {
      console.log(`❌ Erro ao carregar planos: ${planosError.message}`);
    } else {
      console.log(`✅ Planos carregados: ${planos?.length || 0} registros`);
    }

    // Testar dados de questões
    const { data: questoes, error: questError } = await supabase
      .from('questoes')
      .select('*')
      .limit(5);
    
    if (questError) {
      console.log(`❌ Erro ao carregar questões: ${questError.message}`);
    } else {
      console.log(`✅ Questões carregadas: ${questoes?.length || 0} registros`);
    }

    console.log('\n🎯 Testando relacionamentos...');
    
    // Testar join entre questões e disciplinas
    const { data: questoesComDisciplina, error: joinError } = await supabase
      .from('questoes')
      .select(`
        *,
        disciplinas!inner(nome),
        assuntos!inner(nome),
        bancas!inner(nome),
        orgaos!inner(nome),
        escolaridades!inner(nivel),
        anos!inner(ano)
      `)
      .limit(1);
    
    if (joinError) {
      console.log(`❌ Erro no join: ${joinError.message}`);
    } else {
      console.log(`✅ Join funcionando: ${questoesComDisciplina?.length || 0} registros`);
    }

    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSchemaExecution();
