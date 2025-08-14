import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface CadernoPronto {
  id: string;
  nome: string;
  descricao?: string;
  filtros: any;
  link: string;
  created_at: string;
  updated_at: string;
}

const MeusCadernos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cadernos, setCadernos] = useState<CadernoPronto[]>([]);
  const [selectedCaderno, setSelectedCaderno] = useState<CadernoPronto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadCadernos();
    }
  }, [user]);

  const loadCadernos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cadernos_prontos')
        .select('*')
        .eq('usuario_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCadernos(data || []);
    } catch (error) {
      console.error('Erro ao carregar cadernos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaderno = (caderno: CadernoPronto) => {
    // Navegar para a página de questões com os filtros do caderno
    const filtrosString = encodeURIComponent(JSON.stringify(caderno.filtros));
    navigate(`/questoes?caderno=${caderno.id}&filtros=${filtrosString}`);
  };

  const handleCompartilharCaderno = (caderno: CadernoPronto) => {
    const url = `${window.location.origin}/questoes?caderno=${caderno.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link do caderno copiado para a área de transferência!');
    });
  };

  const handleDeletarCaderno = async () => {
    if (!selectedCaderno) return;

    try {
      const { error } = await supabase
        .from('cadernos_prontos')
        .delete()
        .eq('id', selectedCaderno.id);

      if (error) throw error;

      setCadernos(prev => prev.filter(c => c.id !== selectedCaderno.id));
      setShowDeleteModal(false);
      setSelectedCaderno(null);
      alert('Caderno deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar caderno:', error);
      alert('Erro ao deletar caderno. Tente novamente.');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFiltrosResumo = (filtros: any) => {
    const resumo = [];
    
    if (filtros.disciplina_id) {
      resumo.push('Disciplina específica');
    }
    if (filtros.assunto_id) {
      resumo.push('Assunto específico');
    }
    if (filtros.anos && filtros.anos.length > 0) {
      resumo.push(`${filtros.anos.length} ano(s)`);
    }
    if (filtros.banca_id) {
      resumo.push('Banca específica');
    }
    if (filtros.orgao_id) {
      resumo.push('Órgão específico');
    }
    if (filtros.status_resposta && filtros.status_resposta !== 'todas') {
      resumo.push('Status específico');
    }
    if (filtros.search) {
      resumo.push('Busca personalizada');
    }

    return resumo.length > 0 ? resumo.join(', ') : 'Todos os filtros';
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2] mb-2">
            Meus Cadernos
          </h1>
          <p className="text-[#f2f2f2]/70">
            Gerencie seus cadernos de estudo criados
          </p>
        </div>

        {/* Botão Criar Novo Caderno */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/questoes')}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-[#f2f2f2] px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Criar Novo Caderno
          </button>
        </div>

        {/* Lista de Cadernos */}
        {cadernos.length === 0 ? (
          <div className="bg-[#242424] rounded-lg p-12 border border-[#333333] text-center">
            <i className="fas fa-book text-6xl text-[#333333] mb-6"></i>
            <h3 className="text-xl font-semibold mb-4">Nenhum caderno criado ainda</h3>
            <p className="text-[#f2f2f2]/70 mb-6">
              Crie seu primeiro caderno de estudo personalizado na página de questões
            </p>
            <button
              onClick={() => navigate('/questoes')}
              className="bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2] px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Ir para Questões
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cadernos.map((caderno) => (
              <div
                key={caderno.id}
                className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200"
              >
                {/* Header do Caderno */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#f2f2f2] mb-1">
                      {caderno.nome}
                    </h3>
                    {caderno.descricao && (
                      <p className="text-sm text-[#f2f2f2]/70 mb-2">
                        {caderno.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompartilharCaderno(caderno)}
                      className="text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors duration-200"
                      title="Compartilhar"
                    >
                      <i className="fas fa-share-alt"></i>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCaderno(caderno);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Deletar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Filtros Aplicados */}
                <div className="mb-4">
                  <div className="text-xs text-[#f2f2f2]/50 mb-1">Filtros aplicados:</div>
                  <div className="text-sm text-[#f2f2f2]/70">
                    {getFiltrosResumo(caderno.filtros)}
                  </div>
                </div>

                {/* Data de Criação */}
                <div className="text-xs text-[#f2f2f2]/50 mb-4">
                  Criado em: {formatarData(caderno.created_at)}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAbrirCaderno(caderno)}
                    className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2] px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-play"></i>
                    Abrir Caderno
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Confirmação de Deletar */}
        {showDeleteModal && selectedCaderno && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#242424] rounded-lg p-6 w-full max-w-md border border-[#333333]">
              <h3 className="text-xl font-semibold mb-4 text-[#f2f2f2]">Confirmar Exclusão</h3>
              
              <p className="text-[#f2f2f2]/70 mb-6">
                Tem certeza que deseja deletar o caderno <strong>"{selectedCaderno.nome}"</strong>?
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeletarCaderno}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-[#f2f2f2] px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Deletar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCaderno(null);
                  }}
                  className="flex-1 bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusCadernos;
