require('dotenv').config();
const fetch = require('node-fetch');

async function testAdminRoutes() {
    try {
        // Primeiro, fazer login para obter o token
        console.log('Fazendo login...');
        const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                senha: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            console.error('Erro no login:', errorText);
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        console.log('Login realizado com sucesso');
        console.log('Token obtido:', token ? 'Sim' : 'Não');
        console.log('Dados do usuário:', loginData.user);

        // Testar rota de verificação de token
        console.log('\nTestando verificação de token...');
        const verifyResponse = await fetch('http://localhost:3002/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status verificação:', verifyResponse.status);
        if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            console.error('Erro verificação:', errorText);
        } else {
            const verifyData = await verifyResponse.json();
            console.log('Dados da verificação:', verifyData);
        }

        // Testar rota de questões
        console.log('\nTestando rota de questões...');
        const questoesResponse = await fetch('http://localhost:3002/api/admin/questoes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status questões:', questoesResponse.status);
        if (!questoesResponse.ok) {
            const errorText = await questoesResponse.text();
            console.error('Erro questões:', errorText);
        } else {
            const questoesData = await questoesResponse.json();
            console.log('Questões carregadas:', questoesData.questoes ? questoesData.questoes.length : 0);
        }

        // Testar rota de assuntos
        console.log('\nTestando rota de assuntos...');
        const assuntosResponse = await fetch('http://localhost:3002/api/admin/assuntos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status assuntos:', assuntosResponse.status);
        if (!assuntosResponse.ok) {
            const errorText = await assuntosResponse.text();
            console.error('Erro assuntos:', errorText);
        } else {
            const assuntosData = await assuntosResponse.json();
            console.log('Assuntos carregados:', assuntosData.assuntos ? assuntosData.assuntos.length : 0);
        }

        // Testar rota de disciplinas
        console.log('\nTestando rota de disciplinas...');
        const disciplinasResponse = await fetch('http://localhost:3002/api/admin/disciplinas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status disciplinas:', disciplinasResponse.status);
        if (!disciplinasResponse.ok) {
            const errorText = await disciplinasResponse.text();
            console.error('Erro disciplinas:', errorText);
        } else {
            const disciplinasData = await disciplinasResponse.json();
            console.log('Disciplinas carregadas:', disciplinasData.disciplinas ? disciplinasData.disciplinas.length : 0);
        }

    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

testAdminRoutes();
