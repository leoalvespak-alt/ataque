const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuestoesEstrutura() {
    try {
        console.log('=== TESTE DE ESTRUTURA DA TABELA QUESTOES ===\n');

        // 1. Tentar buscar uma questão existente para ver a estrutura
        console.log('1. Verificando estrutura através de uma questão existente...');
        const { data: questao, error: questaoError } = await supabase
            .from('questoes')
            .select('*')
            .limit(1)
            .single();

        if (questaoError) {
            console.log('   ❌ Erro ao buscar questão:', questaoError);
        } else {
            console.log('   ✅ Estrutura da questão:');
            Object.keys(questao).forEach(key => {
                console.log(`     - ${key}: ${typeof questao[key]} = ${questao[key]}`);
            });
        }

        // 2. Tentar criar questão com estrutura correta
        console.log('\n2. Tentando criar questão com estrutura correta...');
        
        // Buscar dados necessários
        const { data: disciplinas } = await supabase.from('disciplinas').select('id').limit(1);
        const { data: assuntos } = await supabase.from('assuntos').select('id').limit(1);
        const { data: bancas } = await supabase.from('bancas').select('id').limit(1);
        const { data: orgaos } = await supabase.from('orgaos').select('id').limit(1);

        if (!disciplinas || !assuntos || !bancas || !orgaos) {
            console.log('   ❌ Dados de referência não encontrados');
            return;
        }

        // Tentar criar questão com ano como número
        const { data: questaoNova, error: questaoNovaError } = await supabase
            .from('questoes')
            .insert([{
                enunciado: 'Questão de teste para verificar estrutura',
                alternativa_a: 'Alternativa A',
                alternativa_b: 'Alternativa B',
                alternativa_c: 'Alternativa C',
                alternativa_d: 'Alternativa D',
                gabarito: 'A',
                tipo: 'MULTIPLA_ESCOLHA',
                ano: 2024, // Usando ano como número
                escolaridade_id: 1,
                disciplina_id: disciplinas[0].id,
                assunto_id: assuntos[0].id,
                banca_id: bancas[0].id,
                orgao_id: orgaos[0].id,
                ativo: true
            }])
            .select('*')
            .single();

        if (questaoNovaError) {
            console.log('   ❌ Erro ao criar questão:', questaoNovaError);
        } else {
            console.log('   ✅ Questão criada com sucesso:', questaoNova.id);
        }

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

testQuestoesEstrutura();
