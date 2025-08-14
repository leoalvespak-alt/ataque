-- =====================================================
-- SCRIPT PARA CRIAR TABELA NOTIFICAÇÕES NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'GERAL', -- GERAL, SISTEMA, PROMOCIONAL, etc.
    prioridade VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- BAIXA, NORMAL, ALTA, URGENTE
    destinatario_tipo VARCHAR(20) NOT NULL DEFAULT 'TODOS', -- TODOS, ALUNOS, GESTORES, ESPECIFICO
    destinatario_id UUID, -- ID específico do usuário (se aplicável)
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    data_envio TIMESTAMP DEFAULT NOW(),
    data_leitura TIMESTAMP,
    criado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para buscar notificações por usuário
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario ON notificacoes(destinatario_id);

-- Índice para buscar notificações por tipo
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);

-- Índice para buscar notificações por prioridade
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);

-- Índice para buscar notificações não lidas
CREATE INDEX IF NOT EXISTS idx_notificacoes_nao_lidas ON notificacoes(destinatario_id, lida) WHERE lida = FALSE;

-- Índice para buscar notificações ativas
CREATE INDEX IF NOT EXISTS idx_notificacoes_ativas ON notificacoes(ativa) WHERE ativa = TRUE;

-- =====================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Política 1: Usuários podem ver suas próprias notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" ON notificacoes
    FOR SELECT
    USING (
        destinatario_id = auth.uid() OR 
        destinatario_tipo = 'TODOS' OR
        (destinatario_tipo = 'ALUNOS' AND EXISTS (
            SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'aluno'
        )) OR
        (destinatario_tipo = 'GESTORES' AND EXISTS (
            SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        ))
    );

-- Política 2: Usuários podem marcar suas notificações como lidas
CREATE POLICY "Usuários podem marcar notificações como lidas" ON notificacoes
    FOR UPDATE
    USING (destinatario_id = auth.uid())
    WITH CHECK (destinatario_id = auth.uid());

-- Política 3: Gestores podem criar notificações
CREATE POLICY "Gestores podem criar notificações" ON notificacoes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- Política 4: Gestores podem atualizar notificações
CREATE POLICY "Gestores podem atualizar notificações" ON notificacoes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- Política 5: Gestores podem deletar notificações
CREATE POLICY "Gestores podem deletar notificações" ON notificacoes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- =====================================================
-- 5. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(notificacao_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notificacoes 
    SET lida = TRUE, data_leitura = NOW()
    WHERE id = notificacao_id AND destinatario_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- Função para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION marcar_todas_notificacoes_lidas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_atualizadas INTEGER;
BEGIN
    UPDATE notificacoes 
    SET lida = TRUE, data_leitura = NOW()
    WHERE destinatario_id = auth.uid() AND lida = FALSE;
    
    GET DIAGNOSTICS total_atualizadas = ROW_COUNT;
    RETURN total_atualizadas;
END;
$$;

-- Função para contar notificações não lidas
CREATE OR REPLACE FUNCTION contar_notificacoes_nao_lidas()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_nao_lidas INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_nao_lidas
    FROM notificacoes
    WHERE (destinatario_id = auth.uid() OR 
           destinatario_tipo = 'TODOS' OR
           (destinatario_tipo = 'ALUNOS' AND EXISTS (
               SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'aluno'
           )) OR
           (destinatario_tipo = 'GESTORES' AND EXISTS (
               SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'gestor'
           )))
    AND lida = FALSE
    AND ativa = TRUE;
    
    RETURN total_nao_lidas;
END;
$$;

-- =====================================================
-- 6. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notificacoes_updated_at
    BEFORE UPDATE ON notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_notificacoes_updated_at();

-- =====================================================
-- 7. INSERIR NOTIFICAÇÕES DE EXEMPLO
-- =====================================================

-- Notificação de boas-vindas para todos
INSERT INTO notificacoes (
    titulo,
    mensagem,
    tipo,
    prioridade,
    destinatario_tipo,
    ativa
) VALUES (
    'Bem-vindo à Plataforma de Questões!',
    'Seja bem-vindo à nossa plataforma de estudos. Aqui você encontrará questões de concursos organizadas por disciplina, assunto e ano. Boa sorte nos seus estudos!',
    'GERAL',
    'NORMAL',
    'TODOS',
    true
) ON CONFLICT DO NOTHING;

-- Notificação para gestores
INSERT INTO notificacoes (
    titulo,
    mensagem,
    tipo,
    prioridade,
    destinatario_tipo,
    ativa
) VALUES (
    'Painel Administrativo Disponível',
    'Como gestor, você tem acesso ao painel administrativo onde pode gerenciar questões, usuários e configurações da plataforma.',
    'SISTEMA',
    'NORMAL',
    'GESTORES',
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VERIFICAR ESTRUTURA CRIADA
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notificacoes' 
ORDER BY ordinal_position;

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notificacoes';

-- Verificar funções criadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('marcar_notificacao_lida', 'marcar_todas_notificacoes_lidas', 'contar_notificacoes_nao_lidas');

-- Verificar notificações de exemplo
SELECT 
    id,
    titulo,
    tipo,
    prioridade,
    destinatario_tipo,
    lida,
    ativa,
    created_at
FROM notificacoes 
ORDER BY created_at DESC;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Tabela notificações criada com sucesso!' as status;
