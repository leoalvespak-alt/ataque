const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com anon key (vamos tentar uma abordagem diferente)
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixUsers() {
    try {
        console.log('🔄 Verificando e corrigindo usuários no Supabase...');

        // Tentar fazer login com o admin para ver o status
        console.log('\n📧 Testando login com admin@rotadeataque.com...');
        
        const { data: adminAuth, error: adminError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (adminError) {
            console.log('❌ Erro no login admin:', adminError.message);
            
            if (adminError.message.includes('Email not confirmed')) {
                console.log('\n🔧 Solução: Vamos tentar recriar o usuário admin...');
                
                // Tentar criar o usuário novamente
                const { data: newAdmin, error: newAdminError } = await supabase.auth.signUp({
                    email: 'admin@rotadeataque.com',
                    password: '123456',
                    options: {
                        data: {
                            nome: 'Administrador',
                            tipo_usuario: 'gestor'
                        }
                    }
                });

                if (newAdminError) {
                    console.error('❌ Erro ao recriar admin:', newAdminError.message);
                } else {
                    console.log('✅ Admin recriado:', newAdmin.user?.email);
                    
                    // Verificar se a tabela usuarios existe e inserir o registro
                    const { data: userData, error: userError } = await supabase
                        .from('usuarios')
                        .insert({
                            id: newAdmin.user.id,
                            nome: 'Administrador',
                            email: 'admin@rotadeataque.com',
                            tipo_usuario: 'gestor',
                            status: 'ativo',
                            xp: 0,
                            questoes_respondidas: 0
                        })
                        .select()
                        .single();

                    if (userError) {
                        console.error('❌ Erro ao inserir admin na tabela usuarios:', userError.message);
                    } else {
                        console.log('✅ Admin inserido na tabela usuarios:', userData);
                    }
                }
            }
        } else {
            console.log('✅ Login admin funcionou!');
            console.log('👤 Usuário:', adminAuth.user.email);
            console.log('🔑 Sessão criada:', !!adminAuth.session);
        }

        // Testar login com o aluno
        console.log('\n📧 Testando login com joao@teste.com...');
        
        const { data: alunoAuth, error: alunoError } = await supabase.auth.signInWithPassword({
            email: 'joao@teste.com',
            password: '123456'
        });

        if (alunoError) {
            console.log('❌ Erro no login aluno:', alunoError.message);
            
            if (alunoError.message.includes('Email not confirmed')) {
                console.log('\n🔧 Solução: Vamos tentar recriar o usuário aluno...');
                
                const { data: newAluno, error: newAlunoError } = await supabase.auth.signUp({
                    email: 'joao@teste.com',
                    password: '123456',
                    options: {
                        data: {
                            nome: 'João Silva',
                            tipo_usuario: 'aluno'
                        }
                    }
                });

                if (newAlunoError) {
                    console.error('❌ Erro ao recriar aluno:', newAlunoError.message);
                } else {
                    console.log('✅ Aluno recriado:', newAluno.user?.email);
                    
                    const { data: userData, error: userError } = await supabase
                        .from('usuarios')
                        .insert({
                            id: newAluno.user.id,
                            nome: 'João Silva',
                            email: 'joao@teste.com',
                            tipo_usuario: 'aluno',
                            status: 'gratuito',
                            xp: 0,
                            questoes_respondidas: 0
                        })
                        .select()
                        .single();

                    if (userError) {
                        console.error('❌ Erro ao inserir aluno na tabela usuarios:', userError.message);
                    } else {
                        console.log('✅ Aluno inserido na tabela usuarios:', userData);
                    }
                }
            }
        } else {
            console.log('✅ Login aluno funcionou!');
            console.log('👤 Usuário:', alunoAuth.user.email);
            console.log('🔑 Sessão criada:', !!alunoAuth.session);
        }

        console.log('\n🎉 Verificação concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Teste o login no site: http://localhost:3000');
        console.log('2. Se ainda houver problemas, pode ser necessário:');
        console.log('   - Desabilitar email confirmation no painel do Supabase');
        console.log('   - Ou confirmar os usuários manualmente no painel');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkAndFixUsers();
