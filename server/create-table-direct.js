require('dotenv').config();

async function createTableDirect() {
    try {
        console.log('🔄 Tentando criar tabela via HTTP direto...');

        const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

        // Tentar fazer uma requisição para verificar se a tabela existe
        const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            console.log('❌ Tabela usuarios não existe');
            console.log('\n📋 SOLUÇÃO: Você precisa criar a tabela manualmente.');
            console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
            console.log('\n📝 Procure por "SQL Editor" no menu lateral e execute este SQL:');
            
            const sql = `
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
            `;
            
            console.log(sql);
            
        } else if (response.ok) {
            console.log('✅ Tabela usuarios já existe!');
        } else {
            console.log('❌ Erro ao verificar tabela:', response.status, response.statusText);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        console.log('\n📋 SOLUÇÃO: Você precisa criar a tabela manualmente.');
        console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql');
    }
}

createTableDirect();
