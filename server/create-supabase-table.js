require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUsuariosTable() {
    try {
        console.log('🔄 Criando tabela usuarios no Supabase...');

        // SQL para criar a tabela usuarios
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'aluno',
                status VARCHAR(20) NOT NULL DEFAULT 'gratuito',
                xp INTEGER NOT NULL DEFAULT 0,
                questoes_respondidas INTEGER NOT NULL DEFAULT 0,
                ultimo_login TIMESTAMP,
                profile_picture_url VARCHAR(255),
                ativo BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;

        // Executar a query SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

        if (error) {
            console.error('❌ Erro ao criar tabela:', error.message);
            
            // Tentar método alternativo usando SQL direto
            console.log('🔄 Tentando método alternativo...');
            
            // Vamos tentar inserir um usuário diretamente para ver se a tabela já existe
            const { data: testData, error: testError } = await supabase
                .from('usuarios')
                .select('*')
                .limit(1);

            if (testError) {
                console.error('❌ Tabela usuarios não existe:', testError.message);
                console.log('\n📋 Para criar a tabela, execute o seguinte SQL no Supabase Dashboard:');
                console.log(createTableSQL);
            } else {
                console.log('✅ Tabela usuarios já existe!');
            }
        } else {
            console.log('✅ Tabela usuarios criada com sucesso!');
        }

        // Agora vamos tentar inserir os usuários novamente
        console.log('\n🔄 Inserindo usuários na tabela...');

        // Buscar usuários do auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('❌ Erro ao buscar usuários do auth:', authError.message);
            return;
        }

        console.log('👥 Usuários encontrados no auth:', authUsers.users.length);

        for (const authUser of authUsers.users) {
            console.log(`\n📝 Processando usuário: ${authUser.email}`);
            
            // Verificar se já existe na tabela usuarios
            const { data: existingUser, error: checkError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('❌ Erro ao verificar usuário:', checkError.message);
                continue;
            }

            if (existingUser) {
                console.log('✅ Usuário já existe na tabela');
                continue;
            }

            // Inserir na tabela usuarios
            const userData = {
                id: authUser.id,
                nome: authUser.user_metadata?.nome || 'Usuário',
                email: authUser.email,
                tipo_usuario: authUser.user_metadata?.tipo_usuario || 'aluno',
                status: authUser.user_metadata?.tipo_usuario === 'gestor' ? 'ativo' : 'gratuito',
                xp: 0,
                questoes_respondidas: 0
            };

            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert(userData)
                .select()
                .single();

            if (insertError) {
                console.error('❌ Erro ao inserir usuário:', insertError.message);
            } else {
                console.log('✅ Usuário inserido na tabela:', newUser);
            }
        }

        console.log('\n🎉 Processo concluído!');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

createUsuariosTable();
