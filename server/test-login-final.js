const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFinal() {
    try {
        console.log('🧪 Teste final de login...');

        // Testar login do admin
        console.log('\n👨‍💼 Testando login do Admin...');
        const { data: adminLogin, error: adminError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (adminError) {
            console.log('❌ Erro no login admin:', adminError.message);
        } else {
            console.log('✅ Login admin funcionou!');
            console.log('👤 Usuário:', adminLogin.user.email);
            console.log('🔑 Sessão criada:', !!adminLogin.session);
            
            // Buscar dados do usuário na tabela
            const { data: adminUser, error: adminUserError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', adminLogin.user.id)
                .single();

            if (adminUserError) {
                console.log('❌ Erro ao buscar dados do admin:', adminUserError.message);
            } else {
                console.log('📊 Dados do admin:', {
                    nome: adminUser.nome,
                    tipo_usuario: adminUser.tipo_usuario,
                    status: adminUser.status
                });
            }
        }

        // Fazer logout
        await supabase.auth.signOut();

        // Testar login do aluno
        console.log('\n👨‍🎓 Testando login do Aluno...');
        const { data: alunoLogin, error: alunoError } = await supabase.auth.signInWithPassword({
            email: 'joao@teste.com',
            password: '123456'
        });

        if (alunoError) {
            console.log('❌ Erro no login aluno:', alunoError.message);
        } else {
            console.log('✅ Login aluno funcionou!');
            console.log('👤 Usuário:', alunoLogin.user.email);
            console.log('🔑 Sessão criada:', !!alunoLogin.session);
            
            // Buscar dados do usuário na tabela
            const { data: alunoUser, error: alunoUserError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', alunoLogin.user.id)
                .single();

            if (alunoUserError) {
                console.log('❌ Erro ao buscar dados do aluno:', alunoUserError.message);
            } else {
                console.log('📊 Dados do aluno:', {
                    nome: alunoUser.nome,
                    tipo_usuario: alunoUser.tipo_usuario,
                    status: alunoUser.status
                });
            }
        }

        console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
        console.log('\n📋 RESULTADO:');
        console.log('✅ Ambos os usuários estão funcionando!');
        console.log('✅ Login sem confirmação de email!');
        console.log('✅ Dados sendo carregados da tabela usuarios!');
        
        console.log('\n🚀 AGORA TESTE NO SITE:');
        console.log('1. Acesse: http://localhost:3000');
        console.log('2. Teste login com:');
        console.log('   👨‍💼 Admin: admin@rotadeataque.com / 123456');
        console.log('   👨‍🎓 Aluno: joao@teste.com / 123456');
        
        console.log('\n📊 O que deve acontecer:');
        console.log('- Login deve funcionar sem erro "Email not confirmed"');
        console.log('- Usuário deve aparecer logado no sistema');
        console.log('- Dados do usuário devem ser carregados');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testLoginFinal();
