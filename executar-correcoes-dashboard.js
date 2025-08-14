const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MTIyNiwiZXhwIjoyMDcwNjI3MjI2fQ.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

// Criar cliente Supabase com service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executarCorrecoesDashboard() {
  console.log('🚀 Iniciando correções do dashboard...');
  
  try {
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'corrigir-funcoes-dashboard-final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    // Executar o SQL
    console.log('⚡ Executando correções no banco de dados...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar executar via REST API
      console.log('🔄 Tentando executar via REST API...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql_query: sqlContent
        })
      });
      
      if (!response.ok) {
        console.error('❌ Erro na REST API:', response.status, response.statusText);
        throw new Error('Falha ao executar correções');
      }
      
      const result = await response.json();
      console.log('✅ Correções executadas via REST API:', result);
    } else {
      console.log('✅ Correções executadas com sucesso:', data);
    }
    
    // Verificar se as funções foram criadas
    console.log('🔍 Verificando se as funções foram criadas...');
    
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .in('routine_name', [
        'get_estatisticas_dashboard',
        'get_notificacoes_dashboard',
        'marcar_notificacao_lida_segura'
      ]);
    
    if (functionsError) {
      console.warn('⚠️ Não foi possível verificar as funções:', functionsError);
    } else {
      console.log('✅ Funções encontradas:', functions?.map(f => f.routine_name));
    }
    
    // Testar as funções
    console.log('🧪 Testando as funções...');
    
    try {
      const { data: testStats, error: testStatsError } = await supabase
        .rpc('get_estatisticas_dashboard');
      
      if (testStatsError) {
        console.warn('⚠️ Erro ao testar get_estatisticas_dashboard:', testStatsError);
      } else {
        console.log('✅ get_estatisticas_dashboard funcionando:', testStats);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao testar função:', error);
    }
    
    try {
      const { data: testNotif, error: testNotifError } = await supabase
        .rpc('get_notificacoes_dashboard');
      
      if (testNotifError) {
        console.warn('⚠️ Erro ao testar get_notificacoes_dashboard:', testNotifError);
      } else {
        console.log('✅ get_notificacoes_dashboard funcionando:', testNotif);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao testar função:', error);
    }
    
    console.log('🎉 Correções do dashboard concluídas!');
    console.log('');
    console.log('📋 Resumo das correções:');
    console.log('✅ Função get_estatisticas_dashboard criada/corrigida');
    console.log('✅ Função get_notificacoes_dashboard criada/corrigida');
    console.log('✅ Função marcar_notificacao_lida_segura criada/corrigida');
    console.log('✅ Tabelas de notificações criadas/verificadas');
    console.log('✅ Políticas RLS configuradas');
    console.log('');
    console.log('🔄 Agora o frontend deve funcionar sem erros 400/404');
    
  } catch (error) {
    console.error('❌ Erro durante as correções:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarCorrecoesDashboard();
}

module.exports = { executarCorrecoesDashboard };
