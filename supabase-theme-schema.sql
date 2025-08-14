-- Schema para sistema de temas dinâmicos
-- Execute este SQL no painel do Supabase

-- 1. Criar tabela de temas
CREATE TABLE IF NOT EXISTS themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tokens JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    version VARCHAR(50) DEFAULT '1.0.0'
);

-- 2. Criar índice para busca por tema ativo
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active) WHERE is_active = true;

-- 3. Criar índice para busca por tema padrão
CREATE INDEX IF NOT EXISTS idx_themes_default ON themes(is_default) WHERE is_default = true;

-- 4. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para atualizar updated_at
CREATE TRIGGER update_themes_updated_at 
    BEFORE UPDATE ON themes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar função para garantir apenas um tema ativo
CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo registro será ativo, desativar todos os outros
    IF NEW.is_active = true THEN
        UPDATE themes 
        SET is_active = false 
        WHERE id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar trigger para garantir apenas um tema ativo
CREATE TRIGGER ensure_single_active_theme_trigger
    BEFORE INSERT OR UPDATE ON themes
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_theme();

-- 8. Criar função para garantir apenas um tema padrão
CREATE OR REPLACE FUNCTION ensure_single_default_theme()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o novo registro será padrão, remover padrão dos outros
    IF NEW.is_default = true THEN
        UPDATE themes 
        SET is_default = false 
        WHERE id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar trigger para garantir apenas um tema padrão
CREATE TRIGGER ensure_single_default_theme_trigger
    BEFORE INSERT OR UPDATE ON themes
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_theme();

-- 10. Configurar RLS (Row Level Security)
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- 11. Política para leitura pública (todos podem ver temas)
CREATE POLICY "Themes are viewable by everyone" ON themes
    FOR SELECT USING (true);

-- 12. Política para inserção (apenas usuários autenticados)
CREATE POLICY "Authenticated users can create themes" ON themes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 13. Política para atualização (apenas gestores ou criador do tema)
CREATE POLICY "Users can update their own themes or gestors can update any" ON themes
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 14. Política para exclusão (apenas gestores ou criador do tema)
CREATE POLICY "Users can delete their own themes or gestors can delete any" ON themes
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo_usuario = 'gestor'
        )
    );

