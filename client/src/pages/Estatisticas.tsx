import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoriesContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Estatisticas.css';

interface EstatisticasDetalhadas {
  total_respostas: number;
  total_acertos: number;
  total_erros: number;
  percentual_acerto: number;
  xp_total: number;
  questoes_respondidas: number;
  respostas_ultimos_30_dias: number;
  acertos_ultimos_30_dias: number;
  percentual_ultimos_30_dias: number;
  streak_atual: number;
  dias_estudo: number;
}

interface EstatisticaDisciplina {
  disciplina_id: number;
  disciplina_nome: string;
  total_questoes: number;
  total_acertos: number;
  percentual_acerto: number;
}

interface EstatisticaAssunto {
  assunto_id: number;
  assunto_nome: string;
  disciplina_nome: string;
  total_questoes: number;
  total_acertos: number;
  percentual_acerto: number;
}

const Estatisticas: React.FC = () => {
  const { user } = useAuth();
  const { disciplines, subjects, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasDetalhadas | null>(null);
  const [estatisticasDisciplinas, setEstatisticasDisciplinas] = useState<EstatisticaDisciplina[]>([]);
  const [estatisticasAssuntos, setEstatisticasAssuntos] = useState<EstatisticaAssunto[]>([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null);
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'geral' | 'disciplina' | 'assunto'>('geral');

  useEffect(() => {
    if (user) {
      loadEstatisticasData();
    }
  }, [user]);

  useEffect(() => {
    if (disciplinaSelecionada) {
      loadEstatisticasAssuntos(disciplinaSelecionada);
    }
  }, [disciplinaSelecionada]);

  const loadEstatisticasData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticasDetalhadas(),
        loadEstatisticasDisciplinas()
      ]);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticasDetalhadas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_estatisticas_dashboard');

      if (error) throw error;
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas detalhadas:', error);
    }
  };

  const loadEstatisticasDisciplinas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_estatisticas_por_disciplina');

      if (error) throw error;
      setEstatisticasDisciplinas(data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas por disciplina:', error);
    }
  };

  const loadEstatisticasAssuntos = async (disciplinaId: number) => {
    try {
      const { data, error } = await supabase
        .rpc('get_estatisticas_por_assunto', { disciplina_id: disciplinaId });

      if (error) throw error;
      setEstatisticasAssuntos(data || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas por assunto:', error);
    }
  };

  const renderProgressBar = (percentual: number, color: string = '#8b0000') => {
    const safePercentual = isNaN(percentual) ? 0 : Math.max(0, Math.min(percentual, 100));
    return (
      <div className="w-full bg-[#333333] rounded-full h-3">
        <div 
          className="h-3 rounded-full transition-all duration-500"
          style={{ 
            width: `${safePercentual}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    );
  };

  const renderCircularProgress = (percentual: number, size: number = 120) => {
    const safePercentual = isNaN(percentual) ? 0 : Math.max(0, Math.min(percentual, 100));
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (safePercentual / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#333333"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#8b0000"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-2xl font-bold text-[#f2f2f2]">{Math.round(safePercentual)}%</div>
          <div className="text-sm text-[#f2f2f2]/70">Taxa de Acerto</div>
        </div>
      </div>
    );
  };

  const renderBarChart = (data: EstatisticaDisciplina[]) => {
    const maxValue = Math.max(...data.map(d => d.total_questoes), 1);
    
    return (
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.disciplina_id} className="bg-[#1b1b1b] rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[#f2f2f2]">{item.disciplina_nome}</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-[#f2f2f2]">
                  {isNaN(item.percentual_acerto) ? '0%' : `${Math.round(item.percentual_acerto)}%`}
                </div>
                <div className="text-sm text-[#f2f2f2]/70">
                  {item.total_acertos}/{item.total_questoes} acertos
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#f2f2f2]/70">
                <span>Progresso</span>
                <span>{item.total_questoes} questões</span>
              </div>
              <div className="w-full bg-[#333333] rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(item.total_questoes / maxValue) * 100}%`, 
                    backgroundColor: '#8b0000' 
                  }}
                />
              </div>
              {renderProgressBar(item.percentual_acerto)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading || categoriesLoading) {
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
          <h1 className="text-3xl font-bold text-[#f2f2f2] mb-4">
            Estatísticas de Performance
          </h1>
          <p className="text-[#f2f2f2]/70">
            Acompanhe seu progresso e identifique suas áreas de força e melhoria
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-[#242424] rounded-lg p-6 mb-8 border border-[#333333]">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('geral')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'geral'
                    ? 'bg-[#8b0000] text-white'
                    : 'bg-[#333333] text-[#f2f2f2] hover:bg-[#444444]'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setViewMode('disciplina')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'disciplina'
                    ? 'bg-[#8b0000] text-white'
                    : 'bg-[#333333] text-[#f2f2f2] hover:bg-[#444444]'
                }`}
              >
                Por Disciplina
              </button>
              <button
                onClick={() => setViewMode('assunto')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'assunto'
                    ? 'bg-[#8b0000] text-white'
                    : 'bg-[#333333] text-[#f2f2f2] hover:bg-[#444444]'
                }`}
              >
                Por Assunto
              </button>
            </div>

            {viewMode === 'disciplina' && (
              <select
                value={disciplinaSelecionada || ''}
                onChange={(e) => setDisciplinaSelecionada(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="">Todas as disciplinas</option>
                {disciplines.map(discipline => (
                  <option key={discipline.id} value={discipline.id}>{discipline.nome}</option>
                ))}
              </select>
            )}

            {viewMode === 'assunto' && (
              <div className="flex gap-2">
                <select
                  value={disciplinaSelecionada || ''}
                  onChange={(e) => setDisciplinaSelecionada(e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplines.map(discipline => (
                    <option key={discipline.id} value={discipline.id}>{discipline.nome}</option>
                  ))}
                </select>
                {disciplinaSelecionada && (
                  <select
                    value={assuntoSelecionado || ''}
                    onChange={(e) => setAssuntoSelecionado(e.target.value ? parseInt(e.target.value) : null)}
                    className="bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                  >
                    <option value="">Todos os assuntos</option>
                    {subjects
                      .filter(subject => subject.disciplina_id === disciplinaSelecionada)
                      .map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.nome}</option>
                      ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo baseado no modo de visualização */}
        {viewMode === 'geral' && estatisticas && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estatísticas Gerais */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6">Resumo Geral</h2>
              <div className="space-y-6">
                <div className="text-center">
                  {renderCircularProgress(estatisticas.percentual_acerto)}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2]">{estatisticas.total_respostas}</div>
                    <div className="text-sm text-[#f2f2f2]/70">Total de Respostas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2]">{estatisticas.xp_total}</div>
                    <div className="text-sm text-[#f2f2f2]/70">XP Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{estatisticas.total_acertos}</div>
                    <div className="text-sm text-[#f2f2f2]/70">Acertos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{estatisticas.total_erros}</div>
                    <div className="text-sm text-[#f2f2f2]/70">Erros</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas dos Últimos 30 Dias */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6">Últimos 30 Dias</h2>
              <div className="space-y-6">
                <div className="text-center">
                  {renderCircularProgress(estatisticas.percentual_ultimos_30_dias, '#00c853')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2]">{estatisticas.respostas_ultimos_30_dias}</div>
                    <div className="text-sm text-[#f2f2f2]/70">Respostas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{estatisticas.acertos_ultimos_30_dias}</div>
                    <div className="text-sm text-[#f2f2f2]/70">Acertos</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f2f2f2]">{estatisticas.streak_atual}</div>
                  <div className="text-sm text-[#f2f2f2]/70">Dias Consecutivos</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'disciplina' && (
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-6">
              Estatísticas por Disciplina
              {disciplinaSelecionada && ` - ${disciplines.find(d => d.id === disciplinaSelecionada)?.nome}`}
            </h2>
            {estatisticasDisciplinas.length > 0 ? (
              renderBarChart(
                disciplinaSelecionada 
                  ? estatisticasDisciplinas.filter(e => e.disciplina_id === disciplinaSelecionada)
                  : estatisticasDisciplinas
              )
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
                <p className="text-[#f2f2f2]/70">Nenhuma estatística disponível para as disciplinas selecionadas</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'assunto' && disciplinaSelecionada && (
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-6">
              Estatísticas por Assunto - {disciplines.find(d => d.id === disciplinaSelecionada)?.nome}
            </h2>
            {estatisticasAssuntos.length > 0 ? (
              <div className="space-y-4">
                {(assuntoSelecionado 
                  ? estatisticasAssuntos.filter(e => e.assunto_id === assuntoSelecionado)
                  : estatisticasAssuntos
                ).map((estatistica) => (
                  <div key={estatistica.assunto_id} className="bg-[#1b1b1b] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-[#f2f2f2]">{estatistica.assunto_nome}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#f2f2f2]">
                          {isNaN(estatistica.percentual_acerto) ? '0%' : `${Math.round(estatistica.percentual_acerto)}%`}
                        </div>
                        <div className="text-sm text-[#f2f2f2]/70">
                          {estatistica.total_acertos}/{estatistica.total_questoes} acertos
                        </div>
                      </div>
                    </div>
                    {renderProgressBar(estatistica.percentual_acerto)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
                <p className="text-[#f2f2f2]/70">Nenhuma estatística disponível para os assuntos selecionados</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'assunto' && !disciplinaSelecionada && (
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333] text-center">
            <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Selecione uma disciplina para ver as estatísticas por assunto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estatisticas;
