const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminTable() {
    try {
        console.log('🔧 Corrigindo usuário admin na tabela...');

        // Primeiro, fazer login para obter o ID do usuário admin
        console.log('\n1️⃣ Fazendo login com admin...');
        
        const { data: adminLogin, error: adminError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (adminError) {
            console.log('❌ Erro no login admin:', adminError.message);
            return;
        }

        console.log('✅ Login admin realizado');
        console.log('👤 ID do admin:', adminLogin.user.id);

        // Verificar se o admin existe na tabela
        console.log('\n2️⃣ Verificando admin na tabela usuarios...');
        
        const { data: adminInTable, error: checkError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', 'admin@rotadeataque.com');

        if (checkError) {
            console.log('❌ Erro ao verificar admin na tabela:', checkError.message);
            return;
        }

        console.log(`📊 Admin encontrado na tabela: ${adminInTable.length} registros`);

        if (adminInTable.length === 0) {
            console.log('⚠️  Admin não encontrado na tabela. Criando...');
            
            const { data: newAdmin, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    id: adminLogin.user.id,
                    nome: 'Administrador',
                    email: 'admin@rotadeataque.com',
                    tipo_usuario: 'gestor',
                    status: 'ativo',
                    xp: 0,
                    questoes_respondidas: 0
                })
                .select()
                .single();

            if (insertError) {
                console.log('❌ Erro ao inserir admin:', insertError.message);
            } else {
                console.log('✅ Admin criado na tabela:', newAdmin);
            }
        } else {
            console.log('✅ Admin já existe na tabela');
            
            // Verificar se o ID está correto
            const adminRecord = adminInTable[0];
            if (adminRecord.id !== adminLogin.user.id) {
                console.log('⚠️  ID do admin na tabela não corresponde ao ID do Auth');
                console.log('🔄 Atualizando ID do admin...');
                
                const { data: updatedAdmin, error: updateError } = await supabase
                    .from('usuarios')
                    .update({ id: adminLogin.user.id })
                    .eq('email', 'admin@rotadeataque.com')
                    .select()
                    .single();

                if (updateError) {
                    console.log('❌ Erro ao atualizar admin:', updateError.message);
                } else {
                    console.log('✅ Admin atualizado:', updatedAdmin);
                }
            } else {
                console.log('✅ ID do admin está correto');
            }
        }

        // Testar busca do admin
        console.log('\n3️⃣ Testando busca do admin...');
        
        const { data: testAdmin, error: testError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', adminLogin.user.id)
            .single();

        if (testError) {
            console.log('❌ Erro ao buscar admin:', testError.message);
        } else {
            console.log('✅ Admin encontrado:', {
                nome: testAdmin.nome,
                tipo_usuario: testAdmin.tipo_usuario,
                status: testAdmin.status
            });
        }

        console.log('\n🎉 Correção concluída!');
        console.log('\n📋 Agora teste no site:');
        console.log('1. Acesse: http://localhost:3000');
        console.log('2. Faça login com: admin@rotadeataque.com / 123456');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

fixAdminTable();
