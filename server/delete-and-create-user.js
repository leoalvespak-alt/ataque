const { User } = require('./models');

async function deleteAndCreateUser() {
    try {
        console.log('Deletando usuário existente...');
        
        // Deletar usuário existente
        await User.destroy({
            where: { email: 'aluno@teste.com' }
        });
        
        console.log('Usuário deletado');

        // Criar usuário novo (usando o campo virtual senha)
        const user = await User.create({
            nome: 'Aluno Teste',
            email: 'aluno@teste.com',
            senha: '123456', // Campo virtual que será convertido para hash_senha
            tipo_usuario: 'aluno',
            xp: 0
        });

        console.log('Usuário aluno criado com sucesso:', user.id);
        
        // Testar se o login funciona
        const senhaCorreta = await user.verificarSenha('123456');
        console.log('Login funciona?', senhaCorreta);
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

deleteAndCreateUser();
