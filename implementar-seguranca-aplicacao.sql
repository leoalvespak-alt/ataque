-- Script para implementar segurança na camada da aplicação
-- Este script cria funções que substituem as políticas RLS complexas

-- =====================================================
-- 1. FUNÇÕES DE SEGURANÇA PARA USUÁRIOS
-- =====================================================

-- Função para obter usuário atual com validação
CREATE OR REPLACE FUNCTION get_usuario_atual()
RETURNS TABLE (
    id UUID,
    nome VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(20),
    xp INTEGER,
    patente_id INTEGER,
    tipo_usuario VARCHAR(20),
    questoes_respondidas INTEGER,
    ultimo_login TIMESTAMP,
    profile_picture_url VARCHAR(255),
    ativo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.email,
        u.status,
        u.xp,
        u.patente_id,
        u.tipo_usuario,
        u.questoes_respondidas,
        u.ultimo_login,
        u.profile_picture_url,
        u.ativo,
        u.created_at,
        u.updated_at
    FROM usuarios u
    WHERE u.id::text = auth.uid()::text
    AND u.ativo = true;
END;
$$;

-- Função para atualizar perfil do usuário atual
CREATE OR REPLACE FUNCTION atualizar_perfil_usuario(
    novo_nome VARCHAR(255) DEFAULT NULL,
    nova_profile_picture_url VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE usuarios 
    SET 
        nome = COALESCE(novo_nome, nome),
        profile_picture_url = COALESCE(nova_profile_picture_url, profile_picture_url),
        updated_at = NOW()
    WHERE id::text = auth.uid()::text
    AND ativo = true;
    
    RETURN FOUND;
END;
$$;

-- Função para obter todos os usuários (apenas para gestores)
CREATE OR REPLACE FUNCTION get_usuarios_admin()
RETURNS TABLE (
    id UUID,
    nome VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(20),
    xp INTEGER,
    tipo_usuario VARCHAR(20),
    questoes_respondidas INTEGER,
    ultimo_login TIMESTAMP,
    ativo BOOLEAN,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário atual é gestor
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text 
        AND tipo_usuario = 'gestor' 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas gestores podem acessar esta função';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.email,
        u.status,
        u.xp,
        u.tipo_usuario,
        u.questoes_respondidas,
        u.ultimo_login,
        u.ativo,
        u.created_at
    FROM usuarios u
    WHERE u.ativo = true
    ORDER BY u.created_at DESC;
END;
$$;

-- =====================================================
-- 2. FUNÇÕES DE SEGURANÇA PARA NOTIFICAÇÕES
-- =====================================================

-- Função para obter notificações do usuário atual
CREATE OR REPLACE FUNCTION get_notificacoes_usuario()
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(255),
    mensagem TEXT,
    tipo VARCHAR(50),
    lida BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.lida,
        n.created_at,
        n.updated_at
    FROM notificacoes n
    WHERE n.usuario_id::text = auth.uid()::text
    ORDER BY n.created_at DESC;
END;
$$;

-- Função para criar notificação (apenas para gestores)
CREATE OR REPLACE FUNCTION criar_notificacao(
    usuario_destino_id UUID,
    titulo_notificacao VARCHAR(255),
    mensagem_notificacao TEXT,
    tipo_notificacao VARCHAR(50) DEFAULT 'GERAL'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nova_notificacao_id INTEGER;
BEGIN
    -- Verificar se o usuário atual é gestor
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text 
        AND tipo_usuario = 'gestor' 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Acesso negado: apenas gestores podem criar notificações';
    END IF;
    
    -- Verificar se o usuário destino existe
    IF NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = usuario_destino_id 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Usuário destino não encontrado';
    END IF;
    
    -- Inserir notificação
    INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo)
    VALUES (usuario_destino_id, titulo_notificacao, mensagem_notificacao, tipo_notificacao)
    RETURNING id INTO nova_notificacao_id;
    
    RETURN nova_notificacao_id;
END;
$$;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida_segura(notificacao_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE notificacoes 
    SET lida = TRUE, updated_at = NOW()
    WHERE id = notificacao_id 
    AND usuario_id::text = auth.uid()::text;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- 3. FUNÇÕES DE SEGURANÇA PARA RESPOSTAS
-- =====================================================

-- Função para obter respostas do usuário atual
CREATE OR REPLACE FUNCTION get_respostas_usuario()
RETURNS TABLE (
    id INTEGER,
    questao_id INTEGER,
    alternativa_marcada VARCHAR(1),
    acertou BOOLEAN,
    tempo_resposta INTEGER,
    data_resposta TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ru.id,
        ru.questao_id,
        ru.alternativa_marcada,
        ru.acertou,
        ru.tempo_resposta,
        ru.data_resposta
    FROM respostas_usuarios ru
    WHERE ru.usuario_id::text = auth.uid()::text
    ORDER BY ru.data_resposta DESC;
END;
$$;

-- Função para inserir resposta do usuário
CREATE OR REPLACE FUNCTION inserir_resposta_usuario(
    questao_id_param INTEGER,
    alternativa_marcada_param VARCHAR(1),
    acertou_param BOOLEAN,
    tempo_resposta_param INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nova_resposta_id INTEGER;
BEGIN
    -- Verificar se a questão existe
    IF NOT EXISTS (
        SELECT 1 FROM questoes 
        WHERE id = questao_id_param 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Questão não encontrada';
    END IF;
    
    -- Verificar se o usuário já respondeu esta questão
    IF EXISTS (
        SELECT 1 FROM respostas_usuarios 
        WHERE usuario_id::text = auth.uid()::text 
        AND questao_id = questao_id_param
    ) THEN
        RAISE EXCEPTION 'Usuário já respondeu esta questão';
    END IF;
    
    -- Inserir resposta
    INSERT INTO respostas_usuarios (usuario_id, questao_id, alternativa_marcada, acertou, tempo_resposta)
    VALUES (auth.uid()::uuid, questao_id_param, alternativa_marcada_param, acertou_param, tempo_resposta_param)
    RETURNING id INTO nova_resposta_id;
    
    -- Atualizar estatísticas do usuário
    UPDATE usuarios 
    SET 
        questoes_respondidas = questoes_respondidas + 1,
        xp = xp + CASE WHEN acertou_param THEN 10 ELSE 1 END,
        updated_at = NOW()
    WHERE id::text = auth.uid()::text;
    
    RETURN nova_resposta_id;
END;
$$;

-- =====================================================
-- 4. FUNÇÕES DE SEGURANÇA PARA COMENTÁRIOS
-- =====================================================

-- Função para obter comentários do usuário atual
CREATE OR REPLACE FUNCTION get_comentarios_usuario()
RETURNS TABLE (
    id INTEGER,
    texto TEXT,
    tipo VARCHAR(20),
    questao_id INTEGER,
    likes INTEGER,
    aprovado BOOLEAN,
    respondido BOOLEAN,
    resposta_admin TEXT,
    data_criacao TIMESTAMP,
    data_resposta TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.id,
        ca.texto,
        ca.tipo,
        ca.questao_id,
        ca.likes,
        ca.aprovado,
        ca.respondido,
        ca.resposta_admin,
        ca.data_criacao,
        ca.data_resposta
    FROM comentarios_alunos ca
    WHERE ca.usuario_id::text = auth.uid()::text
    ORDER BY ca.data_criacao DESC;
END;
$$;

-- Função para inserir comentário
CREATE OR REPLACE FUNCTION inserir_comentario(
    texto_comentario TEXT,
    questao_id_param INTEGER,
    tipo_comentario VARCHAR(20) DEFAULT 'GERAL'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_comentario_id INTEGER;
BEGIN
    -- Verificar se a questão existe
    IF NOT EXISTS (
        SELECT 1 FROM questoes 
        WHERE id = questao_id_param 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Questão não encontrada';
    END IF;
    
    -- Inserir comentário
    INSERT INTO comentarios_alunos (texto, tipo, usuario_id, questao_id)
    VALUES (texto_comentario, tipo_comentario, auth.uid()::uuid, questao_id_param)
    RETURNING id INTO novo_comentario_id;
    
    RETURN novo_comentario_id;
END;
$$;

-- =====================================================
-- 5. FUNÇÕES DE SEGURANÇA PARA CADERNOS
-- =====================================================

-- Função para obter cadernos do usuário atual
CREATE OR REPLACE FUNCTION get_cadernos_usuario()
RETURNS TABLE (
    id INTEGER,
    nome VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        c.created_at,
        c.updated_at
    FROM cadernos c
    WHERE c.aluno_id::text = auth.uid()::text
    ORDER BY c.created_at DESC;
END;
$$;

-- Função para criar caderno
CREATE OR REPLACE FUNCTION criar_caderno(nome_caderno VARCHAR(255))
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_caderno_id INTEGER;
BEGIN
    -- Inserir caderno
    INSERT INTO cadernos (aluno_id, nome)
    VALUES (auth.uid()::uuid, nome_caderno)
    RETURNING id INTO novo_caderno_id;
    
    RETURN novo_caderno_id;
END;
$$;

-- Função para adicionar questão ao caderno
CREATE OR REPLACE FUNCTION adicionar_questao_caderno(
    caderno_id_param INTEGER,
    questao_id_param INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o caderno pertence ao usuário
    IF NOT EXISTS (
        SELECT 1 FROM cadernos 
        WHERE id = caderno_id_param 
        AND aluno_id::text = auth.uid()::text
    ) THEN
        RAISE EXCEPTION 'Caderno não encontrado ou não pertence ao usuário';
    END IF;
    
    -- Verificar se a questão existe
    IF NOT EXISTS (
        SELECT 1 FROM questoes 
        WHERE id = questao_id_param 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Questão não encontrada';
    END IF;
    
    -- Adicionar questão ao caderno
    INSERT INTO cadernos_questoes (caderno_id, questao_id)
    VALUES (caderno_id_param, questao_id_param)
    ON CONFLICT (caderno_id, questao_id) DO NOTHING;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- 6. FUNÇÕES DE SEGURANÇA PARA FAVORITOS
-- =====================================================

-- Função para obter favoritos do usuário atual
CREATE OR REPLACE FUNCTION get_favoritos_usuario()
RETURNS TABLE (
    id INTEGER,
    questao_id INTEGER,
    created_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fq.id,
        fq.questao_id,
        fq.created_at
    FROM favoritos_questoes fq
    WHERE fq.usuario_id::text = auth.uid()::text
    ORDER BY fq.created_at DESC;
END;
$$;

-- Função para adicionar questão aos favoritos
CREATE OR REPLACE FUNCTION adicionar_favorito(questao_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_favorito_id INTEGER;
BEGIN
    -- Verificar se a questão existe
    IF NOT EXISTS (
        SELECT 1 FROM questoes 
        WHERE id = questao_id_param 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Questão não encontrada';
    END IF;
    
    -- Adicionar aos favoritos
    INSERT INTO favoritos_questoes (usuario_id, questao_id)
    VALUES (auth.uid()::uuid, questao_id_param)
    ON CONFLICT (usuario_id, questao_id) DO NOTHING
    RETURNING id INTO novo_favorito_id;
    
    RETURN novo_favorito_id;
END;
$$;

-- Função para remover questão dos favoritos
CREATE OR REPLACE FUNCTION remover_favorito(questao_id_param INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM favoritos_questoes 
    WHERE usuario_id::text = auth.uid()::text 
    AND questao_id = questao_id_param;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- 7. FUNÇÕES DE ESTATÍSTICAS
-- =====================================================

-- Função para obter estatísticas do usuário atual
CREATE OR REPLACE FUNCTION get_estatisticas_usuario()
RETURNS TABLE (
    total_questoes_respondidas INTEGER,
    total_acertos INTEGER,
    total_erros INTEGER,
    percentual_acerto DECIMAL(5,2),
    xp_atual INTEGER,
    patente_atual VARCHAR(100),
    total_comentarios INTEGER,
    total_cadernos INTEGER,
    total_favoritos INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.questoes_respondidas as total_questoes_respondidas,
        (SELECT COUNT(*) FROM respostas_usuarios ru WHERE ru.usuario_id::text = auth.uid()::text AND ru.acertou = true) as total_acertos,
        (SELECT COUNT(*) FROM respostas_usuarios ru WHERE ru.usuario_id::text = auth.uid()::text AND ru.acertou = false) as total_erros,
        CASE 
            WHEN u.questoes_respondidas > 0 THEN 
                ROUND((SELECT COUNT(*)::DECIMAL FROM respostas_usuarios ru WHERE ru.usuario_id::text = auth.uid()::text AND ru.acertou = true) / u.questoes_respondidas * 100, 2)
            ELSE 0 
        END as percentual_acerto,
        u.xp as xp_atual,
        COALESCE(p.nome, 'Sem patente') as patente_atual,
        (SELECT COUNT(*) FROM comentarios_alunos ca WHERE ca.usuario_id::text = auth.uid()::text) as total_comentarios,
        (SELECT COUNT(*) FROM cadernos c WHERE c.aluno_id::text = auth.uid()::text) as total_cadernos,
        (SELECT COUNT(*) FROM favoritos_questoes fq WHERE fq.usuario_id::text = auth.uid()::text) as total_favoritos
    FROM usuarios u
    LEFT JOIN patentes p ON u.patente_id = p.id
    WHERE u.id::text = auth.uid()::text;
END;
$$;

-- =====================================================
-- 8. MENSAGEM DE CONCLUSÃO
-- =====================================================

SELECT 'Funções de segurança implementadas com sucesso!' as status;
SELECT 'Agora a segurança está na camada da aplicação' as observacao;
SELECT 'Use estas funções em vez de acessar as tabelas diretamente' as recomendacao;
