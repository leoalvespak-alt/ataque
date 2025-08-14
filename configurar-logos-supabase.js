const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function configurarLogos() {
  try {
    console.log('🚀 Iniciando configuração das logos da plataforma...\n');

    // 1. Verificar se o bucket 'uploads' existe
    console.log('📦 Verificando bucket "uploads"...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }

    const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
    if (!uploadsBucket) {
      console.log('⚠️  Bucket "uploads" não encontrado. Criando...');
      const { error: createError } = await supabase.storage.createBucket('uploads', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
        return;
      }
      console.log('✅ Bucket "uploads" criado com sucesso!');
    } else {
      console.log('✅ Bucket "uploads" já existe');
    }

    // 2. Verificar se a pasta 'logos' existe
    console.log('\n📁 Verificando pasta "logos"...');
    const { data: logosFiles, error: logosError } = await supabase.storage
      .from('uploads')
      .list('logos');

    if (logosError) {
      console.log('⚠️  Pasta "logos" não encontrada. Criando...');
      // Criar pasta logos (uploadando um arquivo temporário e depois removendo)
      const { error: createFolderError } = await supabase.storage
        .from('uploads')
        .upload('logos/.keep', new Blob([''], { type: 'text/plain' }));

      if (createFolderError) {
        console.error('❌ Erro ao criar pasta logos:', createFolderError);
        return;
      }

      // Remover arquivo temporário
      await supabase.storage
        .from('uploads')
        .remove(['logos/.keep']);

      console.log('✅ Pasta "logos" criada com sucesso!');
    } else {
      console.log('✅ Pasta "logos" já existe');
      console.log('📋 Arquivos na pasta logos:', logosFiles?.map(f => f.name).join(', ') || 'Nenhum');
    }

    // 3. Verificar se a tabela configuracoes_logo existe
    console.log('\n🗄️  Verificando tabela "configuracoes_logo"...');
    const { data: logoConfigs, error: tableError } = await supabase
      .from('configuracoes_logo')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela configuracoes_logo:', tableError);
      console.log('⚠️  Execute o script SQL para criar a tabela primeiro');
      return;
    }

    console.log('✅ Tabela "configuracoes_logo" existe');

    // 4. Configurar URLs das logos
    const logoConfigsToInsert = [
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

    // Limpar configurações existentes
    const { error: deleteError } = await supabase
      .from('configuracoes_logo')
      .delete()
      .neq('id', 0); // Deletar todos

    if (deleteError) {
      console.error('❌ Erro ao limpar configurações existentes:', deleteError);
      return;
    }

    // Inserir novas configurações
    const { data: insertData, error: insertError } = await supabase
      .from('configuracoes_logo')
      .insert(logoConfigsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir configurações:', insertError);
      return;
    }

    console.log('✅ Configurações de logo atualizadas com sucesso!');
    console.log('📋 Configurações inseridas:', insertData);

    // 5. Verificar se os arquivos existem no storage
    console.log('\n🔍 Verificando arquivos no storage...');
    
    for (const config of logoConfigsToInsert) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('uploads')
        .list('logos', {
          search: config.nome_arquivo
        });

      if (fileError) {
        console.error(`❌ Erro ao verificar arquivo ${config.nome_arquivo}:`, fileError);
      } else if (fileData && fileData.length > 0) {
        console.log(`✅ Arquivo ${config.nome_arquivo} encontrado no storage`);
      } else {
        console.log(`⚠️  Arquivo ${config.nome_arquivo} NÃO encontrado no storage`);
        console.log(`📤 Você precisa fazer upload do arquivo para: uploads/logos/${config.nome_arquivo}`);
      }
    }

    // 6. Testar URLs públicas
    console.log('\n🌐 Testando URLs públicas...');
    
    for (const config of logoConfigsToInsert) {
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
    console.log('1. Faça upload dos arquivos para o bucket "uploads" na pasta "logos"');
    console.log('2. Nome dos arquivos:');
    console.log('   - ATAQUE.png (logo principal)');
    console.log('   - favicon-1755150122840.ico (favicon)');
    console.log('3. Verifique se as URLs públicas estão funcionando');
    console.log('4. Teste a aplicação para confirmar que as logos estão carregando');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar configuração
configurarLogos();
