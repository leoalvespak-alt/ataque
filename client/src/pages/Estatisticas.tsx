import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../contexts/CategoriesContext';
import { supabase } from '../lib/supabase.ts';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
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

interface TopicoDificuldade {
  assunto_id: number;
  assunto_nome: string;
  disciplina_nome: string;
  total_questoes: number;
  total_erros: number;
  percentual_erro: number;
}

interface EvolucaoTempo {
  data: string;
  acertos: number;
  total: number;
  percentual: number;
}

const COLORS = ['#8b0000', '#c1121f', '#dc2626', '#ef4444', '#f87171', '#fca5a5'];

const Estatisticas: React.FC = () => {
  const { user } = useAuth();
  const { disciplines, subjects, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasDetalhadas | null>(null);
  const [estatisticasDisciplinas, setEstatisticasDisciplinas] = useState<EstatisticaDisciplina[]>([]);
  const [estatisticasAssuntos, setEstatisticasAssuntos] = useState<EstatisticaAssunto[]>([]);
  const [topicosDificuldade, setTopicosDificuldade] = useState<TopicoDificuldade[]>([]);
  const [evolucaoTempo, setEvolucaoTempo] = useState<EvolucaoTempo[]>([]);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null);
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'geral' | 'disciplina' | 'assunto'>('geral');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'objetiva' | 'discursiva'>('todas');
  const [filtroSituacao, setFiltroSituacao] = useState<'todas' | 'correta' | 'incorreta' | 'revisada'>('todas');

  useEffect(() => {
    if (user) {
      loadEstatisticasData();
    }
  }, [user, filtroPeriodo, filtroTipo, filtroSituacao]);

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
        loadEstatisticasDisciplinas(),
        loadTopicosDificuldade(),
        loadEvolucaoTempo()
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
        .rpc('get_estatisticas_por_assunto', { 
          disciplina_id: disciplinaId,
          user_id: user?.id 
        });

      if (error) {
        console.error('Erro na função RPC, tentando query direta:', error);
        
        const { data: directData, error: directError } = await supabase
          .from('respostas_usuarios')
          .select(`
            acertou,
            questoes!inner(
              assunto_id,
              assuntos!inner(
                id,
                nome,
                disciplinas!inner(
                  id,
                  nome
                )
              )
            )
          `)
          .eq('usuario_id', user?.id)
          .eq('questoes.assuntos.disciplinas.id', disciplinaId)
          .eq('questoes.ativo', true);

        if (directError) throw directError;

        const assuntosMap = new Map();
        
        directData?.forEach((resposta: any) => {
          const assuntoId = resposta.questoes.assuntos.id;
          const assuntoNome = resposta.questoes.assuntos.nome;
          const disciplinaNome = resposta.questoes.assuntos.disciplinas.nome;
          
          if (!assuntosMap.has(assuntoId)) {
            assuntosMap.set(assuntoId, {
              assunto_id: assuntoId,
              assunto_nome: assuntoNome,
              disciplina_nome: disciplinaNome,
              total_questoes: 0,
              total_acertos: 0
            });
          }
          
          const assunto = assuntosMap.get(assuntoId);
          assunto.total_questoes++;
          if (resposta.acertou) {
            assunto.total_acertos++;
          }
        });

        const assuntosArray = Array.from(assuntosMap.values())
          .map(assunto => ({
            ...assunto,
            percentual_acerto: (assunto.total_acertos / assunto.total_questoes) * 100
          }))
          .sort((a, b) => b.total_questoes - a.total_questoes);

        setEstatisticasAssuntos(assuntosArray);
      } else {
        setEstatisticasAssuntos(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas por assunto:', error);
      setEstatisticasAssuntos([]);
    }
  };

  const loadTopicosDificuldade = async () => {
    try {
      const { data, error } = await supabase
        .from('respostas_usuarios')
        .select(`
          acertou,
          questoes!inner(
            assunto_id,
            assuntos!inner(
              id,
              nome,
              disciplinas!inner(
                id,
                nome
              )
            )
          )
        `)
        .eq('usuario_id', user?.id)
        .eq('questoes.ativo', true);

      if (error) throw error;

      const topicosMap = new Map();
      
      data?.forEach((resposta: any) => {
        const assuntoId = resposta.questoes.assuntos.id;
        const assuntoNome = resposta.questoes.assuntos.nome;
        const disciplinaNome = resposta.questoes.assuntos.disciplinas.nome;
        
        if (!topicosMap.has(assuntoId)) {
          topicosMap.set(assuntoId, {
            assunto_id: assuntoId,
            assunto_nome: assuntoNome,
            disciplina_nome: disciplinaNome,
            total_questoes: 0,
            total_erros: 0
          });
        }
        
        const topico = topicosMap.get(assuntoId);
        topico.total_questoes++;
        if (!resposta.acertou) {
          topico.total_erros++;
        }
      });

      const topicosArray = Array.from(topicosMap.values())
        .map(topico => ({
          ...topico,
          percentual_erro: (topico.total_erros / topico.total_questoes) * 100
        }))
        .filter(topico => topico.total_questoes >= 3)
        .sort((a, b) => b.percentual_erro - a.percentual_erro)
        .slice(0, 5);

      setTopicosDificuldade(topicosArray);
    } catch (error) {
      console.error('Erro ao carregar tópicos de dificuldade:', error);
    }
  };

  const loadEvolucaoTempo = async () => {
    try {
      // Simular dados de evolução temporal (em produção, isso viria do backend)
      const hoje = new Date();
      const dados = [];
      
      for (let i = 29; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        
        const acertos = Math.floor(Math.random() * 10) + 1;
        const total = acertos + Math.floor(Math.random() * 5);
        
        dados.push({
          data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          acertos,
          total,
          percentual: total > 0 ? (acertos / total) * 100 : 0
        });
      }
      
      setEvolucaoTempo(dados);
    } catch (error) {
      console.error('Erro ao carregar evolução temporal:', error);
    }
  };

  const renderCircularProgress = (percentual: number, size: number = 120, color: string = '#8b0000') => {
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
            stroke={color}
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1b1b1b] border border-[#333333] rounded-lg p-3 shadow-lg">
          <p className="text-[#f2f2f2] font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const exportarDados = () => {
    if (!estatisticas) return;
    
    const dados = {
      estatisticas_gerais: estatisticas,
      estatisticas_disciplinas: estatisticasDisciplinas,
      estatisticas_assuntos: estatisticasAssuntos,
      topicos_dificuldade: topicosDificuldade,
      evolucao_tempo: evolucaoTempo
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estatisticas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-4xl font-bold text-[#f2f2f2] mb-4 font-saira">
            Dashboard de Estatísticas
          </h1>
          <p className="text-[#f2f2f2]/70 text-lg">
            Acompanhe seu progresso e identifique suas áreas de força e melhoria
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-[#242424] rounded-lg p-6 mb-8 border border-[#333333]">
          <div className="flex flex-wrap gap-4 items-center justify-between">
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

            <div className="flex gap-4">
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                className="bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="7d">Última semana</option>
                <option value="30d">Último mês</option>
                <option value="90d">Últimos 3 meses</option>
                <option value="custom">Período personalizado</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todas">Todas as questões</option>
                <option value="objetiva">Objetivas</option>
                <option value="discursiva">Discursivas</option>
              </select>

              <button
                onClick={exportarDados}
                className="bg-[#c1121f] hover:bg-[#a0121a] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Exportar Dados
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo baseado no modo de visualização */}
        {viewMode === 'geral' && estatisticas && (
          <div className="space-y-8">
            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f2f2f2]/70 text-sm">Total de Questões</p>
                    <p className="text-3xl font-bold text-[#f2f2f2]">{estatisticas.total_respostas}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#8b0000] rounded-lg flex items-center justify-center">
                    <i className="fas fa-question-circle text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f2f2f2]/70 text-sm">Taxa de Acerto</p>
                    <p className="text-3xl font-bold text-green-400">{Math.round(estatisticas.percentual_acerto)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f2f2f2]/70 text-sm">XP Total</p>
                    <p className="text-3xl font-bold text-[#f2f2f2]">{estatisticas.xp_total}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#c1121f] rounded-lg flex items-center justify-center">
                    <i className="fas fa-star text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#f2f2f2]/70 text-sm">Dias Consecutivos</p>
                    <p className="text-3xl font-bold text-[#f2f2f2]">{estatisticas.streak_atual}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-fire text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Evolução Temporal */}
              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
                <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">Evolução de Desempenho</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolucaoTempo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="data" stroke="#f2f2f2" />
                    <YAxis stroke="#f2f2f2" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="percentual" 
                      stroke="#8b0000" 
                      fill="#8b0000" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Distribuição por Disciplina */}
              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
                <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">Distribuição por Disciplina</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={estatisticasDisciplinas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ disciplina_nome, percentual_acerto }) => `${disciplina_nome}: ${Math.round(percentual_acerto)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_questoes"
                    >
                      {estatisticasDisciplinas.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparativo de Disciplinas */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">Comparativo por Disciplina</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={estatisticasDisciplinas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="disciplina_nome" stroke="#f2f2f2" />
                  <YAxis stroke="#f2f2f2" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentual_acerto" fill="#8b0000" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Tópicos com Maior Dificuldade */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">Top 5 Tópicos com Maior Dificuldade</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicosDificuldade.map((topico, index) => (
                  <div key={topico.assunto_id} className="bg-[#1b1b1b] rounded-lg p-4 border border-[#333333] hover:border-red-500 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#f2f2f2] text-sm">{topico.assunto_nome}</h3>
                          <p className="text-xs text-[#f2f2f2]/70">{topico.disciplina_nome}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-400">
                          {Math.round(topico.percentual_erro)}%
                        </div>
                        <div className="text-xs text-[#f2f2f2]/70">
                          {topico.total_erros}/{topico.total_questoes} erros
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-[#333333] rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(topico.percentual_erro, 100)}%`, 
                          backgroundColor: '#ef4444' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights e Recomendações */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">Insights e Recomendações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1b1b1b] rounded-lg p-4 border border-[#333333]">
                  <h3 className="font-semibold text-[#f2f2f2] mb-3 flex items-center gap-2">
                    <i className="fas fa-chart-line text-[#8b0000]"></i>
                    Performance Geral
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#f2f2f2]/70">Taxa de Acerto:</span>
                      <span className="text-[#f2f2f2] font-medium">
                        {estatisticas.percentual_acerto >= 80 ? '🟢 Excelente' :
                         estatisticas.percentual_acerto >= 60 ? '🟡 Boa' :
                         estatisticas.percentual_acerto >= 40 ? '🟠 Regular' : '🔴 Precisa Melhorar'}
                        ({Math.round(estatisticas.percentual_acerto)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#f2f2f2]/70">Consistência:</span>
                      <span className="text-[#f2f2f2] font-medium">
                        {estatisticas.streak_atual >= 7 ? '🟢 Muito Consistente' :
                         estatisticas.streak_atual >= 3 ? '🟡 Consistente' : '🟠 Precisa de Regularidade'}
                        ({estatisticas.streak_atual} dias)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1b1b1b] rounded-lg p-4 border border-[#333333]">
                  <h3 className="font-semibold text-[#f2f2f2] mb-3 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-[#f59e0b]"></i>
                    Recomendações
                  </h3>
                  <div className="space-y-3 text-sm">
                    {estatisticas.percentual_acerto < 60 && (
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">⚠️</span>
                        <span className="text-[#f2f2f2]">Foque em revisar conceitos básicos antes de avançar</span>
                      </div>
                    )}
                    {estatisticas.streak_atual < 3 && (
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-400">📅</span>
                        <span className="text-[#f2f2f2]">Estabeleça uma rotina diária de estudos</span>
                      </div>
                    )}
                    {topicosDificuldade.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400">🎯</span>
                        <span className="text-[#f2f2f2]">Dedique mais tempo aos tópicos com maior dificuldade</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'disciplina' && (
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">
              Estatísticas por Disciplina
              {disciplinaSelecionada && ` - ${disciplines.find(d => d.id === disciplinaSelecionada)?.nome}`}
            </h2>
            {estatisticasDisciplinas.length > 0 ? (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={
                    disciplinaSelecionada 
                      ? estatisticasDisciplinas.filter(e => e.disciplina_id === disciplinaSelecionada)
                      : estatisticasDisciplinas
                  }>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="disciplina_nome" stroke="#f2f2f2" />
                    <YAxis stroke="#f2f2f2" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentual_acerto" fill="#8b0000" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(disciplinaSelecionada 
                    ? estatisticasDisciplinas.filter(e => e.disciplina_id === disciplinaSelecionada)
                    : estatisticasDisciplinas
                  ).map((item) => (
                    <div key={item.disciplina_id} className="bg-[#1b1b1b] rounded-lg p-4 border border-[#333333]">
                      <h3 className="font-semibold text-[#f2f2f2] mb-3">{item.disciplina_nome}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#f2f2f2]/70">Taxa de Acerto:</span>
                          <span className="text-[#f2f2f2] font-medium">{Math.round(item.percentual_acerto)}%</span>
                        </div>
                        <div className="w-full bg-[#333333] rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(item.percentual_acerto, 100)}%`, 
                              backgroundColor: '#8b0000' 
                            }}
                          />
                        </div>
                        <div className="text-sm text-[#f2f2f2]/70">
                          {item.total_acertos}/{item.total_questoes} acertos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
                <p className="text-[#f2f2f2]/70">Nenhuma estatística disponível para as disciplinas selecionadas</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'assunto' && disciplinaSelecionada && (
          <div className="space-y-6">
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6 text-[#f2f2f2]">
                Estatísticas por Assunto - {disciplines.find(d => d.id === disciplinaSelecionada)?.nome}
              </h2>
              {estatisticasAssuntos.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={estatisticasAssuntos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                      <XAxis dataKey="assunto_nome" stroke="#f2f2f2" angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#f2f2f2" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="percentual_acerto" fill="#8b0000" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estatisticasAssuntos.map((estatistica, index) => (
                      <div key={estatistica.assunto_id} className="bg-[#1b1b1b] rounded-lg p-4 border border-[#333333]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#8b0000] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#f2f2f2] text-sm">{estatistica.assunto_nome}</h3>
                            <p className="text-xs text-[#f2f2f2]/70">{estatistica.disciplina_nome}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#f2f2f2]/70">Taxa de Acerto:</span>
                            <span className="text-[#f2f2f2] font-medium">{Math.round(estatistica.percentual_acerto)}%</span>
                          </div>
                          <div className="w-full bg-[#333333] rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(estatistica.percentual_acerto, 100)}%`, 
                                backgroundColor: estatistica.percentual_acerto >= 70 ? '#22c55e' : 
                                               estatistica.percentual_acerto >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <div className="text-sm text-[#f2f2f2]/70">
                            {estatistica.total_acertos}/{estatistica.total_questoes} acertos
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
                  <p className="text-[#f2f2f2]/70 mb-2">Nenhuma estatística disponível para os assuntos selecionados</p>
                  <p className="text-sm text-[#f2f2f2]/50">Tente responder algumas questões desta disciplina para ver as estatísticas</p>
                </div>
              )}
            </div>
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
