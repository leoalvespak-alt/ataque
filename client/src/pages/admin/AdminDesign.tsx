import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ColorToken {
  hex: string;
  hsl: { h: number; s: number; l: number };
  variants: string[];
}

interface ThemeTokens {
  colors: Record<string, ColorToken>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

const AdminDesign: React.FC = () => {
  const { currentTheme, themes, loading, error, updateTheme, createTheme, deleteTheme, activateTheme } = useTheme();
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [editingTheme, setEditingTheme] = useState<ThemeTokens | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'borders' | 'shadows'>('colors');
  const [saving, setSaving] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('🔍 AdminDesign Debug:', {
      user: user ? { id: user.id, tipo_usuario: user.tipo_usuario } : null,
      currentTheme: currentTheme ? { id: currentTheme.id, name: currentTheme.name } : null,
      themes: themes.length,
      loading,
      error
    });
  }, [user, currentTheme, themes, loading, error]);

  // Verificar se o usuário é gestor
  if (user?.tipo_usuario !== 'gestor') {
    console.log('🚫 Usuário não é gestor:', user?.tipo_usuario);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500 mt-2">Tipo de usuário: {user?.tipo_usuario || 'Não autenticado'}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('🔄 useEffect - currentTheme mudou:', currentTheme);
    if (currentTheme) {
      setSelectedTheme(currentTheme.id);
      setEditingTheme(currentTheme.tokens);
    }
  }, [currentTheme]);

  const handleColorChange = (colorKey: string, newHex: string) => {
    if (!editingTheme) return;

    // Converter hex para HSL
    const hsl = hexToHsl(newHex);
    
    setEditingTheme(prev => ({
      ...prev!,
      colors: {
        ...prev!.colors,
        [colorKey]: {
          hex: newHex,
          hsl,
          variants: prev!.colors[colorKey]?.variants || [newHex]
        }
      }
    }));
  };

  const handleSpacingChange = (spacingKey: string, newValue: string) => {
    if (!editingTheme) return;

    setEditingTheme(prev => ({
      ...prev!,
      spacing: {
        ...prev!.spacing,
        [spacingKey]: newValue
      }
    }));
  };

  const handleTypographyChange = (typographyKey: string, newValue: string) => {
    if (!editingTheme) return;

    setEditingTheme(prev => ({
      ...prev!,
      typography: {
        ...prev!.typography,
        [typographyKey]: newValue
      }
    }));
  };

  const handleSaveTheme = async () => {
    if (!editingTheme || !selectedTheme) return;

    setSaving(true);
    try {
      await updateTheme(selectedTheme, {
        tokens: editingTheme
      });
      
      // Aplicar preview imediato
      if (currentTheme) {
        const updatedTheme = {
          ...currentTheme,
          tokens: editingTheme
        };
        // Aqui você aplicaria o tema atualizado para preview
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewTheme = async () => {
    if (!editingTheme) return;

    const themeName = prompt('Digite o nome do novo tema:');
    if (!themeName) return;

    setSaving(true);
    try {
      await createTheme({
        name: themeName,
        description: 'Novo tema criado',
        tokens: editingTheme,
        semantic: currentTheme?.semantic || {
          primary: { light: '#3b82f6', base: '#2563eb', dark: '#1d4ed8' },
          secondary: { light: '#6b7280', base: '#4b5563', dark: '#374151' },
          success: { light: '#22c55e', base: '#16a34a', dark: '#15803d' },
          warning: { light: '#f59e0b', base: '#d97706', dark: '#b45309' },
          error: { light: '#ef4444', base: '#dc2626', dark: '#b91c1c' },
          background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
          surface: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
          text: { primary: '#111827', secondary: '#4b5563', tertiary: '#9ca3af', inverse: '#ffffff' }
        },
        is_active: false,
        is_default: false
      });
    } catch (error) {
      console.error('Erro ao criar tema:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    try {
      await activateTheme(themeId);
      setSelectedTheme(themeId);
    } catch (error) {
      console.error('Erro ao ativar tema:', error);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Tem certeza que deseja deletar este tema?')) return;

    try {
      await deleteTheme(themeId);
    } catch (error) {
      console.error('Erro ao deletar tema:', error);
    }
  };

  // Função para converter hex para HSL
  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Loading state
  if (loading) {
    console.log('⏳ AdminDesign: Loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('❌ AdminDesign: Error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  // Verificar se há dados necessários
  if (!currentTheme || !editingTheme) {
    console.log('⚠️ AdminDesign: Dados insuficientes:', { currentTheme: !!currentTheme, editingTheme: !!editingTheme });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dados Não Encontrados</h1>
          <p className="text-gray-600">Não foi possível carregar os dados do tema.</p>
          <p className="text-sm text-gray-500 mt-2">
            currentTheme: {currentTheme ? 'Sim' : 'Não'} | 
            editingTheme: {editingTheme ? 'Sim' : 'Não'}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ AdminDesign: Renderizando página com sucesso');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuração de Design</h1>
              <p className="text-gray-600 mt-1">Personalize o visual da plataforma</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateNewTheme}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Novo Tema'}
              </button>
              <button
                onClick={handleSaveTheme}
                disabled={saving || !editingTheme}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Seleção de Tema */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Temas</h2>
              
              <div className="space-y-3">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      setEditingTheme(theme.tokens);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{theme.name}</h3>
                        <p className="text-sm text-gray-500">
                          {theme.is_active ? 'Ativo' : theme.is_default ? 'Padrão' : 'Inativo'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!theme.is_active && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateTheme(theme.id);
                            }}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Ativar
                          </button>
                        )}
                        {!theme.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Deletar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'colors', label: 'Cores' },
                    { id: 'typography', label: 'Tipografia' },
                    { id: 'spacing', label: 'Espaçamento' },
                    { id: 'borders', label: 'Bordas' },
                    { id: 'shadows', label: 'Sombras' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'colors' && editingTheme && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Cores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(editingTheme.colors).map(([colorKey, colorValue]) => (
                        <div key={colorKey} className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-lg border border-gray-200"
                            style={{ backgroundColor: colorValue.hex }}
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {colorKey}
                            </label>
                            <input
                              type="color"
                              value={colorValue.hex}
                              onChange={(e) => handleColorChange(colorKey, e.target.value)}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'typography' && editingTheme && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Tipografia</h3>
                    <div className="space-y-4">
                      {Object.entries(editingTheme.typography).map(([typographyKey, typographyValue]) => (
                        <div key={typographyKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {typographyKey}
                          </label>
                          <input
                            type="text"
                            value={typographyValue}
                            onChange={(e) => handleTypographyChange(typographyKey, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'spacing' && editingTheme && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Espaçamento</h3>
                    <div className="space-y-4">
                      {Object.entries(editingTheme.spacing).map(([spacingKey, spacingValue]) => (
                        <div key={spacingKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {spacingKey}
                          </label>
                          <input
                            type="text"
                            value={spacingValue}
                            onChange={(e) => handleSpacingChange(spacingKey, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'borders' && editingTheme && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Bordas</h3>
                    <div className="space-y-4">
                      {Object.entries(editingTheme.borders).map(([borderKey, borderValue]) => (
                        <div key={borderKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {borderKey}
                          </label>
                          <input
                            type="text"
                            value={borderValue}
                            onChange={(e) => {
                              if (!editingTheme) return;
                              setEditingTheme(prev => ({
                                ...prev!,
                                borders: {
                                  ...prev!.borders,
                                  [borderKey]: e.target.value
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'shadows' && editingTheme && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Sombras</h3>
                    <div className="space-y-4">
                      {Object.entries(editingTheme.shadows).map(([shadowKey, shadowValue]) => (
                        <div key={shadowKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {shadowKey}
                          </label>
                          <input
                            type="text"
                            value={shadowValue}
                            onChange={(e) => {
                              if (!editingTheme) return;
                              setEditingTheme(prev => ({
                                ...prev!,
                                shadows: {
                                  ...prev!.shadows,
                                  [shadowKey]: e.target.value
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1 text-sm rounded ${
                        previewMode === 'desktop'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1 text-sm rounded ${
                        previewMode === 'mobile'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div
                  className={`mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
                  }`}
                >
                  {/* Preview Content */}
                  <div className="p-6 space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">Título Principal</h1>
                    <p className="text-gray-600">
                      Este é um exemplo de texto para demonstrar como o tema será aplicado na interface.
                    </p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Botão Primário
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Botão Secundário
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                        Sucesso
                      </div>
                      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
                        Erro
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDesign;
