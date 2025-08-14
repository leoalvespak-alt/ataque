const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarEstruturaNotificacoes() {
    try {
        console.log('=== VERIFICANDO ESTRUTURA DA TABELA NOTIFICAÇÕES ===\n');

        // 1. Verificar se a tabela existe
        console.log('1. Verificando se a tabela notificacoes existe...');
        const { data: notificacoes, error: errorNotificacoes } = await supabase
            .from('notificacoes')
            .select('*')
            .limit(1);

        if (errorNotificacoes) {
            console.log('   ❌ Erro ao acessar tabela:', errorNotificacoes.message);
            return;
        }

        console.log('   ✅ Tabela notificacoes existe');

        // 2. Verificar estrutura da tabela
        console.log('\n2. Verificando estrutura da tabela...');
        const { data: estrutura, error: errorEstrutura } = await supabase
            .from('notificacoes')
            .select('*')
            .limit(0);

        if (errorEstrutura) {
            console.log('   ❌ Erro ao verificar estrutura:', errorEstrutura.message);
        } else {
            console.log('   ✅ Estrutura verificada');
        }

        // 3. Tentar uma consulta simples para ver as colunas
        console.log('\n3. Testando consulta simples...');
        const { data: dados, error: errorDados } = await supabase
            .from('notificacoes')
            .select('id, titulo, mensagem, tipo, prioridade, ativa, lida, created_at')
            .limit(1);

        if (errorDados) {
            console.log('   ❌ Erro na consulta:', errorDados.message);
        } else {
            console.log('   ✅ Consulta simples funcionou');
            if (dados && dados.length > 0) {
                console.log('   📋 Colunas disponíveis:', Object.keys(dados[0]));
            }
        }

        // 4. Verificar se há dados na tabela
        console.log('\n4. Verificando dados na tabela...');
        const { count, error: errorCount } = await supabase
            .from('notificacoes')
            .select('*', { count: 'exact', head: true });

        if (errorCount) {
            console.log('   ❌ Erro ao contar registros:', errorCount.message);
        } else {
            console.log(`   📊 Total de registros: ${count}`);
        }

        // 5. Testar a função problemática
        console.log('\n5. Testando função get_notificacoes_dashboard...');
        const { data: resultadoFuncao, error: errorFuncao } = await supabase
            .rpc('get_notificacoes_dashboard');

        if (errorFuncao) {
            console.log('   ❌ Erro na função:', errorFuncao.message);
            
            // 6. Tentar corrigir a função
            console.log('\n6. Tentando corrigir a função...');
            const sqlCorrecao = `
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
                    notificacoes.id,
                    notificacoes.titulo,
                    notificacoes.mensagem,
                    COALESCE(notificacoes.tipo, 'INFO') as tipo,
                    COALESCE(notificacoes.prioridade, 'NORMAL') as prioridade,
                    COALESCE(notificacoes.lida, false) as lida,
                    notificacoes.created_at
                FROM notificacoes
                WHERE notificacoes.ativa = true
                AND (
                    notificacoes.usuario_id = user_id OR
                    notificacoes.destinatario_tipo = 'TODOS' OR
                    (notificacoes.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
                    (notificacoes.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
                )
                ORDER BY notificacoes.prioridade DESC, notificacoes.created_at DESC
                LIMIT 10;
            END;
            $$;
            `;

            console.log('   📝 SQL de correção gerado. Execute manualmente no Supabase:');
            console.log(sqlCorrecao);
        } else {
            console.log('   ✅ Função funcionando corretamente');
            console.log(`   📊 Retornou ${resultadoFuncao ? resultadoFuncao.length : 0} registros`);
        }

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

// Executar o script
verificarEstruturaNotificacoes();
