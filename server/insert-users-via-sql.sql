-- =====================================================
-- INSERIR USUÁRIOS DIRETAMENTE VIA SQL
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- Primeiro, desabilitar RLS temporariamente
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Inserir usuário Admin
INSERT INTO usuarios (id, nome, email, tipo_usuario, status, xp, questoes_respondidas)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Administrador',
    'admin@rotadeataque.com',
    'gestor',
    'ativo',
    0,
    0
)
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário Aluno
INSERT INTO usuarios (id, nome, email, tipo_usuario, status, xp, questoes_respondidas)
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'João Silva',
    'joao@teste.com',
    'aluno',
    'gratuito',
    0,
    0
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se os usuários foram inseridos
SELECT id, nome, email, tipo_usuario, status FROM usuarios;

-- Reabilitar RLS (opcional - para produção)
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
