const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCriarOrgao() {
    try {
        console.log('=== TESTE DE CRIAÇÃO DE ÓRGÃO ===\n');

        const nomeOrgao = 'Teste Órgão ' + Date.now();

        // 1. Verificar se a tabela orgaos existe
        console.log('1. Verificando estrutura da tabela orgaos...');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'orgaos');

        if (columnsError) {
            console.log('   ❌ Erro ao verificar estrutura:', columnsError);
        } else {
            console.log('   ✅ Estrutura da tabela orgaos:');
            columns.forEach(col => {
                console.log(`     - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
            });
        }

        // 2. Verificar políticas de segurança
        console.log('\n2. Verificando políticas de segurança...');
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'orgaos');

        if (policiesError) {
            console.log('   ❌ Erro ao verificar políticas:', policiesError);
        } else {
            console.log('   ✅ Políticas encontradas:', policies.length);
            policies.forEach(policy => {
                console.log(`     - ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
            });
        }

        // 3. Tentar buscar órgão existente
        console.log('\n3. Tentando buscar órgão existente...');
        const { data: existingOrgao, error: searchError } = await supabase
            .from('orgaos')
            .select('id, nome')
            .eq('nome', nomeOrgao)
            .single();

        if (searchError && searchError.code !== 'PGRST116') {
            console.log('   ❌ Erro ao buscar órgão:', searchError);
        } else if (existingOrgao) {
            console.log('   ✅ Órgão já existe:', existingOrgao);
        } else {
            console.log('   ℹ️ Órgão não encontrado (esperado)');
        }

        // 4. Tentar criar novo órgão
        console.log('\n4. Tentando criar novo órgão...');
        const { data: newOrgao, error: createError } = await supabase
            .from('orgaos')
            .insert([{ 
                nome: nomeOrgao,
                descricao: 'Órgão de teste criado automaticamente'
            }])
            .select('id, nome, created_at')
            .single();

        if (createError) {
            console.log('   ❌ Erro ao criar órgão:', createError);
            console.log('   Detalhes do erro:', {
                code: createError.code,
                message: createError.message,
                details: createError.details,
                hint: createError.hint
            });
        } else {
            console.log('   ✅ Órgão criado com sucesso:', newOrgao);
        }

        // 5. Verificar órgãos existentes
        console.log('\n5. Verificando órgãos existentes...');
        const { data: allOrgaos, error: listError } = await supabase
            .from('orgaos')
            .select('id, nome, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (listError) {
            console.log('   ❌ Erro ao listar órgãos:', listError);
        } else {
            console.log('   ✅ Últimos 5 órgãos:');
            allOrgaos.forEach(orgao => {
                console.log(`     - ${orgao.id}: ${orgao.nome} (${orgao.created_at})`);
            });
        }

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

testCriarOrgao();
