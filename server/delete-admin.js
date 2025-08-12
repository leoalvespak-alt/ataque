require('dotenv').config();
const { User } = require('./models');

async function deleteAdmin() {
  try {
    await User.destroy({
      where: {
        email: 'admin@example.com',
        tipo_usuario: 'gestor'
      }
    });
    console.log('✅ Usuário admin excluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao excluir usuário admin:', error);
  }
}

deleteAdmin();
