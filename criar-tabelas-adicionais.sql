-- Script para criar tabelas adicionais necessárias
-- Execute este SQL diretamente no painel do Supabase

-- 1. Criar tabela de configurações de logo
CREATE TABLE IF NOT EXISTS configuracoes_logo (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE, -- 'logo', 'favicon'
    url VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255),
    tamanho_bytes BIGINT,
    tipo_mime VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir configurações padrão de logo
INSERT INTO configuracoes_logo (tipo, url, nome_arquivo, ativo) VALUES 
('logo', '/logo-ataque.svg', 'logo-ataque.svg', TRUE),
('favicon', '/favicon.svg', 'favicon.svg', TRUE)
ON CONFLICT (tipo) DO NOTHING;

-- 3. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'GERAL',
    prioridade VARCHAR(20) DEFAULT 'NORMAL',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Criar tabela de usuários_notificacoes
CREATE TABLE IF NOT EXISTS usuarios_notificacoes (
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notificacao_id INTEGER REFERENCES notificacoes(id) ON DELETE CASCADE,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (usuario_id, notificacao_id)
);

-- 5. Criar tabela de dicas de estudo
CREATE TABLE IF NOT EXISTS dicas_estudo (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    texto TEXT NOT NULL,
    categoria VARCHAR(50) DEFAULT 'GERAL',
    prioridade INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Inserir dicas de estudo padrão
INSERT INTO dicas_estudo (titulo, texto, categoria, prioridade, ativo) VALUES 
('Estude com Foco', 'Dedique 25 minutos de estudo focado, seguidos de 5 minutos de pausa. Esta técnica Pomodoro aumenta sua produtividade.', 'ESTUDO', 1, TRUE),
('Revise Regularmente', 'Faça revisões espaçadas do conteúdo. Revisar em intervalos crescentes (1 dia, 3 dias, 1 semana) melhora a retenção.', 'ESTUDO', 2, TRUE),
('Mantenha-se Motivado', 'Estabeleça metas pequenas e comemore cada conquista. O progresso constante é mais importante que a perfeição.', 'MOTIVACIONAL', 3, TRUE)
ON CONFLICT DO NOTHING;

-- 7. Configurar RLS para as tabelas
ALTER TABLE configuracoes_logo ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicas_estudo ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para configuracoes_logo
DROP POLICY IF EXISTS "Configurações de logo são visíveis para todos" ON configuracoes_logo;
DROP POLICY IF EXISTS "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo;

CREATE POLICY "Configurações de logo são visíveis para todos" ON configuracoes_logo
    FOR SELECT USING (true);

CREATE POLICY "Apenas gestores podem modificar configurações de logo" ON configuracoes_logo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 9. Criar políticas RLS para notificacoes
DROP POLICY IF EXISTS "Notificações ativas são visíveis para todos" ON notificacoes;
DROP POLICY IF EXISTS "Apenas gestores podem gerenciar notificações" ON notificacoes;

CREATE POLICY "Notificações ativas são visíveis para todos" ON notificacoes
    FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas gestores podem gerenciar notificações" ON notificacoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 10. Criar políticas RLS para usuarios_notificacoes
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON usuarios_notificacoes;
DROP POLICY IF EXISTS "Usuários podem marcar suas notificações como lidas" ON usuarios_notificacoes;
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON usuarios_notificacoes;

CREATE POLICY "Usuários podem ver suas próprias notificações" ON usuarios_notificacoes
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem marcar suas notificações como lidas" ON usuarios_notificacoes
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas notificações" ON usuarios_notificacoes
    FOR UPDATE USING (usuario_id = auth.uid());

-- 11. Criar políticas RLS para dicas_estudo
DROP POLICY IF EXISTS "Dicas ativas são visíveis para todos" ON dicas_estudo;
DROP POLICY IF EXISTS "Apenas gestores podem gerenciar dicas" ON dicas_estudo;

CREATE POLICY "Dicas ativas são visíveis para todos" ON dicas_estudo
    FOR SELECT USING (ativo = true);

CREATE POLICY "Apenas gestores podem gerenciar dicas" ON dicas_estudo
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 12. Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'configuracoes_logo',
    'notificacoes',
    'usuarios_notificacoes',
    'dicas_estudo'
)
ORDER BY table_name;
