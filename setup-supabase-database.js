const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase com as credenciais corretas
const SUPABASE_URL = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const SUPABASE_SERVICE_KEY = 'sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados Supabase...\n');

    // 1. Ler o arquivo SQL
    console.log('📖 Lendo arquivo de schema...');
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // 2. Executar o schema
    console.log('⚡ Executando schema SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

    if (error) {
      console.log('⚠️ Erro ao executar via RPC, tentando método alternativo...');
      console.log('💡 Execute manualmente o arquivo supabase-schema.sql no SQL Editor do Supabase');
      console.log('🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
      return;
    }

    console.log('✅ Schema executado com sucesso!');

    // 3. Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
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

    console.log('\n🎉 Configuração do banco de dados concluída!');
    console.log('📋 Próximos passos:');
    console.log('1. Teste a conexão: node test-supabase-correct-url.js');
    console.log('2. Inicie o frontend: cd client && npm run dev');

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
    console.log('\n💡 Execute manualmente o arquivo supabase-schema.sql no SQL Editor do Supabase');
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
  }
}

// Executar configuração
setupDatabase();
