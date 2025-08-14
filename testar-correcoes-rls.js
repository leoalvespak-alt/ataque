const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarCorrecoesRLS() {
  console.log('=== TESTANDO CORREÇÕES RLS ===');
  
  try {
    // 1. Testar leitura da tabela usuarios
    console.log('1. Testando leitura da tabela usuarios...');
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo_usuario')
      .limit(5);
    
    if (usuariosError) {
      console.error('❌ Erro ao ler usuarios:', usuariosError);
    } else {
      console.log('✅ Usuários lidos com sucesso:', usuariosData.length, 'usuários encontrados');
      usuariosData.forEach(u => {
        console.log(`  - ${u.nome} (${u.email}) - ${u.tipo_usuario}`);
      });
    }
    
    // 2. Testar leitura da tabela notificacoes
    console.log('\n2. Testando leitura da tabela notificacoes...');
    const { data: notificacoesData, error: notificacoesError } = await supabase
      .from('notificacoes')
      .select('*')
      .limit(5);
    
    if (notificacoesError) {
      console.error('❌ Erro ao ler notificacoes:', notificacoesError);
    } else {
      console.log('✅ Notificações lidas com sucesso:', notificacoesData.length, 'notificações encontradas');
    }
    
    // 3. Testar inserção de notificação
    console.log('\n3. Testando inserção de notificação...');
    if (usuariosData && usuariosData.length > 0) {
      const usuarioTeste = usuariosData[0];
      const notificacaoTeste = {
        usuario_id: usuarioTeste.id,
        titulo: 'Teste de notificação',
        mensagem: 'Esta é uma notificação de teste para verificar se as políticas RLS estão funcionando.',
        tipo: 'GERAL',
        lida: false
      };
      
      const { data: notificacaoInserida, error: insertNotifError } = await supabase
        .from('notificacoes')
        .insert(notificacaoTeste)
        .select();
      
      if (insertNotifError) {
        console.error('❌ Erro ao inserir notificação:', insertNotifError);
      } else {
        console.log('✅ Notificação inserida com sucesso:', notificacaoInserida);
      }
    } else {
      console.log('⚠️  Nenhum usuário encontrado para testar inserção de notificação');
    }
    
    // 4. Testar leitura da tabela respostas_usuarios
    console.log('\n4. Testando leitura da tabela respostas_usuarios...');
    const { data: respostasData, error: respostasError } = await supabase
      .from('respostas_usuarios')
      .select('*')
      .limit(5);
    
    if (respostasError) {
      console.error('❌ Erro ao ler respostas_usuarios:', respostasError);
    } else {
      console.log('✅ Respostas lidas com sucesso:', respostasData.length, 'respostas encontradas');
    }
    
    // 5. Testar inserção de resposta
    console.log('\n5. Testando inserção de resposta...');
    if (usuariosData && usuariosData.length > 0) {
      const usuarioTeste = usuariosData[0];
      const respostaTeste = {
        usuario_id: usuarioTeste.id,
        questao_id: 2, // ID da questão existente
        alternativa_marcada: 'A',
        acertou: true,
        tempo_resposta: 30
      };
      
      const { data: respostaInserida, error: insertRespError } = await supabase
        .from('respostas_usuarios')
        .insert(respostaTeste)
        .select();
      
      if (insertRespError) {
        console.error('❌ Erro ao inserir resposta:', insertRespError);
      } else {
        console.log('✅ Resposta inserida com sucesso:', respostaInserida);
      }
    } else {
      console.log('⚠️  Nenhum usuário encontrado para testar inserção de resposta');
    }
    
    // 6. Testar atualização de usuário
    console.log('\n6. Testando atualização de usuário...');
    if (usuariosData && usuariosData.length > 0) {
      const usuarioTeste = usuariosData[0];
      const { data: usuarioAtualizado, error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          ultimo_login: new Date().toISOString(),
          questoes_respondidas: (usuarioTeste.questoes_respondidas || 0) + 1
        })
        .eq('id', usuarioTeste.id)
        .select('id, nome, ultimo_login, questoes_respondidas');
      
      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
      } else {
        console.log('✅ Usuário atualizado com sucesso:', usuarioAtualizado);
      }
    }
    
    console.log('\n=== RESUMO DOS TESTES ===');
    console.log('✅ Leitura de usuarios:', usuariosError ? 'FALHOU' : 'OK');
    console.log('✅ Leitura de notificacoes:', notificacoesError ? 'FALHOU' : 'OK');
    console.log('✅ Leitura de respostas:', respostasError ? 'FALHOU' : 'OK');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarCorrecoesRLS();
