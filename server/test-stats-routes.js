require('dotenv').config();
const fetch = require('node-fetch');

async function testStatsRoutes() {
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

        // Testar rota de estatísticas do usuário logado
        console.log('\nTestando rota /api/stats/me...');
        const statsMeResponse = await fetch('http://localhost:3002/api/stats/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status /api/stats/me:', statsMeResponse.status);
        if (!statsMeResponse.ok) {
            const errorText = await statsMeResponse.text();
            console.error('Erro /api/stats/me:', errorText);
        } else {
            const statsMeData = await statsMeResponse.json();
            console.log('Dados /api/stats/me recebidos com sucesso');
            console.log('Total de respostas:', statsMeData.stats?.geral?.totalRespostas || 0);
            console.log('Percentual de acerto:', statsMeData.stats?.geral?.percentualAcerto || 0);
        }

        // Testar rota de estatísticas de um usuário específico (como gestor)
        console.log('\nTestando rota /api/stats/users/1...');
        const statsUserResponse = await fetch('http://localhost:3002/api/stats/users/1', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status /api/stats/users/1:', statsUserResponse.status);
        if (!statsUserResponse.ok) {
            const errorText = await statsUserResponse.text();
            console.error('Erro /api/stats/users/1:', errorText);
        } else {
            const statsUserData = await statsUserResponse.json();
            console.log('Dados /api/stats/users/1 recebidos com sucesso');
            console.log('Usuário:', statsUserData.user?.nome);
            console.log('Total de respostas:', statsUserData.stats?.geral?.totalRespostas || 0);
            console.log('Percentual de acerto:', statsUserData.stats?.geral?.percentualAcerto || 0);
        }

        // Testar com um usuário aluno
        console.log('\nFazendo login como aluno...');
        const loginAlunoResponse = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'joao@example.com',
                senha: '123456'
            })
        });

        if (loginAlunoResponse.ok) {
            const loginAlunoData = await loginAlunoResponse.json();
            const tokenAluno = loginAlunoData.token;
            
            console.log('Login como aluno realizado com sucesso');
            
            // Testar rota de estatísticas do aluno
            console.log('\nTestando rota /api/stats/me como aluno...');
            const statsAlunoResponse = await fetch('http://localhost:3002/api/stats/me', {
                headers: {
                    'Authorization': `Bearer ${tokenAluno}`
                }
            });

            console.log('Status /api/stats/me (aluno):', statsAlunoResponse.status);
            if (!statsAlunoResponse.ok) {
                const errorText = await statsAlunoResponse.text();
                console.error('Erro /api/stats/me (aluno):', errorText);
            } else {
                const statsAlunoData = await statsAlunoResponse.json();
                console.log('Dados /api/stats/me (aluno) recebidos com sucesso');
                console.log('Total de respostas:', statsAlunoData.stats?.geral?.totalRespostas || 0);
                console.log('Percentual de acerto:', statsAlunoData.stats?.geral?.percentualAcerto || 0);
            }
        } else {
            console.log('Não foi possível fazer login como aluno');
        }

    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

testStatsRoutes();
