import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoriesContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import FormattedText from '../components/FormattedText';

interface Question {
  id: string;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_e?: string;
  gabarito: string;
  comentario_professor?: string;
  ano: number;
  disciplina_id: number;
  assunto_id: number;
  banca_id: number;
  orgao_id: number;
  escolaridade_id: number;
  ativo: boolean;
  created_at: string;
  // Campos relacionados
  disciplina_nome?: string;
  assunto_nome?: string;
  banca_nome?: string;
  orgao_nome?: string;
  escolaridade_nome?: string;
  // Status da resposta do usuário
  resposta_usuario?: string;
  acertou?: boolean;
  respondida?: boolean;
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

const Questoes: React.FC = () => {
  const { user } = useAuth();
  const { disciplines, subjects, bancas, orgaos, escolaridades, loading: categoriesLoading, reloadCategories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const [filters, setFilters] = useState({
    disciplina_id: '',
    assunto_id: '',
    banca_id: '',
    orgao_id: '',
    escolaridade_id: '',
    anos: [] as number[], // Array para seleção múltipla de anos
    status_resposta: 'todas', // todas, nao_respondidas, acertadas, erradas
    search: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Aplicar filtros apenas quando as questões mudarem, não quando os filtros mudarem
    if (questions.length > 0) {
      applyFilters();
    }
  }, [questions]);

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

  // Função para aplicar filtros manualmente
  const handleApplyFilters = () => {
    console.log('=== BOTÃO FILTRAR CLICADO ===');
    console.log('Filtros atuais antes de aplicar:', filters);
    applyFilters();
  };

  const loadData = async () => {
      try {
        setLoading(true);

      // Carregar questões com status de resposta do usuário
        console.log('Carregando questões do Supabase...');
        const { data: questionsData, error } = await supabase
          .from('questoes')
          .select(`
            *,
            disciplinas!inner(nome),
            assuntos!inner(nome),
            bancas!inner(nome),
            orgaos!inner(nome),
            escolaridades!inner(nivel),
            respostas_usuarios!left(alternativa_marcada, acertou)
          `)
          .eq('ativo', true)
        .order('created_at', { ascending: false });

        console.log('Resposta do Supabase:', { questionsData, error });

        if (questionsData && !error) {
          console.log('Questões carregadas:', questionsData.length);
          // Processar dados das questões
          const processedQuestions = questionsData.map((q: any) => {
            const processed = {
              ...q,
              disciplina_nome: q.disciplinas.nome,
              assunto_nome: q.assuntos.nome,
              banca_nome: q.bancas.nome,
              orgao_nome: q.orgaos.nome,
              escolaridade_nome: q.escolaridades.nivel,
              ano: q.ano, // Usar campo ano diretamente
              resposta_usuario: q.respostas_usuarios?.[0]?.alternativa_marcada || null,
              acertou: q.respostas_usuarios?.[0]?.acertou || false,
              respondida: !!q.respostas_usuarios?.[0]
            };
            console.log('Questão processada:', { id: processed.id, ano: processed.ano, disciplina: processed.disciplina_nome, escolaridade: processed.escolaridade_nome });
            return processed;
          });
          setQuestions(processedQuestions);
          console.log('Questões processadas e salvas no estado:', processedQuestions.length);
      } else {
        console.error('Erro ao carregar questões:', error);
      }
      } catch (error) {
      console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

  const applyFilters = () => {
    console.log('=== APLICANDO FILTROS ===');
    console.log('Filtros atuais:', filters);
    console.log('Total de questões disponíveis:', questions.length);
    
    let filtered = [...questions];
    console.log('Questões iniciais:', filtered.length);

    // Filtro por busca
    if (filters.search) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(q =>
        q.enunciado.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.disciplina_nome?.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.assunto_nome?.toLowerCase().includes(filters.search.toLowerCase())
      );
      console.log(`Filtro busca: ${beforeSearch} -> ${filtered.length}`);
    }

    // Filtro por disciplina
    if (filters.disciplina_id) {
      const beforeDisciplina = filtered.length;
      filtered = filtered.filter(q => q.disciplina_id === parseInt(filters.disciplina_id));
      console.log(`Filtro disciplina (${filters.disciplina_id}): ${beforeDisciplina} -> ${filtered.length}`);
    }

    // Filtro por assunto
    if (filters.assunto_id) {
      const beforeAssunto = filtered.length;
      filtered = filtered.filter(q => q.assunto_id === parseInt(filters.assunto_id));
      console.log(`Filtro assunto (${filters.assunto_id}): ${beforeAssunto} -> ${filtered.length}`);
    }

    // Filtro por banca
    if (filters.banca_id) {
      const beforeBanca = filtered.length;
      filtered = filtered.filter(q => q.banca_id === parseInt(filters.banca_id));
      console.log(`Filtro banca (${filters.banca_id}): ${beforeBanca} -> ${filtered.length}`);
    }

    // Filtro por órgão
    if (filters.orgao_id) {
      const beforeOrgao = filtered.length;
      filtered = filtered.filter(q => q.orgao_id === parseInt(filters.orgao_id));
      console.log(`Filtro órgão (${filters.orgao_id}): ${beforeOrgao} -> ${filtered.length}`);
    }

    // Filtro por escolaridade
    if (filters.escolaridade_id) {
      const beforeEscolaridade = filtered.length;
      filtered = filtered.filter(q => q.escolaridade_id === parseInt(filters.escolaridade_id));
      console.log(`Filtro escolaridade (${filters.escolaridade_id}): ${beforeEscolaridade} -> ${filtered.length}`);
    }

    // Filtro por anos (seleção múltipla)
    if (filters.anos.length > 0) {
      const beforeAnos = filtered.length;
      filtered = filtered.filter(q => filters.anos.includes(q.ano));
      console.log(`Filtro anos (${filters.anos.join(', ')}): ${beforeAnos} -> ${filtered.length}`);
    }

    // Filtro por status de resposta
    switch (filters.status_resposta) {
      case 'nao_respondidas':
        const beforeStatus = filtered.length;
        filtered = filtered.filter(q => !q.respondida);
        console.log(`Filtro status (não respondidas): ${beforeStatus} -> ${filtered.length}`);
        break;
      case 'acertadas':
        const beforeStatus2 = filtered.length;
        filtered = filtered.filter(q => q.respondida && q.acertou);
        console.log(`Filtro status (acertadas): ${beforeStatus2} -> ${filtered.length}`);
        break;
      case 'erradas':
        const beforeStatus3 = filtered.length;
        filtered = filtered.filter(q => q.respondida && !q.acertou);
        console.log(`Filtro status (erradas): ${beforeStatus3} -> ${filtered.length}`);
        break;
    }

    console.log('=== RESULTADO FINAL ===');
    console.log('Questões filtradas:', filtered.length);
    console.log('Primeiras 3 questões filtradas:', filtered.slice(0, 3).map(q => ({ id: q.id, enunciado: q.enunciado?.substring(0, 50) })));
    
    setFilteredQuestions(filtered);
    setCurrentQuestionIndex(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      disciplina_id: '',
      assunto_id: '',
      banca_id: '',
      orgao_id: '',
      escolaridade_id: '',
      anos: [],
      status_resposta: 'todas',
      search: ''
    });
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !user) return;

    const correct = selectedAnswer === currentQuestion.gabarito;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Salvar resposta do usuário
    try {
      await supabase
        .from('respostas_usuarios')
        .insert({
          usuario_id: user.id,
          questao_id: currentQuestion.id,
          alternativa_marcada: selectedAnswer,
          acertou: correct
        });

    // Atualizar XP do usuário
      const xpGain = correct ? 20 : 5;
      await supabase
        .from('usuarios')
        .update({ 
          xp: (user.xp || 0) + xpGain,
          questoes_respondidas: (user.questoes_respondidas || 0) + 1
        })
        .eq('id', user.id);

      // Atualizar questão local
      setQuestions(prev => prev.map(q => 
        q.id === currentQuestion.id 
          ? { ...q, resposta_usuario: selectedAnswer, acertou: correct, respondida: true }
          : q
      ));
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
    }
  };

  const getAlternatives = () => {
    if (!currentQuestion) return [];
    
    return [
      { key: 'A', text: currentQuestion.alternativa_a },
      { key: 'B', text: currentQuestion.alternativa_b },
      { key: 'C', text: currentQuestion.alternativa_c },
      { key: 'D', text: currentQuestion.alternativa_d },
      ...(currentQuestion.alternativa_e ? [{ key: 'E', text: currentQuestion.alternativa_e }] : [])
    ];
  };

  const getStatusBadge = (question: Question) => {
    if (!question.respondida) {
      return <span className="px-2 py-1 text-xs bg-gray-500 text-[#f2f2f2] rounded">Não respondida</span>;
    }
    return question.acertou 
      ? <span className="px-2 py-1 text-xs bg-green-500 text-[#f2f2f2] rounded">Acertou</span>
      : <span className="px-2 py-1 text-xs bg-red-500 text-[#f2f2f2] rounded">Errou</span>;
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
            Questões
          </h1>
          <p className="text-[#f2f2f2]/70">
            Pratique com questões de concursos públicos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Enunciado, disciplina ou assunto..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>

            {/* Disciplina */}
            <div>
              <label className="block text-sm font-medium mb-2">Disciplina</label>
              <select
                value={filters.disciplina_id}
                onChange={(e) => handleFilterChange('disciplina_id', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todas as disciplinas</option>
                {disciplines.map(discipline => (
                  <option key={discipline.id} value={discipline.id}>{discipline.nome}</option>
                ))}
              </select>
            </div>

            {/* Assunto */}
            <div>
              <label className="block text-sm font-medium mb-2">Assunto</label>
              <select
                value={filters.assunto_id}
                onChange={(e) => handleFilterChange('assunto_id', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todos os assuntos</option>
                {subjects
                  .filter(subject => !filters.disciplina_id || subject.disciplina_id === parseInt(filters.disciplina_id))
                  .map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.nome}</option>
                  ))}
              </select>
            </div>

            {/* Banca */}
    <div>
              <label className="block text-sm font-medium mb-2">Banca</label>
              <select
                value={filters.banca_id}
                onChange={(e) => handleFilterChange('banca_id', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todas as bancas</option>
                {bancas.map(banca => (
                  <option key={banca.id} value={banca.id}>{banca.nome}</option>
                ))}
              </select>
            </div>

            {/* Órgão */}
            <div>
              <label className="block text-sm font-medium mb-2">Órgão</label>
              <select
                value={filters.orgao_id}
                onChange={(e) => handleFilterChange('orgao_id', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todos os órgãos</option>
                {orgaos.map(orgao => (
                  <option key={orgao.id} value={orgao.id}>{orgao.nome}</option>
                ))}
              </select>
            </div>

            {/* Escolaridade */}
            <div>
              <label className="block text-sm font-medium mb-2">Escolaridade</label>
              <select
                value={filters.escolaridade_id}
                onChange={(e) => handleFilterChange('escolaridade_id', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todas as escolaridades</option>
                {escolaridades.map(escolaridade => (
                  <option key={escolaridade.id} value={escolaridade.id}>{escolaridade.nivel}</option>
                ))}
              </select>
            </div>

            {/* Anos */}
            <div>
              <label className="block text-sm font-medium mb-2">Anos</label>
              <div className="max-h-32 overflow-y-auto bg-[#1b1b1b] border border-[#333333] rounded-lg p-2">
                {/* Opção "Todos os anos" */}
                <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-[#333333] rounded px-2 border-b border-[#333333] mb-2">
                  <input
                    type="checkbox"
                    checked={filters.anos.length === 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({ ...prev, anos: [] }));
                      }
                    }}
                    className="rounded border-[#333333] bg-[#1b1b1b] text-[#8b0000] focus:ring-[#8b0000]"
                  />
                  <span className="text-[#f2f2f2] text-sm font-medium">Todos os anos</span>
                </label>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                  <label key={ano} className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-[#333333] rounded px-2">
                    <input
                      type="checkbox"
                      checked={filters.anos.includes(ano)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, anos: [...prev.anos, ano] }));
                        } else {
                          setFilters(prev => ({ ...prev, anos: prev.anos.filter(a => a !== ano) }));
                        }
                      }}
                      className="rounded border-[#333333] bg-[#1b1b1b] text-[#8b0000] focus:ring-[#8b0000]"
                    />
                    <span className="text-[#f2f2f2] text-sm">{ano}</span>
                  </label>
                ))}
              </div>
              {filters.anos.length > 0 && (
                <div className="mt-2 text-xs text-[#f2f2f2]/70">
                  Selecionados: {filters.anos.sort((a, b) => b - a).join(', ')}
                </div>
              )}
            </div>

