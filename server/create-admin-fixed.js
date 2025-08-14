require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');
const { sequelize } = require('./config/database');

async function createFixedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco estabelecida.');

        // Verificar se já existe o admin específico
        const existingAdmin = await User.findOne({
            where: { email: 'admin@rotadeataque.com' }
        });

        if (existingAdmin) {
            console.log('Admin já existe:', existingAdmin.email);
            // Atualizar senha se necessário
            const senhaValida = await bcrypt.compare('123456', existingAdmin.hash_senha);
            if (!senhaValida) {
                const hashedPassword = await bcrypt.hash('123456', 12);
                await existingAdmin.update({ hash_senha: hashedPassword });
                console.log('Senha do admin atualizada para: 123456');
            }
            return;
        }

        // Criar admin com as credenciais especificadas
        const hashedPassword = await bcrypt.hash('123456', 12);
        
        const admin = await User.create({
            nome: 'Administrador',
            email: 'admin@rotadeataque.com',
            senha: '123456', // Será hasheada automaticamente pelo hook
            tipo_usuario: 'gestor',
            status: 'premium',
            ativo: true,
            xp: 0,
            questoes_respondidas: 0
        });

        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Senha: 123456');
        console.log('👤 Tipo de usuário:', admin.tipo_usuario);
        console.log('📊 Status:', admin.status);

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        await sequelize.close();
    }
}

createFixedAdmin();
