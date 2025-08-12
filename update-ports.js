const fs = require('fs');
const path = require('path');

// Função para atualizar arquivos recursivamente
function updateFilesInDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            updateFilesInDirectory(filePath);
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;
                
                // Substituir todas as ocorrências de localhost:3001 por localhost:3002
                content = content.replace(/localhost:3001/g, 'localhost:3002');
                
                // Se o conteúdo mudou, salvar o arquivo
                if (content !== originalContent) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`✅ Atualizado: ${filePath}`);
                }
            } catch (error) {
                console.error(`❌ Erro ao processar ${filePath}:`, error.message);
            }
        }
    });
}

// Atualizar arquivos no diretório client/public
console.log('🔄 Atualizando referências de porta 3001 para 3002...');
updateFilesInDirectory('./client/public');
console.log('✅ Atualização concluída!');
