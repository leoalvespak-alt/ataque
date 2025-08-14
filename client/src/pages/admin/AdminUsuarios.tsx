import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  status: string;
  xp: number;
  questoes_respondidas: number;
  ultimo_login?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const AdminUsuarios: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadUsers();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userTypeFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        throw error;
      }

      setUsers(data || []);
      console.log('Usuários carregados:', data);
      
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de usuário
    if (userTypeFilter !== 'todos') {
      filtered = filtered.filter(user => user.tipo_usuario === userTypeFilter);
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nome: editingUser.nome!.trim(),
          email: editingUser.email!.trim().toLowerCase(),
          tipo_usuario: editingUser.tipo_usuario || 'aluno',
          status: editingUser.status || 'gratuito',
          xp: editingUser.xp || 0,
          questoes_respondidas: editingUser.questoes_respondidas || 0,
          ativo: editingUser.ativo !== undefined ? editingUser.ativo : true
        }])
        .select()
        .single();

      if (error) throw error;

      setUsers([data, ...users]);
      setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      resetUserForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao criar usuário: ' + (error as Error).message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingUser({
      nome: user.nome,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      status: user.status,
      xp: user.xp,
      questoes_respondidas: user.questoes_respondidas,
      ativo: user.ativo
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !validateUserForm()) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: editingUser.nome!.trim(),
          email: editingUser.email!.trim().toLowerCase(),
          tipo_usuario: editingUser.tipo_usuario!,
          status: editingUser.status!,
          xp: editingUser.xp!,
          questoes_respondidas: editingUser.questoes_respondidas!,
          ativo: editingUser.ativo!
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      const updatedUser = {
        ...selectedUser,
        ...editingUser
      };

      setUsers(users.map(user =>
        user.id === selectedUser.id ? updatedUser : user
      ));

      setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      setShowEditModal(false);
      resetUserForm();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar usuário: ' + (error as Error).message });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir usuário: ' + (error as Error).message });
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, ativo: !currentStatus } : user
      ));

      setMessage({ 
        type: 'success', 
        text: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!` 
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar status do usuário: ' + (error as Error).message });
    }
  };

  const validateUserForm = () => {
    if (!editingUser.nome?.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      return false;
    }
    if (!editingUser.email?.trim()) {
      setMessage({ type: 'error', text: 'Email é obrigatório' });
      return false;
    }
    if (!editingUser.tipo_usuario) {
      setMessage({ type: 'error', text: 'Tipo de usuário é obrigatório' });
      return false;
    }
    if (!editingUser.status) {
      setMessage({ type: 'error', text: 'Status é obrigatório' });
      return false;
    }
    return true;
  };

  const resetUserForm = () => {
    setEditingUser({});
    setSelectedUser(null);
  };

  const openCreateUserModal = () => {
    setIsCreating(true);
    setEditingUser({
      tipo_usuario: 'aluno',
      status: 'gratuito',
      xp: 0,
      questoes_respondidas: 0,
      ativo: true
    });
    setSelectedUser(null);
    setShowEditModal(true);
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'aluno': return 'Aluno';
      case 'gestor': return 'Gestor';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'gratuito': return 'Gratuito';
      case 'premium': return 'Premium';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'text-yellow-400 bg-yellow-900/20';
      case 'gratuito': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
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
            Gerenciar Usuários
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={openCreateUserModal}
              className="bg-[#00c853] hover:bg-[#00a843] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Novo Usuário
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Usuário</label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="aluno">Aluno</option>
                <option value="gestor">Gestor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="gratuito">Gratuito</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setUserTypeFilter('todos');
                  setStatusFilter('todos');
                }}
                className="w-full bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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
                {users.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Total de Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {users.filter(u => u.tipo_usuario === 'aluno').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {users.filter(u => u.tipo_usuario === 'gestor').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Gestores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {users.filter(u => u.status === 'premium').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Premium</div>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                      {getUserTypeLabel(user.tipo_usuario)}
                    </span>
                    {!user.ativo && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400">
                        Inativo
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#f2f2f2] mb-2">
                    {user.nome}
                  </h3>
                  <p className="text-sm text-[#f2f2f2]/70 mb-3">
                    {user.email}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#f2f2f2]/80">
                    <div><strong>XP:</strong> {user.xp}</div>
                    <div><strong>Questões:</strong> {user.questoes_respondidas}</div>
                    <div><strong>Criado:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}</div>
                    {user.ultimo_login && (
                      <div><strong>Último login:</strong> {new Date(user.ultimo_login).toLocaleDateString('pt-BR')}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleUserStatus(user.id, user.ativo)}
                    className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                      user.ativo 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <i className={`fas ${user.ativo ? 'fa-ban' : 'fa-check'} mr-1`}></i>
                    {user.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-md border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {isCreating ? 'Novo Usuário' : 'Editar Usuário'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={editingUser.nome || ''}
                  onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Nome do usuário"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Email do usuário"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Usuário *</label>
                <select
                  value={editingUser.tipo_usuario || ''}
                  onChange={(e) => setEditingUser({...editingUser, tipo_usuario: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="aluno">Aluno</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={editingUser.status || ''}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="gratuito">Gratuito</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">XP</label>
                <input
                  type="number"
                  value={editingUser.xp || 0}
                  onChange={(e) => setEditingUser({...editingUser, xp: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Questões Respondidas</label>
                <input
                  type="number"
                  value={editingUser.questoes_respondidas || 0}
                  onChange={(e) => setEditingUser({...editingUser, questoes_respondidas: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editingUser.ativo !== undefined ? editingUser.ativo : true}
                  onChange={(e) => setEditingUser({...editingUser, ativo: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="ativo" className="text-sm font-medium">
                  Usuário Ativo
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreateUser : handleSaveUser}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Criar Usuário' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetUserForm();
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

export default AdminUsuarios;
