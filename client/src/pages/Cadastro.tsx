import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { cadastro } = useAuth();
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
    
    if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
      showMessage('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      showMessage('As senhas não coincidem.', 'error');
      return;
    }

    if (formData.senha.length < 6) {
      showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const success = await cadastro({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });
      
      if (success) {
        showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      showMessage('Erro ao criar conta. Tente novamente.', 'error');
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
            <div className="mb-2">
              <h1 className="font-['Saira'] font-bold text-3xl text-[#8b0000]">
                Rota de Ataque
              </h1>
            </div>
            <p className="font-['Aptos'] text-base text-[#f2f2f2]">
              Crie sua conta gratuita
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
              <label htmlFor="nome" className="block font-['Saira'] font-semibold text-sm text-[#f2f2f2] mb-2">
                Nome completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#333333] rounded-md text-[#f2f2f2] font-['Aptos'] text-base transition-all duration-300 focus:outline-none focus:border-[#8b0000] focus:shadow-[0_0_0_2px_rgba(139,0,0,0.2)]"
                placeholder="Seu nome completo"
              />
            </div>

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
                placeholder="seu@email.com"
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
                placeholder="••••••••"
              />
              <p className="text-xs text-[#f2f2f2] mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block font-['Saira'] font-semibold text-sm text-[#f2f2f2] mb-2">
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                required
                value={formData.confirmarSenha}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1b1b1b] border border-[#333333] rounded-md text-[#f2f2f2] font-['Aptos'] text-base transition-all duration-300 focus:outline-none focus:border-[#8b0000] focus:shadow-[0_0_0_2px_rgba(139,0,0,0.2)]"
                placeholder="••••••••"
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
                  Criando conta...
                </div>
              ) : (
                'Criar conta'
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

          {/* Login link */}
          <div className="text-center mt-6">
            <p className="text-[#f2f2f2]">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-[#8b0000] no-underline font-semibold transition-all duration-300 hover:text-[#f2f2f2]"
              >
                Faça login
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-[#8b0000]/10 border border-[#8b0000] rounded-md p-4 mt-6">
            <h4 className="font-['Saira'] font-semibold text-sm text-[#8b0000] mb-3 text-center">
              🎉 Conta gratuita inclui:
            </h4>
            <ul className="text-xs text-[#f2f2f2] space-y-1">
              <li>• Acesso a milhares de questões</li>
              <li>• Sistema de ranking</li>
              <li>• Comentários de professores</li>
              <li>• Filtros avançados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
