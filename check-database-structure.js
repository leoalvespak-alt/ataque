const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com as credenciais corretas
const SUPABASE_URL = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Verificando estrutura atual do banco de dados...\n');

    // Verificar se a tabela usuarios existe e sua estrutura
    console.log('1️⃣ Verificando tabela usuarios...');
    try {
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1);
      
      if (usuariosError) {
        console.log('❌ Tabela usuarios não existe ou erro:', usuariosError.message);
      } else {
        console.log('✅ Tabela usuarios existe');
        if (usuarios && usuarios.length > 0) {
          console.log('📋 Estrutura da primeira linha:', Object.keys(usuarios[0]));
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar usuarios:', error.message);
    }

    // Verificar se a tabela auth.users existe (tabela padrão do Supabase)
    console.log('\n2️⃣ Verificando tabela auth.users...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .limit(1);
      
      if (authError) {
        console.log('❌ Tabela auth.users não existe ou erro:', authError.message);
      } else {
        console.log('✅ Tabela auth.users existe');
        if (authUsers && authUsers.length > 0) {
          console.log('📋 Estrutura da primeira linha:', Object.keys(authUsers[0]));
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar auth.users:', error.message);
    }

    // Verificar outras tabelas importantes
    console.log('\n3️⃣ Verificando outras tabelas...');
    const tables = ['disciplinas', 'questoes', 'respostas_usuarios'];
    
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
        console.log(`❌ Erro ao verificar ${table}:`, error.message);
      }
    }

    console.log('\n💡 Recomendação:');
    console.log('Se a tabela auth.users existir e usar UUID, você deve:');
    console.log('1. Usar UUID para a tabela usuarios');
    console.log('2. Ou criar uma tabela separada para dados do usuário');
    console.log('3. Ou modificar o schema para usar INTEGER consistentemente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
checkDatabaseStructure();
