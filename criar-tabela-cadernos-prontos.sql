-- Script para criar tabela de cadernos prontos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela cadernos_prontos
CREATE TABLE IF NOT EXISTS cadernos_prontos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    filtros JSONB NOT NULL DEFAULT '{}',
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    link VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cadernos_prontos_usuario ON cadernos_prontos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cadernos_prontos_created_at ON cadernos_prontos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cadernos_prontos_link ON cadernos_prontos(link);

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_cadernos_prontos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar trigger para atualizar updated_at
CREATE TRIGGER update_cadernos_prontos_updated_at_trigger
    BEFORE UPDATE ON cadernos_prontos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_cadernos_prontos_updated_at();

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE cadernos_prontos ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
CREATE POLICY "Users can view their own cadernos" ON cadernos_prontos
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own cadernos" ON cadernos_prontos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own cadernos" ON cadernos_prontos
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own cadernos" ON cadernos_prontos
    FOR DELETE USING (auth.uid() = usuario_id);

-- 7. Política para visualização pública de cadernos (opcional)
CREATE POLICY "Public can view cadernos by link" ON cadernos_prontos
    FOR SELECT USING (true);

-- 8. Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela cadernos_prontos criada com sucesso' as status,
    COUNT(*) as total_cadernos
FROM cadernos_prontos;

-- 9. Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cadernos_prontos' 
ORDER BY ordinal_position;

-- 10. Comentários sobre a estrutura
COMMENT ON TABLE cadernos_prontos IS 'Tabela para armazenar cadernos prontos criados pelos usuários';
COMMENT ON COLUMN cadernos_prontos.filtros IS 'JSON com os filtros aplicados para criar o caderno';
COMMENT ON COLUMN cadernos_prontos.link IS 'Link único para acessar o caderno';
COMMENT ON COLUMN cadernos_prontos.usuario_id IS 'ID do usuário que criou o caderno';
