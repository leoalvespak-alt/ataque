import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogo } from '../contexts/LogoContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { login } = useAuth();
  const { getLogoConfig } = useLogo();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário submetido:', formData);
    
    if (!formData.email || !formData.senha) {
      showMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      console.log('Chamando função login...');
      const success = await login(formData);
      console.log('Resultado do login:', success);
      
      if (success) {
        showMessage('Login realizado com sucesso! Redirecionando...', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        showMessage('E-mail ou senha incorretos.', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showMessage('E-mail ou senha incorretos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b1b1b] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#242424] border border-[#333333] rounded-xl p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              {getLogoConfig('logo') ? (
                <img 
                  src={getLogoConfig('logo')?.url} 
                  alt="Logo" 
                  className="mx-auto h-16 w-auto object-contain mb-2"
                />
              ) : (
                <h1 className="font-['Saira'] font-bold text-3xl text-[#8b0000]">
                  Rota de Ataque
                </h1>
              )}
            </div>
            <p className="font-['Aptos'] text-base text-[#f2f2f2]">
              Faça login para continuar
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-3 rounded-md mb-4 text-sm ${
              message.type === 'success' 
                ? 'bg-green-900/10 border border-green-500 text-green-500' 
                : 'bg-red-900/10 border border-red-500 text-red-500'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block font-['Saira'] font-semibold text-sm text-[#f2f2f2] mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#333333] rounded-md text-[#f2f2f2] font-['Aptos'] text-base transition-all duration-300 focus:outline-none focus:border-[#8b0000] focus:shadow-[0_0_0_2px_rgba(139,0,0,0.2)]"
                placeholder="Seu e-mail"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block font-['Saira'] font-semibold text-sm text-[#f2f2f2] mb-2">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#333333] rounded-md text-[#f2f2f2] font-['Aptos'] text-base transition-all duration-300 focus:outline-none focus:border-[#8b0000] focus:shadow-[0_0_0_2px_rgba(139,0,0,0.2)]"
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#8b0000] text-[#f2f2f2] border-none rounded-md font-['Aptos'] font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-[#f2f2f2] hover:text-[#1b1b1b] hover:transform hover:-translate-y-0.5 disabled:bg-[#333333] disabled:cursor-not-allowed disabled:transform-none mb-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#333333] border-t-[#8b0000] rounded-full animate-spin mr-2"></div>
                  Fazendo login...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="text-center my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-[#333333]"></div>
            </div>
            <span className="bg-[#242424] px-4 text-[#f2f2f2] text-sm">ou</span>
          </div>

          {/* Register link */}
          <div className="text-center mt-6">
            <p className="text-[#f2f2f2]">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="text-[#8b0000] no-underline font-semibold transition-all duration-300 hover:text-[#f2f2f2]"
              >
                Cadastre-se
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="bg-[#8b0000]/10 border border-[#8b0000] rounded-md p-4 mt-6">
            <h4 className="font-['Saira'] font-semibold text-sm text-[#8b0000] mb-2">
              Credenciais de Teste
            </h4>
            <p className="font-['Aptos'] text-xs text-[#f2f2f2] mb-1">
              <strong>Admin:</strong> admin@rotadeataque.com / 123456
            </p>
            <p className="font-['Aptos'] text-xs text-[#f2f2f2]">
              <strong>Aluno:</strong> joao@teste.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
