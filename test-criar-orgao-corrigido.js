const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCriarOrgaoCorrigido() {
    try {
        console.log('=== TESTE DE CRIAÇÃO DE ÓRGÃO CORRIGIDO ===\n');

        const nomeOrgao = 'Teste Órgão ' + Date.now();

        // 1. Tentar buscar órgão existente
        console.log('1. Tentando buscar órgão existente...');
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

        // 2. Tentar criar novo órgão (sem a coluna descricao)
        console.log('\n2. Tentando criar novo órgão...');
        const { data: newOrgao, error: createError } = await supabase
            .from('orgaos')
            .insert([{ 
                nome: nomeOrgao
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

        // 3. Verificar órgãos existentes
        console.log('\n3. Verificando órgãos existentes...');
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

        // 4. Testar criação de questão completa
        console.log('\n4. Testando criação de questão completa...');
        
        // Buscar dados necessários
        const { data: disciplinas } = await supabase.from('disciplinas').select('id').limit(1);
        const { data: assuntos } = await supabase.from('assuntos').select('id').limit(1);
        const { data: bancas } = await supabase.from('bancas').select('id').limit(1);
        const { data: anos } = await supabase.from('anos').select('id').limit(1);

        if (!disciplinas || !assuntos || !bancas || !anos) {
            console.log('   ❌ Dados de referência não encontrados');
            return;
        }

        // Criar questão de teste
        const { data: questao, error: questaoError } = await supabase
            .from('questoes')
            .insert([{
                enunciado: 'Questão de teste para verificar criação',
                alternativa_a: 'Alternativa A',
                alternativa_b: 'Alternativa B',
                alternativa_c: 'Alternativa C',
                alternativa_d: 'Alternativa D',
                gabarito: 'A',
                tipo: 'MULTIPLA_ESCOLHA',
                ano_id: anos[0].id,
                escolaridade_id: 1,
                disciplina_id: disciplinas[0].id,
                assunto_id: assuntos[0].id,
                banca_id: bancas[0].id,
                orgao_id: newOrgao ? newOrgao.id : 1,
                ativo: true
            }])
            .select('*')
            .single();

        if (questaoError) {
            console.log('   ❌ Erro ao criar questão:', questaoError);
        } else {
            console.log('   ✅ Questão criada com sucesso:', questao.id);
        }

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

testCriarOrgaoCorrigido();
