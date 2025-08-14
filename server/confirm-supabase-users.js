const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com service role key
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseServiceKey = 'sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmSupabaseUsers() {
    try {
        console.log('🔄 Confirmando usuários no Supabase...');

        // Lista de emails para confirmar
        const emails = [
            'admin@rotadeataque.com',
            'joao@teste.com'
        ];

        for (const email of emails) {
            console.log(`\n📧 Confirmando usuário: ${email}`);
            
            try {
                // Buscar usuário pelo email
                const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
                
                if (searchError) {
                    console.error(`❌ Erro ao buscar usuários:`, searchError.message);
                    continue;
                }

                // Encontrar o usuário pelo email
                const user = users.users.find(u => u.email === email);
                
                if (!user) {
                    console.log(`⚠️  Usuário ${email} não encontrado`);
                    continue;
                }

                console.log(`👤 Usuário encontrado: ${user.email} (ID: ${user.id})`);
                console.log(`📊 Status atual: ${user.email_confirmed_at ? 'Confirmado' : 'Não confirmado'}`);

                // Confirmar o usuário se não estiver confirmado
                if (!user.email_confirmed_at) {
                    const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
                        user.id,
                        { email_confirm: true }
                    );

                    if (confirmError) {
                        console.error(`❌ Erro ao confirmar ${email}:`, confirmError.message);
                    } else {
                        console.log(`✅ Usuário ${email} confirmado com sucesso!`);
                    }
                } else {
                    console.log(`✅ Usuário ${email} já estava confirmado`);
                }

            } catch (error) {
                console.error(`❌ Erro ao processar ${email}:`, error.message);
            }
        }

        console.log('\n🎉 Processo de confirmação concluído!');
        console.log('\n📋 Agora você pode fazer login com:');
        console.log('👨‍💼 Admin: admin@rotadeataque.com / 123456');
        console.log('👨‍🎓 Aluno: joao@teste.com / 123456');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

confirmSupabaseUsers();
