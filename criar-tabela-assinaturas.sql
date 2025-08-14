-- =====================================================
-- CRIAR TABELA ASSINATURAS_USUARIOS
-- =====================================================

-- Criar tabela assinaturas_usuarios se não existir
CREATE TABLE IF NOT EXISTS assinaturas_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
    asaas_subscription_id VARCHAR(100),
    data_inicio TIMESTAMP DEFAULT NOW(),
    data_expiracao TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'inadimplente', 'expirada')),
    valor_pago DECIMAL(10,2) NOT NULL,
    proxima_cobranca TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Desabilitar RLS temporariamente
ALTER TABLE assinaturas_usuarios DISABLE ROW LEVEL SECURITY;

-- Criar política permissiva
DROP POLICY IF EXISTS "Permitir todas operações assinaturas" ON assinaturas_usuarios;
CREATE POLICY "Permitir todas operações assinaturas"
ON assinaturas_usuarios FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assinaturas_usuarios'
ORDER BY ordinal_position;
