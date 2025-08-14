import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Notification {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: string;
  destinatario_tipo: string;
  usuario_id?: string;
  lida: boolean;
  ativa: boolean;
  data_envio: string;
  data_leitura?: string;
  criado_por?: string;
  created_at: string;
  updated_at: string;
  criador_nome?: string;
}

interface NotificationForm {
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: string;
  destinatario_tipo: string;
  usuario_id?: string;
  ativa: boolean;
}

const AdminNotificacoes: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NotificationForm>({
    titulo: '',
    mensagem: '',
    tipo: 'GERAL',
    prioridade: 'NORMAL',
    destinatario_tipo: 'TODOS',
    ativa: true
  });

  const types = [
    { value: 'GERAL', label: 'Geral' },
    { value: 'SISTEMA', label: 'Sistema' },
    { value: 'PROMOCIONAL', label: 'Promocional' },
    { value: 'MANUTENCAO', label: 'Manutenção' },
    { value: 'ATUALIZACAO', label: 'Atualização' },
    { value: 'EVENTO', label: 'Evento' }
  ];

  const priorities = [
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'URGENTE', label: 'Urgente' }
  ];

  const recipientTypes = [
    { value: 'TODOS', label: 'Todos os usuários' },
    { value: 'ALUNOS', label: 'Apenas alunos' },
    { value: 'GESTORES', label: 'Apenas gestores' },
    { value: 'ESPECIFICO', label: 'Usuário específico' }
  ];

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const processedNotifications = data.map((notification: any) => ({
          ...notification,
          criador_nome: 'Sistema' // Por enquanto, todas as notificações são do sistema
        }));
        setNotifications(processedNotifications);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNotification) {
        // Atualizar notificação existente
        const { error } = await supabase
          .from('notificacoes')
          .update({
            titulo: formData.titulo,
            mensagem: formData.mensagem,
            tipo: formData.tipo,
            prioridade: formData.prioridade,
            destinatario_tipo: formData.destinatario_tipo,
            usuario_id: formData.usuario_id || null,
            ativa: formData.ativa,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNotification.id);

        if (!error) {
          alert('Notificação atualizada com sucesso!');
          resetForm();
          loadNotifications();
        } else {
          alert('Erro ao atualizar notificação: ' + error.message);
        }
      } else {
        // Criar nova notificação
        const { error } = await supabase
          .from('notificacoes')
          .insert({
            titulo: formData.titulo,
            mensagem: formData.mensagem,
            tipo: formData.tipo,
            prioridade: formData.prioridade,
            destinatario_tipo: formData.destinatario_tipo,
            usuario_id: formData.usuario_id || null,
            ativa: formData.ativa,
            criado_por: user?.id
          });

        if (!error) {
          alert('Notificação criada com sucesso!');
          resetForm();
          loadNotifications();
        } else {
          alert('Erro ao criar notificação: ' + error.message);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
      alert('Erro ao salvar notificação');
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      titulo: notification.titulo,
      mensagem: notification.mensagem,
      tipo: notification.tipo,
      prioridade: notification.prioridade,
      destinatario_tipo: notification.destinatario_tipo,
      usuario_id: notification.usuario_id || undefined,
      ativa: notification.ativa
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id);

      if (!error) {
        alert('Notificação excluída com sucesso!');
        loadNotifications();
      } else {
        alert('Erro ao excluir notificação: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      alert('Erro ao excluir notificação');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      mensagem: '',
      tipo: 'GERAL',
      prioridade: 'NORMAL',
      destinatario_tipo: 'TODOS',
      ativa: true
    });
    setEditingNotification(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      'GERAL': 'bg-blue-500',
      'SISTEMA': 'bg-green-500',
      'PROMOCIONAL': 'bg-yellow-500',
      'MANUTENCAO': 'bg-red-500',
      'ATUALIZACAO': 'bg-purple-500',
      'EVENTO': 'bg-orange-500'
    };
    return typeColors[type] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'BAIXA': 'bg-gray-500',
      'NORMAL': 'bg-blue-500',
      'ALTA': 'bg-yellow-500',
      'URGENTE': 'bg-red-500'
    };
    return priorityColors[priority] || 'bg-gray-500';
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
            Gerenciar Notificações
          </h1>
          <p className="text-[#f2f2f2]/70">
            Crie e gerencie notificações para os usuários da plataforma
          </p>
        </div>

        {/* Botão Criar Nova Notificação */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Nova Notificação
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-4">
              {editingNotification ? 'Editar Notificação' : 'Nova Notificação'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  >
                    {types.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destinatários</label>
                  <select
                    value={formData.destinatario_tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinatario_tipo: e.target.value }))}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  >
                    {recipientTypes.map(recipient => (
                      <option key={recipient.value} value={recipient.value}>
                        {recipient.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.destinatario_tipo === 'ESPECIFICO' && (
                <div>
                  <label className="block text-sm font-medium mb-2">ID do Usuário</label>
                  <input
                    type="text"
                    value={formData.usuario_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, usuario_id: e.target.value }))}
                    className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    placeholder="Digite o ID do usuário"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <textarea
                  value={formData.mensagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                  rows={4}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ativa}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
                    className="rounded border-[#333333] bg-[#1b1b1b] text-[#8b0000] focus:ring-[#8b0000]"
                  />
                  <span className="text-sm">Ativa</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {editingNotification ? 'Atualizar' : 'Criar'} Notificação
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#333333] hover:bg-[#444444] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Notificações */}
        <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-6">Notificações Existentes</h2>
          
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-bell text-4xl text-[#333333] mb-4"></i>
              <p className="text-[#f2f2f2]/70">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 bg-[#1b1b1b] rounded-lg border border-[#333333]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${getTypeColor(notification.tipo)}`}></div>
                    <div>
                      <div className="font-semibold">{notification.titulo}</div>
                      <div className="text-sm text-[#f2f2f2]/70 mb-1">{notification.mensagem}</div>
                      <div className="flex items-center gap-4 text-xs text-[#f2f2f2]/50">
                        <span>Tipo: {notification.tipo}</span>
                        <span>Prioridade: {notification.prioridade}</span>
                        <span>Destinatários: {notification.destinatario_tipo}</span>
                        <span>Criado por: {notification.criador_nome}</span>
                        <span>Criado em: {new Date(notification.created_at).toLocaleDateString('pt-BR')}</span>
                        {notification.lida && (
                          <span>Lida em: {new Date(notification.data_leitura!).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      notification.ativa 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {notification.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(notification.prioridade)} text-white`}>
                      {notification.prioridade}
                    </span>
                    <button
                      onClick={() => handleEdit(notification)}
                      className="bg-[#333333] hover:bg-[#444444] text-white p-2 rounded transition-colors duration-200"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors duration-200"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificacoes;
