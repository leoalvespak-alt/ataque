const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCorrecoesDashboard() {
    try {
        console.log('=== TESTANDO CORREÇÕES DO DASHBOARD ===\n');

        // 1. Testar função get_estatisticas_detalhadas_usuario
        console.log('1. Testando get_estatisticas_detalhadas_usuario...');
        const { data: estatisticas, error: errorEstatisticas } = await supabase
            .rpc('get_estatisticas_detalhadas_usuario');

        if (errorEstatisticas) {
            console.log('   ❌ Erro:', errorEstatisticas.message);
        } else {
            console.log('   ✅ Sucesso!');
            if (estatisticas && estatisticas.length > 0) {
                console.log('      Dados retornados:', estatisticas[0]);
            } else {
                console.log('      Nenhum dado retornado (usuário sem respostas)');
            }
        }

        // 2. Testar função get_topicos_maior_dificuldade
        console.log('\n2. Testando get_topicos_maior_dificuldade...');
        const { data: topicos, error: errorTopicos } = await supabase
            .rpc('get_topicos_maior_dificuldade');

        if (errorTopicos) {
            console.log('   ❌ Erro:', errorTopicos.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${topicos ? topicos.length : 0} tópicos`);
        }

        // 3. Testar função get_percentual_por_disciplina_assunto
        console.log('\n3. Testando get_percentual_por_disciplina_assunto...');
        const { data: percentuais, error: errorPercentuais } = await supabase
            .rpc('get_percentual_por_disciplina_assunto');

        if (errorPercentuais) {
            console.log('   ❌ Erro:', errorPercentuais.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${percentuais ? percentuais.length : 0} registros`);
        }

        // 4. Testar função get_progresso_ultimos_7_dias
        console.log('\n4. Testando get_progresso_ultimos_7_dias...');
        const { data: progresso, error: errorProgresso } = await supabase
            .rpc('get_progresso_ultimos_7_dias');

        if (errorProgresso) {
            console.log('   ❌ Erro:', errorProgresso.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${progresso ? progresso.length : 0} dias`);
            if (progresso && progresso.length > 0) {
                console.log('      Exemplo de dados:', progresso[0]);
            }
        }

        // 5. Testar função get_dicas_estudo
        console.log('\n5. Testando get_dicas_estudo...');
        const { data: dicas, error: errorDicas } = await supabase
            .rpc('get_dicas_estudo');

        if (errorDicas) {
            console.log('   ❌ Erro:', errorDicas.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${dicas ? dicas.length : 0} dicas`);
        }

        // 6. Testar função get_notificacoes_dashboard
        console.log('\n6. Testando get_notificacoes_dashboard...');
        const { data: notificacoes, error: errorNotificacoes } = await supabase
            .rpc('get_notificacoes_dashboard');

        if (errorNotificacoes) {
            console.log('   ❌ Erro:', errorNotificacoes.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${notificacoes ? notificacoes.length : 0} notificações`);
        }

        // 7. Testar consulta de disciplinas
        console.log('\n7. Testando consulta de disciplinas...');
        const { data: disciplinas, error: errorDisciplinas } = await supabase
            .from('disciplinas')
            .select('id, nome')
            .eq('ativo', true)
            .order('nome');

        if (errorDisciplinas) {
            console.log('   ❌ Erro:', errorDisciplinas.message);
        } else {
            console.log('   ✅ Sucesso!');
            console.log(`      Retornou ${disciplinas ? disciplinas.length : 0} disciplinas`);
        }

        console.log('\n=== RESUMO DOS TESTES ===');
        console.log('Se todas as funções retornaram "✅ Sucesso!", o dashboard deve funcionar corretamente.');
        console.log('\nPara aplicar as correções:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá para SQL Editor');
        console.log('3. Cole o conteúdo do arquivo corrigir-funcoes-dashboard-final.sql');
        console.log('4. Execute o script');

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

// Executar o script
testarCorrecoesDashboard();
