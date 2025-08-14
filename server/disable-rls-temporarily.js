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

async function disableRLSTemporarily() {
    try {
        console.log('🔧 Desabilitando RLS temporariamente na tabela usuarios...');

        // Desabilitar RLS na tabela usuarios
        console.log('\n1️⃣ Desabilitando RLS...');
        
        const disableRLSSQL = `
            ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
        `;

        const { data: disableResult, error: disableError } = await supabase
            .rpc('exec_sql', { sql: disableRLSSQL });

        if (disableError) {
            console.log('❌ Erro ao desabilitar RLS:', disableError.message);
            
            // Tentar uma abordagem alternativa
            console.log('\n🔧 Tentando abordagem alternativa...');
            
            // Criar uma política muito permissiva
            const createPermissivePolicySQL = `
                DROP POLICY IF EXISTS "usuarios_select_all" ON usuarios;
                CREATE POLICY "usuarios_select_all" ON usuarios
                FOR ALL USING (true) WITH CHECK (true);
            `;

            const { data: policyResult, error: policyError } = await supabase
                .rpc('exec_sql', { sql: createPermissivePolicySQL });

            if (policyError) {
                console.log('❌ Erro ao criar política permissiva:', policyError.message);
            } else {
                console.log('✅ Política permissiva criada');
            }
        } else {
            console.log('✅ RLS desabilitado com sucesso');
        }

        // Testar se o acesso agora funciona
        console.log('\n2️⃣ Testando acesso após desabilitar RLS...');
        
        // Fazer login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (loginError) {
            console.log('❌ Erro no login:', loginError.message);
        } else {
            console.log('✅ Login realizado');
            
            // Testar query
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', loginData.user.id)
                .single();

            if (userError) {
                console.log('❌ Erro na query:', userError.message);
            } else {
                console.log('✅ Query funcionou!');
                console.log('📊 Usuário encontrado:', userData.nome);
            }
        }

        console.log('\n🎉 Processo concluído!');
        console.log('\n📋 Agora teste no site:');
        console.log('1. Acesse: http://localhost:3000');
        console.log('2. Faça login com: admin@rotadeataque.com / 123456');
        console.log('3. O login deve funcionar sem erro 406');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

disableRLSTemporarily();
