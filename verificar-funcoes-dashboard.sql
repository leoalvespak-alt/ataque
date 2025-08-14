-- Script para verificar se as funções do dashboard foram criadas corretamente

-- =====================================================
-- 1. VERIFICAR SE AS FUNÇÕES EXISTEM
-- =====================================================

-- Verificar função de estatísticas detalhadas
SELECT 'Verificando função get_estatisticas_detalhadas_usuario...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_estatisticas_detalhadas_usuario';

-- Verificar função de tópicos de dificuldade
SELECT 'Verificando função get_topicos_maior_dificuldade...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_topicos_maior_dificuldade';

-- Verificar função de percentual por disciplina
SELECT 'Verificando função get_percentual_por_disciplina_assunto...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_percentual_por_disciplina_assunto';

-- Verificar função de progresso diário
SELECT 'Verificando função get_progresso_ultimos_7_dias...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_progresso_ultimos_7_dias';

-- Verificar função de notificações
SELECT 'Verificando função get_notificacoes_dashboard...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_notificacoes_dashboard';

-- Verificar função de dicas de estudo
SELECT 'Verificando função get_dicas_estudo...' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_dicas_estudo';

-- =====================================================
-- 2. VERIFICAR SE A TABELA DICAS_ESTUDO EXISTE
-- =====================================================

SELECT 'Verificando tabela dicas_estudo...' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'dicas_estudo';

-- =====================================================
-- 3. VERIFICAR ESTRUTURA DA TABELA DISCIPLINAS
-- =====================================================

SELECT 'Verificando estrutura da tabela disciplinas...' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'disciplinas' 
ORDER BY ordinal_position;

-- =====================================================
-- 4. VERIFICAR SE EXISTEM DADOS NAS TABELAS
-- =====================================================

-- Verificar se existem disciplinas
SELECT 'Verificando dados na tabela disciplinas...' as info;
SELECT COUNT(*) as total_disciplinas FROM disciplinas;

-- Verificar se existem respostas de usuários
SELECT 'Verificando dados na tabela respostas_usuarios...' as info;
SELECT COUNT(*) as total_respostas FROM respostas_usuarios;

-- Verificar se existem dicas de estudo
SELECT 'Verificando dados na tabela dicas_estudo...' as info;
SELECT COUNT(*) as total_dicas FROM dicas_estudo;

-- =====================================================
-- 5. TESTAR FUNÇÕES (se existirem)
-- =====================================================

-- Testar função de dicas (deve funcionar mesmo sem dados)
SELECT 'Testando função get_dicas_estudo...' as info;
SELECT * FROM get_dicas_estudo() LIMIT 5;

-- =====================================================
-- 6. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 'Verificando políticas RLS da tabela dicas_estudo...' as info;
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'dicas_estudo';

-- =====================================================
-- 7. VERIFICAR ÍNDICES
-- =====================================================

SELECT 'Verificando índices da tabela dicas_estudo...' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'dicas_estudo';

-- =====================================================
-- 8. RESUMO
-- =====================================================

SELECT '=== RESUMO DA VERIFICAÇÃO ===' as info;

-- Contar funções criadas
SELECT 'Total de funções criadas:' as info, COUNT(*) as total
FROM information_schema.routines 
WHERE routine_name IN (
    'get_estatisticas_detalhadas_usuario',
    'get_topicos_maior_dificuldade',
    'get_percentual_por_disciplina_assunto',
    'get_progresso_ultimos_7_dias',
    'get_notificacoes_dashboard',
    'get_dicas_estudo'
);

-- Verificar tabelas
SELECT 'Tabelas criadas:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('dicas_estudo', 'disciplinas', 'respostas_usuarios', 'usuarios', 'notificacoes')
ORDER BY table_name;
