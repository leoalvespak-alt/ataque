import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Script {
  id: string;
  nome: string;
  descricao: string;
  status: 'ativo' | 'inativo';
  ultima_execucao?: string;
  proxima_execucao?: string;
  tipo: 'backup' | 'limpeza' | 'relatorio' | 'sincronizacao';
}

const AdminScripts: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [executingScript, setExecutingScript] = useState<string | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadScripts();
  }, [user]);

  const loadScripts = async () => {
    try {
      // Simular carregamento de scripts
      setScripts([
        {
          id: '1',
          nome: 'Backup Diário',
          descricao: 'Realiza backup automático do banco de dados',
          status: 'ativo',
          ultima_execucao: '2024-01-15T02:00:00',
          proxima_execucao: '2024-01-16T02:00:00',
          tipo: 'backup'
        },
        {
          id: '2',
          nome: 'Limpeza de Logs',
          descricao: 'Remove logs antigos do sistema',
          status: 'ativo',
          ultima_execucao: '2024-01-14T03:00:00',
          proxima_execucao: '2024-01-21T03:00:00',
          tipo: 'limpeza'
        },
        {
          id: '3',
          nome: 'Relatório Semanal',
          descricao: 'Gera relatório semanal de uso da plataforma',
          status: 'ativo',
          ultima_execucao: '2024-01-14T08:00:00',
          proxima_execucao: '2024-01-21T08:00:00',
          tipo: 'relatorio'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteScript = async (scriptId: string) => {
    setExecutingScript(scriptId);
    try {
      // Simular execução
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Script ${scriptId} executado com sucesso`);
    } catch (error) {
      console.error('Erro ao executar script:', error);
    } finally {
      setExecutingScript(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'backup': return 'text-blue-400 bg-blue-900/20';
      case 'limpeza': return 'text-orange-400 bg-orange-900/20';
      case 'relatorio': return 'text-purple-400 bg-purple-900/20';
      case 'sincronizacao': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'backup': return 'fas fa-database';
      case 'limpeza': return 'fas fa-broom';
      case 'relatorio': return 'fas fa-chart-bar';
      case 'sincronizacao': return 'fas fa-sync';
      default: return 'fas fa-cog';
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2]">
            Scripts Automatizados
          </h1>
          <Link
            to="/admin"
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Admin
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Estatísticas dos Scripts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {scripts.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Total de Scripts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {scripts.filter(s => s.status === 'ativo').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Scripts Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {scripts.filter(s => s.tipo === 'backup').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Backups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {scripts.filter(s => s.tipo === 'relatorio').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Relatórios</div>
            </div>
          </div>
        </div>

        {/* Lista de Scripts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <div key={script.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <i className={`${getTypeIcon(script.tipo)} text-xl text-[#8b0000]`}></i>
                    <h3 className="text-lg font-semibold text-[#f2f2f2]">
                      {script.nome}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(script.tipo)}`}>
                    {script.tipo === 'backup' ? 'Backup' : 
                     script.tipo === 'limpeza' ? 'Limpeza' : 
                     script.tipo === 'relatorio' ? 'Relatório' : 'Sincronização'}
                  </span>
                  <p className="text-sm text-[#f2f2f2]/70 mt-3 mb-4">
                    {script.descricao}
                  </p>
                  <div className="space-y-2 text-xs text-[#f2f2f2]/50">
                    {script.ultima_execucao && (
                      <div>
                        <strong>Última execução:</strong> {new Date(script.ultima_execucao).toLocaleString('pt-BR')}
                      </div>
                    )}
                    {script.proxima_execucao && (
                      <div>
                        <strong>Próxima execução:</strong> {new Date(script.proxima_execucao).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      script.status === 'ativo' 
                        ? 'text-green-400 bg-green-900/20' 
                        : 'text-red-400 bg-red-900/20'
                    }`}>
                      {script.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleExecuteScript(script.id)}
                  disabled={executingScript === script.id}
                  className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] disabled:bg-[#333333] text-white px-3 py-2 rounded text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {executingScript === script.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Executando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play"></i>
                      Executar
                    </>
                  )}
                </button>
                <button className="bg-[#333333] hover:bg-[#444444] text-white px-3 py-2 rounded text-sm transition-colors duration-200">
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botão Adicionar Script */}
        <div className="mt-8 text-center">
          <button className="bg-[#00c853] hover:bg-[#00a843] text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto">
            <i className="fas fa-plus"></i>
            Adicionar Novo Script
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminScripts;
