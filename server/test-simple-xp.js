const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api';

async function testSimpleXP() {
    console.log('=== Teste Simples do Sistema de XP ===\n');

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
    console.log('XP atual:', loginData.user.xp || 0);

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

    // 3. Responder uma questão
    console.log('\n3. Respondendo questão...');
    const questao = questoes[0];
    console.log(`Questão: ${questao.enunciado.substring(0, 50)}...`);
    
    const responderResponse = await fetch(`${API_BASE}/questions/${questao.id}/responder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            alternativa_marcada: 'A' // Sempre responder A para teste
        })
    });

    if (responderResponse.ok) {
        const resultado = await responderResponse.json();
        console.log('✅ Resposta processada');
        console.log(`Resposta correta: ${resultado.acertou ? 'SIM' : 'NÃO'}`);
        console.log(`XP ganho: ${resultado.xpGanho || 0}`);
        console.log(`Novo XP total: ${resultado.novoXP || 0}`);
        console.log(`Questões respondidas: ${resultado.questoes_respondidas || 0}`);
        
        if (resultado.patente) {
            console.log(`Patente atual: ${resultado.patente.nome}`);
        }
        
        if (resultado.novaPatente) {
            console.log(`🎉 NOVA PATENTE: ${resultado.novaPatente.nome}!`);
        }
    } else {
        console.error('❌ Erro ao responder:', await responderResponse.text());
    }

    console.log('\n=== Teste concluído ===');
}

testSimpleXP().catch(console.error);
