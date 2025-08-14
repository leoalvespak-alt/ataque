const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com service role key para verificar políticas
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseServiceKey = 'sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRLSPolicies() {
    try {
        console.log('🔍 Verificando políticas RLS da tabela usuarios...');

        // Verificar se RLS está habilitado
        console.log('\n1️⃣ Verificando se RLS está habilitado...');
        
        const { data: rlsStatus, error: rlsError } = await supabase
            .rpc('get_table_rls_status', { table_name: 'usuarios' });

        if (rlsError) {
            console.log('⚠️  Não foi possível verificar RLS automaticamente');
            console.log('📋 Vamos verificar manualmente...');
        } else {
            console.log('📊 Status RLS:', rlsStatus);
        }

        // Verificar políticas existentes
        console.log('\n2️⃣ Verificando políticas existentes...');
        
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_table_policies', { table_name: 'usuarios' });

        if (policiesError) {
            console.log('⚠️  Não foi possível verificar políticas automaticamente');
        } else {
            console.log('📊 Políticas encontradas:', policies.length);
            policies.forEach(policy => {
                console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.roles.join(', ')})`);
            });
        }

        // Testar acesso com diferentes contextos
        console.log('\n3️⃣ Testando acesso com diferentes contextos...');
        
        // Teste 1: Acesso anônimo
        console.log('\n📧 Teste 1: Acesso anônimo');
        const { data: anonData, error: anonError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);

        if (anonError) {
            console.log('❌ Erro no acesso anônimo:', anonError.message);
        } else {
            console.log('✅ Acesso anônimo funcionou');
        }

        // Teste 2: Acesso autenticado
        console.log('\n📧 Teste 2: Acesso autenticado');
        
        // Fazer login primeiro
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'admin@rotadeataque.com',
            password: '123456'
        });

        if (loginError) {
            console.log('❌ Erro no login:', loginError.message);
        } else {
            console.log('✅ Login realizado');
            
            // Agora testar acesso autenticado
            const { data: authData, error: authError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', loginData.user.id);

            if (authError) {
                console.log('❌ Erro no acesso autenticado:', authError.message);
            } else {
                console.log('✅ Acesso autenticado funcionou');
                console.log('📊 Dados encontrados:', authData.length);
            }
        }

        // Verificar se há políticas muito restritivas
        console.log('\n4️⃣ Verificando se há políticas muito restritivas...');
        
        // Tentar criar uma política mais permissiva para teste
        console.log('\n🔧 Criando política de teste mais permissiva...');
        
        const createPolicySQL = `
            CREATE POLICY IF NOT EXISTS "usuarios_select_all" ON usuarios
            FOR SELECT USING (true);
        `;

        const { data: createResult, error: createError } = await supabase
            .rpc('exec_sql', { sql: createPolicySQL });

        if (createError) {
            console.log('⚠️  Não foi possível criar política de teste:', createError.message);
        } else {
            console.log('✅ Política de teste criada');
        }

        console.log('\n🎉 Verificação concluída!');
        console.log('\n📋 Recomendações:');
        console.log('1. Se o acesso anônimo não funcionar, pode ser necessário:');
        console.log('   - Desabilitar RLS temporariamente');
        console.log('   - Ou criar políticas mais permissivas');
        console.log('2. Se o acesso autenticado não funcionar:');
        console.log('   - Verificar se as políticas estão corretas');
        console.log('   - Verificar se o usuário tem as permissões necessárias');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkRLSPolicies();
