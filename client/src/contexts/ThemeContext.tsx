import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Tipos para o sistema de temas
interface ThemeTokens {
  colors: Record<string, { hex: string; hsl: { h: number; s: number; l: number }; variants: string[] }>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

interface SemanticTokens {
  primary: { light: string; base: string; dark: string };
  secondary: { light: string; base: string; dark: string };
  success: { light: string; base: string; dark: string };
  warning: { light: string; base: string; dark: string };
  error: { light: string; base: string; dark: string };
  background: { primary: string; secondary: string; tertiary: string };
  surface: { primary: string; secondary: string; tertiary: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string };
}

interface Theme {
  id: string;
  name: string;
  description?: string;
  tokens: {
    colors: ThemeTokens['colors'];
    spacing: ThemeTokens['spacing'];
    typography: ThemeTokens['typography'];
    borders: ThemeTokens['borders'];
    shadows: ThemeTokens['shadows'];
    transitions: ThemeTokens['transitions'];
  };
  semantic: SemanticTokens;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  loading: boolean;
  error: string | null;
  applyTheme: (theme: Theme) => void;
  updateTheme: (themeId: string, updates: Partial<Theme>) => Promise<void>;
  createTheme: (theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  activateTheme: (themeId: string) => Promise<void>;
  generateCSSVariables: (theme: Theme) => string;
  applyCSSVariables: (cssVars: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Tema padrão fallback
const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Tema Padrão',
  description: 'Tema padrão da aplicação',
  tokens: {
    colors: {
      'primary-500': { hex: '#3b82f6', hsl: { h: 217, s: 91, l: 60 }, variants: ['#3b82f6', '#2563eb', '#1d4ed8'] },
      'secondary-500': { hex: '#6b7280', hsl: { h: 220, s: 9, l: 46 }, variants: ['#6b7280', '#4b5563', '#374151'] },
      'success-500': { hex: '#22c55e', hsl: { h: 142, s: 71, l: 45 }, variants: ['#22c55e', '#16a34a', '#15803d'] },
      'warning-500': { hex: '#f59e0b', hsl: { h: 38, s: 92, l: 50 }, variants: ['#f59e0b', '#d97706', '#b45309'] },
      'error-500': { hex: '#ef4444', hsl: { h: 0, s: 84, l: 60 }, variants: ['#ef4444', '#dc2626', '#b91c1c'] },
      'gray-50': { hex: '#f9fafb', hsl: { h: 210, s: 20, l: 98 }, variants: ['#f9fafb'] },
      'gray-100': { hex: '#f3f4f6', hsl: { h: 220, s: 14, l: 96 }, variants: ['#f3f4f6'] },
      'gray-200': { hex: '#e5e7eb', hsl: { h: 220, s: 13, l: 91 }, variants: ['#e5e7eb'] },
      'gray-300': { hex: '#d1d5db', hsl: { h: 216, s: 12, l: 84 }, variants: ['#d1d5db'] },
      'gray-400': { hex: '#9ca3af', hsl: { h: 217, s: 16, l: 65 }, variants: ['#9ca3af'] },
      'gray-500': { hex: '#6b7280', hsl: { h: 220, s: 9, l: 46 }, variants: ['#6b7280'] },
      'gray-600': { hex: '#4b5563', hsl: { h: 215, s: 16, l: 34 }, variants: ['#4b5563'] },
      'gray-700': { hex: '#374151', hsl: { h: 216, s: 19, l: 27 }, variants: ['#374151'] },
      'gray-800': { hex: '#1f2937', hsl: { h: 217, s: 33, l: 17 }, variants: ['#1f2937'] },
      'gray-900': { hex: '#111827', hsl: { h: 222, s: 47, l: 11 }, variants: ['#111827'] },
      'white': { hex: '#ffffff', hsl: { h: 0, s: 0, l: 100 }, variants: ['#ffffff'] },
      'black': { hex: '#000000', hsl: { h: 0, s: 0, l: 0 }, variants: ['#000000'] }
    },
    spacing: {
      'spacing-0': '0px',
      'spacing-1': '4px',
      'spacing-2': '8px',
      'spacing-3': '12px',
      'spacing-4': '16px',
      'spacing-5': '20px',
      'spacing-6': '24px',
      'spacing-8': '32px',
      'spacing-10': '40px',
      'spacing-12': '48px',
      'spacing-16': '64px',
      'spacing-20': '80px',
      'spacing-xs': '2px',
      'spacing-sm': '8px',
      'spacing-md': '16px',
      'spacing-lg': '24px',
      'spacing-xl': '32px',
      'spacing-2xl': '48px',
      'spacing-3xl': '64px'
    },
    typography: {
      'font-family-sans': 'Inter, system-ui, -apple-system, sans-serif',
      'font-family-mono': 'JetBrains Mono, Consolas, monospace',
      'font-size-xs': '12px',
      'font-size-sm': '14px',
      'font-size-base': '16px',
      'font-size-lg': '18px',
      'font-size-xl': '20px',
      'font-size-2xl': '24px',
      'font-size-3xl': '30px',
      'font-size-4xl': '36px',
      'font-size-5xl': '48px',
      'font-weight-light': '300',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-semibold': '600',
      'font-weight-bold': '700',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-relaxed': '1.75'
    },
    borders: {
      'border-radius-none': '0',
      'border-radius-sm': '2px',
      'border-radius-base': '4px',
      'border-radius-md': '6px',
      'border-radius-lg': '8px',
      'border-radius-xl': '12px',
      'border-radius-2xl': '16px',
      'border-radius-full': '9999px',
      'border-width-none': '0',
      'border-width-sm': '1px',
      'border-width-base': '2px',
      'border-width-lg': '4px'
    },
    shadows: {
      'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      'shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    transitions: {
      'transition-fast': '150ms ease-in-out',
      'transition-base': '250ms ease-in-out',
      'transition-slow': '350ms ease-in-out',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)'
    }
  },
  semantic: {
    primary: { light: '#3b82f6', base: '#2563eb', dark: '#1d4ed8' },
    secondary: { light: '#6b7280', base: '#4b5563', dark: '#374151' },
    success: { light: '#22c55e', base: '#16a34a', dark: '#15803d' },
    warning: { light: '#f59e0b', base: '#d97706', dark: '#b45309' },
    error: { light: '#ef4444', base: '#dc2626', dark: '#b91c1c' },
    background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
    surface: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
    text: { primary: '#111827', secondary: '#4b5563', tertiary: '#9ca3af', inverse: '#ffffff' }
  },
  is_active: true,
  is_default: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Função para gerar CSS variables a partir de um tema
function generateCSSVariables(theme: Theme): string {
  const cssVars: string[] = [];
  
  // Cores
  Object.entries(theme.tokens.colors).forEach(([key, value]) => {
    cssVars.push(`--color-${key}: ${value.hex};`);
  });
  
  // Espaçamentos
  Object.entries(theme.tokens.spacing).forEach(([key, value]) => {
    cssVars.push(`--spacing-${key}: ${value};`);
  });
  
  // Tipografia
  Object.entries(theme.tokens.typography).forEach(([key, value]) => {
    cssVars.push(`--font-${key}: ${value};`);
  });
  
  // Bordas
  Object.entries(theme.tokens.borders).forEach(([key, value]) => {
    cssVars.push(`--border-${key}: ${value};`);
  });
  
  // Sombras
  Object.entries(theme.tokens.shadows).forEach(([key, value]) => {
    cssVars.push(`--shadow-${key}: ${value};`);
  });
  
  // Transições
  Object.entries(theme.tokens.transitions).forEach(([key, value]) => {
    cssVars.push(`--transition-${key}: ${value};`);
  });
  
  // Tokens semânticos
  Object.entries(theme.semantic).forEach(([category, values]) => {
    if (typeof values === 'object' && values !== null) {
      Object.entries(values).forEach(([variant, value]) => {
        cssVars.push(`--${category}-${variant}: ${value};`);
      });
    }
  });
  
  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
}

// Função para aplicar CSS variables no DOM
function applyCSSVariables(cssVars: string): void {
  // Remover estilo anterior se existir
  const existingStyle = document.getElementById('theme-variables');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Criar novo elemento de estilo
  const style = document.createElement('style');
  style.id = 'theme-variables';
  style.textContent = cssVars;
  document.head.appendChild(style);
}

// Função para carregar cache do localStorage
function loadThemeCache(): { theme: Theme; updatedAt: string } | null {
  try {
    const cached = localStorage.getItem('app_theme_cache_v1');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Erro ao carregar cache do tema:', error);
  }
  return null;
}

// Função para salvar cache no localStorage
function saveThemeCache(theme: Theme): void {
  try {
    const cache = {
      theme,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('app_theme_cache_v1', JSON.stringify(cache));
  } catch (error) {
    console.warn('Erro ao salvar cache do tema:', error);
  }
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar tema ativo do Supabase
  const loadActiveTheme = async (): Promise<Theme | null> => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.warn('Erro ao carregar tema ativo:', error);
        return null;
      }

      return data as Theme;
    } catch (error) {
      console.warn('Erro ao carregar tema ativo:', error);
      return null;
    }
  };

  // Carregar todos os temas
  const loadThemes = async (): Promise<Theme[]> => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao carregar temas:', error);
        return [];
      }