            {/* Status de Resposta */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status_resposta}
                onChange={(e) => handleFilterChange('status_resposta', e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todas">Todas as questões</option>
                <option value="nao_respondidas">Não respondidas</option>
                <option value="acertadas">Acertadas</option>
                <option value="erradas">Erradas</option>
              </select>
        </div>
      </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              className="bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Filtrar
            </button>
            <button
              onClick={clearFilters}
              className="bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Limpar Filtros
            </button>
            <button
              onClick={reloadFilters}
              className="bg-[#0066cc] hover:bg-[#0052a3] text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Atualizar Filtros
            </button>
          </div>
            </div>

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {filteredQuestions.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Questões Encontradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {filteredQuestions.filter(q => !q.respondida).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Não Respondidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {filteredQuestions.filter(q => q.respondida && q.acertou).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Acertadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {filteredQuestions.filter(q => q.respondida && !q.acertou).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Erradas</div>
          </div>
        </div>
      </div>

        {/* Questão Atual */}
        {currentQuestion && (
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            {/* Header da Questão */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#8b0000] text-[#f2f2f2] rounded-lg font-medium">
                  Questão #{currentQuestion.id}
                  </span>
                {getStatusBadge(currentQuestion)}
                </div>
              <div className="text-right text-sm text-[#f2f2f2]/70">
                <div>Questão {currentQuestionIndex + 1} de {filteredQuestions.length}</div>
                <div>{currentQuestion.ano} • {currentQuestion.banca_nome}</div>
                </div>
              </div>

            {/* Informações da Questão */}
            <div className="flex items-center gap-4 mb-4 text-sm text-[#f2f2f2]/70">
              <span><strong>Disciplina:</strong> {currentQuestion.disciplina_nome}</span>
              <span>•</span>
              <span><strong>Assunto:</strong> {currentQuestion.assunto_nome}</span>
              <span>•</span>
              <span><strong>Órgão:</strong> {currentQuestion.orgao_nome}</span>
            </div>

            {/* Enunciado */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#f2f2f2] mb-4">
                <FormattedText text={currentQuestion.enunciado} />
              </h3>
            </div>

            {/* Alternativas */}
            {!showExplanation && (
              <div className="space-y-3 mb-6">
                {getAlternatives().map((alt) => (
                  <button
                    key={alt.key}
                    onClick={() => handleAnswerSelect(alt.key)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                      selectedAnswer === alt.key
                          ? 'border-[#8b0000] bg-[#8b0000]/10'
                        : 'border-[#333333] hover:border-[#8b0000]'
                    }`}
                  >
                    <span className="font-medium text-[#8b0000] mr-3">{alt.key})</span>
                    {alt.text}
                  </button>
                ))}
                </div>
              )}

            {/* Resultado */}
              {showExplanation && (
              <div className={`p-4 rounded-lg mb-6 ${
                isCorrect 
                  ? 'bg-green-900/20 border border-green-500 text-green-400' 
                  : 'bg-red-900/20 border border-red-500 text-red-400'
              }`}>
                <div className="font-semibold mb-2">
                  {isCorrect ? '✅ Resposta Correta!' : '❌ Resposta Incorreta'}
                </div>
                <div className="mb-2">
                  <strong>Sua resposta:</strong> {selectedAnswer}
                </div>
                <div className="mb-2">
                  <strong>Resposta correta:</strong> {currentQuestion.gabarito}
                  </div>
                {currentQuestion.comentario_professor && (
                  <div>
                    <strong>Explicação:</strong> {currentQuestion.comentario_professor}
                  </div>
                )}
                </div>
              )}

            {/* Botões de Navegação */}
            <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                className="bg-[#333333] hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Anterior
                </button>

              <div className="flex gap-3">
                {!showExplanation && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-[#8b0000] hover:bg-[#6b0000] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Responder
                  </button>
                )}
              </div>
                
                <button
                  onClick={handleNextQuestion}
                disabled={currentQuestionIndex === filteredQuestions.length - 1}
                className="bg-[#333333] hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Próxima
                </button>
              </div>
            </div>
        )}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-question-circle text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Nenhuma questão encontrada com os filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questoes;
