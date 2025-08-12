const { sequelize } = require('./config/database');
const { Patente } = require('./models');

async function fixDatabase() {
    try {
        console.log('Corrigindo banco de dados...');

        // Primeiro, criar apenas a tabela de patentes
        await Patente.sync({ force: true });
        console.log('Tabela de patentes criada');

        // Adicionar coluna patente_id manualmente
        try {
            await sequelize.query('ALTER TABLE usuarios ADD COLUMN patente_id INTEGER REFERENCES patentes(id)');
            console.log('Coluna patente_id adicionada');
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log('Coluna patente_id já existe');
            } else {
                throw error;
            }
        }

        // Criar patentes padrão
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
        console.log('Correção do banco concluída!');
    } catch (error) {
        console.error('Erro ao corrigir banco:', error);
    } finally {
        await sequelize.close();
    }
}

fixDatabase();
