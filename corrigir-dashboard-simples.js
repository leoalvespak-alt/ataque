const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function corrigirDashboard() {
    try {
        console.log('=== CORRIGINDO FUNÇÕES DO DASHBOARD ===\n');

        // 1. Verificar se a tabela disciplinas tem a coluna 'ativo'
        console.log('1. Verificando estrutura da tabela disciplinas...');
        const { data: disciplinas, error: errorDisciplinas } = await supabase
            .from('disciplinas')
            .select('*')
            .limit(1);

        if (errorDisciplinas) {
            console.log('   ❌ Erro ao verificar disciplinas:', errorDisciplinas.message);
        } else {
            console.log('   ✅ Tabela disciplinas acessível');
        }

        // 2. Verificar se a tabela respostas_usuarios existe
        console.log('\n2. Verificando tabela respostas_usuarios...');
        const { data: respostas, error: errorRespostas } = await supabase
            .from('respostas_usuarios')
            .select('*')
            .limit(1);

        if (errorRespostas) {
            console.log('   ❌ Tabela respostas_usuarios não existe ou não acessível:', errorRespostas.message);
            console.log('   📝 Criando tabela respostas_usuarios...');
            
            // Tentar criar a tabela
            const { error: createError } = await supabase
                .from('respostas_usuarios')
                .insert({
                    usuario_id: '00000000-0000-0000-0000-000000000000',
                    questao_id: 1,
                    acertou: false,
                    data_resposta: new Date().toISOString()
                });

            if (createError) {
                console.log('   ❌ Não foi possível criar dados de teste:', createError.message);
            }
        } else {
            console.log('   ✅ Tabela respostas_usuarios acessível');
        }

        // 3. Testar funções existentes
        console.log('\n3. Testando funções existentes...');
        
        const funcoes = [
            'get_estatisticas_detalhadas_usuario',
            'get_topicos_maior_dificuldade', 
            'get_percentual_por_disciplina_assunto',
            'get_progresso_ultimos_7_dias',
            'get_dicas_estudo',
            'get_notificacoes_dashboard'
        ];

        for (const funcao of funcoes) {
            try {
                console.log(`   Testando ${funcao}...`);
                const { data, error } = await supabase.rpc(funcao);
                
                if (error) {
                    console.log(`      ❌ Erro: ${error.message}`);
                } else {
                    console.log(`      ✅ Sucesso - Retornou ${Array.isArray(data) ? data.length : 1} registros`);
                }
            } catch (error) {
                console.log(`      ❌ Exceção: ${error.message}`);
            }
        }

        // 4. Verificar tabela notificacoes
        console.log('\n4. Verificando tabela notificacoes...');
        const { data: notificacoes, error: errorNotificacoes } = await supabase
            .from('notificacoes')
            .select('*')
            .limit(1);

        if (errorNotificacoes) {
            console.log('   ❌ Tabela notificacoes não existe:', errorNotificacoes.message);
        } else {
            console.log('   ✅ Tabela notificacoes acessível');
        }

        // 5. Verificar tabela dicas_estudo
        console.log('\n5. Verificando tabela dicas_estudo...');
        const { data: dicas, error: errorDicas } = await supabase
            .from('dicas_estudo')
            .select('*')
            .limit(1);

        if (errorDicas) {
            console.log('   ❌ Tabela dicas_estudo não existe:', errorDicas.message);
        } else {
            console.log('   ✅ Tabela dicas_estudo acessível');
        }

        console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
        console.log('\nPara corrigir os problemas, execute o script SQL no painel do Supabase:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá para SQL Editor');
        console.log('3. Cole o conteúdo do arquivo corrigir-funcoes-dashboard.sql');
        console.log('4. Execute o script');

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

// Executar o script
corrigirDashboard();
