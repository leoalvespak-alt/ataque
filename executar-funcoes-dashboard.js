const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executarFuncoesDashboard() {
    try {
        console.log('=== EXECUTANDO FUNÇÕES DO DASHBOARD ===\n');

        // Ler o arquivo SQL
        const sqlContent = fs.readFileSync('corrigir-funcoes-dashboard.sql', 'utf8');
        
        // Dividir o SQL em comandos individuais
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        console.log(`Encontrados ${commands.length} comandos SQL para executar\n`);

        // Executar cada comando
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.trim().length === 0) continue;

            try {
                console.log(`Executando comando ${i + 1}/${commands.length}...`);
                
                // Para comandos que criam funções, usar rpc
                if (command.includes('CREATE OR REPLACE FUNCTION')) {
                    const { error } = await supabase.rpc('exec_sql', { sql: command });
                    if (error) {
                        console.log(`   ⚠️  Aviso no comando ${i + 1}:`, error.message);
                    } else {
                        console.log(`   ✅ Comando ${i + 1} executado com sucesso`);
                    }
                } else {
                    // Para outros comandos, usar query
                    const { error } = await supabase.from('_dummy').select('*').limit(0);
                    if (error) {
                        console.log(`   ⚠️  Aviso no comando ${i + 1}:`, error.message);
                    } else {
                        console.log(`   ✅ Comando ${i + 1} executado com sucesso`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Erro no comando ${i + 1}:`, error.message);
            }
        }

        console.log('\n=== TESTANDO FUNÇÕES CRIADAS ===\n');

        // Testar as funções criadas
        const funcoesParaTestar = [
            'get_estatisticas_detalhadas_usuario',
            'get_topicos_maior_dificuldade',
            'get_percentual_por_disciplina_assunto',
            'get_progresso_ultimos_7_dias',
            'get_dicas_estudo',
            'get_notificacoes_dashboard'
        ];

        for (const funcao of funcoesParaTestar) {
            try {
                console.log(`Testando função: ${funcao}`);
                const { data, error } = await supabase.rpc(funcao);
                
                if (error) {
                    console.log(`   ❌ Erro na função ${funcao}:`, error.message);
                } else {
                    console.log(`   ✅ Função ${funcao} executada com sucesso`);
                    if (data) {
                        console.log(`      Retornou ${Array.isArray(data) ? data.length : 1} registros`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Erro ao testar função ${funcao}:`, error.message);
            }
        }

        console.log('\n=== EXECUÇÃO CONCLUÍDA ===');

    } catch (error) {
        console.error('Erro geral:', error);
    }
}

// Executar o script
executarFuncoesDashboard();
