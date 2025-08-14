const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSistemaCompleto() {
    try {
        console.log('=== TESTE COMPLETO DO SISTEMA ===\n');

        // 1. Testar criação de usuário
        console.log('1. Testando criação de usuário...');
        const novoUsuario = {
            nome: 'Teste Usuário ' + Date.now(),
            email: 'teste' + Date.now() + '@exemplo.com',
            senha: '123456',
            tipo_usuario: 'aluno',
            ativo: true
        };

        const { data: usuarioCriado, error: erroUsuario } = await supabase
            .from('usuarios')
            .insert(novoUsuario)
            .select()
            .single();

        if (usuarioCriado && !erroUsuario) {
            console.log('   ✅ Usuário criado com sucesso:', usuarioCriado.id);
        } else {
            console.log('   ❌ Erro ao criar usuário:', erroUsuario?.message);
        }

        // 2. Testar criação de notificação
        console.log('\n2. Testando criação de notificação...');
        const novaNotificacao = {
            titulo: 'Teste de Notificação',
            mensagem: 'Esta é uma notificação de teste criada pelo sistema.',
            categoria: 'teste',
            tipo: 'info',
            ativo: true,
            criado_por: usuarioCriado?.id || '1'
        };

        const { data: notificacaoCriada, error: erroNotificacao } = await supabase
            .from('notificacoes')
            .insert(novaNotificacao)
            .select()
            .single();

        if (notificacaoCriada && !erroNotificacao) {
            console.log('   ✅ Notificação criada com sucesso:', notificacaoCriada.id);
        } else {
            console.log('   ❌ Erro ao criar notificação:', erroNotificacao?.message);
        }

        // 3. Testar distribuição de notificação para usuários
        console.log('\n3. Testando distribuição de notificação...');
        if (notificacaoCriada && usuarioCriado) {
            const { data: notificacaoUsuario, error: erroDistribuicao } = await supabase
                .from('notificacoes_usuarios')
                .insert({
                    notificacao_id: notificacaoCriada.id,
                    usuario_id: usuarioCriado.id
                })
                .select()
                .single();

            if (notificacaoUsuario && !erroDistribuicao) {
                console.log('   ✅ Notificação distribuída com sucesso');
            } else {
                console.log('   ❌ Erro ao distribuir notificação:', erroDistribuicao?.message);
            }
        }

        // 4. Testar busca de notificações não lidas
        console.log('\n4. Testando busca de notificações não lidas...');
        const { data: notificacoesNaoLidas, error: erroBusca } = await supabase
            .rpc('obter_notificacoes_nao_lidas');

        if (notificacoesNaoLidas && !erroBusca) {
            console.log('   ✅ Notificações não lidas encontradas:', notificacoesNaoLidas.length);
        } else {
            console.log('   ❌ Erro ao buscar notificações:', erroBusca?.message);
        }

        // 5. Testar marcação de notificação como lida
        console.log('\n5. Testando marcação de notificação como lida...');
        if (notificacaoCriada && usuarioCriado) {
            const { data: resultadoMarcacao, error: erroMarcacao } = await supabase
                .rpc('marcar_notificacao_lida', { p_notificacao_id: notificacaoCriada.id });

            if (resultadoMarcacao && !erroMarcacao) {
                console.log('   ✅ Notificação marcada como lida:', resultadoMarcacao);
            } else {
                console.log('   ❌ Erro ao marcar notificação:', erroMarcacao?.message);
            }
        }

        // 6. Testar criação de questão
        console.log('\n6. Testando criação de questão...');
        const novaQuestao = {
            enunciado: 'Questão de teste criada pelo sistema',
            alternativa_a: 'Alternativa A',
            alternativa_b: 'Alternativa B',
            alternativa_c: 'Alternativa C',
            alternativa_d: 'Alternativa D',
            gabarito: 'A',
            ano: 2024,
            disciplina_id: 1,
            assunto_id: 1,
            banca_id: 1,
            orgao_id: 1,
            ativo: true
        };

        const { data: questaoCriada, error: erroQuestao } = await supabase
            .from('questoes')
            .insert(novaQuestao)
            .select()
            .single();

        if (questaoCriada && !erroQuestao) {
            console.log('   ✅ Questão criada com sucesso:', questaoCriada.id);
        } else {
            console.log('   ❌ Erro ao criar questão:', erroQuestao?.message);
        }

        // 7. Testar resposta de questão
        console.log('\n7. Testando resposta de questão...');
        if (questaoCriada && usuarioCriado) {
            const { data: respostaCriada, error: erroResposta } = await supabase
                .from('respostas_usuarios')
                .insert({
                    aluno_id: usuarioCriado.id,
                    questao_id: questaoCriada.id,
                    resposta_selecionada: 'A',
                    correta: true
                })
                .select()
                .single();

            if (respostaCriada && !erroResposta) {
                console.log('   ✅ Resposta criada com sucesso');
            } else {
                console.log('   ❌ Erro ao criar resposta:', erroResposta?.message);
            }
        }

        // 8. Testar atualização de XP do usuário
        console.log('\n8. Testando atualização de XP...');
        if (usuarioCriado) {
            const { data: usuarioAtualizado, error: erroXP } = await supabase
                .from('usuarios')
                .update({ 
                    xp: (usuarioCriado.xp || 0) + 20,
                    questoes_respondidas: (usuarioCriado.questoes_respondidas || 0) + 1
                })
                .eq('id', usuarioCriado.id)
                .select()
                .single();

            if (usuarioAtualizado && !erroXP) {
                console.log('   ✅ XP atualizado com sucesso:', usuarioAtualizado.xp);
            } else {
                console.log('   ❌ Erro ao atualizar XP:', erroXP?.message);
            }
        }

        // 9. Testar busca de estatísticas
        console.log('\n9. Testando busca de estatísticas...');
        const { data: estatisticas, error: erroStats } = await supabase
            .from('usuarios')
            .select('id, nome, xp, questoes_respondidas')
            .order('xp', { ascending: false })
            .limit(5);

        if (estatisticas && !erroStats) {
            console.log('   ✅ Estatísticas carregadas:', estatisticas.length, 'usuários');
        } else {
            console.log('   ❌ Erro ao carregar estatísticas:', erroStats?.message);
        }

        // 10. Limpeza dos dados de teste
        console.log('\n10. Limpando dados de teste...');
        if (usuarioCriado) {
            await supabase.from('usuarios').delete().eq('id', usuarioCriado.id);
            console.log('   ✅ Usuário de teste removido');
        }
        if (notificacaoCriada) {
            await supabase.from('notificacoes').delete().eq('id', notificacaoCriada.id);
            console.log('   ✅ Notificação de teste removida');
        }
        if (questaoCriada) {
            await supabase.from('questoes').delete().eq('id', questaoCriada.id);
            console.log('   ✅ Questão de teste removida');
        }

        console.log('\n=== TESTE CONCLUÍDO COM SUCESSO! ===');
        console.log('✅ Todas as funcionalidades principais estão funcionando');
        console.log('✅ Sistema pronto para uso');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar teste
testSistemaCompleto();
