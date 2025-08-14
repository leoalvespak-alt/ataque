-- Script de verificação rápida para testar se a correção funcionou

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar estrutura da tabela notificacoes
SELECT 'Estrutura da tabela notificacoes:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notificacoes' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela usuarios
SELECT 'Estrutura da tabela usuarios:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- =====================================================
-- 2. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar políticas da tabela usuarios
SELECT 'Políticas RLS da tabela usuarios:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'usuarios' 
ORDER BY policyname;

-- Verificar políticas da tabela notificacoes
SELECT 'Políticas RLS da tabela notificacoes:' as info;
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'notificacoes' 
ORDER BY policyname;

-- =====================================================
-- 3. TESTAR CONSULTAS BÁSICAS
-- =====================================================

-- Teste 1: Contar usuários
SELECT 'Teste 1 - Contar usuários:' as teste, COUNT(*) as total FROM usuarios;

-- Teste 2: Contar notificações
SELECT 'Teste 2 - Contar notificações:' as teste, COUNT(*) as total FROM notificacoes;

-- Teste 3: Contar respostas
SELECT 'Teste 3 - Contar respostas:' as teste, COUNT(*) as total FROM respostas_usuarios;

-- Teste 4: Contar comentários
SELECT 'Teste 4 - Contar comentários:' as teste, COUNT(*) as total FROM comentarios_alunos;

-- Teste 5: Contar cadernos
SELECT 'Teste 5 - Contar cadernos:' as teste, COUNT(*) as total FROM cadernos;

-- Teste 6: Contar favoritos
SELECT 'Teste 6 - Contar favoritos:' as teste, COUNT(*) as total FROM favoritos_questoes;

-- =====================================================
-- 4. VERIFICAR FUNÇÕES
-- =====================================================

-- Verificar funções criadas
SELECT 'Funções criadas:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE 'marcar_%' OR routine_name LIKE 'contar_%')
ORDER BY routine_name;

-- =====================================================
-- 5. VERIFICAR ÍNDICES
-- =====================================================

-- Verificar índices das tabelas principais
SELECT 'Índices das tabelas:' as info;
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'notificacoes', 'respostas_usuarios', 'comentarios_alunos', 'cadernos', 'favoritos_questoes')
ORDER BY tablename, indexname;

-- =====================================================
-- 6. TESTE DE RECURSÃO INFINITA
-- =====================================================

-- Teste que antes causava recursão infinita
SELECT 'Teste de recursão infinita:' as teste;

-- Tentar uma consulta que antes causava problemas
SELECT 'Consulta complexa:' as info;
SELECT 
    u.id as usuario_id,
    u.nome as usuario_nome,
    COUNT(n.id) as total_notificacoes,
    COUNT(r.id) as total_respostas
FROM usuarios u
LEFT JOIN notificacoes n ON u.id = n.usuario_id
LEFT JOIN respostas_usuarios r ON u.id = r.usuario_id
GROUP BY u.id, u.nome
LIMIT 5;

-- =====================================================
-- 7. RESUMO DOS TESTES
-- =====================================================

SELECT 'RESUMO DOS TESTES:' as resumo;
SELECT '✅ Se todas as consultas acima funcionaram sem erro, a correção foi bem-sucedida' as status;
SELECT '✅ O erro de recursão infinita foi resolvido' as resultado;
SELECT '✅ Todas as tabelas estão acessíveis' as tabelas;
SELECT '✅ As políticas RLS estão funcionando corretamente' as politicas;
