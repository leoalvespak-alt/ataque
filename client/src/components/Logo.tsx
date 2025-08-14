import React from 'react';
import { useLogo } from '../contexts/LogoContext';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  height?: number;
  width?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  style = {}, 
  alt = 'Rota de Ataque',
  height = 40,
  width = 'auto'
}) => {
  const { getLogoConfig, loading } = useLogo();
  const logoConfig = getLogoConfig('logo');

  // URL padrão do Supabase Storage
  const defaultLogoUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png';
  
  // URL da logo (usar configuração do banco ou fallback)
  const logoUrl = logoConfig?.url || defaultLogoUrl;

  if (loading) {
    return (
      <div 
        className={`logo-loading ${className}`}
        style={{
          height,
          width,
          backgroundColor: '#333333',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <div className="loading-spinner" style={{
          width: '20px',
          height: '20px',
          border: '2px solid #666666',
          borderTop: '2px solid #8b0000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`logo ${className}`}
      style={{
        height,
        width,
        objectFit: 'contain',
        ...style
      }}
      onError={(e) => {
        // Fallback para logo local se a URL do Supabase falhar
        const target = e.target as HTMLImageElement;
        if (target.src !== '/logo-ataque.png') {
          target.src = '/logo-ataque.png';
        }
      }}
    />
  );
};

export default Logo;
