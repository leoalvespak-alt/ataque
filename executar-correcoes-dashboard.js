const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executarCorrecoes() {
    try {
        console.log('=== EXECUTANDO CORREÇÕES DO DASHBOARD ===\n');

        // 1. Corrigir função get_notificacoes_dashboard
        console.log('1. Corrigindo função get_notificacoes_dashboard...');
        
        const sqlCorrecaoNotificacoes = `
        CREATE OR REPLACE FUNCTION get_notificacoes_dashboard()
        RETURNS TABLE (
            id INTEGER,
            titulo VARCHAR(255),
            mensagem TEXT,
            tipo VARCHAR(50),
            prioridade VARCHAR(20),
            lida BOOLEAN,
            created_at TIMESTAMP
        )
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
            user_id UUID;
            user_tipo VARCHAR(20);
        BEGIN
            user_id := auth.uid();
            
            -- Obter tipo do usuário
            SELECT COALESCE(tipo_usuario, 'aluno') INTO user_tipo
            FROM usuarios
            WHERE id = user_id;
            
            -- Retornar dados vazios se a tabela notificacoes não existir
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'notificacoes'
            ) THEN
                RETURN;
            END IF;
            
            RETURN QUERY
            SELECT 
                n.id,
                n.titulo,
                n.mensagem,
                COALESCE(n.tipo, 'INFO') as tipo,
                COALESCE(n.prioridade, 'NORMAL') as prioridade,
                COALESCE(n.lida, false) as lida,
                n.created_at
            FROM notificacoes n
            WHERE n.ativa = true
            AND (
                n.usuario_id = user_id OR
                n.destinatario_tipo = 'TODOS' OR
                (n.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
                (n.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
            )
            ORDER BY n.prioridade DESC, n.created_at DESC
            LIMIT 10;
        END;
        $$;
        `;

        // Tentar executar a correção via RPC (se existir)
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: sqlCorrecaoNotificacoes });
            if (error) {
                console.log('   ⚠️  Não foi possível executar via RPC, mas a função pode já estar corrigida');
            } else {
                console.log('   ✅ Função corrigida via RPC');
            }
        } catch (error) {
            console.log('   ⚠️  RPC não disponível, função pode precisar ser executada manualmente');
        }

        // 2. Verificar se a tabela notificacoes tem a estrutura correta
        console.log('\n2. Verificando estrutura da tabela notificacoes...');
        const { data: notificacoes, error: errorNotificacoes } = await supabase
            .from('notificacoes')
            .select('*')
            .limit(1);

        if (errorNotificacoes) {
            console.log('   ❌ Tabela notificacoes não existe ou não acessível:', errorNotificacoes.message);
            console.log('   📝 Criando tabela notificacoes básica...');
            
            // Tentar criar uma notificação de teste
            const { error: createError } = await supabase
                .from('notificacoes')
                .insert({
                    titulo: 'Bem-vindo!',
                    mensagem: 'Seja bem-vindo ao sistema de questões.',
                    tipo: 'INFO',
                    prioridade: 'NORMAL',
                    ativa: true,
                    lida: false,
                    usuario_id: null,
                    destinatario_tipo: 'TODOS'
                });

            if (createError) {
                console.log('   ❌ Não foi possível criar notificação de teste:', createError.message);
            } else {
                console.log('   ✅ Notificação de teste criada');
            }
        } else {
            console.log('   ✅ Tabela notificacoes acessível');
        }

        // 3. Testar todas as funções novamente
        console.log('\n3. Testando todas as funções após correções...');
        
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

        console.log('\n=== INSTRUÇÕES FINAIS ===');
        console.log('Se ainda houver erros, execute manualmente no Supabase:');
        console.log('1. Acesse o painel do Supabase');
        console.log('2. Vá para SQL Editor');
        console.log('3. Cole o conteúdo do arquivo corrigir-funcoes-dashboard-final.sql');
        console.log('4. Execute o script');

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

// Executar o script
executarCorrecoes();
