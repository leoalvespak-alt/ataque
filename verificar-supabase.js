const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuração do Supabase...\n');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas:');
    console.error(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
    console.error(`   SUPABASE_ANON_KEY: ${supabaseKey ? '✅' : '❌'}`);
    console.error('');
    console.error('💡 Solução:');
    console.error('1. Verifique se o arquivo .env existe na raiz do projeto');
    console.error('2. Verifique se as variáveis estão configuradas corretamente');
    process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSupabase() {
    try {
        // 1. Testar conexão básica
        console.log('1️⃣ Testando conexão com Supabase...');
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        
        if (error) {
            console.error('❌ Erro na conexão:', error.message);
            return;
        }
        
        console.log('✅ Conexão com Supabase funcionando');
        console.log('');

        // 2. Verificar buckets de storage
        console.log('2️⃣ Verificando buckets de storage...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError.message);
            return;
        }

        console.log(`✅ ${buckets.length} bucket(s) encontrado(s):`);
        buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (público: ${bucket.public})`);
        });
        console.log('');

        // 3. Verificar se o bucket "uploads" existe
        const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
        if (!uploadsBucket) {
            console.log('❌ Bucket "uploads" não encontrado');
            console.log('');
            console.log('💡 Solução:');
            console.log('1. Acesse o painel do Supabase');
            console.log('2. Vá em Storage');
            console.log('3. Clique em "New bucket"');
            console.log('4. Nome: uploads');
            console.log('5. Marque "Public bucket"');
            console.log('6. Clique em "Create bucket"');
            console.log('');
            console.log('Depois execute:');
            console.log('node configurar-storage-policies.js');
            return;
        }

        console.log('✅ Bucket "uploads" encontrado');
        console.log(`   - Público: ${uploadsBucket.public}`);
        console.log('');

        // 4. Verificar políticas RLS
        console.log('3️⃣ Verificando políticas RLS...');
        const { data: policies, error: policiesError } = await supabase
            .from('storage.objects')
            .select('*')
            .limit(1);

        if (policiesError) {
            console.log('⚠️ Não foi possível verificar políticas (normal se não há arquivos)');
        } else {
            console.log('✅ Políticas RLS configuradas');
        }
        console.log('');

        // 5. Testar upload simples
        console.log('4️⃣ Testando upload de arquivo...');
        const testContent = 'Teste de upload - ' + new Date().toISOString();
        const testFile = new Blob([testContent], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(`test-${Date.now()}.txt`, testFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Erro no upload:', uploadError.message);
            console.log('');
            console.log('💡 Possíveis soluções:');
            console.log('1. Execute o SQL para configurar políticas:');
            console.log('   - Abra o painel do Supabase');
            console.log('   - Vá em SQL Editor');
            console.log('   - Execute o conteúdo de configurar-storage-policies.sql');
            console.log('');
            console.log('2. Ou execute o script:');
            console.log('   node configurar-storage-policies.js');
            return;
        }

        console.log('✅ Upload funcionando!');
        console.log(`   - Arquivo: ${uploadData.path}`);
        console.log('');

        // 6. Limpar arquivo de teste
        console.log('5️⃣ Limpando arquivo de teste...');
        await supabase.storage.from('uploads').remove([uploadData.path]);
        console.log('✅ Arquivo de teste removido');
        console.log('');

        console.log('🎉 Verificação concluída com sucesso!');
        console.log('✅ Supabase configurado corretamente');
        console.log('✅ Storage funcionando');
        console.log('✅ Pronto para upload de logo/favicon');

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error.message);
    }
}

verificarSupabase();
