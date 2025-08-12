require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');
const { sequelize } = require('./config/database');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco estabelecida.');

        // Verificar se já existe um gestor
        const existingGestor = await User.findOne({
            where: { tipo_usuario: 'gestor' }
        });

        if (existingGestor) {
            console.log('Gestor já existe:', existingGestor.email);
            return;
        }

        // Criar gestor
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const gestor = await User.create({
            nome: 'Administrador',
            email: 'admin@rotaquestoes.com',
            senha: hashedPassword,
            tipo_usuario: 'gestor',
            status: 'ativo',
            ativo: true,
            xp: 0,
            questoes_respondidas: 0
        });

        console.log('Gestor criado com sucesso!');
        console.log('Email:', gestor.email);
        console.log('Senha: admin123');
        console.log('Tipo de usuário:', gestor.tipo_usuario);

    } catch (error) {
        console.error('Erro ao criar gestor:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
