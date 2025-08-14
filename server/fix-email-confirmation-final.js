const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixEmailConfirmation() {
    try {
        console.log('🔧 Tentando resolver problema de email confirmation...');

        // Primeiro, vamos tentar uma abordagem diferente - usar signUp com email confirmation desabilitado
        console.log('\n📧 Tentando criar usuário admin com configuração especial...');
        
        // Tentar fazer signUp novamente para ver se conseguimos criar sem confirmação
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'admin@rotadeataque.com',
            password: '123456',
            options: {
                data: {
                    nome: 'Administrador',
                    tipo_usuario: 'gestor'
                },
                emailRedirectTo: 'http://localhost:3000'
            }
        });

        if (signUpError) {
            console.log('❌ Erro no signUp:', signUpError.message);
            
            if (signUpError.message.includes('already registered')) {
                console.log('⚠️  Usuário já existe. Vamos tentar uma abordagem diferente...');
                
                // Tentar fazer login direto
                console.log('\n🔐 Tentando login direto...');
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: 'admin@rotadeataque.com',
                    password: '123456'
                });

                if (loginError) {
                    console.log('❌ Erro no login:', loginError.message);
                    
                    if (loginError.message.includes('Email not confirmed')) {
                        console.log('\n🚨 PROBLEMA IDENTIFICADO: Email confirmation ainda está habilitado!');
                        console.log('\n📋 SOLUÇÃO MANUAL NECESSÁRIA:');
                        console.log('1. Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/auth/settings');
                        console.log('2. Role para baixo até "Email Auth"');
                        console.log('3. DESMARQUE "Enable email confirmations"');
                        console.log('4. Clique em "Save"');
                        console.log('5. Teste o login novamente');
                        
                        console.log('\n🔧 Alternativamente, você pode:');
                        console.log('1. Ir para: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/auth/users');
                        console.log('2. Encontrar o usuário admin@rotadeataque.com');
                        console.log('3. Clicar nos 3 pontos → "Confirm user"');
                        
                        return;
                    }
                } else {
                    console.log('✅ Login funcionou!');
                    console.log('👤 Usuário:', loginData.user.email);
                    console.log('🔑 Sessão criada:', !!loginData.session);
                }
            }
        } else {
            console.log('✅ SignUp realizado:', signUpData.user?.email);
            
            if (signUpData.session) {
                console.log('✅ Sessão criada automaticamente!');
                console.log('🔑 Login funcionou sem confirmação de email');
            } else {
                console.log('⚠️  Sessão não criada automaticamente');
                console.log('📧 Verifique se recebeu email de confirmação');
            }
        }

        // Testar com o usuário aluno também
        console.log('\n📧 Testando usuário aluno...');
        const { data: alunoLogin, error: alunoError } = await supabase.auth.signInWithPassword({
            email: 'joao@teste.com',
            password: '123456'
        });

        if (alunoError) {
            console.log('❌ Erro no login aluno:', alunoError.message);
        } else {
            console.log('✅ Login aluno funcionou!');
            console.log('👤 Usuário:', alunoLogin.user.email);
        }

        console.log('\n🎉 Verificação concluída!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Se ainda houver erro "Email not confirmed":');
        console.log('   → Desabilite email confirmation no painel do Supabase');
        console.log('2. Se funcionou:');
        console.log('   → Teste no site: http://localhost:3000');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

fixEmailConfirmation();
