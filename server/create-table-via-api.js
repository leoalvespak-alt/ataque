require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTableViaAPI() {
    try {
        console.log('🔄 Tentando criar tabela via API...');

        // Primeiro, vamos tentar inserir um usuário diretamente
        // Se a tabela não existir, isso vai falhar
        const testUser = {
            id: '00000000-0000-0000-0000-000000000001',
            nome: 'Teste',
            email: 'teste@teste.com',
            tipo_usuario: 'aluno',
            status: 'gratuito',
            xp: 0,
            questoes_respondidas: 0
        };

        const { data, error } = await supabase
            .from('usuarios')
            .insert(testUser)
            .select()
            .single();

        if (error) {
            console.log('❌ Tabela não existe ou erro de permissão:', error.message);
            console.log('\n📋 SOLUÇÃO: Você precisa criar a tabela manualmente no Supabase Dashboard.');
            console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
            console.log('\n📝 Execute este SQL:');
            console.log(`
-- Criar a tabela usuarios
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

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios dados" 
ON usuarios FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" 
ON usuarios FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON usuarios FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);
            `);
        } else {
            console.log('✅ Tabela usuarios existe!');
            
            // Remover o usuário de teste
            await supabase
                .from('usuarios')
                .delete()
                .eq('email', 'teste@teste.com');
            
            console.log('✅ Usuário de teste removido');
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

createTableViaAPI();
