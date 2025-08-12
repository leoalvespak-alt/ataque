const { Questao, Disciplina, Assunto, Banca, Orgao } = require('./models');

async function checkQuestions() {
    try {
        console.log('Verificando questões no banco...');
        
        const questoes = await Questao.findAll();
        
        console.log(`Encontradas ${questoes.length} questões`);
        
        if (questoes.length === 0) {
            console.log('Nenhuma questão encontrada. Criando questões de teste...');
            await createTestQuestions();
        } else {
            console.log('Questões existentes:');
            questoes.forEach((q, i) => {
                console.log(`${i + 1}. ${q.enunciado.substring(0, 50)}...`);
            });
        }
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function createTestQuestions() {
    try {
        // Verificar se já existem disciplinas, assuntos, etc.
        let disciplina = await Disciplina.findOne({ where: { nome: 'Matemática' } });
        if (!disciplina) {
            disciplina = await Disciplina.create({
                nome: 'Matemática',
                descricao: 'Matemática básica'
            });
        }
        
        let assunto = await Assunto.findOne({ where: { nome: 'Álgebra' } });
        if (!assunto) {
            assunto = await Assunto.create({
                nome: 'Álgebra',
                descricao: 'Álgebra básica',
                disciplina_id: disciplina.id
            });
        }
        
        let banca = await Banca.findOne({ where: { nome: 'CESPE' } });
        if (!banca) {
            banca = await Banca.create({
                nome: 'CESPE',
                descricao: 'Centro de Seleção e de Promoção de Eventos'
            });
        }
        
        let orgao = await Orgao.findOne({ where: { nome: 'UNB' } });
        if (!orgao) {
            orgao = await Orgao.create({
                nome: 'UNB',
                descricao: 'Universidade de Brasília'
            });
        }
        
        // Criar questões de teste
        const questoes = [
            {
                enunciado: 'Qual é o resultado de 2 + 2?',
                alternativa_a: '3',
                alternativa_b: '4',
                alternativa_c: '5',
                alternativa_d: '6',
                gabarito: 'B',
                disciplina_id: disciplina.id,
                assunto_id: assunto.id,
                banca_id: banca.id,
                orgao_id: orgao.id,
                ano: 2023
            },
            {
                enunciado: 'Qual é o resultado de 5 x 5?',
                alternativa_a: '20',
                alternativa_b: '25',
                alternativa_c: '30',
                alternativa_d: '35',
                gabarito: 'B',
                disciplina_id: disciplina.id,
                assunto_id: assunto.id,
                banca_id: banca.id,
                orgao_id: orgao.id,
                ano: 2023
            },
            {
                enunciado: 'Qual é o resultado de 10 ÷ 2?',
                alternativa_a: '3',
                alternativa_b: '4',
                alternativa_c: '5',
                alternativa_d: '6',
                gabarito: 'C',
                disciplina_id: disciplina.id,
                assunto_id: assunto.id,
                banca_id: banca.id,
                orgao_id: orgao.id,
                ano: 2023
            }
        ];
        
        for (const questaoData of questoes) {
            await Questao.create(questaoData);
        }
        
        console.log('Questões de teste criadas com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar questões de teste:', error);
    }
}

checkQuestions();
