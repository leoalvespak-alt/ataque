const { User } = require('./models');
const bcrypt = require('bcrypt');

async function testLogin() {
    try {
        console.log('Verificando usuários existentes...');
        
        const users = await User.findAll({
            attributes: ['id', 'nome', 'email', 'tipo_usuario', 'xp']
        });
        
        console.log('Usuários encontrados:');
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Nome: ${user.nome}, Email: ${user.email}, Tipo: ${user.tipo_usuario}, XP: ${user.xp}`);
        });

        // Testar login com o usuário aluno
        console.log('\nTestando login...');
        const user = await User.findOne({
            where: { email: 'aluno@teste.com' }
        });

        if (!user) {
            console.log('Usuário não encontrado');
            return;
        }

        const senhaCorreta = await user.verificarSenha('123456');
        console.log('Senha correta?', senhaCorreta);

        if (senhaCorreta) {
            console.log('Login funcionando!');
            console.log('Hash da senha no banco:', user.hash_senha);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

testLogin();
