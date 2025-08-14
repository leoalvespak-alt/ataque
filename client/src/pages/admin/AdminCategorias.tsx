import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Discipline {
  id: number;
  nome: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  nome: string;
  disciplina_id: number;
  disciplina_nome: string;
  created_at: string;
  updated_at: string;
}

const AdminCategorias: React.FC = () => {
  const { user } = useAuth();
  const { reloadCategories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'disciplines' | 'subjects'>('disciplines');
  
  // Estados para modais
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Estados para formulários
  const [editingDiscipline, setEditingDiscipline] = useState<Partial<Discipline>>({});
  const [editingSubject, setEditingSubject] = useState<Partial<Subject>>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Estados para filtros
  const [disciplineFilter, setDisciplineFilter] = useState<string>('todos');
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  
  // Estados para feedback
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, disciplineFilter]);

  const filterSubjects = () => {
    if (disciplineFilter === 'todos') {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject => 
        subject.disciplina_nome === disciplineFilter
      );
      setFilteredSubjects(filtered);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar disciplinas do Supabase
      const { data: disciplinesData, error: disciplinesError } = await supabase
        .from('disciplinas')
        .select('*')
        .order('nome');

      if (disciplinesError) {
        throw new Error('Erro ao carregar disciplinas: ' + disciplinesError.message);
      }

      // Carregar assuntos com disciplina do Supabase
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('assuntos')
        .select(`
          *,
          disciplina:disciplinas(nome)
        `)
        .order('nome');

      if (subjectsError) {
        throw new Error('Erro ao carregar assuntos: ' + subjectsError.message);
      }

      setDisciplines(disciplinesData || []);
      const processedSubjects = subjectsData?.map((s: any) => ({
        ...s,
        disciplina_nome: s.disciplina?.nome || 'Disciplina não encontrada'
      })) || [];
      setSubjects(processedSubjects);
      setFilteredSubjects(processedSubjects);
      
      console.log('Disciplinas carregadas:', disciplinesData);
      console.log('Assuntos carregados:', subjectsData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscipline = async () => {
    if (!editingDiscipline.nome?.trim()) {
      setMessage({ type: 'error', text: 'Nome da disciplina é obrigatório' });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([
          { nome: editingDiscipline.nome.trim() }
        ])
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar disciplina: ' + error.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Disciplina criada com sucesso!' });
      resetDisciplineForm();
      setShowDisciplineModal(false);
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao criar disciplina:', error);
      setMessage({ type: 'error', text: 'Erro ao criar disciplina: ' + (error as Error).message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!editingSubject.nome?.trim() || !editingSubject.disciplina_id) {
      setMessage({ type: 'error', text: 'Nome e disciplina são obrigatórios' });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('assuntos')
        .insert([
          { 
            nome: editingSubject.nome.trim(),
            disciplina_id: editingSubject.disciplina_id
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar assunto: ' + error.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Assunto criado com sucesso!' });
      resetSubjectForm();
      setShowSubjectModal(false);
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao criar assunto:', error);
      setMessage({ type: 'error', text: 'Erro ao criar assunto: ' + (error as Error).message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveDiscipline = async () => {
    if (!selectedDiscipline || !editingDiscipline.nome?.trim()) {
      setMessage({ type: 'error', text: 'Nome da disciplina é obrigatório' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .update({ nome: editingDiscipline.nome.trim() })
        .eq('id', selectedDiscipline.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao atualizar disciplina: ' + error.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Disciplina atualizada com sucesso!' });
      setShowDisciplineModal(false);
      resetDisciplineForm();
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar disciplina: ' + (error as Error).message });
    }
  };

  const handleSaveSubject = async () => {
    if (!selectedSubject || !editingSubject.nome?.trim() || !editingSubject.disciplina_id) {
      setMessage({ type: 'error', text: 'Nome e disciplina são obrigatórios' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('assuntos')
        .update({ 
          nome: editingSubject.nome.trim(),
          disciplina_id: editingSubject.disciplina_id
        })
        .eq('id', selectedSubject.id)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao atualizar assunto: ' + error.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Assunto atualizado com sucesso!' });
      setShowSubjectModal(false);
      resetSubjectForm();
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao atualizar assunto:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar assunto: ' + (error as Error).message });
    }
  };

  const handleDeleteDiscipline = async (disciplineId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta disciplina? Isso também excluirá todos os assuntos relacionados.')) return;

    try {
      // Primeiro deletar assuntos relacionados
      const { error: subjectsError } = await supabase
        .from('assuntos')
        .delete()
        .eq('disciplina_id', disciplineId);

      if (subjectsError) {
        throw new Error('Erro ao excluir assuntos relacionados: ' + subjectsError.message);
      }

      // Depois deletar a disciplina
      const { error: disciplineError } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', disciplineId);

      if (disciplineError) {
        throw new Error('Erro ao excluir disciplina: ' + disciplineError.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Disciplina excluída com sucesso!' });
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir disciplina: ' + (error as Error).message });
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm('Tem certeza que deseja excluir este assunto?')) return;

    try {
      const { error } = await supabase
        .from('assuntos')
        .delete()
        .eq('id', subjectId);

      if (error) {
        throw new Error('Erro ao excluir assunto: ' + error.message);
      }

      // Recarregar dados do Supabase
      await loadData();
      setMessage({ type: 'success', text: 'Assunto excluído com sucesso!' });
      // Recarregar categorias para atualizar outras páginas
      await reloadCategories();
    } catch (error) {
      console.error('Erro ao excluir assunto:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir assunto: ' + (error as Error).message });
    }
  };

  const resetDisciplineForm = () => {
    setEditingDiscipline({});
    setSelectedDiscipline(null);
  };

  const resetSubjectForm = () => {
    setEditingSubject({});
    setSelectedSubject(null);
  };

  const openCreateDisciplineModal = () => {
    setIsCreating(true);
    setEditingDiscipline({});
    setSelectedDiscipline(null);
    setShowDisciplineModal(true);
  };

  const openCreateSubjectModal = () => {
    setIsCreating(true);
    setEditingSubject({});
    setSelectedSubject(null);
    setShowSubjectModal(true);
  };

  const openEditDisciplineModal = (discipline: Discipline) => {
    setIsCreating(false);
    setSelectedDiscipline(discipline);
    setEditingDiscipline({
      nome: discipline.nome
    });
    setShowDisciplineModal(true);
  };

  const openEditSubjectModal = (subject: Subject) => {
    setIsCreating(false);
    setSelectedSubject(subject);
    setEditingSubject({
      nome: subject.nome,
      disciplina_id: subject.disciplina_id
    });
    setShowSubjectModal(true);
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
            Gerenciar Categorias
          </h1>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="bg-[#00c853] hover:bg-[#00a843] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              title="Atualizar dados"
            >
              <i className="fas fa-sync-alt"></i>
              Atualizar
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

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {disciplines.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Disciplinas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {subjects.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Assuntos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {Math.round(subjects.length / Math.max(disciplines.length, 1))}
              </div>
              <div className="text-sm text-[#f2f2f2]">Média Assuntos/Disciplina</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {new Date().getFullYear()}
              </div>
              <div className="text-sm text-[#f2f2f2]">Ano Atual</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#242424] rounded-lg border border-[#333333] mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('disciplines')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors duration-200 ${
                activeTab === 'disciplines'
                  ? 'bg-[#8b0000] text-white'
                  : 'text-[#f2f2f2] hover:bg-[#333333]'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Disciplinas ({disciplines.length})
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors duration-200 ${
                activeTab === 'subjects'
                  ? 'bg-[#8b0000] text-white'
                  : 'text-[#f2f2f2] hover:bg-[#333333]'
              }`}
            >
              <i className="fas fa-tags mr-2"></i>
              Assuntos ({subjects.length})
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'disciplines' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Disciplinas</h2>
              <button 
                onClick={openCreateDisciplineModal}
                className="bg-[#00c853] hover:bg-[#00a843] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Nova Disciplina
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disciplines.map((discipline) => (
                <div key={discipline.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#f2f2f2] mb-2">
                        {discipline.nome}
                      </h3>
                      <div className="text-xs text-[#f2f2f2]/50">
                        Criada em {new Date(discipline.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-[#f2f2f2]/50">
                        Assuntos: {subjects.filter(s => s.disciplina_id === discipline.id).length}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDisciplineModal(discipline)}
                        className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteDiscipline(discipline.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {disciplines.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-book text-4xl text-[#333333] mb-4"></i>
                <p className="text-[#f2f2f2]/70">Nenhuma disciplina encontrada</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Assuntos</h2>
              <button 
                onClick={openCreateSubjectModal}
                className="bg-[#00c853] hover:bg-[#00a843] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <i className="fas fa-plus mr-2"></i>
                Novo Assunto
              </button>
            </div>

            {/* Filtro de Disciplinas */}
            <div className="mb-6">
              <label htmlFor="disciplineFilter" className="block text-sm font-medium text-[#f2f2f2] mb-2">
                Filtrar por Disciplina:
              </label>
              <select
                id="disciplineFilter"
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="bg-[#242424] border border-[#333333] text-[#f2f2f2] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8b0000] transition-colors duration-200"
              >
                <option value="todos">Todas as Disciplinas</option>
                {disciplines.map((discipline) => (
                  <option key={discipline.id} value={discipline.nome}>
                    {discipline.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <div key={subject.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#f2f2f2] mb-2">
                        {subject.nome}
                      </h3>
                      <div className="text-sm text-[#8b0000] mb-2">
                        {subject.disciplina_nome}
                      </div>
                      <div className="text-xs text-[#f2f2f2]/50">
                        Criado em {new Date(subject.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSubjectModal(subject)}
                        className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSubjects.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-tags text-4xl text-[#333333] mb-4"></i>
                <p className="text-[#f2f2f2]/70">
                  {subjects.length === 0 ? 'Nenhum assunto encontrado' : 'Nenhum assunto encontrado para a disciplina selecionada'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Disciplina */}
      {showDisciplineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-md border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {isCreating ? 'Nova Disciplina' : 'Editar Disciplina'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={editingDiscipline.nome || ''}
                  onChange={(e) => setEditingDiscipline({...editingDiscipline, nome: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Nome da disciplina"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreateDiscipline : handleSaveDiscipline}
                disabled={isCreating && !editingDiscipline.nome?.trim()}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] disabled:bg-[#333333] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Criar' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowDisciplineModal(false);
                  resetDisciplineForm();
                }}
                className="flex-1 bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Assunto */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-md border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {isCreating ? 'Novo Assunto' : 'Editar Assunto'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={editingSubject.nome || ''}
                  onChange={(e) => setEditingSubject({...editingSubject, nome: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Nome do assunto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Disciplina *</label>
                <select
                  value={editingSubject.disciplina_id || ''}
                  onChange={(e) => setEditingSubject({...editingSubject, disciplina_id: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreateSubject : handleSaveSubject}
                disabled={isCreating && (!editingSubject.nome?.trim() || !editingSubject.disciplina_id)}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] disabled:bg-[#333333] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Criar' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  resetSubjectForm();
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

export default AdminCategorias;
