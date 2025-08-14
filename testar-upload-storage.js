const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use ANON_KEY para upload

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarUploadStorage() {
    console.log('🔍 Testando configuração do storage...\n');

    try {
        // 1. Verificar se o bucket existe
        console.log('1️⃣ Verificando bucket "uploads"...');
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();

        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError.message);
            return;
        }

        const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
        if (!uploadsBucket) {
            console.error('❌ Bucket "uploads" não encontrado');
            return;
        }

        console.log('✅ Bucket "uploads" encontrado');
        console.log(`   - Público: ${uploadsBucket.public}`);
        console.log(`   - Criado em: ${uploadsBucket.created_at}\n`);

        // 2. Verificar políticas RLS
        console.log('2️⃣ Verificando políticas RLS...');
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_storage_policies');

        if (policiesError) {
            console.log('⚠️ Não foi possível verificar políticas via RPC');
            console.log('   Verifique manualmente no painel do Supabase\n');
        } else {
            console.log('✅ Políticas RLS configuradas');
            policies.forEach(policy => {
                console.log(`   - ${policy.policyname}: ${policy.cmd}`);
            });
            console.log('');
        }

        // 3. Testar upload de arquivo simples
        console.log('3️⃣ Testando upload de arquivo...');
        
        // Criar um arquivo de teste simples
        const testContent = 'Teste de upload - ' + new Date().toISOString();
        const testFile = new Blob([testContent], { type: 'text/plain' });
        
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('uploads')
            .upload(`test-${Date.now()}.txt`, testFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Erro no upload:', uploadError.message);
            console.log('\n🔧 Possíveis soluções:');
            console.log('1. Execute o script configurar-storage-policies.sql');
            console.log('2. Verifique se está logado no frontend');
            console.log('3. Confirme que o bucket é público');
            return;
        }

        console.log('✅ Upload realizado com sucesso!');
        console.log(`   - Arquivo: ${uploadData.path}`);
        console.log(`   - Tamanho: ${testFile.size} bytes\n`);

        // 4. Testar download do arquivo
        console.log('4️⃣ Testando download do arquivo...');
        const { data: downloadData, error: downloadError } = await supabase
            .storage
            .from('uploads')
            .download(uploadData.path);

        if (downloadError) {
            console.error('❌ Erro no download:', downloadError.message);
        } else {
            const content = await downloadData.text();
            console.log('✅ Download realizado com sucesso!');
            console.log(`   - Conteúdo: ${content.substring(0, 50)}...\n`);
        }

        // 5. Listar arquivos no bucket
        console.log('5️⃣ Listando arquivos no bucket...');
        const { data: files, error: filesError } = await supabase
            .storage
            .from('uploads')
            .list();

        if (filesError) {
            console.error('❌ Erro ao listar arquivos:', filesError.message);
        } else {
            console.log(`✅ ${files.length} arquivo(s) encontrado(s) no bucket`);
            files.forEach(file => {
                console.log(`   - ${file.name} (${file.metadata?.size || 0} bytes)`);
            });
        }

        console.log('\n🎉 Teste de storage concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log('- Bucket "uploads" configurado');
        console.log('- Upload funcionando');
        console.log('- Download funcionando');
        console.log('- Sistema pronto para upload de logo/favicon');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

testarUploadStorage();