-- 15. Inserir tema padrão baseado na auditoria
INSERT INTO themes (name, description, tokens, is_active, is_default, created_by) VALUES (
    'Tema Padrão',
    'Tema padrão da plataforma baseado na auditoria de cores',
    '{
        "metadata": {
            "generatedAt": "2024-01-15T00:00:00.000Z",
            "source": "theme-audit.json",
            "version": "1.0.0"
        },
        "tokens": {
            "colors": {
                "primary-500": {
                    "hex": "#3b82f6",
                    "hsl": {"h": 217, "s": 91, "l": 60},
                    "variants": ["#3b82f6", "#2563eb", "#1d4ed8"]
                },
                "secondary-500": {
                    "hex": "#6b7280",
                    "hsl": {"h": 220, "s": 9, "l": 46},
                    "variants": ["#6b7280", "#4b5563", "#374151"]
                },
                "success-500": {
                    "hex": "#22c55e",
                    "hsl": {"h": 142, "s": 71, "l": 45},
                    "variants": ["#22c55e", "#16a34a", "#15803d"]
                },
                "warning-500": {
                    "hex": "#f59e0b",
                    "hsl": {"h": 38, "s": 92, "l": 50},
                    "variants": ["#f59e0b", "#d97706", "#b45309"]
                },
                "error-500": {
                    "hex": "#ef4444",
                    "hsl": {"h": 0, "s": 84, "l": 60},
                    "variants": ["#ef4444", "#dc2626", "#b91c1c"]
                },
                "gray-50": {
                    "hex": "#f9fafb",
                    "hsl": {"h": 210, "s": 20, "l": 98},
                    "variants": ["#f9fafb"]
                },
                "gray-100": {
                    "hex": "#f3f4f6",
                    "hsl": {"h": 220, "s": 14, "l": 96},
                    "variants": ["#f3f4f6"]
                },
                "gray-200": {
                    "hex": "#e5e7eb",
                    "hsl": {"h": 220, "s": 13, "l": 91},
                    "variants": ["#e5e7eb"]
                },
                "gray-300": {
                    "hex": "#d1d5db",
                    "hsl": {"h": 216, "s": 12, "l": 84},
                    "variants": ["#d1d5db"]
                },
                "gray-400": {
                    "hex": "#9ca3af",
                    "hsl": {"h": 217, "s": 16, "l": 65},
                    "variants": ["#9ca3af"]
                },
                "gray-500": {
                    "hex": "#6b7280",
                    "hsl": {"h": 220, "s": 9, "l": 46},
                    "variants": ["#6b7280"]
                },
                "gray-600": {
                    "hex": "#4b5563",
                    "hsl": {"h": 215, "s": 16, "l": 34},
                    "variants": ["#4b5563"]
                },
                "gray-700": {
                    "hex": "#374151",
                    "hsl": {"h": 216, "s": 19, "l": 27},
                    "variants": ["#374151"]
                },
                "gray-800": {
                    "hex": "#1f2937",
                    "hsl": {"h": 217, "s": 33, "l": 17},
                    "variants": ["#1f2937"]
                },
                "gray-900": {
                    "hex": "#111827",
                    "hsl": {"h": 222, "s": 47, "l": 11},
                    "variants": ["#111827"]
                },
                "white": {
                    "hex": "#ffffff",
                    "hsl": {"h": 0, "s": 0, "l": 100},
                    "variants": ["#ffffff"]
                },
                "black": {
                    "hex": "#000000",
                    "hsl": {"h": 0, "s": 0, "l": 0},
                    "variants": ["#000000"]
                }
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
                "spacing-xs": "2px",
                "spacing-sm": "8px",
                "spacing-md": "16px",
                "spacing-lg": "24px",
                "spacing-xl": "32px",
                "spacing-2xl": "48px",
                "spacing-3xl": "64px"
            },
            "typography": {
                "font-family-sans": "Inter, system-ui, -apple-system, sans-serif",
                "font-family-mono": "JetBrains Mono, Consolas, monospace",
                "font-size-xs": "12px",
                "font-size-sm": "14px",
                "font-size-base": "16px",
                "font-size-lg": "18px",
                "font-size-xl": "20px",
                "font-size-2xl": "24px",
                "font-size-3xl": "30px",
                "font-size-4xl": "36px",
                "font-size-5xl": "48px",
                "font-weight-light": "300",
                "font-weight-normal": "400",
                "font-weight-medium": "500",
                "font-weight-semibold": "600",
                "font-weight-bold": "700",
                "line-height-tight": "1.25",
                "line-height-normal": "1.5",
                "line-height-relaxed": "1.75"
            },
            "borders": {
                "border-radius-none": "0",
                "border-radius-sm": "2px",
                "border-radius-base": "4px",
                "border-radius-md": "6px",
                "border-radius-lg": "8px",
                "border-radius-xl": "12px",
                "border-radius-2xl": "16px",
                "border-radius-full": "9999px",
                "border-width-none": "0",
                "border-width-sm": "1px",
                "border-width-base": "2px",
                "border-width-lg": "4px"
            },
            "shadows": {
                "shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "shadow-base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                "shadow-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                "shadow-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            },
            "transitions": {
                "transition-fast": "150ms ease-in-out",
                "transition-base": "250ms ease-in-out",
                "transition-slow": "350ms ease-in-out",
                "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
                "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
                "ease-out": "cubic-bezier(0, 0, 0.2, 1)"
            }
        },
        "semantic": {
            "primary": {
                "light": "#3b82f6",
                "base": "#2563eb",
                "dark": "#1d4ed8"
            },
            "secondary": {
                "light": "#6b7280",
                "base": "#4b5563",
                "dark": "#374151"
            },
            "success": {
                "light": "#22c55e",
                "base": "#16a34a",
                "dark": "#15803d"
            },
            "warning": {
                "light": "#f59e0b",
                "base": "#d97706",
                "dark": "#b45309"
            },
            "error": {
                "light": "#ef4444",
                "base": "#dc2626",
                "dark": "#b91c1c"
            },
            "background": {
                "primary": "#ffffff",
                "secondary": "#f9fafb",
                "tertiary": "#f3f4f6"
            },
            "surface": {
                "primary": "#ffffff",
                "secondary": "#f9fafb",
                "tertiary": "#f3f4f6"
            },
            "text": {
                "primary": "#111827",
                "secondary": "#4b5563",
                "tertiary": "#9ca3af",
                "inverse": "#ffffff"
            }
        }
    }',
    true,
    true,
    NULL
) ON CONFLICT DO NOTHING;

-- 16. Verificar se a inserção foi bem-sucedida
SELECT 
    id,
    name,
    is_active,
    is_default,
    created_at
FROM themes 
WHERE is_default = true;

-- 17. Comentários sobre a estrutura
COMMENT ON TABLE themes IS 'Tabela para armazenar temas dinâmicos da aplicação';
COMMENT ON COLUMN themes.tokens IS 'JSON com todos os tokens de design (cores, espaçamentos, tipografia, etc.)';
COMMENT ON COLUMN themes.is_active IS 'Indica se este tema está atualmente ativo na aplicação';
COMMENT ON COLUMN themes.is_default IS 'Indica se este é o tema padrão da aplicação';
