-- Script para corrigir a estrutura da tabela notificacoes
-- Este script garante que a tabela use usuario_id em vez de destinatario_id

-- =====================================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- =====================================================

-- Verificar se a tabela notificacoes existe
SELECT 'Verificando estrutura da tabela notificacoes...' as info;

-- Verificar colunas existentes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notificacoes' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. CORRIGIR ESTRUTURA DA TABELA
-- =====================================================

-- Verificar se existe coluna destinatario_id e renomear para usuario_id
DO $$
DECLARE
    col_exists BOOLEAN;
    usuario_id_exists BOOLEAN;
BEGIN
    -- Verificar se existe coluna destinatario_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'destinatario_id'
    ) INTO col_exists;
    
    -- Verificar se existe coluna usuario_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'usuario_id'
    ) INTO usuario_id_exists;
    
    IF col_exists AND NOT usuario_id_exists THEN
        -- Renomear destinatario_id para usuario_id
        ALTER TABLE notificacoes RENAME COLUMN destinatario_id TO usuario_id;
        RAISE NOTICE 'Coluna destinatario_id renomeada para usuario_id';
    ELSIF NOT col_exists AND NOT usuario_id_exists THEN
        -- Criar coluna usuario_id se não existir
        ALTER TABLE notificacoes ADD COLUMN usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna usuario_id criada';
    ELSE
        RAISE NOTICE 'Estrutura da coluna já está correta';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR E CRIAR COLUNAS NECESSÁRIAS
-- =====================================================

-- Verificar se existe coluna prioridade
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'prioridade'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN prioridade VARCHAR(20) DEFAULT 'NORMAL';
        RAISE NOTICE 'Coluna prioridade criada';
    END IF;
END $$;

-- Verificar se existe coluna destinatario_tipo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'destinatario_tipo'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN destinatario_tipo VARCHAR(20) DEFAULT 'TODOS';
        RAISE NOTICE 'Coluna destinatario_tipo criada';
    END IF;
END $$;

-- Verificar se existe coluna ativa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'ativa'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN ativa BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Coluna ativa criada';
    END IF;
END $$;

-- Verificar se existe coluna criado_por
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'criado_por'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN criado_por UUID REFERENCES usuarios(id);
        RAISE NOTICE 'Coluna criado_por criada';
    END IF;
END $$;

-- Verificar se existe coluna data_envio
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'data_envio'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN data_envio TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna data_envio criada';
    END IF;
END $$;

-- Verificar se existe coluna data_leitura
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notificacoes' AND column_name = 'data_leitura'
    ) THEN
        ALTER TABLE notificacoes ADD COLUMN data_leitura TIMESTAMP;
        RAISE NOTICE 'Coluna data_leitura criada';
    END IF;
END $$;

-- =====================================================
-- 4. CRIAR ÍNDICES NECESSÁRIOS
-- =====================================================

-- Índice para usuario_id
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);

-- Índice para tipo
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);

-- Índice para prioridade
CREATE INDEX IF NOT EXISTS idx_notificacoes_prioridade ON notificacoes(prioridade);

-- Índice para destinatario_tipo
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario_tipo ON notificacoes(destinatario_tipo);

-- Índice para lida
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Índice para ativa
CREATE INDEX IF NOT EXISTS idx_notificacoes_ativa ON notificacoes(ativa);

-- Índice composto para notificações não lidas
CREATE INDEX IF NOT EXISTS idx_notificacoes_nao_lidas ON notificacoes(usuario_id, lida) WHERE lida = FALSE;

-- Índice para notificações ativas
CREATE INDEX IF NOT EXISTS idx_notificacoes_ativas ON notificacoes(ativa) WHERE ativa = TRUE;

-- =====================================================
-- 5. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar estrutura final
SELECT 'Estrutura final da tabela notificacoes:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notificacoes' 
ORDER BY ordinal_position;

-- Verificar índices
SELECT 'Índices da tabela notificacoes:' as info;
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'notificacoes'
ORDER BY indexname;

-- =====================================================
-- 6. TESTAR CONSULTAS
-- =====================================================

-- Teste de inserção
SELECT 'Testando inserção de notificação...' as teste;
INSERT INTO notificacoes (
    titulo, 
    mensagem, 
    tipo, 
    prioridade, 
    destinatario_tipo, 
    usuario_id, 
    lida, 
    ativa,
    criado_por
) VALUES (
    'Teste de Estrutura',
    'Esta é uma notificação de teste para verificar a estrutura da tabela.',
    'GERAL',
    'NORMAL',
    'TODOS',
    NULL,
    FALSE,
    TRUE,
    NULL
) ON CONFLICT DO NOTHING;

-- Teste de leitura
SELECT 'Testando leitura de notificações...' as teste;
SELECT COUNT(*) as total_notificacoes FROM notificacoes;

-- Teste de consulta específica
SELECT 'Testando consulta específica...' as teste;
SELECT 
    id,
    titulo,
    tipo,
    prioridade,
    destinatario_tipo,
    usuario_id,
    lida,
    ativa
FROM notificacoes 
LIMIT 5;

-- =====================================================
-- 7. LIMPEZA E FINALIZAÇÃO
-- =====================================================

-- Remover notificação de teste
DELETE FROM notificacoes WHERE titulo = 'Teste de Estrutura';

-- Mensagem de conclusão
SELECT 'Estrutura da tabela notificacoes corrigida com sucesso!' as status;
SELECT 'Todas as colunas necessárias foram criadas/renomeadas' as observacao;
SELECT 'Índices otimizados foram criados' as indices;
SELECT 'A tabela está pronta para uso' as finalizacao;
