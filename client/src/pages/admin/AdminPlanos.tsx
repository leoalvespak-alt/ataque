import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Plano {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_dias: number;
  questoes_por_dia?: number;
  recursos_especiais?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPlanos: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [filteredPlanos, setFilteredPlanos] = useState<Plano[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Partial<Plano>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadPlanos();
  }, [user]);

  useEffect(() => {
    filterPlanos();
  }, [planos, searchTerm]);

  const loadPlanos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('preco', { ascending: true });

      if (error) {
        console.error('Erro ao carregar planos:', error);
        throw error;
      }

      setPlanos(data || []);
      console.log('Planos carregados:', data);
      
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar planos: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const filterPlanos = () => {
    let filtered = planos;

    if (searchTerm) {
      filtered = filtered.filter(plano =>
        plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plano.descricao && plano.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPlanos(filtered);
  };

  const handleCreatePlano = async () => {
    if (!validatePlanoForm()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('planos')
        .insert([{
          nome: editingPlano.nome!.trim(),
          descricao: editingPlano.descricao?.trim() || null,
          preco: editingPlano.preco!,
          duracao_dias: editingPlano.duracao_dias!,
          questoes_por_dia: editingPlano.questoes_por_dia || null,
          recursos_especiais: editingPlano.recursos_especiais || [],
          ativo: editingPlano.ativo !== undefined ? editingPlano.ativo : true
        }])
        .select()
        .single();

      if (error) throw error;

      setPlanos([data, ...planos]);
      setMessage({ type: 'success', text: 'Plano criado com sucesso!' });
      resetPlanoForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      setMessage({ type: 'error', text: 'Erro ao criar plano: ' + (error as Error).message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditPlano = (plano: Plano) => {
    setSelectedPlano(plano);
    setEditingPlano({
      nome: plano.nome,
      descricao: plano.descricao,
      preco: plano.preco,
      duracao_dias: plano.duracao_dias,
      questoes_por_dia: plano.questoes_por_dia,
      recursos_especiais: plano.recursos_especiais,
      ativo: plano.ativo
    });
    setShowEditModal(true);
  };

  const handleSavePlano = async () => {
    if (!selectedPlano || !validatePlanoForm()) return;

    try {
      const { error } = await supabase
        .from('planos')
        .update({
          nome: editingPlano.nome!.trim(),
          descricao: editingPlano.descricao?.trim() || null,
          preco: editingPlano.preco!,
          duracao_dias: editingPlano.duracao_dias!,
          questoes_por_dia: editingPlano.questoes_por_dia || null,
          recursos_especiais: editingPlano.recursos_especiais || [],
          ativo: editingPlano.ativo!
        })
        .eq('id', selectedPlano.id);

      if (error) throw error;

      const updatedPlano = {
        ...selectedPlano,
        ...editingPlano
      };

      setPlanos(planos.map(plano =>
        plano.id === selectedPlano.id ? updatedPlano : plano
      ));

      setMessage({ type: 'success', text: 'Plano atualizado com sucesso!' });
      setShowEditModal(false);
      resetPlanoForm();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar plano: ' + (error as Error).message });
    }
  };

  const handleDeletePlano = async (planoId: number) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;

    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', planoId);

      if (error) throw error;

      setPlanos(planos.filter(plano => plano.id !== planoId));
      setMessage({ type: 'success', text: 'Plano excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir plano: ' + (error as Error).message });
    }
  };

  const handleTogglePlanoStatus = async (planoId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('planos')
        .update({ ativo: !currentStatus })
        .eq('id', planoId);

      if (error) throw error;

      setPlanos(planos.map(plano =>
        plano.id === planoId ? { ...plano, ativo: !currentStatus } : plano
      ));

      setMessage({ 
        type: 'success', 
        text: `Plano ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!` 
      });
    } catch (error) {
      console.error('Erro ao alterar status do plano:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar status do plano: ' + (error as Error).message });
    }
  };

  const validatePlanoForm = () => {
    if (!editingPlano.nome?.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      return false;
    }
    if (!editingPlano.preco || editingPlano.preco < 0) {
      setMessage({ type: 'error', text: 'Preço deve ser maior ou igual a zero' });
      return false;
    }
    if (!editingPlano.duracao_dias || editingPlano.duracao_dias <= 0) {
      setMessage({ type: 'error', text: 'Duração deve ser maior que zero' });
      return false;
    }
    return true;
  };

  const resetPlanoForm = () => {
    setEditingPlano({});
    setSelectedPlano(null);
  };

  const openCreatePlanoModal = () => {
    setIsCreating(true);
    setEditingPlano({
      preco: 0,
      duracao_dias: 30,
      questoes_por_dia: 10,
      recursos_especiais: [],
      ativo: true
    });
    setSelectedPlano(null);
    setShowEditModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
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
            Gerenciar Planos
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={openCreatePlanoModal}
              className="bg-[#00c853] hover:bg-[#00a843] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Novo Plano
            </button>
          <Link
            to="/admin"
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Admin
          </Link>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-900/20 border border-green-500 text-green-400' 
              : 'bg-red-900/20 border border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSearchTerm('')}
                className="bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {planos.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Total de Planos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {planos.filter(p => p.ativo).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Planos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {planos.filter(p => p.preco === 0).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Planos Gratuitos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {planos.filter(p => p.preco > 0).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Planos Pagos</div>
            </div>
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlanos.map((plano) => (
            <div key={plano.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plano.ativo 
                        ? 'text-green-400 bg-green-900/20' 
                        : 'text-red-400 bg-red-900/20'
                    }`}>
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plano.preco === 0 
                        ? 'text-blue-400 bg-blue-900/20' 
                        : 'text-yellow-400 bg-yellow-900/20'
                    }`}>
                      {plano.preco === 0 ? 'Gratuito' : 'Pago'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#f2f2f2] mb-2">
                    {plano.nome}
                  </h3>
                  
                  {plano.descricao && (
                    <p className="text-sm text-[#f2f2f2]/70 mb-3">
                      {plano.descricao}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm text-[#f2f2f2]/80">
                    <div><strong>Preço:</strong> {formatPrice(plano.preco)}</div>
                    <div><strong>Duração:</strong> {plano.duracao_dias} dias</div>
                    {plano.questoes_por_dia && (
                      <div><strong>Questões/dia:</strong> {plano.questoes_por_dia}</div>
                    )}
                    {plano.recursos_especiais && plano.recursos_especiais.length > 0 && (
                      <div>
                        <strong>Recursos:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          {plano.recursos_especiais.map((recurso, index) => (
                            <li key={index} className="text-xs">{recurso}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditPlano(plano)}
                  className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-2 rounded text-sm transition-colors duration-200"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Editar
                </button>
                <button
                  onClick={() => handleTogglePlanoStatus(plano.id, plano.ativo)}
                  className={`px-3 py-2 rounded text-sm transition-colors duration-200 ${
                    plano.ativo 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <i className={`fas ${plano.ativo ? 'fa-ban' : 'fa-check'} mr-1`}></i>
                  {plano.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                <button
                  onClick={() => handleDeletePlano(plano.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Excluir
                  </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPlanos.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-credit-card text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Nenhum plano encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-2xl border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {isCreating ? 'Novo Plano' : 'Editar Plano'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={editingPlano.nome || ''}
                  onChange={(e) => setEditingPlano({...editingPlano, nome: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Nome do plano"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={editingPlano.descricao || ''}
                  onChange={(e) => setEditingPlano({...editingPlano, descricao: e.target.value})}
                  rows={3}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Descrição do plano"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPlano.preco || 0}
                    onChange={(e) => setEditingPlano({...editingPlano, preco: parseFloat(e.target.value)})}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duração (dias) *</label>
                  <input
                    type="number"
                    min="1"
                    value={editingPlano.duracao_dias || 30}
                    onChange={(e) => setEditingPlano({...editingPlano, duracao_dias: parseInt(e.target.value)})}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Questões por Dia</label>
                <input
                  type="number"
                  min="0"
                  value={editingPlano.questoes_por_dia || ''}
                                     onChange={(e) => setEditingPlano({...editingPlano, questoes_por_dia: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Ilimitado (deixe em branco)"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editingPlano.ativo !== undefined ? editingPlano.ativo : true}
                  onChange={(e) => setEditingPlano({...editingPlano, ativo: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="ativo" className="text-sm font-medium">
                  Plano Ativo
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreatePlano : handleSavePlano}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Criar Plano' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetPlanoForm();
                }}
                className="flex-1 bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
          </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlanos;
