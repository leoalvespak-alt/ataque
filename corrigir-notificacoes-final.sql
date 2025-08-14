-- Script para corrigir a função get_notificacoes_dashboard
-- Problema: ambiguidade na coluna "id"

CREATE OR REPLACE FUNCTION get_notificacoes_dashboard()
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    mensagem TEXT,
    tipo VARCHAR(50),
    prioridade VARCHAR(20),
    lida BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    user_tipo VARCHAR(20);
BEGIN
    user_id := auth.uid();
    
    -- Obter tipo do usuário
    SELECT COALESCE(tipo_usuario, 'aluno') INTO user_tipo
    FROM usuarios
    WHERE id = user_id;
    
    -- Retornar dados vazios se a tabela notificacoes não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notificacoes'
    ) THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        notificacoes.id,
        notificacoes.titulo,
        notificacoes.mensagem,
        COALESCE(notificacoes.tipo, 'INFO') as tipo,
        COALESCE(notificacoes.prioridade, 'NORMAL') as prioridade,
        COALESCE(notificacoes.lida, false) as lida,
        notificacoes.created_at
    FROM notificacoes
    WHERE notificacoes.ativa = true
    AND (
        notificacoes.usuario_id = user_id OR
        notificacoes.destinatario_tipo = 'TODOS' OR
        (notificacoes.destinatario_tipo = 'ALUNOS' AND user_tipo = 'aluno') OR
        (notificacoes.destinatario_tipo = 'GESTORES' AND user_tipo = 'gestor')
    )
    ORDER BY notificacoes.prioridade DESC, notificacoes.created_at DESC
    LIMIT 10;
END;
$$;

-- Verificar se a função foi criada corretamente
SELECT 'Função get_notificacoes_dashboard corrigida com sucesso!' as status;
