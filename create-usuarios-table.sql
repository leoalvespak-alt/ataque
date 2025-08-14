-- =====================================================
-- CRIAR TABELA USUARIOS NO SUPABASE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

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

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios dados" 
ON usuarios FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" 
ON usuarios FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON usuarios FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERIR USUÁRIOS DE TESTE (se não existirem)
-- =====================================================

-- Inserir usuário Admin (se não existir)
INSERT INTO usuarios (id, nome, email, tipo_usuario, status, xp, questoes_respondidas)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Administrador',
    'admin@rotadeataque.com',
    'gestor',
    'ativo',
    0,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@rotadeataque.com'
);

-- Inserir usuário Aluno (se não existir)
INSERT INTO usuarios (id, nome, email, tipo_usuario, status, xp, questoes_respondidas)
SELECT 
    '00000000-0000-0000-0000-000000000002'::uuid,
    'João Silva',
    'joao@teste.com',
    'aluno',
    'gratuito',
    0,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'joao@teste.com'
);

-- =====================================================
-- VERIFICAR SE A TABELA FOI CRIADA
-- =====================================================

SELECT 
    'Tabela usuarios criada com sucesso!' as status,
    COUNT(*) as total_usuarios
FROM usuarios;
