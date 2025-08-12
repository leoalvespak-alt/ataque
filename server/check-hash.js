require('dotenv').config();
const { User } = require('./models');
const bcrypt = require('bcrypt');

async function checkHash() {
  try {
    const user = await User.findOne({
      where: {
        email: 'admin@example.com',
        tipo_usuario: 'gestor'
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('Hash armazenado:', user.hash_senha);
    
    const senha = 'admin123';
    console.log('Senha fornecida:', senha);
    
    const senhaValida = await bcrypt.compare(senha, user.hash_senha);
    console.log('Senha válida?', senhaValida);

    // Gerar novo hash para comparação
    const novoHash = await bcrypt.hash(senha, 12);
    console.log('Novo hash gerado:', novoHash);
    console.log('Hashes iguais?', novoHash === user.hash_senha);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkHash();
