-- Script para recriar a tabela themes do zero
-- ATENÇÃO: Este script irá apagar todos os dados existentes na tabela themes
-- Execute apenas se você tem certeza de que quer recriar a tabela

-- 1. Fazer backup dos dados existentes (opcional)
CREATE TABLE IF NOT EXISTS themes_backup AS 
SELECT * FROM themes;

-- 2. Remover a tabela themes existente
DROP TABLE IF EXISTS themes CASCADE;

-- 3. Criar a tabela themes com a estrutura correta
CREATE TABLE themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    tokens JSONB NOT NULL DEFAULT '{}',
    semantic JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    version VARCHAR(50) DEFAULT '1.0.0'
);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_themes_default ON themes(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para atualizar updated_at
CREATE TRIGGER update_themes_updated_at_trigger
    BEFORE UPDATE ON themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_themes_updated_at();

-- 7. Configurar RLS (Row Level Security)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de segurança
CREATE POLICY "Themes are viewable by everyone" ON themes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create themes" ON themes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own themes or gestors can update any" ON themes
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

CREATE POLICY "Users can delete their own themes or gestors can delete any" ON themes
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 9. Inserir tema padrão
INSERT INTO themes (name, description, tokens, semantic, is_active, is_default) VALUES (
    'Tema Padrão',
    'Tema padrão da aplicação Rota de Ataque',
    '{
        "colors": {
            "primary-500": {"hex": "#8b0000", "hsl": {"h": 0, "s": 100, "l": 27}, "variants": ["#8b0000", "#a00000", "#c1121f"]},
            "secondary-500": {"hex": "#6b7280", "hsl": {"h": 220, "s": 9, "l": 46}, "variants": ["#6b7280", "#4b5563", "#374151"]},
            "success-500": {"hex": "#22c55e", "hsl": {"h": 142, "s": 71, "l": 45}, "variants": ["#22c55e", "#16a34a", "#15803d"]},
            "warning-500": {"hex": "#f59e0b", "hsl": {"h": 38, "s": 92, "l": 50}, "variants": ["#f59e0b", "#d97706", "#b45309"]},
            "error-500": {"hex": "#ef4444", "hsl": {"h": 0, "s": 84, "l": 60}, "variants": ["#ef4444", "#dc2626", "#b91c1c"]},
            "gray-50": {"hex": "#f9fafb", "hsl": {"h": 210, "s": 20, "l": 98}, "variants": ["#f9fafb"]},
            "gray-100": {"hex": "#f3f4f6", "hsl": {"h": 220, "s": 14, "l": 96}, "variants": ["#f3f4f6"]},
            "gray-200": {"hex": "#e5e7eb", "hsl": {"h": 220, "s": 13, "l": 91}, "variants": ["#e5e7eb"]},
            "gray-300": {"hex": "#d1d5db", "hsl": {"h": 216, "s": 12, "l": 84}, "variants": ["#d1d5db"]},
            "gray-400": {"hex": "#9ca3af", "hsl": {"h": 217, "s": 16, "l": 65}, "variants": ["#9ca3af"]},
            "gray-500": {"hex": "#6b7280", "hsl": {"h": 220, "s": 9, "l": 46}, "variants": ["#6b7280"]},
            "gray-600": {"hex": "#4b5563", "hsl": {"h": 215, "s": 16, "l": 34}, "variants": ["#4b5563"]},
            "gray-700": {"hex": "#374151", "hsl": {"h": 216, "s": 19, "l": 27}, "variants": ["#374151"]},
            "gray-800": {"hex": "#1f2937", "hsl": {"h": 217, "s": 33, "l": 17}, "variants": ["#1f2937"]},
            "gray-900": {"hex": "#111827", "hsl": {"h": 222, "s": 47, "l": 11}, "variants": ["#111827"]},
            "white": {"hex": "#ffffff", "hsl": {"h": 0, "s": 0, "l": 100}, "variants": ["#ffffff"]},
            "black": {"hex": "#000000", "hsl": {"h": 0, "s": 0, "l": 0}, "variants": ["#000000"]}
        },
        "spacing": {
            "spacing-0": "0px",
            "spacing-1": "4px",
            "spacing-2": "8px",
            "spacing-3": "12px",
            "spacing-4": "16px",
            "spacing-5": "20px",
            "spacing-6": "24px",
            "spacing-8": "32px",
            "spacing-10": "40px",
            "spacing-12": "48px",
            "spacing-16": "64px",
            "spacing-20": "80px",
            "spacing-24": "96px",
            "spacing-32": "128px",
            "spacing-40": "160px",
            "spacing-48": "192px",
            "spacing-56": "224px",
            "spacing-64": "256px"
        },
        "typography": {
            "font-family-sans": "Aptos, Calibre, system-ui, sans-serif",
            "font-family-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            "font-size-xs": "0.75rem",
            "font-size-sm": "0.875rem",
            "font-size-base": "1rem",
            "font-size-lg": "1.125rem",
            "font-size-xl": "1.25rem",
            "font-size-2xl": "1.5rem",
            "font-size-3xl": "1.875rem",
            "font-size-4xl": "2.25rem",
            "font-size-5xl": "3rem",
            "font-size-6xl": "3.75rem",
            "font-weight-light": "300",
            "font-weight-normal": "400",
            "font-weight-medium": "500",
            "font-weight-semibold": "600",
            "font-weight-bold": "700",
            "line-height-tight": "1.25",
            "line-height-snug": "1.375",
            "line-height-normal": "1.5",
            "line-height-relaxed": "1.625",
            "line-height-loose": "2"
        },
        "borders": {
            "border-radius-none": "0",
            "border-radius-sm": "0.125rem",
            "border-radius-base": "0.25rem",
            "border-radius-md": "0.375rem",
            "border-radius-lg": "0.5rem",
            "border-radius-xl": "0.75rem",
            "border-radius-2xl": "1rem",
            "border-radius-3xl": "1.5rem",
            "border-radius-full": "9999px",
            "border-width-0": "0px",
            "border-width-1": "1px",
            "border-width-2": "2px",
            "border-width-4": "4px",
            "border-width-8": "8px"
        },
        "shadows": {
            "shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            "shadow-base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            "shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "shadow-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            "shadow-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
            "shadow-none": "none"
        },
        "transitions": {
            "transition-none": "none",
            "transition-all": "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-colors": "color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), text-decoration-color 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 150ms cubic-bezier(0.4, 0, 0.2, 1), stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-opacity": "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-shadow": "box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-transform": "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
        }
    }',
    '{
        "primary": {"light": "#a00000", "base": "#8b0000", "dark": "#c1121f"},
        "secondary": {"light": "#9ca3af", "base": "#6b7280", "dark": "#374151"},
        "success": {"light": "#4ade80", "base": "#22c55e", "dark": "#16a34a"},
        "warning": {"light": "#fbbf24", "base": "#f59e0b", "dark": "#d97706"},
        "error": {"light": "#f87171", "base": "#ef4444", "dark": "#dc2626"},
        "background": {"primary": "#1b1b1b", "secondary": "#242424", "tertiary": "#2a2a2a"},
        "surface": {"primary": "#242424", "secondary": "#2a2a2a", "tertiary": "#333333"},
        "text": {"primary": "#f2f2f2", "secondary": "#cccccc", "tertiary": "#9ca3af", "inverse": "#ffffff"}
    }',
    true,
    true
);

-- 10. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela criada com sucesso' as status,
    COUNT(*) as total_temas
FROM themes;

-- 11. Verificar a estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'themes' 
ORDER BY ordinal_position;
