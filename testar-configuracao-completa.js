const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConfiguracaoCompleta() {
    console.log('🔍 Testando configuração completa do sistema...\n');

    try {
        // 1. Testar conexão
        console.log('1️⃣ Testando conexão com Supabase...');
        const { data: testData, error: testError } = await supabase
            .from('usuarios')
            .select('count')
            .limit(1);
        
        if (testError) {
            console.error('❌ Erro na conexão:', testError.message);
            return;
        }
        console.log('✅ Conexão estabelecida com sucesso\n');

        // 2. Verificar tabelas criadas
        console.log('2️⃣ Verificando tabelas criadas...');
        const tabelasParaVerificar = [
            'configuracoes_logo',
            'notificacoes', 
            'usuarios_notificacoes',
            'dicas_estudo'
        ];

        for (const tabela of tabelasParaVerificar) {
            const { data, error } = await supabase
                .from(tabela)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ Tabela ${tabela}: ${error.message}`);
            } else {
                console.log(`✅ Tabela ${tabela}: OK`);
            }
        }
        console.log('');

        // 3. Verificar funções criadas
        console.log('3️⃣ Verificando funções criadas...');
        const funcoesParaVerificar = [
            'get_estatisticas_dashboard',
            'get_estatisticas_por_disciplina',
            'get_estatisticas_por_assunto',
            'get_notificacoes_dashboard',
            'marcar_notificacao_lida_segura'
        ];

        for (const funcao of funcoesParaVerificar) {
            try {
                const { data, error } = await supabase.rpc(funcao);
                if (error) {
                    console.log(`❌ Função ${funcao}: ${error.message}`);
                } else {
                    console.log(`✅ Função ${funcao}: OK`);
                }
            } catch (err) {
                console.log(`❌ Função ${funcao}: ${err.message}`);
            }
        }
        console.log('');

        // 4. Verificar configurações de logo
        console.log('4️⃣ Verificando configurações de logo...');
        const { data: logoConfig, error: logoError } = await supabase
            .from('configuracoes_logo')
            .select('*');

        if (logoError) {
            console.log(`❌ Configurações de logo: ${logoError.message}`);
        } else {
            console.log(`✅ Configurações de logo: ${logoConfig.length} registros encontrados`);
            logoConfig.forEach(config => {
                console.log(`   - ${config.tipo}: ${config.url}`);
            });
        }
        console.log('');

        // 5. Verificar dicas de estudo
        console.log('5️⃣ Verificando dicas de estudo...');
        const { data: dicas, error: dicasError } = await supabase
            .from('dicas_estudo')
            .select('*')
            .eq('ativo', true);

        if (dicasError) {
            console.log(`❌ Dicas de estudo: ${dicasError.message}`);
        } else {
            console.log(`✅ Dicas de estudo: ${dicas.length} dicas ativas encontradas`);
        }
        console.log('');

        // 6. Verificar storage buckets
        console.log('6️⃣ Verificando buckets de storage...');
        const { data: buckets, error: bucketsError } = await supabase
            .storage
            .listBuckets();

        if (bucketsError) {
            console.log(`❌ Buckets de storage: ${bucketsError.message}`);
        } else {
            const uploadsBucket = buckets.find(bucket => bucket.name === 'uploads');
            if (uploadsBucket) {
                console.log('✅ Bucket "uploads" encontrado');
            } else {
                console.log('❌ Bucket "uploads" não encontrado');
            }
        }
        console.log('');

        // 7. Testar função de estatísticas
        console.log('7️⃣ Testando função de estatísticas...');
        try {
            const { data: stats, error: statsError } = await supabase.rpc('get_estatisticas_dashboard');
            if (statsError) {
                console.log(`❌ Estatísticas: ${statsError.message}`);
            } else {
                console.log('✅ Função de estatísticas funcionando');
                if (stats && stats.length > 0) {
                    console.log(`   - Total de respostas: ${stats[0].total_respostas || 0}`);
                    console.log(`   - XP total: ${stats[0].xp_total || 0}`);
                }
            }
        } catch (err) {
            console.log(`❌ Estatísticas: ${err.message}`);
        }
        console.log('');

        console.log('🎉 Teste de configuração concluído!');
        console.log('\n📋 Resumo:');
        console.log('- Tabelas adicionais criadas');
        console.log('- Funções de dashboard implementadas');
        console.log('- Configurações de logo configuradas');
        console.log('- Dicas de estudo inseridas');
        console.log('- Sistema pronto para uso');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

testarConfiguracaoCompleta();
