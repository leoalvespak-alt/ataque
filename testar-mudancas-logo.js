const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarMudancasLogo() {
    console.log('🔍 Testando mudanças de logo e favicon...\n');

    try {
        // 1. Verificar configurações atuais
        console.log('1️⃣ Verificando configurações atuais...');
        const { data: logoConfigs, error: configError } = await supabase
            .from('configuracoes_logo')
            .select('*')
            .eq('ativo', true)
            .order('tipo');

        if (configError) {
            console.error('❌ Erro ao buscar configurações:', configError.message);
            return;
        }

        console.log(`✅ ${logoConfigs.length} configurações encontradas:`);
        logoConfigs.forEach(config => {
            console.log(`   - ${config.tipo}: ${config.url}`);
        });
        console.log('');

        // 2. Testar upload de logo de teste
        console.log('2️⃣ Testando upload de logo de teste...');
        
        // Criar um arquivo SVG simples para teste
        const logoSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#8b0000"/>
            <text x="50" y="60" font-family="Arial" font-size="20" fill="white" text-anchor="middle">TESTE</text>
        </svg>`;
        
        const logoBlob = new Blob([logoSvg], { type: 'image/svg+xml' });
        const logoFile = new File([logoBlob], 'teste-logo.svg', { type: 'image/svg+xml' });

        // Upload para storage
        const logoPath = `logos/teste-logo-${Date.now()}.svg`;
        const { data: logoUploadData, error: logoUploadError } = await supabase.storage
            .from('uploads')
            .upload(logoPath, logoFile);

        if (logoUploadError) {
            console.error('❌ Erro no upload da logo:', logoUploadError.message);
        } else {
            console.log('✅ Logo de teste enviada com sucesso');
            
            // Obter URL pública
            const { data: logoUrlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(logoPath);

            // Atualizar configuração
            const { data: logoUpdateData, error: logoUpdateError } = await supabase
                .from('configuracoes_logo')
                .upsert({
                    tipo: 'logo',
                    url: logoUrlData.publicUrl,
                    nome_arquivo: `teste-logo-${Date.now()}.svg`,
                    tamanho_bytes: logoFile.size,
                    tipo_mime: 'image/svg+xml',
                    ativo: true
                })
                .select()
                .single();

            if (logoUpdateError) {
                console.error('❌ Erro ao atualizar configuração da logo:', logoUpdateError.message);
            } else {
                console.log('✅ Configuração da logo atualizada');
            }
        }
        console.log('');

        // 3. Testar upload de favicon de teste
        console.log('3️⃣ Testando upload de favicon de teste...');
        
        // Criar um arquivo SVG simples para favicon
        const faviconSvg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" fill="#8b0000"/>
            <text x="16" y="20" font-family="Arial" font-size="12" fill="white" text-anchor="middle">F</text>
        </svg>`;
        
        const faviconBlob = new Blob([faviconSvg], { type: 'image/svg+xml' });
        const faviconFile = new File([faviconBlob], 'teste-favicon.svg', { type: 'image/svg+xml' });

        // Upload para storage
        const faviconPath = `logos/teste-favicon-${Date.now()}.svg`;
        const { data: faviconUploadData, error: faviconUploadError } = await supabase.storage
            .from('uploads')
            .upload(faviconPath, faviconFile);

        if (faviconUploadError) {
            console.error('❌ Erro no upload do favicon:', faviconUploadError.message);
        } else {
            console.log('✅ Favicon de teste enviado com sucesso');
            
            // Obter URL pública
            const { data: faviconUrlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(faviconPath);

            // Atualizar configuração
            const { data: faviconUpdateData, error: faviconUpdateError } = await supabase
                .from('configuracoes_logo')
                .upsert({
                    tipo: 'favicon',
                    url: faviconUrlData.publicUrl,
                    nome_arquivo: `teste-favicon-${Date.now()}.svg`,
                    tamanho_bytes: faviconFile.size,
                    tipo_mime: 'image/svg+xml',
                    ativo: true
                })
                .select()
                .single();

            if (faviconUpdateError) {
                console.error('❌ Erro ao atualizar configuração do favicon:', faviconUpdateError.message);
            } else {
                console.log('✅ Configuração do favicon atualizada');
            }
        }
        console.log('');

        // 4. Verificar configurações finais
        console.log('4️⃣ Verificando configurações finais...');
        const { data: finalConfigs, error: finalError } = await supabase
            .from('configuracoes_logo')
            .select('*')
            .eq('ativo', true)
            .order('tipo');

        if (finalError) {
            console.error('❌ Erro ao verificar configurações finais:', finalError.message);
        } else {
            console.log('✅ Configurações finais:');
            finalConfigs.forEach(config => {
                console.log(`   - ${config.tipo}: ${config.url}`);
                console.log(`     Arquivo: ${config.nome_arquivo}`);
                console.log(`     Tamanho: ${config.tamanho_bytes} bytes`);
            });
        }
        console.log('');

        // 5. Instruções para testar no frontend
        console.log('5️⃣ Instruções para testar no frontend:');
        console.log('   📱 Acesse: http://localhost:3000');
        console.log('   🔄 Faça refresh da página (Ctrl+F5)');
        console.log('   👀 Verifique:');
        console.log('      - Favicon na aba do navegador');
        console.log('      - Logo na página de login');
        console.log('      - Logo no menu lateral');
        console.log('      - Logo no rodapé');
        console.log('');

        console.log('🎉 Teste de mudanças de logo concluído!');
        console.log('\n📋 Resumo:');
        console.log('- Logo de teste enviada e configurada');
        console.log('- Favicon de teste enviado e configurado');
        console.log('- Configurações atualizadas no banco');
        console.log('- Pronto para testar no frontend');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

testarMudancasLogo();
