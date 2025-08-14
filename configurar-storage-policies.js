const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Usar service key para criar bucket

console.log('🔧 Configurando storage e políticas RLS...\n');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas:');
    console.error(`   SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
    console.error(`   SUPABASE_SERVICE_KEY: ${supabaseKey ? '✅' : '❌'}`);
    console.error('');
    console.error('💡 Solução:');
    console.error('1. Verifique se o arquivo .env existe');
    console.error('2. Substitua SUPABASE_SERVICE_KEY pela sua service key real');
    console.error('3. Para obter a service key:');
    console.error('   - Acesse: https://supabase.com/dashboard');
    console.error('   - Vá em Settings > API');
    console.error('   - Copie a "service_role" key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function configurarStorage() {
    try {
        // 1. Criar bucket "uploads"
        console.log('1️⃣ Criando bucket "uploads"...');
        const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('uploads', {
            public: true,
            allowedMimeTypes: ['image/*', 'text/plain'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('✅ Bucket "uploads" já existe');
            } else {
                console.error('❌ Erro ao criar bucket:', bucketError.message);
                return;
            }
        } else {
            console.log('✅ Bucket "uploads" criado com sucesso');
        }
        console.log('');

        // 2. Configurar políticas RLS via SQL
        console.log('2️⃣ Configurando políticas RLS...');
        
        // Políticas SQL para configurar
        const policiesSQL = `
            -- Remover políticas existentes (se houver)
            DROP POLICY IF EXISTS "Public Access" ON storage.objects;
            DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
            DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
            DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
            DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
            DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

            -- Criar política para permitir visualização pública de arquivos
            CREATE POLICY "Anyone can view files" ON storage.objects
                FOR SELECT USING (bucket_id = 'uploads');

            -- Criar política para permitir upload de arquivos autenticados
            CREATE POLICY "Authenticated users can upload files" ON storage.objects
                FOR INSERT WITH CHECK (
                    bucket_id = 'uploads' 
                    AND auth.role() = 'authenticated'
                );

            -- Criar política para permitir atualização de arquivos pelo proprietário
            CREATE POLICY "Users can update their own files" ON storage.objects
                FOR UPDATE USING (
                    bucket_id = 'uploads' 
                    AND auth.uid() = owner
                );

            -- Criar política para permitir exclusão de arquivos pelo proprietário
            CREATE POLICY "Users can delete their own files" ON storage.objects
                FOR DELETE USING (
                    bucket_id = 'uploads' 
                    AND auth.uid() = owner
                );
        `;

        // Executar SQL via RPC (se disponível) ou instruir usuário
        console.log('⚠️  Para configurar as políticas RLS, execute este SQL no painel do Supabase:');
        console.log('');
        console.log('1. Acesse: https://supabase.com/dashboard');
        console.log('2. Selecione seu projeto');
        console.log('3. Vá em SQL Editor');
        console.log('4. Cole e execute o seguinte SQL:');
        console.log('');
        console.log('--- INÍCIO DO SQL ---');
        console.log(policiesSQL);
        console.log('--- FIM DO SQL ---');
        console.log('');

        // 3. Testar configuração
        console.log('3️⃣ Testando configuração...');
        
        // Usar anon key para testar upload
        const supabaseAnon = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);
        
        const testContent = 'Teste de configuração - ' + new Date().toISOString();
        const testFile = new Blob([testContent], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabaseAnon.storage
            .from('uploads')
            .upload(`test-config-${Date.now()}.txt`, testFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.log('⚠️  Upload falhou (normal se políticas não foram configuradas ainda):');
            console.log(`   Erro: ${uploadError.message}`);
            console.log('');
            console.log('💡 Execute o SQL acima primeiro, depois teste novamente');
        } else {
            console.log('✅ Upload funcionando!');
            console.log(`   - Arquivo: ${uploadData.path}`);
            
            // Limpar arquivo de teste
            await supabaseAnon.storage.from('uploads').remove([uploadData.path]);
            console.log('✅ Arquivo de teste removido');
        }
        console.log('');

        console.log('🎉 Configuração concluída!');
        console.log('');
        console.log('📋 Próximos passos:');
        console.log('1. Execute o SQL no painel do Supabase');
        console.log('2. Teste novamente: node verificar-supabase.js');
        console.log('3. Teste upload de logo/favicon no frontend');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error.message);
    }
}

configurarStorage();
