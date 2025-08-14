import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface LogoConfig {
  id: number;
  tipo: string;
  url: string;
  nome_arquivo: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
  ativo: boolean;
}

interface LogoContextType {
  logoConfigs: LogoConfig[];
  loading: boolean;
  loadLogoConfigs: () => Promise<void>;
  updateFavicon: (url: string) => void;
  getLogoConfig: (tipo: string) => LogoConfig | undefined;
  refreshConfigs: () => Promise<void>;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

interface LogoProviderProps {
  children: ReactNode;
}

export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [logoConfigs, setLogoConfigs] = useState<LogoConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogoConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_logo')
        .select('*')
        .eq('ativo', true)
        .order('tipo');

      if (error) {
        console.error('Erro ao carregar configurações de logo:', error);
        // Fallback para URLs padrão do Supabase Storage
        const fallbackConfigs = [
          {
            id: 1,
            tipo: 'logo',
            url: 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png',
            nome_arquivo: 'ATAQUE.png',
            ativo: true
          },
          {
            id: 2,
            tipo: 'favicon',
            url: 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico',
            nome_arquivo: 'favicon-1755150122840.ico',
            ativo: true
          }
        ];
        setLogoConfigs(fallbackConfigs);
        
        // Aplicar favicon fallback
        updateFavicon(fallbackConfigs[1].url);
        return;
      }

      setLogoConfigs(data || []);

      // Aplicar favicon se existir
      const faviconConfig = data?.find(config => config.tipo === 'favicon');
      if (faviconConfig) {
        updateFavicon(faviconConfig.url);
      }

      // Aplicar logo no título da página se existir
      const logoConfig = data?.find(config => config.tipo === 'logo');
      if (logoConfig) {
        updatePageTitle(logoConfig.url);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de logo:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFavicon = (url: string) => {
    try {
      // Remover favicons existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Adicionar novo favicon com timestamp para evitar cache
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = `${url}?v=${Date.now()}`;
      document.head.appendChild(link);

      // Adicionar também como shortcut icon
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.href = `${url}?v=${Date.now()}`;
      document.head.appendChild(shortcutLink);

      console.log('Favicon atualizado:', url);
    } catch (error) {
      console.error('Erro ao atualizar favicon:', error);
    }
  };

  const updatePageTitle = (logoUrl: string) => {
    try {
      // Atualizar logo no título da página (se necessário)
      // Esta função pode ser expandida para atualizar outros elementos
      console.log('Logo atualizado:', logoUrl);
    } catch (error) {
      console.error('Erro ao atualizar logo:', error);
    }
  };

  const getLogoConfig = (tipo: string) => {
    return logoConfigs.find(config => config.tipo === tipo);
  };

  const refreshConfigs = async () => {
    await loadLogoConfigs();
  };

  useEffect(() => {
    loadLogoConfigs();
  }, []);

  const value: LogoContextType = {
    logoConfigs,
    loading,
    loadLogoConfigs,
    updateFavicon,
    getLogoConfig,
    refreshConfigs
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo deve ser usado dentro de um LogoProvider');
  }
  return context;
};
