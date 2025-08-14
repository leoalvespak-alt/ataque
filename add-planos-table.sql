-- =====================================================
-- ADICIONAR TABELA DE PLANOS
-- =====================================================

-- Tabela planos
CREATE TABLE IF NOT EXISTS planos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duracao_dias INTEGER NOT NULL DEFAULT 30,
    questoes_por_dia INTEGER,
    recursos_especiais TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Remover política existente (se houver)
DROP POLICY IF EXISTS "Planos são visíveis para todos" ON planos;

-- Criar política de segurança
CREATE POLICY "Planos são visíveis para todos" ON planos FOR SELECT USING (true);

-- Inserir planos padrão
INSERT INTO planos (nome, descricao, preco, duracao_dias, questoes_por_dia, recursos_especiais, ativo) VALUES 
    ('Gratuito', 'Acesso básico à plataforma', 0.00, 30, 10, ARRAY['Questões básicas', 'Ranking básico'], true),
    ('Premium', 'Acesso completo à plataforma', 29.90, 30, NULL, ARRAY['Questões ilimitadas', 'Ranking completo', 'Relatórios detalhados', 'Suporte prioritário'], true),
    ('Anual', 'Plano anual com desconto', 299.90, 365, NULL, ARRAY['Questões ilimitadas', 'Ranking completo', 'Relatórios detalhados', 'Suporte prioritário', 'Desconto anual'], true)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