      return data as Theme[];
    } catch (error) {
      console.warn('Erro ao carregar temas:', error);
      return [];
    }
  };

  // Aplicar tema
  const applyTheme = (theme: Theme): void => {
    setCurrentTheme(theme);
    const cssVars = generateCSSVariables(theme);
    applyCSSVariables(cssVars);
    saveThemeCache(theme);
  };

  // Atualizar tema
  const updateTheme = async (themeId: string, updates: Partial<Theme>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', themeId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de temas
      setThemes(prev => prev.map(theme => 
        theme.id === themeId ? { ...theme, ...updates } : theme
      ));

      // Se for o tema ativo, reaplicar
      if (currentTheme?.id === themeId) {
        applyTheme({ ...currentTheme, ...updates });
      }
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
      throw error;
    }
  };

  // Criar tema
  const createTheme = async (theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .insert(theme)
        .select()
        .single();

      if (error) throw error;

      // Recarregar temas
      const updatedThemes = await loadThemes();
      setThemes(updatedThemes);
    } catch (error) {
      console.error('Erro ao criar tema:', error);
      throw error;
    }
  };

  // Deletar tema
  const deleteTheme = async (themeId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      // Recarregar temas
      const updatedThemes = await loadThemes();
      setThemes(updatedThemes);

      // Se era o tema ativo, aplicar tema padrão
      if (currentTheme?.id === themeId) {
        const defaultTheme = updatedThemes.find(t => t.is_default) || DEFAULT_THEME;
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Erro ao deletar tema:', error);
      throw error;
    }
  };

  // Ativar tema
  const activateTheme = async (themeId: string): Promise<void> => {
    try {
      // Desativar todos os temas
      await supabase
        .from('themes')
        .update({ is_active: false })
        .eq('is_active', true);

      // Ativar o tema selecionado
      const { data, error } = await supabase
        .from('themes')
        .update({ is_active: true })
        .eq('id', themeId)
        .select()
        .single();

      if (error) throw error;

      // Aplicar o novo tema
      applyTheme(data as Theme);

      // Recarregar temas
      const updatedThemes = await loadThemes();
      setThemes(updatedThemes);
    } catch (error) {
      console.error('Erro ao ativar tema:', error);
      throw error;
    }
  };

  // Inicialização
  useEffect(() => {
    const initializeTheme = async () => {
      setLoading(true);
      setError(null);

      try {
        // Tentar carregar cache primeiro
        const cached = loadThemeCache();
        
        // Carregar tema ativo do Supabase
        let activeTheme = await loadActiveTheme();
        
        if (!activeTheme) {
          // Se não há tema ativo, usar cache ou padrão
          if (cached) {
            activeTheme = cached.theme;
          } else {
            activeTheme = DEFAULT_THEME;
          }
        }

        // Carregar todos os temas
        const allThemes = await loadThemes();
        setThemes(allThemes);

        // Aplicar tema
        applyTheme(activeTheme);

      } catch (error) {
        console.error('Erro ao inicializar tema:', error);
        setError('Erro ao carregar tema');
        
        // Aplicar tema padrão em caso de erro
        applyTheme(DEFAULT_THEME);
      } finally {
        setLoading(false);
      }
    };

    initializeTheme();

    // Configurar Realtime para mudanças na tabela themes
    const channel = supabase
      .channel('themes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'themes'
        },
        async (payload) => {
          console.log('Mudança detectada na tabela themes:', payload);
          
          // Recarregar tema ativo se necessário
          if (payload.eventType === 'UPDATE' && payload.new.is_active) {
            const activeTheme = await loadActiveTheme();
            if (activeTheme) {
              applyTheme(activeTheme);
            }
          }
          
          // Recarregar lista de temas
          const updatedThemes = await loadThemes();
          setThemes(updatedThemes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    loading,
    error,
    applyTheme,
    updateTheme,
    createTheme,
    deleteTheme,
    activateTheme,
    generateCSSVariables,
    applyCSSVariables
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
