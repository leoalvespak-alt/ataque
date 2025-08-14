require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando chave anônima)
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSupabaseUsers() {
    try {
        console.log('🔄 Criando usuários no Supabase...');

        // 1. Criar usuário Admin
        console.log('\n📝 Criando usuário Admin...');
        const { data: adminAuth, error: adminAuthError } = await supabase.auth.signUp({
            email: 'admin@rotadeataque.com',
            password: '123456',
            options: {
                data: {
                    nome: 'Administrador',
                    tipo_usuario: 'gestor'
                }
            }
        });

        if (adminAuthError) {
            console.error('❌ Erro ao criar admin:', adminAuthError.message);
        } else {
            console.log('✅ Admin criado:', adminAuth.user.email);
            
            // Criar registro na tabela usuarios
            const { data: adminUser, error: adminUserError } = await supabase
                .from('usuarios')
                .insert({
                    id: adminAuth.user.id,
                    nome: 'Administrador',
                    email: 'admin@rotadeataque.com',
                    tipo_usuario: 'gestor',
                    status: 'ativo',
                    xp: 0,
                    questoes_respondidas: 0
                })
                .select()
                .single();

            if (adminUserError) {
                console.error('❌ Erro ao criar admin na tabela usuarios:', adminUserError.message);
            } else {
                console.log('✅ Admin criado na tabela usuarios:', adminUser);
            }
        }

        // Aguardar um pouco antes de criar o próximo usuário
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Criar usuário Aluno
        console.log('\n📝 Criando usuário Aluno...');
        const { data: alunoAuth, error: alunoAuthError } = await supabase.auth.signUp({
            email: 'joao@teste.com',
            password: '123456',
            options: {
                data: {
                    nome: 'João Silva',
                    tipo_usuario: 'aluno'
                }
            }
        });

        if (alunoAuthError) {
            console.error('❌ Erro ao criar aluno:', alunoAuthError.message);
        } else {
            console.log('✅ Aluno criado:', alunoAuth.user.email);
            
            // Criar registro na tabela usuarios
            const { data: alunoUser, error: alunoUserError } = await supabase
                .from('usuarios')
                .insert({
                    id: alunoAuth.user.id,
                    nome: 'João Silva',
                    email: 'joao@teste.com',
                    tipo_usuario: 'aluno',
                    status: 'gratuito',
                    xp: 0,
                    questoes_respondidas: 0
                })
                .select()
                .single();

            if (alunoUserError) {
                console.error('❌ Erro ao criar aluno na tabela usuarios:', alunoUserError.message);
            } else {
                console.log('✅ Aluno criado na tabela usuarios:', alunoUser);
            }
        }

        console.log('\n🎉 Processo concluído!');
        console.log('\n📋 Credenciais de teste:');
        console.log('👨‍💼 Admin: admin@rotadeataque.com / 123456');
        console.log('👨‍🎓 Aluno: joao@teste.com / 123456');
        console.log('\n⚠️  IMPORTANTE: Os usuários podem precisar confirmar o email.');
        console.log('   Se o login não funcionar, verifique se o email foi confirmado.');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

createSupabaseUsers();
