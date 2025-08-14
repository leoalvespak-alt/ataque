const { Disciplina, Assunto, Banca, Orgao, Questao } = require('./server/models');

async function testQuestoesCreation() {
    try {
        console.log('=== TESTE DE CRIAÇÃO DE QUESTÕES ===\n');

        // 1. Verificar se as entidades base existem
        console.log('1. Verificando entidades base...');
        
        const disciplinas = await Disciplina.findAll();
        console.log(`   - Disciplinas encontradas: ${disciplinas.length}`);
        disciplinas.forEach(d => console.log(`     * ${d.id}: ${d.nome}`));

        const assuntos = await Assunto.findAll();
        console.log(`   - Assuntos encontrados: ${assuntos.length}`);
        assuntos.forEach(a => console.log(`     * ${a.id}: ${a.nome} (Disciplina: ${a.disciplina_id})`));

        const bancas = await Banca.findAll();
        console.log(`   - Bancas encontradas: ${bancas.length}`);
        bancas.forEach(b => console.log(`     * ${b.id}: ${b.nome}`));

        const orgaos = await Orgao.findAll();
        console.log(`   - Órgãos encontrados: ${orgaos.length}`);
        orgaos.forEach(o => console.log(`     * ${o.id}: ${o.nome}`));

        // 2. Verificar se há dados suficientes para criar uma questão
        if (disciplinas.length === 0 || assuntos.length === 0 || bancas.length === 0 || orgaos.length === 0) {
            console.log('\n❌ ERRO: Não há dados suficientes para criar questões!');
            console.log('   Execute o script de correção primeiro.');
            return;
        }

        // 3. Tentar criar uma questão de teste
        console.log('\n2. Tentando criar uma questão de teste...');
        
        const questaoTeste = {
            enunciado: 'Questão de teste para verificar se a criação está funcionando.',
            alternativa_a: 'Alternativa A',
            alternativa_b: 'Alternativa B',
            alternativa_c: 'Alternativa C',
            alternativa_d: 'Alternativa D',
            alternativa_e: null,
            gabarito: 'A',
            tipo: 'MULTIPLA_ESCOLHA',
            ano: 2024,
            disciplina_id: disciplinas[0].id,
            assunto_id: assuntos[0].id,
            banca_id: bancas[0].id,
            orgao_id: orgaos[0].id,
            comentario_professor: 'Comentário de teste'
        };

        console.log('   Dados da questão:');
        console.log(`   - Disciplina ID: ${questaoTeste.disciplina_id}`);
        console.log(`   - Assunto ID: ${questaoTeste.assunto_id}`);
        console.log(`   - Banca ID: ${questaoTeste.banca_id}`);
        console.log(`   - Órgão ID: ${questaoTeste.orgao_id}`);

        const questao = await Questao.create(questaoTeste);
        console.log(`   ✅ Questão criada com sucesso! ID: ${questao.id}`);

        // 4. Verificar se a questão foi criada corretamente
        console.log('\n3. Verificando questão criada...');
        const questaoCriada = await Questao.findByPk(questao.id, {
            include: [
                { model: Disciplina, as: 'disciplina' },
                { model: Assunto, as: 'assunto' },
                { model: Banca, as: 'banca' },
                { model: Orgao, as: 'orgao' }
            ]
        });

        console.log(`   - ID: ${questaoCriada.id}`);
        console.log(`   - Enunciado: ${questaoCriada.enunciado.substring(0, 50)}...`);
        console.log(`   - Disciplina: ${questaoCriada.disciplina?.nome}`);
        console.log(`   - Assunto: ${questaoCriada.assunto?.nome}`);
        console.log(`   - Banca: ${questaoCriada.banca?.nome}`);
        console.log(`   - Órgão: ${questaoCriada.orgao?.nome}`);
        console.log(`   - Gabarito: ${questaoCriada.gabarito}`);
        console.log(`   - Ano: ${questaoCriada.ano}`);

        // 5. Limpar questão de teste
        console.log('\n4. Removendo questão de teste...');
        await questao.destroy();
        console.log('   ✅ Questão de teste removida.');

        console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
        console.log('   A criação de questões está funcionando corretamente.');

    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.name === 'SequelizeValidationError') {
            console.log('\nDetalhes dos erros de validação:');
            error.errors.forEach(err => {
                console.log(`   - ${err.path}: ${err.message}`);
            });
        }
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.log('\n❌ ERRO DE CHAVE ESTRANGEIRA:');
            console.log('   Uma das entidades relacionadas não existe.');
            console.log('   Execute o script de correção primeiro.');
        }
    }
}

// Executar o teste
testQuestoesCreation();
