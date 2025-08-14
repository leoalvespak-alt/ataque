import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import RichTextEditor from '../../components/RichTextEditor';

interface Question {
  id: string; // ID único de 8 dígitos
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  gabarito: string;
  tipo: 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';
  comentario_professor?: string;
  ano: number;
  disciplina_id: number;
  assunto_id: number;
  banca_id: number;
  orgao_id: number;
  escolaridade_id: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Campos relacionados
  disciplina_nome?: string;
  assunto_nome?: string;
  banca_nome?: string;
  orgao_nome?: string;
  escolaridade_nome?: string;
}

interface Discipline {
  id: number;
  nome: string;
}

interface Subject {
  id: number;
  nome: string;
  disciplina_id: number;
}

interface Banca {
  id: number;
  nome: string;
}

interface Orgao {
  id: number;
  nome: string;
}

interface Escolaridade {
  id: number;
  nivel: string;
}

interface Ano {
  id: number;
  ano: number;
}

const AdminQuestoes: React.FC = () => {
  const { user } = useAuth();
  const { 
    disciplines, 
    subjects, 
    bancas, 
    orgaos, 
    escolaridades, 
    anos, 
    loading: categoriesLoading, 
    reloadCategories 
  } = useCategories();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('todos');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadData();
  }, [user]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, disciplineFilter]);

  // Função para recarregar apenas os filtros
  const reloadFilters = async () => {
    try {
      console.log('Recarregando filtros...');
      await reloadCategories();
      console.log('Filtros recarregados com sucesso');
    } catch (error) {
      console.error('Erro ao recarregar filtros:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar questões com relacionamentos
      const { data: questionsData, error: questionsError } = await supabase
        .from('questoes')
        .select(`
          *,
          disciplinas!inner(nome),
          assuntos!inner(nome),
          bancas!inner(nome),
          orgaos!inner(nome)
        `)
        .order('created_at', { ascending: false });

      if (questionsError) {
        console.error('Erro ao carregar questões:', questionsError);
        throw questionsError;
      }

      // Processar dados das questões
      const processedQuestions = questionsData?.map((q: any) => ({
        ...q,
        disciplina_nome: q.disciplinas.nome,
        assunto_nome: q.assuntos.nome,
        banca_nome: q.bancas.nome,
        orgao_nome: q.orgaos.nome,


      })) || [];

      setQuestions(processedQuestions);

      console.log('Questões carregadas:', processedQuestions);
      console.log('Disciplinas:', disciplines);
      console.log('Assuntos:', subjects);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.disciplina_nome && question.disciplina_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (question.assunto_nome && question.assunto_nome.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por disciplina
    if (disciplineFilter !== 'todos') {
      filtered = filtered.filter(question => 
        question.disciplina_nome === disciplineFilter
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleCreateQuestion = async () => {
    if (!validateQuestionForm()) return;

    setIsCreating(true);
    try {
      console.log('Ano sendo usado:', editingQuestion.ano, 'Tipo:', typeof editingQuestion.ano);
      
      // Usar o ano diretamente como número
      const ano = parseInt(editingQuestion.ano as any);
      if (isNaN(ano)) {
        throw new Error('Ano inválido');
      }

      console.log('Ano sendo usado:', ano);

      // Buscar ou criar o órgão
      let orgaoId = editingQuestion.orgao_id;
      if (editingQuestion.orgao_nome) {
        const { data: orgaoData, error: orgaoError } = await supabase
          .from('orgaos')
          .select('id')
          .eq('nome', editingQuestion.orgao_nome.trim())
          .single();

        if (orgaoError) {
          // Criar novo órgão se não existir
          const { data: newOrgao, error: createOrgaoError } = await supabase
            .from('orgaos')
            .insert([{ nome: editingQuestion.orgao_nome.trim() }])
            .select('id')
            .single();

          if (createOrgaoError) {
            throw new Error('Erro ao criar órgão');
          }
          orgaoId = newOrgao.id;
        } else {
          orgaoId = orgaoData.id;
        }
      }

      // Definir alternativas baseadas no tipo de questão
      let alternativaA = editingQuestion.alternativa_a || '';
      let alternativaB = editingQuestion.alternativa_b || '';
      let alternativaC = editingQuestion.alternativa_c || '';
      let alternativaD = editingQuestion.alternativa_d || '';
      let alternativaE = editingQuestion.alternativa_e || null;

      if (editingQuestion.tipo === 'CERTO_ERRADO') {
        alternativaA = 'Certo';
        alternativaB = 'Errado';
        alternativaC = '';
        alternativaD = '';
        alternativaE = null;
      }

      // Garantir que escolaridade_id tenha um valor padrão se não foi selecionado
      let escolaridadeId = editingQuestion.escolaridade_id;
      if (!escolaridadeId) {
        // Buscar o ID da escolaridade MEDIO como padrão
        const { data: escolaridadeData } = await supabase
          .from('escolaridades')
          .select('id')
          .eq('nivel', 'MEDIO')
          .single();
        
        escolaridadeId = escolaridadeData?.id;
        if (!escolaridadeId) {
          throw new Error('Escolaridade padrão não encontrada');
        }
      }

      console.log('Dados sendo enviados:', {
        enunciado: editingQuestion.enunciado!.trim(),
        alternativa_a: alternativaA,
        alternativa_b: alternativaB,
        alternativa_c: alternativaC,
        alternativa_d: alternativaD,
        alternativa_e: alternativaE,
        gabarito: editingQuestion.gabarito!,
        tipo: editingQuestion.tipo || 'MULTIPLA_ESCOLHA',
        comentario_professor: editingQuestion.comentario_professor?.trim() || null,
        ano: ano,
        disciplina_id: editingQuestion.disciplina_id!,
        assunto_id: editingQuestion.assunto_id!,
        banca_id: editingQuestion.banca_id!,
        orgao_id: orgaoId!,
        escolaridade_id: escolaridadeId,
        ativo: true
      });

      const { data, error } = await supabase
        .from('questoes')
        .insert([{
          enunciado: editingQuestion.enunciado!.trim(),
          alternativa_a: alternativaA,
          alternativa_b: alternativaB,
          alternativa_c: alternativaC,
          alternativa_d: alternativaD,
          alternativa_e: alternativaE,
          gabarito: editingQuestion.gabarito!,
          tipo: editingQuestion.tipo || 'MULTIPLA_ESCOLHA',
          comentario_professor: editingQuestion.comentario_professor?.trim() || null,
          ano: ano,
          disciplina_id: editingQuestion.disciplina_id!,
          assunto_id: editingQuestion.assunto_id!,
          banca_id: editingQuestion.banca_id!,
          orgao_id: orgaoId!,
          escolaridade_id: escolaridadeId,
          ativo: true
        }])
        .select(`
          *,
          disciplinas!inner(nome),
          assuntos!inner(nome),
          bancas!inner(nome),
          orgaos!inner(nome)
        `)
        .single();

      if (error) throw error;

      const newQuestion = {
        ...data,
        disciplina_nome: data.disciplinas.nome,
        assunto_nome: data.assuntos.nome,
        banca_nome: data.bancas.nome,
        orgao_nome: data.orgaos.nome
      };

      setQuestions([newQuestion, ...questions]);
      setMessage({ type: 'success', text: 'Questão criada com sucesso!' });
      resetQuestionForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Erro ao criar questão:', error);
      setMessage({ type: 'error', text: 'Erro ao criar questão: ' + (error as Error).message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setEditingQuestion({
      enunciado: question.enunciado,
      alternativa_a: question.alternativa_a,
      alternativa_b: question.alternativa_b,
      alternativa_c: question.alternativa_c,
      alternativa_d: question.alternativa_d,
      alternativa_e: question.alternativa_e,
      gabarito: question.gabarito,
      tipo: question.tipo,
      comentario_professor: question.comentario_professor,
      ano: question.ano,
      disciplina_id: question.disciplina_id,
      assunto_id: question.assunto_id,
      banca_id: question.banca_id,
      orgao_id: question.orgao_id,
      orgao_nome: question.orgao_nome
    });
    setShowEditModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!selectedQuestion || !validateQuestionForm()) return;

    try {
      console.log('Ano sendo usado (save):', editingQuestion.ano, 'Tipo:', typeof editingQuestion.ano);
      
      // Usar o ano diretamente como número
      const ano = parseInt(editingQuestion.ano as any);
      if (isNaN(ano)) {
        throw new Error('Ano inválido');
      }

      console.log('Ano sendo usado (save):', ano);

      // Buscar ou criar o órgão
      let orgaoId = editingQuestion.orgao_id;
      if (editingQuestion.orgao_nome) {
        const { data: orgaoData, error: orgaoError } = await supabase
          .from('orgaos')
          .select('id')
          .eq('nome', editingQuestion.orgao_nome.trim())
          .single();

        if (orgaoError) {
          // Criar novo órgão se não existir
          const { data: newOrgao, error: createOrgaoError } = await supabase
            .from('orgaos')
            .insert([{ nome: editingQuestion.orgao_nome.trim() }])
            .select('id')
            .single();

          if (createOrgaoError) {
            throw new Error('Erro ao criar órgão');
          }
          orgaoId = newOrgao.id;
        } else {
          orgaoId = orgaoData.id;
        }
      }

      // Definir alternativas baseadas no tipo de questão
      let alternativaA = editingQuestion.alternativa_a || '';
      let alternativaB = editingQuestion.alternativa_b || '';
      let alternativaC = editingQuestion.alternativa_c || '';
      let alternativaD = editingQuestion.alternativa_d || '';
      let alternativaE = editingQuestion.alternativa_e || null;

      if (editingQuestion.tipo === 'CERTO_ERRADO') {
        alternativaA = 'Certo';
        alternativaB = 'Errado';
        alternativaC = '';
        alternativaD = '';
        alternativaE = null;
      }

      // Garantir que escolaridade_id tenha um valor padrão se não foi selecionado
      let escolaridadeId = editingQuestion.escolaridade_id;
      if (!escolaridadeId) {
        // Buscar o ID da escolaridade MEDIO como padrão
        const { data: escolaridadeData } = await supabase
          .from('escolaridades')
          .select('id')
          .eq('nivel', 'MEDIO')
          .single();
        
        escolaridadeId = escolaridadeData?.id;
        if (!escolaridadeId) {
          throw new Error('Escolaridade padrão não encontrada');
        }
      }

      const { error } = await supabase
        .from('questoes')
        .update({
          enunciado: editingQuestion.enunciado!.trim(),
          alternativa_a: alternativaA,
          alternativa_b: alternativaB,
          alternativa_c: alternativaC,
          alternativa_d: alternativaD,
          alternativa_e: alternativaE,
          gabarito: editingQuestion.gabarito!,
          tipo: editingQuestion.tipo || 'MULTIPLA_ESCOLHA',
          comentario_professor: editingQuestion.comentario_professor?.trim() || null,
          ano: ano,
          disciplina_id: editingQuestion.disciplina_id!,
          assunto_id: editingQuestion.assunto_id!,
          banca_id: editingQuestion.banca_id!,
          orgao_id: orgaoId!,
          escolaridade_id: escolaridadeId
        })
        .eq('id', selectedQuestion.id);

      if (error) throw error;

      // Atualizar lista local
      const updatedQuestion = {
        ...selectedQuestion,
        ...editingQuestion,
        disciplina_nome: disciplines.find(d => d.id === editingQuestion.disciplina_id)?.nome,
        assunto_nome: subjects.find(s => s.id === editingQuestion.assunto_id)?.nome,
        banca_nome: bancas.find(b => b.id === editingQuestion.banca_id)?.nome,
        orgao_nome: orgaos.find(o => o.id === editingQuestion.orgao_id)?.nome
      };

      setQuestions(questions.map(question =>
        question.id === selectedQuestion.id ? updatedQuestion : question
      ));

      setMessage({ type: 'success', text: 'Questão atualizada com sucesso!' });
      setShowEditModal(false);
      resetQuestionForm();
    } catch (error) {
      console.error('Erro ao atualizar questão:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar questão: ' + (error as Error).message });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;

    try {
      const { error } = await supabase
        .from('questoes')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(questions.filter(question => question.id !== questionId));
      setMessage({ type: 'success', text: 'Questão excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir questão: ' + (error as Error).message });
    }
  };

  const validateQuestionForm = () => {
    if (!editingQuestion.enunciado?.trim()) {
      setMessage({ type: 'error', text: 'Enunciado é obrigatório' });
      return false;
    }
    if (!editingQuestion.alternativa_a?.trim()) {
      setMessage({ type: 'error', text: 'Alternativa A é obrigatória' });
      return false;
    }
    if (!editingQuestion.alternativa_b?.trim()) {
      setMessage({ type: 'error', text: 'Alternativa B é obrigatória' });
      return false;
    }
    if (!editingQuestion.alternativa_c?.trim()) {
      setMessage({ type: 'error', text: 'Alternativa C é obrigatória' });
      return false;
    }
    if (!editingQuestion.alternativa_d?.trim()) {
      setMessage({ type: 'error', text: 'Alternativa D é obrigatória' });
      return false;
    }
    if (!editingQuestion.gabarito) {
      setMessage({ type: 'error', text: 'Gabarito é obrigatório' });
      return false;
    }
    if (!editingQuestion.disciplina_id) {
      setMessage({ type: 'error', text: 'Disciplina é obrigatória' });
      return false;
    }
    if (!editingQuestion.assunto_id) {
      setMessage({ type: 'error', text: 'Assunto é obrigatório' });
      return false;
    }
    if (!editingQuestion.banca_id) {
      setMessage({ type: 'error', text: 'Banca é obrigatória' });
      return false;
    }
    if (!editingQuestion.orgao_nome?.trim()) {
      setMessage({ type: 'error', text: 'Órgão é obrigatório' });
      return false;
    }
    if (!editingQuestion.escolaridade_id) {
      setMessage({ type: 'error', text: 'Escolaridade é obrigatória' });
      return false;
    }
    if (!editingQuestion.ano) {
      setMessage({ type: 'error', text: 'Ano é obrigatório' });
      return false;
    }
    return true;
  };

  const resetQuestionForm = () => {
    setEditingQuestion({});
    setSelectedQuestion(null);
  };

  const openCreateQuestionModal = () => {
    setIsCreating(true);
    setEditingQuestion({
      gabarito: 'A',
      tipo: 'MULTIPLA_ESCOLHA',
      ano: new Date().getFullYear(),
      escolaridade_id: escolaridades.find(e => e.nivel === 'MEDIO')?.id || undefined
    });
    setSelectedQuestion(null);
    setShowEditModal(true);
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'MULTIPLA_ESCOLHA': return 'Múltipla Escolha';
      case 'CERTO_ERRADO': return 'Certo ou Errado';
      default: return tipo;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            Gerenciar Questões
          </h1>
          <div className="flex gap-3">
            <button 
              onClick={openCreateQuestionModal}
              className="bg-[#00c853] hover:bg-[#00a843] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Nova Questão
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Enunciado, disciplina ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Disciplina</label>
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todos">Todas</option>
                {disciplines.map(discipline => (
                  <option key={discipline.id} value={discipline.nome}>{discipline.nome}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDisciplineFilter('todos');
                }}
                className="flex-1 bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Limpar Filtros
              </button>
              <button
                onClick={reloadFilters}
                className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                title="Atualizar lista de disciplinas e outros filtros"
              >
                <i className="fas fa-sync-alt"></i>
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
                {questions.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Total de Questões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {questions.filter(q => q.tipo === 'MULTIPLA_ESCOLHA').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Múltipla Escolha</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {questions.filter(q => q.tipo === 'CERTO_ERRADO').length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Certo ou Errado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {disciplines.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Disciplinas</div>
            </div>
          </div>
        </div>

        {/* Lista de Questões */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                      {getTipoLabel(question.tipo)}
                    </span>
                    <span className="text-sm text-[#f2f2f2]/70">{question.disciplina_nome}</span>
                    <span className="text-sm text-[#f2f2f2]/70">•</span>
                    <span className="text-sm text-[#f2f2f2]/70">{question.assunto_nome}</span>
                    <span className="text-sm text-[#f2f2f2]/70">•</span>
                    <span className="text-sm text-[#f2f2f2]/70">{question.ano}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#f2f2f2] mb-3">
                    {truncateText(question.enunciado, 200)}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#f2f2f2]/80">
                    <div><strong>A)</strong> {truncateText(question.alternativa_a, 80)}</div>
                    <div><strong>B)</strong> {truncateText(question.alternativa_b, 80)}</div>
                    <div><strong>C)</strong> {truncateText(question.alternativa_c, 80)}</div>
                    <div><strong>D)</strong> {truncateText(question.alternativa_d, 80)}</div>
                    {question.alternativa_e && (
                      <div><strong>E)</strong> {truncateText(question.alternativa_e, 80)}</div>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-[#f2f2f2]/60">
                    <strong>Gabarito:</strong> {question.gabarito}
                  </div>
                  <div className="mt-2 text-xs text-[#f2f2f2]/50">
                    <strong>Banca:</strong> {question.banca_nome} • <strong>Órgão:</strong> {question.orgao_nome}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
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

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-question-circle text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Nenhuma questão encontrada</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {isCreating ? 'Nova Questão' : 'Editar Questão'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Enunciado *</label>
                <RichTextEditor
                  value={editingQuestion.enunciado || ''}
                  onChange={(value) => setEditingQuestion({...editingQuestion, enunciado: value})}
                  placeholder="Digite o enunciado da questão"
                  rows={4}
                />
              </div>
              
              {editingQuestion.tipo === 'CERTO_ERRADO' ? (
                // Para questões do tipo "Certo ou Errado"
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa A (Certo) *</label>
                    <input
                      type="text"
                      value="Certo"
                      disabled
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa B (Errado) *</label>
                    <input
                      type="text"
                      value="Errado"
                      disabled
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] opacity-50"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Alternativas C, D e E (não aplicável)</label>
                    <input
                      type="text"
                      value="Não aplicável para questões do tipo 'Certo ou Errado'"
                      disabled
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] opacity-50"
                    />
                  </div>
                </>
              ) : (
                // Para questões de múltipla escolha
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa A *</label>
                    <input
                      type="text"
                      value={editingQuestion.alternativa_a || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, alternativa_a: e.target.value})}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                      placeholder="Alternativa A"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa B *</label>
                    <input
                      type="text"
                      value={editingQuestion.alternativa_b || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, alternativa_b: e.target.value})}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                      placeholder="Alternativa B"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa C *</label>
                    <input
                      type="text"
                      value={editingQuestion.alternativa_c || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, alternativa_c: e.target.value})}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                      placeholder="Alternativa C"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa D *</label>
                    <input
                      type="text"
                      value={editingQuestion.alternativa_d || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, alternativa_d: e.target.value})}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                      placeholder="Alternativa D"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Alternativa E (opcional)</label>
                    <input
                      type="text"
                      value={editingQuestion.alternativa_e || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, alternativa_e: e.target.value})}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                      placeholder="Alternativa E (opcional)"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Gabarito *</label>
                <select
                  value={editingQuestion.gabarito || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, gabarito: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione</option>
                  {editingQuestion.tipo === 'CERTO_ERRADO' ? (
                    <>
                      <option value="A">A (Certo)</option>
                      <option value="B">B (Errado)</option>
                    </>
                  ) : (
                    <>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tipo *</label>
                <select
                  value={editingQuestion.tipo || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, tipo: e.target.value as 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO'})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  <option value="CERTO_ERRADO">Certo ou Errado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Disciplina *</label>
                <select
                  value={editingQuestion.disciplina_id || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, disciplina_id: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>{discipline.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Assunto *</label>
                <select
                  value={editingQuestion.assunto_id || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, assunto_id: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione um assunto</option>
                  {subjects
                    .filter(subject => !editingQuestion.disciplina_id || subject.disciplina_id === editingQuestion.disciplina_id)
                    .map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.nome}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Banca *</label>
                <select
                  value={editingQuestion.banca_id || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, banca_id: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione uma banca</option>
                  {bancas.map(banca => (
                    <option key={banca.id} value={banca.id}>{banca.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Órgão *</label>
                <input
                  type="text"
                  value={editingQuestion.orgao_nome || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, orgao_nome: e.target.value})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Digite o nome do órgão"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Escolaridade *</label>
                <select
                  value={editingQuestion.escolaridade_id || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, escolaridade_id: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione uma escolaridade</option>
                  {escolaridades.map(escolaridade => (
                    <option key={escolaridade.id} value={escolaridade.id}>{escolaridade.nivel}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Ano *</label>
                <select
                  value={editingQuestion.ano || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, ano: parseInt(e.target.value)})}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione um ano</option>
                  {anos.map(ano => (
                    <option key={ano.id} value={ano.ano}>{ano.ano}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Comentário do Professor (opcional)</label>
                <textarea
                  value={editingQuestion.comentario_professor || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, comentario_professor: e.target.value})}
                  rows={3}
                  className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  placeholder="Comentário do professor sobre a questão"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={isCreating ? handleCreateQuestion : handleSaveQuestion}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Criar Questão' : 'Salvar'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetQuestionForm();
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

export default AdminQuestoes;
