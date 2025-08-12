const { User } = require('./models');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        console.log('Criando usuário aluno de teste...');
        
        // Verificar se já existe
        const existingUser = await User.findOne({
            where: { email: 'aluno@teste.com' }
        });

        if (existingUser) {
            console.log('Usuário aluno@teste.com já existe');
            return;
        }

        // Criar hash da senha
        const hashedPassword = await bcrypt.hash('123456', 10);

        // Criar usuário
        const user = await User.create({
            nome: 'Aluno Teste',
            email: 'aluno@teste.com',
            hash_senha: hashedPassword,
            tipo_usuario: 'aluno',
            xp: 0
        });

        console.log('Usuário aluno criado com sucesso:', user.id);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
    }
}

createTestUser();
