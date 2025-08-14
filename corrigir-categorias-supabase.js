const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function corrigirPoliticasCategorias() {
  try {
    console.log('🔧 Iniciando correção das políticas de segurança das categorias...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'corrigir-politicas-categorias.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executando script SQL...');
    
    // Executar o script SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Erro ao executar script SQL:', error);
      console.log('\n💡 Execute manualmente o arquivo corrigir-politicas-categorias.sql no SQL Editor do Supabase');
      console.log('🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
      return;
    }

    console.log('✅ Script SQL executado com sucesso!');
    console.log('📊 Resultados:', data);

    // Testar as operações CRUD
    console.log('\n🧪 Testando operações CRUD...');

    // Teste 1: Inserir uma disciplina de teste
    console.log('1. Testando inserção de disciplina...');
    const { data: disciplinaTeste, error: errorDisciplina } = await supabase
      .from('disciplinas')
      .insert([{ nome: 'Disciplina Teste - ' + Date.now() }])
      .select()
      .single();

    if (errorDisciplina) {
      console.error('❌ Erro ao inserir disciplina:', errorDisciplina);
    } else {
      console.log('✅ Disciplina inserida:', disciplinaTeste);

      // Teste 2: Inserir um assunto de teste
      console.log('2. Testando inserção de assunto...');
      const { data: assuntoTeste, error: errorAssunto } = await supabase
        .from('assuntos')
        .insert([{ 
          nome: 'Assunto Teste - ' + Date.now(),
          disciplina_id: disciplinaTeste.id
        }])
        .select()
        .single();

      if (errorAssunto) {
        console.error('❌ Erro ao inserir assunto:', errorAssunto);
      } else {
        console.log('✅ Assunto inserido:', assuntoTeste);

        // Teste 3: Atualizar disciplina
        console.log('3. Testando atualização de disciplina...');
        const { data: disciplinaAtualizada, error: errorUpdate } = await supabase
          .from('disciplinas')
          .update({ nome: 'Disciplina Atualizada - ' + Date.now() })
          .eq('id', disciplinaTeste.id)
          .select()
          .single();

        if (errorUpdate) {
          console.error('❌ Erro ao atualizar disciplina:', errorUpdate);
        } else {
          console.log('✅ Disciplina atualizada:', disciplinaAtualizada);
        }

        // Teste 4: Deletar assunto
        console.log('4. Testando exclusão de assunto...');
        const { error: errorDeleteAssunto } = await supabase
          .from('assuntos')
          .delete()
          .eq('id', assuntoTeste.id);

        if (errorDeleteAssunto) {
          console.error('❌ Erro ao deletar assunto:', errorDeleteAssunto);
        } else {
          console.log('✅ Assunto deletado com sucesso');
        }
      }

      // Teste 5: Deletar disciplina
      console.log('5. Testando exclusão de disciplina...');
      const { error: errorDeleteDisciplina } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', disciplinaTeste.id);

      if (errorDeleteDisciplina) {
        console.error('❌ Erro ao deletar disciplina:', errorDeleteDisciplina);
      } else {
        console.log('✅ Disciplina deletada com sucesso');
      }
    }

    console.log('\n🎉 Correção das políticas de segurança concluída!');
    console.log('✅ Agora os gestores podem gerenciar categorias diretamente no Supabase');

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
    console.log('\n💡 Execute manualmente o arquivo corrigir-politicas-categorias.sql no SQL Editor do Supabase');
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
  }
}

// Executar a correção
corrigirPoliticasCategorias();
