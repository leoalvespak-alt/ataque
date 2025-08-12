const fetch = require('node-fetch');

async function testFrontendAdmin() {
    try {
        console.log('Testando frontend admin...');
        
        // Testar se o servidor frontend está rodando
        console.log('\n1. Testando servidor frontend...');
        const frontendResponse = await fetch('http://localhost:3000');
        console.log('Status frontend:', frontendResponse.status);
        
        if (frontendResponse.ok) {
            console.log('✅ Servidor frontend está rodando');
        } else {
            console.log('❌ Servidor frontend não está respondendo');
        }
        
        // Testar se a página admin está acessível
        console.log('\n2. Testando página admin...');
        const adminResponse = await fetch('http://localhost:3000/admin.html');
        console.log('Status página admin:', adminResponse.status);
        
        if (adminResponse.ok) {
            console.log('✅ Página admin está acessível');
        } else {
            console.log('❌ Página admin não está acessível');
        }
        
        // Testar se a página de questões admin está acessível
        console.log('\n3. Testando página admin-questoes...');
        const questoesResponse = await fetch('http://localhost:3000/admin-questoes.html');
        console.log('Status página admin-questoes:', questoesResponse.status);
        
        if (questoesResponse.ok) {
            console.log('✅ Página admin-questoes está acessível');
        } else {
            console.log('❌ Página admin-questoes não está acessível');
        }
        
        // Testar se a página de categorias admin está acessível
        console.log('\n4. Testando página admin-categorias...');
        const categoriasResponse = await fetch('http://localhost:3000/admin-categorias.html');
        console.log('Status página admin-categorias:', categoriasResponse.status);
        
        if (categoriasResponse.ok) {
            console.log('✅ Página admin-categorias está acessível');
        } else {
            console.log('❌ Página admin-categorias não está acessível');
        }
        
        console.log('\n🎉 Teste do frontend concluído!');
        console.log('\n📋 Resumo:');
        console.log('- Frontend: http://localhost:3000');
        console.log('- Backend: http://localhost:3002/api');
        console.log('- Admin: http://localhost:3000/admin.html');
        console.log('- Credenciais: admin@example.com / admin123');
        
    } catch (error) {
        console.error('❌ Erro no teste do frontend:', error);
    }
}

testFrontendAdmin();
