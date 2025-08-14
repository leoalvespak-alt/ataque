import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalCategories: number;
  activeSubscriptions: number;
}

const Admin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalCategories: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || user.tipo_usuario !== 'gestor') {
        navigate('/login');
        return;
      }
      await loadAdminStats();
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, navigate]);

  const loadAdminStats = async () => {
    try {
      // Buscar estatísticas do banco de dados
      const [usersResult, questionsResult, categoriesResult, subscriptionsResult] = await Promise.all([
        supabase.from('usuarios').select('id', { count: 'exact' }),
        supabase.from('questoes').select('id', { count: 'exact' }),
        supabase.from('disciplinas').select('id', { count: 'exact' }),
        supabase.from('assinaturas_usuarios').select('id', { count: 'exact' }).eq('status', 'ativo')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalQuestions: questionsResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-[#f2f2f2]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#f2f2f2] mb-4">
            Painel de Administração
          </h1>
          <p className="text-lg text-[#f2f2f2]">
            Gerencie sua plataforma de estudos de forma eficiente
          </p>
        </div>

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-8 mb-8 border border-[#333333]">
          <h2 className="text-2xl font-semibold mb-6">Estatísticas da Plataforma</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8b0000] mb-2">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-[#f2f2f2]">Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8b0000] mb-2">
                {stats.totalQuestions.toLocaleString()}
              </div>
              <div className="text-sm text-[#f2f2f2]">Questões</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8b0000] mb-2">
                {stats.totalCategories.toLocaleString()}
              </div>
              <div className="text-sm text-[#f2f2f2]">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8b0000] mb-2">
                {stats.activeSubscriptions.toLocaleString()}
              </div>
              <div className="text-sm text-[#f2f2f2]">Assinaturas Ativas</div>
            </div>
          </div>
        </div>

        {/* Cards de Administração */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/usuarios"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-users text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Gerenciar Usuários
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Visualize, edite e gerencie todos os usuários da plataforma. 
              Controle permissões e status de contas.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/questoes"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-question-circle text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Gerenciar Questões
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Adicione, edite e remova questões. Organize por disciplina, 
              assunto e dificuldade.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/categorias"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-tags text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Categorias
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Gerencie disciplinas, assuntos e organizações. 
              Mantenha a estrutura organizacional da plataforma.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/relatorios"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-chart-bar text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Relatórios
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Acesse relatórios detalhados sobre o uso da plataforma, 
              performance dos usuários e estatísticas.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Ver Relatórios</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/planos"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-crown text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Planos
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Gerencie assinaturas, visualize pagamentos e 
              configure métodos de pagamento.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/comentarios"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-comments text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Comentários
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Gerencie comentários dos usuários nas questões. 
              Modere conteúdo e mantenha a qualidade.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/notificacoes"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-bell text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Notificações
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Crie e gerencie notificações para os usuários. 
              Envie avisos, dicas e comunicados importantes.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/dicas-estudo"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-lightbulb text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Dicas de Estudo
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Crie e gerencie dicas de estudo para ajudar os alunos. 
              Compartilhe estratégias e técnicas eficazes.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/politicas-termos"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-file-contract text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Políticas e Termos
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Gerencie políticas de privacidade e termos de uso. 
              Mantenha a documentação legal atualizada.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Gerenciar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/configuracoes"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-cog text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Configurações
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Configure parâmetros da plataforma, notificações, 
              planos de assinatura e mais.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Configurar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <Link
            to="/admin/design"
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#8b0000] to-[#a00000] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-palette text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Design e Logo
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Personalize o visual da plataforma. 
              Altere logos, cores e elementos visuais.
            </p>
            <div className="flex items-center gap-2 text-[#8b0000] font-medium">
              <span>Personalizar</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group text-left"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#333333] to-[#444444] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-sign-out-alt text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#f2f2f2]">
              Sair
            </h3>
            <p className="text-[#f2f2f2] mb-4 text-sm leading-relaxed">
              Faça logout do painel administrativo e 
              retorne à página de login.
            </p>
            <div className="flex items-center gap-2 text-[#f2f2f2] font-medium">
              <span>Sair</span>
              <i className="fas fa-arrow-right"></i>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
