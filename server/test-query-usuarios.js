const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueryUsuarios() {
    try {
        console.log('🧪 Testando queries da tabela usuarios...');

        // Primeiro, fazer login para obter o token
        console.log('\n1️⃣ Fazendo login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (loginError) {
            console.log('❌ Erro no login:', loginError.message);
            return;
        }

        console.log('✅ Login realizado');
        console.log('👤 ID do usuário:', loginData.user.id);

        // Testar query simples primeiro
        console.log('\n2️⃣ Testando query simples...');
        
        const { data: simpleQuery, error: simpleError } = await supabase
            .from('usuarios')
            .select('*');

        if (simpleError) {
            console.log('❌ Erro na query simples:', simpleError.message);
            console.log('📊 Código do erro:', simpleError.code);
        } else {
            console.log('✅ Query simples funcionou');
            console.log(`📊 Total de usuários: ${simpleQuery.length}`);
        }

        // Testar query com filtro por email
        console.log('\n3️⃣ Testando query com filtro por email...');
        
        const { data: emailQuery, error: emailError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', 'admin@rotadeataque.com');

        if (emailError) {
            console.log('❌ Erro na query por email:', emailError.message);
        } else {
            console.log('✅ Query por email funcionou');
            console.log('📊 Usuário encontrado:', emailQuery[0]?.nome);
        }

        // Testar query com filtro por ID (a que está falhando)
        console.log('\n4️⃣ Testando query com filtro por ID...');
        
        const { data: idQuery, error: idError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', loginData.user.id);

        if (idError) {
            console.log('❌ Erro na query por ID:', idError.message);
            console.log('📊 Código do erro:', idError.code);
            console.log('🔍 Detalhes do erro:', idError.details);
        } else {
            console.log('✅ Query por ID funcionou');
            console.log('📊 Usuário encontrado:', idQuery[0]?.nome);
        }

        // Testar query com single()
        console.log('\n5️⃣ Testando query com single()...');
        
        const { data: singleQuery, error: singleError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', loginData.user.id)
            .single();

        if (singleError) {
            console.log('❌ Erro na query single:', singleError.message);
            console.log('📊 Código do erro:', singleError.code);
        } else {
            console.log('✅ Query single funcionou');
            console.log('📊 Usuário:', singleQuery.nome);
        }

        // Verificar se o ID existe na tabela
        console.log('\n6️⃣ Verificando se o ID existe na tabela...');
        
        const { data: allUsers, error: allError } = await supabase
            .from('usuarios')
            .select('id, email, nome');

        if (allError) {
            console.log('❌ Erro ao buscar todos os usuários:', allError.message);
        } else {
            console.log('📊 Usuários na tabela:');
            allUsers.forEach(user => {
                console.log(`   - ${user.email} (ID: ${user.id})`);
            });
            
            const userExists = allUsers.find(u => u.id === loginData.user.id);
            if (userExists) {
                console.log('✅ ID do usuário logado existe na tabela');
            } else {
                console.log('❌ ID do usuário logado NÃO existe na tabela');
            }
        }

        console.log('\n🎉 Teste concluído!');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

testQueryUsuarios();
