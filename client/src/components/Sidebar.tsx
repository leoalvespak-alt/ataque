import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogo } from '../contexts/LogoContext';

interface SidebarItem {
  path: string;
  name: string;
  icon: string;
  adminOnly?: boolean;
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getLogoConfig } = useLogo();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems: SidebarItem[] = [
    { path: '/dashboard', name: 'Dashboard', icon: 'fas fa-home' },
    { path: '/questoes', name: 'Questões', icon: 'fas fa-question-circle' },
    { path: '/estatisticas', name: 'Estatísticas', icon: 'fas fa-chart-line' },
    { path: '/ranking', name: 'Ranking', icon: 'fas fa-trophy' },
    { path: '/planos', name: 'Planos', icon: 'fas fa-crown' },
    { path: '/perfil', name: 'Perfil', icon: 'fas fa-user' },
  ];

  const adminItems: SidebarItem[] = [
    { path: '/admin', name: 'Admin', icon: 'fas fa-cog', adminOnly: true },
    { path: '/admin/usuarios', name: 'Usuários', icon: 'fas fa-users', adminOnly: true },
    { path: '/admin/questoes', name: 'Questões', icon: 'fas fa-question', adminOnly: true },
    { path: '/admin/relatorios', name: 'Relatórios', icon: 'fas fa-chart-bar', adminOnly: true },
    { path: '/admin/notificacoes', name: 'Notificações', icon: 'fas fa-bell', adminOnly: true },
    { path: '/admin/dicas-estudo', name: 'Dicas', icon: 'fas fa-lightbulb', adminOnly: true },
    { path: '/admin/politicas-termos', name: 'Políticas/Termos', icon: 'fas fa-file-contract', adminOnly: true },
    { path: '/admin/configuracoes', name: 'Configurações', icon: 'fas fa-wrench', adminOnly: true },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const allItems = [...navigationItems, ...adminItems];
  const logoConfig = getLogoConfig('logo');

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-[#1b1b1b] border-r border-[#333333] transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isExpanded ? 'w-60' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo - Header fixo */}
      <div className="flex items-center justify-center h-16 border-b border-[#333333] flex-shrink-0">
        <Link to="/dashboard" className="flex items-center">
          <div className="w-8 h-8 bg-[#8b0000] rounded-lg flex items-center justify-center">
            {logoConfig ? (
              <img 
                src={logoConfig.url} 
                alt="Logo" 
                className="w-6 h-6 object-contain"
              />
            ) : (
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            )}
          </div>
          {isExpanded && (
            <span className="ml-3 text-lg font-bold text-[#8b0000] whitespace-nowrap">
              Rota de Ataque
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Items - Área com scroll */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-2 py-4">
          {/* Itens de navegação principais */}
          <div className="mb-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 mb-1 rounded-lg text-[#f2f2f2] transition-all duration-300 group ${
                  isActive(item.path)
                    ? 'bg-[#8b0000] text-white'
                    : 'hover:bg-[#8b0000] hover:text-white'
                }`}
              >
                <i className={`${item.icon} text-lg w-5 text-center flex-shrink-0`}></i>
                {isExpanded && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Separador para itens admin */}
          {user?.tipo_usuario === 'gestor' && (
            <>
              <div className="border-t border-[#333333] my-4"></div>
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  {isExpanded ? 'Administração' : ''}
                </div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-3 mb-1 rounded-lg text-[#f2f2f2] transition-all duration-300 group ${
                      isActive(item.path)
                        ? 'bg-[#8b0000] text-white'
                        : 'hover:bg-[#8b0000] hover:text-white'
                    }`}
                  >
                    <i className={`${item.icon} text-lg w-5 text-center flex-shrink-0`}></i>
                    {isExpanded && (
                      <span className="ml-3 text-sm font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Logout Button - Footer fixo */}
      <div className="border-t border-[#333333] p-2 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 rounded-lg text-[#f2f2f2] hover:bg-[#8b0000] hover:text-white transition-all duration-300"
        >
          <i className="fas fa-sign-out-alt text-lg w-5 text-center flex-shrink-0"></i>
          {isExpanded && (
            <span className="ml-3 text-sm font-medium whitespace-nowrap">
              Sair
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
