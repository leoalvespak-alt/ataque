const { sequelize } = require('./config/database');
const { Patente } = require('./models');

async function updateDatabase() {
    try {
        console.log('Atualizando banco de dados...');

        // Sincronizar modelos (isso vai criar as tabelas/colunas que faltam)
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado');

        // Criar patentes padrão se não existirem
        const patentesExistentes = await Patente.count();
        
        if (patentesExistentes === 0) {
            console.log('Criando patentes padrão...');
            
            const patentes = [
                { nome: 'Iniciante', descricao: 'Primeiros passos', xp_necessario: 0, icone: '🌟', cor: '#6c757d' },
                { nome: 'Estudante', descricao: 'Aprendendo', xp_necessario: 50, icone: '📚', cor: '#28a745' },
                { nome: 'Aplicado', descricao: 'Dedicado aos estudos', xp_necessario: 150, icone: '🎯', cor: '#007bff' },
                { nome: 'Esforçado', descricao: 'Muito dedicado', xp_necessario: 300, icone: '🔥', cor: '#fd7e14' },
                { nome: 'Destacado', descricao: 'Excelente desempenho', xp_necessario: 500, icone: '⭐', cor: '#ffc107' },
                { nome: 'Mestre', descricao: 'Domínio da matéria', xp_necessario: 1000, icone: '👑', cor: '#dc3545' },
                { nome: 'Lenda', descricao: 'Lendário', xp_necessario: 2000, icone: '💎', cor: '#6f42c1' }
            ];

            for (const patente of patentes) {
                await Patente.create(patente);
            }
            
            console.log('Patentes padrão criadas');
        } else {
            console.log('Patentes já existem');
        }

        console.log('Atualização do banco concluída!');
    } catch (error) {
        console.error('Erro ao atualizar banco:', error);
    } finally {
        await sequelize.close();
    }
}

updateDatabase();
