import React from 'react';
import { Link } from 'react-router-dom';
import { useLogo } from '../contexts/LogoContext';

const Footer: React.FC = () => {
  const { getLogoConfig } = useLogo();
  const logoConfig = getLogoConfig('logo');

  return (
    <footer className="bg-[#242424] border-t border-[#333333] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e descrição */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#8b0000] rounded-lg flex items-center justify-center mr-3">
                {logoConfig ? (
                  <img 
                    src={logoConfig.url} 
                    alt="Logo" 
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <i className="fas fa-graduation-cap text-white"></i>
                )}
              </div>
              <span className="text-xl font-bold text-[#f2f2f2]">Rota de Ataque</span>
            </div>
            <p className="text-[#f2f2f2]/70 text-sm">
              Plataforma de estudos para concursos públicos com questões atualizadas e estatísticas detalhadas.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-[#f2f2f2] font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/politicas-privacidade" 
                  className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors text-sm"
                >
                  Políticas de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/planos" 
                  className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors text-sm"
                >
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div>
            <h3 className="text-[#f2f2f2] font-semibold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/rotadeataque/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors"
                title="Instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=55997169114&text=Ol%C3%A1%2C+estava+no+site+e+preciso+de+ajuda.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors"
                title="WhatsApp"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#333333] mt-8 pt-6 text-center">
          <p className="text-[#f2f2f2]/70 text-sm">
            © 2025 Rota de Ataque. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
