const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCategorias() {
  try {
    console.log('🧪 Testando operações de categorias no Supabase...\n');

    // 1. Verificar se as tabelas existem
    console.log('1. Verificando existência das tabelas...');
    
    const { data: disciplinas, error: errorDisciplinas } = await supabase
      .from('disciplinas')
      .select('*')
      .limit(1);

    if (errorDisciplinas) {
      console.error('❌ Erro ao acessar tabela disciplinas:', errorDisciplinas);
    } else {
      console.log('✅ Tabela disciplinas acessível');
    }

    const { data: assuntos, error: errorAssuntos } = await supabase
      .from('assuntos')
      .select('*')
      .limit(1);

    if (errorAssuntos) {
      console.error('❌ Erro ao acessar tabela assuntos:', errorAssuntos);
    } else {
      console.log('✅ Tabela assuntos acessível');
    }

    // 2. Verificar políticas RLS
    console.log('\n2. Verificando políticas RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename IN ('disciplinas', 'assuntos')
          ORDER BY tablename, policyname;
        `
      });

    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError);
    } else {
      console.log('📋 Políticas encontradas:', policies);
    }

    // 3. Verificar se RLS está habilitado
    console.log('\n3. Verificando se RLS está habilitado...');
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables 
          WHERE tablename IN ('disciplinas', 'assuntos')
          ORDER BY tablename;
        `
      });

    if (rlsError) {
      console.error('❌ Erro ao verificar RLS:', rlsError);
    } else {
      console.log('🔒 Status RLS:', rlsStatus);
    }

    // 4. Testar inserção de disciplina
    console.log('\n4. Testando inserção de disciplina...');
    
    const disciplinaTeste = {
      nome: 'Disciplina Teste - ' + Date.now()
    };

    const { data: disciplinaInserida, error: errorInserir } = await supabase
      .from('disciplinas')
      .insert([disciplinaTeste])
      .select()
      .single();

    if (errorInserir) {
      console.error('❌ Erro ao inserir disciplina:', errorInserir);
      console.log('🔍 Detalhes do erro:', {
        code: errorInserir.code,
        message: errorInserir.message,
        details: errorInserir.details,
        hint: errorInserir.hint
      });
    } else {
      console.log('✅ Disciplina inserida:', disciplinaInserida);

      // 5. Testar atualização
      console.log('\n5. Testando atualização de disciplina...');
      
      const { data: disciplinaAtualizada, error: errorAtualizar } = await supabase
        .from('disciplinas')
        .update({ nome: 'Disciplina Atualizada - ' + Date.now() })
        .eq('id', disciplinaInserida.id)
        .select()
        .single();

      if (errorAtualizar) {
        console.error('❌ Erro ao atualizar disciplina:', errorAtualizar);
      } else {
        console.log('✅ Disciplina atualizada:', disciplinaAtualizada);
      }

      // 6. Testar exclusão
      console.log('\n6. Testando exclusão de disciplina...');
      
      const { error: errorDeletar } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', disciplinaInserida.id);

      if (errorDeletar) {
        console.error('❌ Erro ao deletar disciplina:', errorDeletar);
      } else {
        console.log('✅ Disciplina deletada com sucesso');
      }
    }

    // 7. Verificar tabela assinaturas_usuarios
    console.log('\n7. Verificando tabela assinaturas_usuarios...');
    
    const { data: assinaturas, error: errorAssinaturas } = await supabase
      .from('assinaturas_usuarios')
      .select('id')
      .eq('status', 'ativo')
      .limit(1);

    if (errorAssinaturas) {
      console.error('❌ Erro ao acessar assinaturas_usuarios:', errorAssinaturas);
      console.log('🔍 A tabela assinaturas_usuarios pode não existir ou ter nome diferente');
    } else {
      console.log('✅ Tabela assinaturas_usuarios acessível');
    }

    // 8. Listar todas as tabelas
    console.log('\n8. Listando todas as tabelas...');
    
    const { data: tabelas, error: errorTabelas } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name LIKE '%assinatura%'
          ORDER BY table_name;
        `
      });

    if (errorTabelas) {
      console.error('❌ Erro ao listar tabelas:', errorTabelas);
    } else {
      console.log('📋 Tabelas com "assinatura" no nome:', tabelas);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testarCategorias();
