-- =====================================================
-- CORREÇÃO DAS POLÍTICAS DA TABELA QUESTOES
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
-- CORREÇÃO DAS POLÍTICAS DA TABELA PLANOS
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
