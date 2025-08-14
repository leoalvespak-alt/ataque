const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function configurarLogosSimples() {
  try {
    console.log('🚀 Configurando logos da plataforma...\n');

    // 1. Verificar se a tabela configuracoes_logo existe
    console.log('🗄️  Verificando tabela "configuracoes_logo"...');
    const { data: existingConfigs, error: tableError } = await supabase
      .from('configuracoes_logo')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela configuracoes_logo:', tableError);
      console.log('⚠️  Execute o script SQL primeiro para criar a tabela');
      return;
    }

    console.log('✅ Tabela "configuracoes_logo" existe');

    // 2. Configurar URLs das logos
    const logoConfigs = [
      {
        tipo: 'logo',
        url: 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png',
        nome_arquivo: 'ATAQUE.png',
        ativo: true
      },
      {
        tipo: 'favicon',
        url: 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico',
        nome_arquivo: 'favicon-1755150122840.ico',
        ativo: true
      }
    ];

    console.log('\n🔄 Atualizando configurações de logo...');

    // 3. Limpar configurações existentes
    const { error: deleteError } = await supabase
      .from('configuracoes_logo')
      .delete()
      .neq('id', 0); // Deletar todos

    if (deleteError) {
      console.error('❌ Erro ao limpar configurações existentes:', deleteError);
      return;
    }

    console.log('✅ Configurações existentes removidas');

    // 4. Inserir novas configurações
    const { data: insertData, error: insertError } = await supabase
      .from('configuracoes_logo')
      .insert(logoConfigs)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir configurações:', insertError);
      return;
    }

    console.log('✅ Configurações de logo atualizadas com sucesso!');
    console.log('📋 Configurações inseridas:', insertData);

    // 5. Verificar configurações
    console.log('\n🔍 Verificando configurações...');
    const { data: finalConfigs, error: finalError } = await supabase
      .from('configuracoes_logo')
      .select('*')
      .eq('ativo', true)
      .order('tipo');

    if (finalError) {
      console.error('❌ Erro ao verificar configurações finais:', finalError);
    } else {
      console.log('✅ Configurações finais:');
      finalConfigs.forEach(config => {
        console.log(`   - ${config.tipo}: ${config.url}`);
      });
    }

    // 6. Testar URLs públicas
    console.log('\n🌐 Testando URLs públicas...');
    
    for (const config of logoConfigs) {
      try {
        const response = await fetch(config.url);
        if (response.ok) {
          console.log(`✅ URL pública funcionando: ${config.tipo}`);
        } else {
          console.log(`⚠️  URL pública não acessível: ${config.tipo} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Erro ao testar URL: ${config.tipo} - ${error.message}`);
      }
    }

    console.log('\n🎉 Configuração das logos concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse o Dashboard do Supabase');
    console.log('2. Vá para Storage > Buckets');
    console.log('3. Crie um bucket chamado "uploads" (se não existir)');
    console.log('4. Dentro do bucket, crie uma pasta chamada "logos"');
    console.log('5. Faça upload dos arquivos:');
    console.log('   - ATAQUE.png (logo principal)');
    console.log('   - favicon-1755150122840.ico (favicon)');
    console.log('6. Teste a aplicação para confirmar que as logos estão carregando');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar configuração
configurarLogosSimples();
