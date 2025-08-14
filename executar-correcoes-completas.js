const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MTIyNiwiZXhwIjoyMDcwNjI3MjI2fQ.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

// Criar cliente Supabase com role de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

async function executarCorrecoes() {
  console.log('🚀 Iniciando correções completas do sistema...\n');

  try {
    // 1. Ler o arquivo SQL de correções
    const sqlFile = path.join(__dirname, 'corrigir-problemas-completos.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📋 Executando correções SQL...');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`\n🔧 Executando comando ${i + 1}/${commands.length}...`);
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: command
          });

          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Erro ao executar comando ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Resumo da execução:`);
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);

    // 2. Verificar se as funções foram criadas
    console.log('\n🔍 Verificando funções criadas...');
    
    const funcoesParaVerificar = [
      'get_estatisticas_dashboard',
      'get_estatisticas_por_disciplina',
      'get_estatisticas_por_assunto',
      'get_notificacoes_dashboard',
      'marcar_notificacao_lida_segura'
    ];

    for (const funcao of funcoesParaVerificar) {
      try {
        const { data, error } = await supabase
          .from('information_schema.routines')
          .select('routine_name, routine_type')
          .eq('routine_name', funcao)
          .eq('routine_schema', 'public');

        if (error) {
          console.log(`❌ Erro ao verificar função ${funcao}:`, error.message);
        } else if (data && data.length > 0) {
          console.log(`✅ Função ${funcao} encontrada`);
        } else {
          console.log(`⚠️  Função ${funcao} não encontrada`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar função ${funcao}:`, err.message);
      }
    }

    // 3. Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tabelasParaVerificar = [
      'configuracoes_logo',
      'notificacoes',
      'usuarios_notificacoes',
      'dicas_estudo'
    ];

    for (const tabela of tabelasParaVerificar) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Erro ao verificar tabela ${tabela}:`, error.message);
        } else {
          console.log(`✅ Tabela ${tabela} acessível`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar tabela ${tabela}:`, err.message);
      }
    }

    // 4. Testar funções com dados de exemplo
    console.log('\n🧪 Testando funções...');
    
    try {
      const { data: estatisticas, error: estatError } = await supabase
        .rpc('get_estatisticas_dashboard');

      if (estatError) {
        console.log('❌ Erro ao testar get_estatisticas_dashboard:', estatError.message);
      } else {
        console.log('✅ get_estatisticas_dashboard funcionando');
        console.log('📊 Dados retornados:', estatisticas);
      }
    } catch (err) {
      console.log('❌ Erro ao testar função:', err.message);
    }

    // 5. Verificar bucket de storage
    console.log('\n🔍 Verificando bucket de storage...');
    
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.log('❌ Erro ao listar buckets:', bucketError.message);
      } else {
        console.log('📦 Buckets disponíveis:', buckets.map(b => b.name));
        
        const uploadsBucket = buckets.find(b => b.name === 'uploads');
        if (uploadsBucket) {
          console.log('✅ Bucket "uploads" encontrado');
        } else {
          console.log('⚠️  Bucket "uploads" não encontrado - será necessário criar manualmente');
        }
      }
    } catch (err) {
      console.log('❌ Erro ao verificar buckets:', err.message);
    }

    console.log('\n🎉 Correções completas finalizadas!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique se todas as funções foram criadas corretamente');
    console.log('2. Crie o bucket "uploads" no painel do Supabase se não existir');
    console.log('3. Configure as políticas de RLS para o bucket de storage');
    console.log('4. Teste o upload de arquivos na página de configurações');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correções
executarCorrecoes().catch(console.error);
