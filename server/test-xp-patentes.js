const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api';

async function testXPAndPatentes() {
    console.log('=== Teste do Sistema de XP e Patentes ===\n');

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
    console.log('Login realizado com sucesso');
    console.log('XP atual:', loginData.user.xp || 0);
    console.log('Patente atual:', loginData.user.patente ? loginData.user.patente.nome : 'Nenhuma');

    // 2. Verificar patentes disponíveis (rota pública)
    console.log('\n2. Verificando patentes disponíveis...');
    const patentesResponse = await fetch(`${API_BASE}/patentes/public`);

    if (patentesResponse.ok) {
        const patentes = await patentesResponse.json();
        console.log('Patentes disponíveis:');
        patentes.forEach(p => {
            console.log(`- ${p.nome} (XP necessário: ${p.xp_necessario})`);
        });
    } else {
        console.log('Erro ao buscar patentes:', await patentesResponse.text());
    }

    // 3. Buscar questões disponíveis
    console.log('\n3. Buscando questões disponíveis...');
    const questoesResponse = await fetch(`${API_BASE}/questions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!questoesResponse.ok) {
        console.error('Erro ao buscar questões:', await questoesResponse.text());
        return;
    }

    const questoes = await questoesResponse.json();
    console.log(`Encontradas ${questoes.length} questões`);

    if (questoes.length === 0) {
        console.log('Nenhuma questão disponível para teste');
        return;
    }

    // 4. Responder algumas questões
    console.log('\n4. Respondendo questões para testar XP...');
    
    for (let i = 0; i < Math.min(3, questoes.length); i++) {
        const questao = questoes[i];
        console.log(`\nRespondendo questão ${i + 1}: ${questao.enunciado.substring(0, 50)}...`);
        
        // Criar alternativas no formato esperado pela API
        const alternativas = [
            { id: 'A', texto: questao.alternativa_a },
            { id: 'B', texto: questao.alternativa_b },
            { id: 'C', texto: questao.alternativa_c },
            { id: 'D', texto: questao.alternativa_d }
        ];
        
        if (questao.alternativa_e) {
            alternativas.push({ id: 'E', texto: questao.alternativa_e });
        }
        
        // Pegar a primeira alternativa como resposta (pode estar correta ou não)
        const resposta = alternativas[0];
        
        const responderResponse = await fetch(`${API_BASE}/questions/${questao.id}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                alternativa_id: resposta.id
            })
        });

        if (responderResponse.ok) {
            const resultado = await responderResponse.json();
            console.log(`Resposta: ${resultado.correta ? 'CORRETA' : 'INCORRETA'}`);
            console.log(`XP ganho: ${resultado.novoXP || 0}`);
            console.log(`Questões respondidas: ${resultado.questoes_respondidas || 0}`);
            
            if (resultado.patente) {
                console.log(`Patente atual: ${resultado.patente.nome}`);
            }
            
            if (resultado.novaPatente) {
                console.log(`🎉 NOVA PATENTE CONQUISTADA: ${resultado.novaPatente.nome}!`);
            }
        } else {
            console.error(`Erro ao responder questão ${questao.id}:`, await responderResponse.text());
        }
    }

    // 5. Verificar estatísticas finais
    console.log('\n5. Verificando estatísticas finais...');
    const statsResponse = await fetch(`${API_BASE}/stats/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('Estatísticas finais:');
        console.log(`- Total de respostas: ${stats.total_respostas}`);
        console.log(`- Respostas corretas: ${stats.respostas_corretas}`);
        console.log(`- Percentual de acerto: ${stats.percentual_acerto}%`);
        console.log(`- XP total: ${stats.xp_total}`);
        console.log(`- Questões respondidas: ${stats.questoes_respondidas}`);
    }

    console.log('\n=== Teste concluído ===');
}

testXPAndPatentes().catch(console.error);
