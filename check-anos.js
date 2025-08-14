const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnos() {
  console.log('🔍 Verificando anos disponíveis na tabela anos...\n');

  try {
    // Buscar todos os anos
    const { data: anos, error } = await supabase
      .from('anos')
      .select('*')
      .order('ano', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar anos:', error);
      return;
    }

    console.log('📋 Anos disponíveis:');
    if (anos && anos.length > 0) {
      anos.forEach(ano => {
        console.log(`  - ${ano.ano} (ID: ${ano.id})`);
      });
    } else {
      console.log('  ❌ Nenhum ano encontrado!');
    }

    // Testar busca por ano específico
    const anoTeste = 2024;
    console.log(`\n🔍 Testando busca pelo ano ${anoTeste}...`);
    
    const { data: anoEspecifico, error: erroEspecifico } = await supabase
      .from('anos')
      .select('id')
      .eq('ano', anoTeste)
      .single();

    if (erroEspecifico) {
      console.error(`❌ Ano ${anoTeste} não encontrado:`, erroEspecifico.message);
    } else {
      console.log(`✅ Ano ${anoTeste} encontrado com ID: ${anoEspecifico.id}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAnos();
