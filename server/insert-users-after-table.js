require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertUsersAfterTable() {
    try {
        console.log('🔄 Verificando se a tabela usuarios existe...');

        // Verificar se a tabela existe
        const { data: testData, error: testError } = await supabase
            .from('usuarios')
            .select('*')
            .limit(1);

        if (testError) {
            console.log('❌ Tabela usuarios ainda não existe:', testError.message);
            console.log('\n📋 Você precisa criar a tabela primeiro!');
            console.log('🔗 Siga o guia em: GUIA_VISUAL_CRIAR_TABELA.md');
            return;
        }

        console.log('✅ Tabela usuarios existe!');
        console.log('🔄 Inserindo usuários na tabela...');

        // Buscar usuários do auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Erro ao buscar usuários do auth:', authError.message);
            console.log('🔄 Tentando método alternativo...');
            
            // Tentar inserir usuários diretamente
            await insertUsersDirectly();
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

async function insertUsersDirectly() {
    try {
        console.log('🔄 Inserindo usuários diretamente...');

        // Usuário Admin
        const adminUser = {
            id: '00000000-0000-0000-0000-000000000001',
            nome: 'Administrador',
            email: 'admin@rotadeataque.com',
            tipo_usuario: 'gestor',
            status: 'ativo',
            xp: 0,
            questoes_respondidas: 0
        };

        const { data: adminData, error: adminError } = await supabase
            .from('usuarios')
            .insert(adminUser)
            .select()
            .single();

        if (adminError) {
            console.error('❌ Erro ao inserir admin:', adminError.message);
        } else {
            console.log('✅ Admin inserido:', adminData);
        }

        // Usuário Aluno
        const alunoUser = {
            id: '00000000-0000-0000-0000-000000000002',
            nome: 'João Silva',
            email: 'joao@teste.com',
            tipo_usuario: 'aluno',
            status: 'gratuito',
            xp: 0,
            questoes_respondidas: 0
        };

        const { data: alunoData, error: alunoError } = await supabase
            .from('usuarios')
            .insert(alunoUser)
            .select()
            .single();

        if (alunoError) {
            console.error('❌ Erro ao inserir aluno:', alunoError.message);
        } else {
            console.log('✅ Aluno inserido:', alunoData);
        }

        console.log('\n🎉 Usuários inseridos!');
        console.log('\n📋 Credenciais de teste:');
        console.log('👨‍💼 Admin: admin@rotadeataque.com / 123456');
        console.log('👨‍🎓 Aluno: joao@teste.com / 123456');

    } catch (error) {
        console.error('❌ Erro ao inserir usuários:', error);
    }
}

insertUsersAfterTable();
