const { User } = require('../models');

async function seedUsuarios() {
  try {
    console.log('👥 Criando usuários de exemplo...');

    // Verificar se já existem usuários
    const existingUsers = await User.count();
    if (existingUsers > 1) { // Mais de 1 porque já temos o admin
      console.log('✅ Usuários já existem, pulando criação...');
      return;
    }

    // Criar usuários de exemplo individualmente para executar os hooks
    const usuariosData = [
      {
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: '123456',
        tipo_usuario: 'aluno',
        status: 'gratuito',
        xp: 150,
        questoes_respondidas: 25,
        ativo: true
      },
      {
        nome: 'Maria Santos',
        email: 'maria@example.com',
        senha: '123456',
        tipo_usuario: 'aluno',
        status: 'premium',
        xp: 320,
        questoes_respondidas: 45,
        ativo: true
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@example.com',
        senha: '123456',
        tipo_usuario: 'aluno',
        status: 'gratuito',
        xp: 75,
        questoes_respondidas: 12,
        ativo: true
      },
      {
        nome: 'Ana Oliveira',
        email: 'ana@example.com',
        senha: '123456',
        tipo_usuario: 'aluno',
        status: 'premium',
        xp: 450,
        questoes_respondidas: 67,
        ativo: true
      },
      {
        nome: 'Carlos Ferreira',
        email: 'carlos@example.com',
        senha: '123456',
        tipo_usuario: 'aluno',
        status: 'gratuito',
        xp: 200,
        questoes_respondidas: 30,
        ativo: true
      }
    ];

    const usuarios = [];
    for (const userData of usuariosData) {
      const usuario = await User.create(userData);
      usuarios.push(usuario);
    }

    console.log('✅ Usuários de exemplo criados:', usuarios.length);
    console.log('📝 Credenciais dos usuários:');
    usuarios.forEach(user => {
      console.log(`   ${user.nome}: ${user.email} / 123456`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuários de exemplo:', error);
    throw error;
  }
}

module.exports = seedUsuarios;
