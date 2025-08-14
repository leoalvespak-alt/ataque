const fs = require('fs');
const path = require('path');

function mostrarSQLNotificacoes() {
    try {
        console.log('📋 CONTEÚDO DO SQL PARA EXECUTAR MANUALMENTE');
        console.log('=' .repeat(60));
        
        // Ler o arquivo SQL
        const sqlFilePath = path.join(__dirname, 'corrigir-notificacoes-final.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log(sqlContent);
        console.log('=' .repeat(60));
        
        console.log('\n📝 INSTRUÇÕES PARA EXECUTAR:');
        console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Selecione seu projeto');
        console.log('3. Vá para "SQL Editor" no menu lateral');
        console.log('4. Cole o conteúdo acima na área de texto');
        console.log('5. Clique em "Run" para executar');
        console.log('\n✅ Este script corrigirá a função get_notificacoes_dashboard');
        
    } catch (error) {
        console.error('❌ Erro ao ler arquivo SQL:', error);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    mostrarSQLNotificacoes();
}

module.exports = { mostrarSQLNotificacoes };
