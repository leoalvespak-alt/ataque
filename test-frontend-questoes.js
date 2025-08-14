const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3002/api/admin';
const TEST_TOKEN = 'test-token'; // Token de teste

async function testQuestoesAPI() {
    try {
        console.log('=== TESTE DA API DE QUESTÕES ===\n');

        // 1. Testar busca de questões
        console.log('1. Testando busca de questões...');
        try {
            const response = await axios.get(`${API_BASE_URL}/questoes`, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`
                }
            });
            console.log('   ✅ Busca de questões funcionando');
            console.log(`   - Total de questões: ${response.data.pagination?.total || 0}`);
        } catch (error) {
            console.log('   ❌ Erro na busca de questões:', error.response?.data?.message || error.message);
        }

        // 2. Testar busca de entidades relacionadas
        console.log('\n2. Testando busca de entidades relacionadas...');
        
        const entities = ['disciplinas', 'assuntos', 'bancas', 'orgaos'];
        for (const entity of entities) {
            try {
                const response = await axios.get(`${API_BASE_URL}/${entity}`, {
                    headers: {
                        'Authorization': `Bearer ${TEST_TOKEN}`
                    }
                });
                console.log(`   ✅ ${entity}: ${response.data[entity]?.length || 0} encontrados`);
            } catch (error) {
                console.log(`   ❌ Erro na busca de ${entity}:`, error.response?.data?.message || error.message);
            }
        }

        // 3. Testar criação de questão
        console.log('\n3. Testando criação de questão...');
        
        // Primeiro, buscar dados para criar a questão
        const [disciplinas, assuntos, bancas, orgaos] = await Promise.all([
            axios.get(`${API_BASE_URL}/disciplinas`, { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }),
            axios.get(`${API_BASE_URL}/assuntos`, { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }),
            axios.get(`${API_BASE_URL}/bancas`, { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }),
            axios.get(`${API_BASE_URL}/orgaos`, { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } })
        ]);

        if (disciplinas.data.disciplinas?.length && 
            assuntos.data.assuntos?.length && 
            bancas.data.bancas?.length && 
            orgaos.data.orgaos?.length) {
            
            const questaoData = {
                enunciado: 'Questão de teste via API - ' + new Date().toISOString(),
                alternativa_a: 'Alternativa A - Teste',
                alternativa_b: 'Alternativa B - Teste',
                alternativa_c: 'Alternativa C - Teste',
                alternativa_d: 'Alternativa D - Teste',
                alternativa_e: null,
                gabarito: 'A',
                tipo: 'MULTIPLA_ESCOLHA',
                ano: 2024,
                disciplina_id: disciplinas.data.disciplinas[0].id,
                assunto_id: assuntos.data.assuntos[0].id,
                banca_id: bancas.data.bancas[0].id,
                orgao_id: orgaos.data.orgaos[0].id,
                comentario_professor: 'Comentário de teste via API'
            };

            console.log('   Dados da questão:');
            console.log(`   - Disciplina: ${disciplinas.data.disciplinas[0].nome}`);
            console.log(`   - Assunto: ${assuntos.data.assuntos[0].nome}`);
            console.log(`   - Banca: ${bancas.data.bancas[0].nome}`);
            console.log(`   - Órgão: ${orgaos.data.orgaos[0].nome}`);

            try {
                const response = await axios.post(`${API_BASE_URL}/questoes`, questaoData, {
                    headers: {
                        'Authorization': `Bearer ${TEST_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('   ✅ Questão criada com sucesso!');
                console.log(`   - ID: ${response.data.questao?.id}`);
                
                // 4. Testar exclusão da questão criada
                console.log('\n4. Testando exclusão da questão...');
                try {
                    await axios.delete(`${API_BASE_URL}/questoes/${response.data.questao.id}`, {
                        headers: {
                            'Authorization': `Bearer ${TEST_TOKEN}`
                        }
                    });
                    console.log('   ✅ Questão excluída com sucesso!');
                } catch (error) {
                    console.log('   ❌ Erro ao excluir questão:', error.response?.data?.message || error.message);
                }
                
            } catch (error) {
                console.log('   ❌ Erro ao criar questão:', error.response?.data?.message || error.message);
                if (error.response?.data?.details) {
                    console.log('   Detalhes dos erros:');
                    error.response.data.details.forEach(detail => {
                        console.log(`     - ${detail.path}: ${detail.msg}`);
                    });
                }
            }
        } else {
            console.log('   ❌ Não há dados suficientes para criar uma questão');
        }

        console.log('\n✅ TESTE CONCLUÍDO!');

    } catch (error) {
        console.error('\n❌ ERRO GERAL:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testQuestoesAPI();
