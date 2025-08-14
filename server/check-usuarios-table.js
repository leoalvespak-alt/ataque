const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsuariosTable() {
    try {
        console.log('🔍 Verificando estrutura da tabela usuarios...');

        // Verificar se a tabela existe
        console.log('\n1️⃣ Verificando se a tabela usuarios existe...');
        
        const { data: tableInfo, error: tableError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Erro ao acessar tabela usuarios:', tableError.message);
            return;
        }

        console.log('✅ Tabela usuarios existe!');

        // Verificar estrutura da tabela
        console.log('\n2️⃣ Verificando estrutura da tabela...');
        
        const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'usuarios' });

        if (columnsError) {
            console.log('⚠️  Não foi possível obter informações das colunas automaticamente');
            console.log('📋 Vamos verificar manualmente...');
            
            // Tentar inserir um registro temporário para ver a estrutura
            const { data: sampleData, error: sampleError } = await supabase
                .from('usuarios')
                .select('*')
                .limit(1);

            if (sampleData && sampleData.length > 0) {
                console.log('📊 Estrutura da tabela (baseada em dados existentes):');
                const sample = sampleData[0];
                Object.keys(sample).forEach(key => {
                    console.log(`   - ${key}: ${typeof sample[key]}`);
                });
            }
        } else {
            console.log('📊 Estrutura da tabela:');
            columns.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
        }

        // Verificar dados existentes
        console.log('\n3️⃣ Verificando dados existentes...');
        
        const { data: users, error: usersError } = await supabase
            .from('usuarios')
            .select('*');

        if (usersError) {
            console.error('❌ Erro ao buscar usuários:', usersError.message);
        } else {
            console.log(`📊 Total de usuários na tabela: ${users.length}`);
            
            if (users.length > 0) {
                console.log('👥 Usuários encontrados:');
                users.forEach(user => {
                    console.log(`   - ${user.email} (${user.tipo_usuario}) - Status: ${user.status}`);
                });
            } else {
                console.log('⚠️  Nenhum usuário encontrado na tabela');
            }
        }

        // Verificar se há campo de senha
        console.log('\n4️⃣ Verificando campo de senha...');
        
        const { data: testUser, error: testError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1)
            .single();

        if (testUser) {
            const hasPassword = 'senha' in testUser || 'password' in testUser || 'hash_senha' in testUser;
            console.log(`🔐 Campo de senha encontrado: ${hasPassword ? 'Sim' : 'Não'}`);
            
            if (hasPassword) {
                const passwordField = Object.keys(testUser).find(key => 
                    key.includes('senha') || key.includes('password') || key.includes('hash')
                );
                console.log(`   Campo: ${passwordField}`);
            }
        }

        console.log('\n🎉 Verificação concluída!');
        console.log('\n📋 Observações:');
        console.log('- A tabela usuarios não deve ter campo de senha (senhas ficam no Supabase Auth)');
        console.log('- O campo de senha é gerenciado automaticamente pelo Supabase Auth');
        console.log('- O problema principal é a confirmação de email');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkUsuariosTable();
