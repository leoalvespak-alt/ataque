-- =====================================================
-- SCRIPT PARA VERIFICAR STATUS DAS NOTIFICAÇÕES
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE A TABELA EXISTE
-- =====================================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'notificacoes';

-- =====================================================
-- 2. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notificacoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'notificacoes'
ORDER BY policyname;

-- =====================================================
-- 4. VERIFICAR FUNÇÕES EXISTENTES
-- =====================================================

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('marcar_notificacao_lida', 'marcar_todas_notificacoes_lidas', 'contar_notificacoes_nao_lidas');

-- =====================================================
-- 5. VERIFICAR TRIGGERS
-- =====================================================

SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'notificacoes';

-- =====================================================
-- 6. VERIFICAR DADOS EXISTENTES
-- =====================================================

SELECT 
    COUNT(*) as total_notificacoes
FROM notificacoes;

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
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 7. VERIFICAR ÍNDICES
-- =====================================================

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notificacoes';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Verificação das notificações concluída!' as status;
