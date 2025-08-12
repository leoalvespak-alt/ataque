const bcrypt = require('bcrypt');
const { User } = require('../models');

async function seedAdmin() {
  try {
    // Verificar se já existe um admin
    const adminExists = await User.findOne({
      where: {
        email: 'admin@example.com',
        tipo_usuario: 'gestor'
      }
    });

    if (adminExists) {
      console.log('✓ Usuário admin já existe');
      return;
    }

    // Criar usuário admin
    const admin = await User.create({
      nome: 'Administrador',
      email: 'admin@example.com',
      senha: 'admin123', // Será hasheada automaticamente pelo hook
      tipo_usuario: 'gestor',
      status: 'gratuito',
      xp: 0,
      questoes_respondidas: 0,
      ativo: true
    });

    console.log('✅ Usuário admin criado com sucesso!');
    return admin;
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    throw error;
  }
}

module.exports = seedAdmin;
