const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function recreateAlunoUser() {
    try {
        console.log('🔄 Recriando usuário aluno...');

        // Primeiro, vamos limpar o usuário aluno existente da tabela usuarios
        console.log('\n1️⃣ Limpando usuário aluno da tabela usuarios...');
        
        const { data: deleteData, error: deleteError } = await supabase
            .from('usuarios')
            .delete()
            .eq('email', 'joao@teste.com')
            .select();

        if (deleteError) {
            console.log('⚠️  Erro ao deletar da tabela usuarios:', deleteError.message);
        } else {
            console.log('✅ Usuário removido da tabela usuarios');
        }

        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Agora vamos recriar o usuário aluno
        console.log('\n2️⃣ Recriando usuário aluno no Supabase Auth...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'joao@teste.com',
            password: '123456',
            options: {
                data: {
                    nome: 'João Silva',
                    tipo_usuario: 'aluno'
                },
                emailRedirectTo: 'http://localhost:3000'
            }
        });

        if (signUpError) {
            console.log('❌ Erro no signUp:', signUpError.message);
            
            if (signUpError.message.includes('already registered')) {
                console.log('⚠️  Usuário já existe no Auth. Vamos tentar fazer login...');
                
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: 'joao@teste.com',
                    password: '123456'
                });

                if (loginError) {
                    console.log('❌ Erro no login:', loginError.message);
                    return;
                } else {
                    console.log('✅ Login funcionou!');
                    console.log('👤 Usuário:', loginData.user.email);
                    
                    // Criar registro na tabela usuarios
                    const { data: userData, error: userError } = await supabase
                        .from('usuarios')
                        .insert({
                            id: loginData.user.id,
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
                        console.error('❌ Erro ao inserir na tabela usuarios:', userError.message);
                    } else {
                        console.log('✅ Usuário inserido na tabela usuarios:', userData);
                    }
                }
            }
        } else {
            console.log('✅ SignUp realizado:', signUpData.user?.email);
            
            if (signUpData.session) {
                console.log('✅ Sessão criada automaticamente!');
                
                // Criar registro na tabela usuarios
                const { data: userData, error: userError } = await supabase
                    .from('usuarios')
                    .insert({
                        id: signUpData.user.id,
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
                    console.error('❌ Erro ao inserir na tabela usuarios:', userError.message);
                } else {
                    console.log('✅ Usuário inserido na tabela usuarios:', userData);
                }
            } else {
                console.log('⚠️  Sessão não criada automaticamente');
            }
        }

        // Testar login final
        console.log('\n3️⃣ Testando login final...');
        
        const { data: finalLogin, error: finalError } = await supabase.auth.signInWithPassword({
            email: 'joao@teste.com',
            password: '123456'
        });

        if (finalError) {
            console.log('❌ Erro no login final:', finalError.message);
        } else {
            console.log('✅ Login final funcionou!');
            console.log('👤 Usuário:', finalLogin.user.email);
            console.log('🔑 Sessão criada:', !!finalLogin.session);
        }

        console.log('\n🎉 Processo concluído!');
        console.log('\n📋 Agora teste no site:');
        console.log('1. Acesse: http://localhost:3000');
        console.log('2. Faça login com: joao@teste.com / 123456');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

recreateAlunoUser();
