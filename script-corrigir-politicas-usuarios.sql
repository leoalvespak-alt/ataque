-- =====================================================
-- SCRIPT PARA CORRIGIR POLÍTICAS DE SEGURANÇA DOS USUÁRIOS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DA TABELA USUARIOS
-- =====================================================

-- Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. REMOVER POLÍTICAS EXISTENTES
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários são visíveis para todos" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem gerenciar todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem inserir usuários" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer usuário" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem deletar usuários" ON usuarios;

-- =====================================================
-- 3. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================

-- Desabilitar RLS para permitir operações de administração
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. VERIFICAR DADOS EXISTENTES
-- =====================================================

-- Verificar se há usuários na tabela
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar tipos de usuário existentes
SELECT tipo_usuario, COUNT(*) as quantidade 
FROM usuarios 
GROUP BY tipo_usuario;

-- =====================================================
-- 5. HABILITAR RLS COM POLÍTICAS CORRETAS
-- =====================================================

-- Habilitar RLS novamente
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Política 1: Permitir inserção de novos usuários (cadastro)
CREATE POLICY "Permitir inserção de novos usuários" ON usuarios
    FOR INSERT
    WITH CHECK (true);

-- Política 2: Usuários podem ver seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
    FOR SELECT
    USING (auth.uid() = id);

-- Política 3: Usuários podem atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios
    FOR UPDATE
    USING (auth.uid() = id);

-- Política 4: Administradores podem ver todos os usuários
CREATE POLICY "Administradores podem ver todos os usuários" ON usuarios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- Política 5: Administradores podem inserir usuários
CREATE POLICY "Administradores podem inserir usuários" ON usuarios
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- Política 6: Administradores podem atualizar qualquer usuário
CREATE POLICY "Administradores podem atualizar qualquer usuário" ON usuarios
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- Política 7: Administradores podem deletar usuários
CREATE POLICY "Administradores podem deletar usuários" ON usuarios
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'gestor'
        )
    );

-- =====================================================
-- 7. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

-- Listar todas as políticas da tabela usuarios
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
WHERE tablename = 'usuarios';

-- =====================================================
-- 8. TESTAR OPERAÇÕES
-- =====================================================

-- Verificar se a tabela está acessível
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Verificar se há pelo menos um administrador
SELECT COUNT(*) as total_admins 
FROM usuarios 
WHERE tipo_usuario = 'gestor';

-- =====================================================
-- 9. CRIAR FUNÇÃO PARA INSERÇÃO SEGURA
-- =====================================================

-- Função para inserir usuário com verificação de segurança
CREATE OR REPLACE FUNCTION inserir_usuario_seguro(
    p_nome TEXT,
    p_email TEXT,
    p_senha TEXT,
    p_tipo_usuario TEXT DEFAULT 'aluno'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_id UUID;
BEGIN
    -- Verificar se o email já existe
    IF EXISTS (SELECT 1 FROM usuarios WHERE email = p_email) THEN
        RETURN 'ERRO: Email já cadastrado';
    END IF;
    
    -- Inserir novo usuário
    INSERT INTO usuarios (nome, email, senha, tipo_usuario, ativo, created_at, updated_at)
    VALUES (p_nome, p_email, p_senha, p_tipo_usuario, true, NOW(), NOW())
    RETURNING id INTO novo_id;
    
    RETURN 'SUCESSO: Usuário criado com ID ' || novo_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO: ' || SQLERRM;
END;
$$;

-- =====================================================
-- 10. VERIFICAR FUNÇÃO CRIADA
-- =====================================================

-- Verificar se a função foi criada
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'inserir_usuario_seguro';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de conclusão
SELECT 'Políticas de segurança dos usuários configuradas com sucesso!' as status;
