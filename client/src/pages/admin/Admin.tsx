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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione apenas arquivos de imagem.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 2MB.' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setMessage(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadLogo = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Nenhum arquivo selecionado.' });
      return;
    }

    setUploadLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Logo atualizada com sucesso!' });
        resetUpload();
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao fazer upload da logo.' });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setUploadLoading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl('');
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

        {/* Upload de Logo */}
        <div className="bg-[#242424] rounded-lg p-8 mb-8 border border-[#333333]">
          <h2 className="text-2xl font-semibold mb-6">Logo da Plataforma</h2>
          
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' 
                ? 'bg-green-900/20 border border-green-500 text-green-400' 
                : 'bg-red-900/20 border border-red-500 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div
            className="border-2 border-dashed border-[#333333] rounded-lg p-10 text-center cursor-pointer transition-all duration-300 hover:border-[#8b0000] hover:bg-[#8b0000]/10"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('logoFile')?.click()}
          >
            <i className="fas fa-cloud-upload-alt text-5xl text-[#f2f2f2] mb-4"></i>
            <div className="text-lg text-[#f2f2f2] mb-2">
              Clique ou arraste uma imagem aqui
            </div>
            <div className="text-sm text-[#f2f2f2]">
              PNG, JPG ou SVG (máx. 2MB)
            </div>
          </div>

          <input
            id="logoFile"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {previewUrl && (
            <div className="mt-6 text-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-[200px] max-h-[100px] rounded-lg border border-[#333333] mx-auto mb-4"
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={uploadLogo}
                  disabled={uploadLoading}
                  className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Logo'
                  )}
                </button>
                <button
                  onClick={resetUpload}
                  className="bg-[#333333] hover:bg-[#444444] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
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
