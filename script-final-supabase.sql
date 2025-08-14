-- =====================================================
-- SCRIPT FINAL PARA SUPABASE - CORREÇÕES COMPLETAS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA PLANOS (se não existir)
-- =====================================================

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

-- Habilitar RLS para planos
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Inserir dados iniciais de planos
INSERT INTO planos (nome, descricao, preco, duracao_dias, questoes_por_dia) VALUES 
    ('Gratuito', 'Plano básico gratuito', 0.00, 30, 10),
    ('Premium', 'Plano premium com recursos avançados', 29.90, 30, 50),
    ('Anual', 'Plano anual com desconto', 299.90, 365, 100)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 2. CORRIGIR POLÍTICAS DA TABELA QUESTOES
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Questões são visíveis para todos" ON questoes;

-- Criar novas políticas para questoes
-- SELECT: Todos podem ver questões ativas
CREATE POLICY "Questões são visíveis para todos" ON questoes FOR SELECT USING (ativo = true);

-- INSERT: Apenas gestores podem inserir questões
CREATE POLICY "Gestores podem inserir questões" ON questoes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- UPDATE: Apenas gestores podem atualizar questões
CREATE POLICY "Gestores podem atualizar questões" ON questoes FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- DELETE: Apenas gestores podem deletar questões
CREATE POLICY "Gestores podem deletar questões" ON questoes FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- =====================================================
-- 3. CORRIGIR POLÍTICAS DA TABELA PLANOS
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Planos são visíveis para todos" ON planos;

-- Criar novas políticas para planos
-- SELECT: Todos podem ver planos ativos
CREATE POLICY "Planos são visíveis para todos" ON planos FOR SELECT USING (ativo = true);

-- INSERT: Apenas gestores podem inserir planos
CREATE POLICY "Gestores podem inserir planos" ON planos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- UPDATE: Apenas gestores podem atualizar planos
CREATE POLICY "Gestores podem atualizar planos" ON planos FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- DELETE: Apenas gestores podem deletar planos
CREATE POLICY "Gestores podem deletar planos" ON planos FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.id::text = auth.uid()::text 
        AND usuarios.tipo_usuario = 'gestor'
    )
);

-- =====================================================
-- 4. VERIFICAR DADOS INICIAIS
-- =====================================================

-- Verificar se temos anos cadastrados
INSERT INTO anos (ano) VALUES 
    (2024), (2023), (2022), (2021), (2020),
    (2019), (2018), (2017), (2016), (2015)
ON CONFLICT (ano) DO NOTHING;

-- Verificar se temos escolaridades cadastradas
INSERT INTO escolaridades (nivel) VALUES 
    ('FUNDAMENTAL'),
    ('MEDIO'),
    ('SUPERIOR')
ON CONFLICT (nivel) DO NOTHING;

-- =====================================================
-- 5. MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

-- Esta consulta vai mostrar o status das tabelas
SELECT 
    'Tabela planos criada com sucesso!' as status,
    COUNT(*) as total_planos
FROM planos
UNION ALL
SELECT 
    'Políticas de segurança configuradas!' as status,
    0 as total_planos;
