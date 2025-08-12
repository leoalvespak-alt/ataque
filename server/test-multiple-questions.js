const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api';

async function testMultipleQuestions() {
    console.log('=== Teste de Múltiplas Questões - Sistema de XP ===\n');

    // 1. Fazer login como aluno
    console.log('1. Fazendo login como aluno...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'aluno@teste.com',
            senha: '123456'
        })
    });

    if (!loginResponse.ok) {
        console.error('Erro no login:', await loginResponse.text());
        return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login realizado com sucesso');
    console.log('XP inicial:', loginData.user.xp || 0);

    // 2. Buscar questões
    console.log('\n2. Buscando questões...');
    const questoesResponse = await fetch(`${API_BASE}/questions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!questoesResponse.ok) {
        console.error('Erro ao buscar questões:', await questoesResponse.text());
        return;
    }

    const questoesData = await questoesResponse.json();
    const questoes = questoesData.questoes || questoesData;
    console.log(`✅ Encontradas ${questoes.length} questões`);

    if (questoes.length === 0) {
        console.log('❌ Nenhuma questão disponível');
        return;
    }

    // 3. Responder múltiplas questões
    console.log('\n3. Respondendo questões...');
    
    for (let i = 0; i < Math.min(5, questoes.length); i++) {
        const questao = questoes[i];
        console.log(`\n--- Questão ${i + 1} ---`);
        console.log(`Enunciado: ${questao.enunciado.substring(0, 60)}...`);
        console.log(`Gabarito: ${questao.gabarito}`);
        
        // Tentar responder corretamente baseado no gabarito
        const alternativaCorreta = questao.gabarito;
        
        const responderResponse = await fetch(`${API_BASE}/questions/${questao.id}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                alternativa_marcada: alternativaCorreta
            })
        });

        if (responderResponse.ok) {
            const resultado = await responderResponse.json();
            console.log(`✅ Resposta: ${resultado.acertou ? 'CORRETA' : 'INCORRETA'}`);
            console.log(`XP ganho: ${resultado.xpGanho || 0}`);
            console.log(`XP total: ${resultado.novoXP || 0}`);
            console.log(`Questões respondidas: ${resultado.questoes_respondidas || 0}`);
            
            if (resultado.patente) {
                console.log(`Patente atual: ${resultado.patente.nome}`);
            }
            
            if (resultado.novaPatente) {
                console.log(`🎉 NOVA PATENTE CONQUISTADA: ${resultado.novaPatente.nome}!`);
            }
        } else {
            console.error('❌ Erro ao responder:', await responderResponse.text());
        }
    }

    // 4. Verificar estatísticas finais
    console.log('\n4. Verificando estatísticas finais...');
    const statsResponse = await fetch(`${API_BASE}/stats/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('📊 Estatísticas finais:');
        console.log(`- Total de respostas: ${stats.total_respostas}`);
        console.log(`- Respostas corretas: ${stats.respostas_corretas}`);
        console.log(`- Percentual de acerto: ${stats.percentual_acerto}%`);
        console.log(`- XP total: ${stats.xp_total}`);
        console.log(`- Questões respondidas: ${stats.questoes_respondidas}`);
    }

    console.log('\n=== Teste concluído ===');
}

testMultipleQuestions().catch(console.error);
