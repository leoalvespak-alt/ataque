const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarAutenticacao() {
  try {
    console.log('🔍 Verificando autenticação e permissões...\n');

    // 1. Verificar se há sessão ativa
    console.log('1. Verificando sessão ativa...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao verificar sessão:', sessionError);
    } else if (!session) {
      console.log('⚠️ Nenhuma sessão ativa encontrada');
      console.log('💡 O usuário precisa estar logado para acessar as categorias');
    } else {
      console.log('✅ Sessão ativa encontrada');
      console.log('👤 User ID:', session.user.id);
      console.log('📧 Email:', session.user.email);
    }

    // 2. Verificar se o usuário existe na tabela usuarios
    if (session) {
      console.log('\n2. Verificando dados do usuário na tabela usuarios...');
      
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (usuarioError) {
        console.error('❌ Erro ao buscar usuário:', usuarioError);
        console.log('💡 O usuário pode não existir na tabela usuarios');
      } else {
        console.log('✅ Usuário encontrado na tabela usuarios');
        console.log('👤 Dados do usuário:', {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          status: usuario.status
        });

        // 3. Verificar se é gestor
        if (usuario.tipo_usuario === 'gestor') {
          console.log('✅ Usuário é gestor - tem permissão para gerenciar categorias');
        } else {
          console.log('❌ Usuário não é gestor - não tem permissão para gerenciar categorias');
          console.log('💡 O tipo_usuario deve ser "gestor" para acessar o admin');
        }
      }
    }

    // 4. Testar operação de leitura (deve funcionar para todos autenticados)
    console.log('\n3. Testando operação de leitura...');
    
    const { data: disciplinas, error: readError } = await supabase
      .from('disciplinas')
      .select('*')
      .limit(5);

    if (readError) {
      console.error('❌ Erro ao ler disciplinas:', readError);
      console.log('🔍 Detalhes do erro:', {
        code: readError.code,
        message: readError.message,
        details: readError.details,
        hint: readError.hint
      });
    } else {
      console.log('✅ Operação de leitura funcionou');
      console.log('📋 Disciplinas encontradas:', disciplinas?.length || 0);
    }

    // 5. Testar operação de escrita (só deve funcionar para gestores)
    console.log('\n4. Testando operação de escrita...');
    
    const disciplinaTeste = {
      nome: 'Teste Escrita - ' + Date.now()
    };

    const { data: disciplinaInserida, error: writeError } = await supabase
      .from('disciplinas')
      .insert([disciplinaTeste])
      .select()
      .single();

    if (writeError) {
      console.error('❌ Erro ao inserir disciplina:', writeError);
      console.log('🔍 Detalhes do erro:', {
        code: writeError.code,
        message: writeError.message,
        details: writeError.details,
        hint: writeError.hint
      });
      
      if (writeError.code === '42501') {
        console.log('💡 Erro 42501 = Permissão negada - Políticas RLS estão bloqueando');
      } else if (writeError.code === '23505') {
        console.log('💡 Erro 23505 = Violação de chave única - Disciplina já existe');
      }
    } else {
      console.log('✅ Operação de escrita funcionou');
      console.log('📝 Disciplina inserida:', disciplinaInserida);

      // Limpar o teste
      const { error: deleteError } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', disciplinaInserida.id);

      if (deleteError) {
        console.error('⚠️ Erro ao limpar teste:', deleteError);
      } else {
        console.log('🧹 Teste limpo com sucesso');
      }
    }

    // 6. Verificar políticas RLS
    console.log('\n5. Verificando políticas RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tablename,
            policyname,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'disciplinas'
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError);
    } else {
      console.log('📋 Políticas encontradas para disciplinas:', policies?.length || 0);
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`  - ${policy.policyname}: ${policy.cmd}`);
        });
      } else {
        console.log('⚠️ Nenhuma política encontrada - RLS pode estar desabilitado');
      }
    }

    // 7. Verificar se RLS está habilitado
    console.log('\n6. Verificando se RLS está habilitado...');
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename = 'disciplinas';
        `
      });

    if (rlsError) {
      console.error('❌ Erro ao verificar RLS:', rlsError);
    } else {
      console.log('🔒 Status RLS para disciplinas:', rlsStatus);
      if (rlsStatus && rlsStatus.length > 0) {
        const status = rlsStatus[0].rowsecurity;
        console.log(`  - RLS habilitado: ${status}`);
        if (!status) {
          console.log('💡 RLS está desabilitado - todas as operações devem funcionar');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar a verificação
verificarAutenticacao();
