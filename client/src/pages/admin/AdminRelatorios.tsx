import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface RelatorioData {
  totalUsuarios: number;
  usuariosAtivos: number;
  usuariosGratuitos: number;
  usuariosPremium: number;
  totalQuestoes: number;
  questoesAtivas: number;
  totalRespostas: number;
  respostasCorretas: number;
  totalComentarios: number;
  comentariosPendentes: number;
  comentariosAprovados: number;
  planosAtivos: number;
  receitaTotal: number;
  mediaAcertos: number;
  topDisciplinas: Array<{ disciplina: string; total: number }>;
  topBancas: Array<{ banca: string; total: number }>;
  usuariosPorMes: Array<{ mes: string; total: number }>;
  questoesPorMes: Array<{ mes: string; total: number }>;
}

const AdminRelatorios: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadRelatorioData();
  }, [user]);

  const loadRelatorioData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados básicos
      const [
        usuariosResult,
        questoesResult,
        respostasResult,
        comentariosResult,
        planosResult
      ] = await Promise.all([
        supabase.from('usuarios').select('*'),
        supabase.from('questoes').select('*'),
        supabase.from('respostas_usuarios').select('*'),
        supabase.from('comentarios_alunos').select('*'),
        supabase.from('planos').select('*')
      ]);

      if (usuariosResult.error) throw usuariosResult.error;
      if (questoesResult.error) throw questoesResult.error;
      if (respostasResult.error) throw respostasResult.error;
      if (comentariosResult.error) throw comentariosResult.error;
      if (planosResult.error) throw planosResult.error;

      const usuarios = usuariosResult.data || [];
      const questoes = questoesResult.data || [];
      const respostas = respostasResult.data || [];
      const comentarios = comentariosResult.data || [];
      const planos = planosResult.data || [];

      // Carregar dados de disciplinas e bancas
      const [disciplinasResult, bancasResult] = await Promise.all([
        supabase.from('disciplinas').select('*'),
        supabase.from('bancas').select('*')
      ]);

      const disciplinas = disciplinasResult.data || [];
      const bancas = bancasResult.data || [];

      // Calcular estatísticas
      const totalUsuarios = usuarios.length;
      const usuariosAtivos = usuarios.filter(u => u.ativo).length;
      const usuariosGratuitos = usuarios.filter(u => u.status === 'gratuito').length;
      const usuariosPremium = usuarios.filter(u => u.status === 'premium').length;
      
      const totalQuestoes = questoes.length;
      const questoesAtivas = questoes.filter(q => q.ativo).length;
      
      const totalRespostas = respostas.length;
      const respostasCorretas = respostas.filter(r => r.acertou).length;
      
      const totalComentarios = comentarios.length;
      const comentariosPendentes = comentarios.filter(c => !c.respondido).length;
      const comentariosAprovados = comentarios.filter(c => c.aprovado).length;
      
      const planosAtivos = planos.filter(p => p.ativo).length;
      const receitaTotal = planos.reduce((sum, p) => sum + p.preco, 0);
      const mediaAcertos = totalRespostas > 0 ? (respostasCorretas / totalRespostas) * 100 : 0;

      // Top disciplinas
      const disciplinaCounts: { [key: string]: number } = {};
      questoes.forEach(q => {
        const disciplina = disciplinas.find(d => d.id === q.disciplina_id);
        if (disciplina) {
          disciplinaCounts[disciplina.nome] = (disciplinaCounts[disciplina.nome] || 0) + 1;
        }
      });
      const topDisciplinas = Object.entries(disciplinaCounts)
        .map(([disciplina, total]) => ({ disciplina, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Top bancas
      const bancaCounts: { [key: string]: number } = {};
      questoes.forEach(q => {
        const banca = bancas.find(b => b.id === q.banca_id);
        if (banca) {
          bancaCounts[banca.nome] = (bancaCounts[banca.nome] || 0) + 1;
        }
      });
      const topBancas = Object.entries(bancaCounts)
        .map(([banca, total]) => ({ banca, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Usuários por mês (últimos 6 meses)
      const usuariosPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mes = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const inicioMes = new Date(date.getFullYear(), date.getMonth(), 1);
        const fimMes = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const total = usuarios.filter(u => {
          const createdDate = new Date(u.created_at);
          return createdDate >= inicioMes && createdDate <= fimMes;
        }).length;
        
        usuariosPorMes.push({ mes, total });
      }

      // Questões por mês (últimos 6 meses)
      const questoesPorMes = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mes = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        const inicioMes = new Date(date.getFullYear(), date.getMonth(), 1);
        const fimMes = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const total = questoes.filter(q => {
          const createdDate = new Date(q.created_at);
          return createdDate >= inicioMes && createdDate <= fimMes;
        }).length;
        
        questoesPorMes.push({ mes, total });
      }

      setRelatorioData({
        totalUsuarios,
        usuariosAtivos,
        usuariosGratuitos,
        usuariosPremium,
        totalQuestoes,
        questoesAtivas,
        totalRespostas,
        respostasCorretas,
        totalComentarios,
        comentariosPendentes,
        comentariosAprovados,
        planosAtivos,
        receitaTotal,
        mediaAcertos,
        topDisciplinas,
        topBancas,
        usuariosPorMes,
        questoesPorMes
      });

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados do relatório: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const downloadRelatorio = async (tipo: 'usuarios' | 'questoes' | 'respostas' | 'comentarios') => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (tipo) {
        case 'usuarios':
          const { data: usuarios } = await supabase.from('usuarios').select('*');
          data = usuarios || [];
          filename = 'relatorio_usuarios.csv';
          break;
        case 'questoes':
          const { data: questoes } = await supabase.from('questoes').select('*');
          data = questoes || [];
          filename = 'relatorio_questoes.csv';
          break;
        case 'respostas':
          const { data: respostas } = await supabase.from('respostas_usuarios').select('*');
          data = respostas || [];
          filename = 'relatorio_respostas.csv';
          break;
        case 'comentarios':
          const { data: comentarios } = await supabase.from('comentarios_alunos').select('*');
          data = comentarios || [];
          filename = 'relatorio_comentarios.csv';
          break;
      }

      if (data.length === 0) {
        setMessage({ type: 'error', text: 'Nenhum dado encontrado para download' });
        return;
      }

      // Converter para CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: `Relatório ${tipo} baixado com sucesso!` });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      setMessage({ type: 'error', text: 'Erro ao baixar relatório: ' + (error as Error).message });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (!relatorioData) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] text-[#f2f2f2]">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <i className="fas fa-chart-bar text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Erro ao carregar dados do relatório</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-[#f2f2f2]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2]">
            Relatórios
          </h1>
          <Link
            to="/admin"
            className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Admin
          </Link>
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

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f2f2f2]/70">Total de Usuários</p>
                <p className="text-2xl font-bold text-[#8b0000]">{relatorioData.totalUsuarios}</p>
              </div>
              <i className="fas fa-users text-2xl text-[#8b0000]"></i>
              </div>
            </div>

          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f2f2f2]/70">Total de Questões</p>
                <p className="text-2xl font-bold text-[#8b0000]">{relatorioData.totalQuestoes}</p>
              </div>
              <i className="fas fa-question-circle text-2xl text-[#8b0000]"></i>
            </div>
              </div>

          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f2f2f2]/70">Total de Respostas</p>
                <p className="text-2xl font-bold text-[#8b0000]">{relatorioData.totalRespostas}</p>
            </div>
              <i className="fas fa-check-circle text-2xl text-[#8b0000]"></i>
              </div>
            </div>

          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#f2f2f2]/70">Média de Acertos</p>
                <p className="text-2xl font-bold text-[#8b0000]">{relatorioData.mediaAcertos.toFixed(1)}%</p>
              </div>
              <i className="fas fa-percentage text-2xl text-[#8b0000]"></i>
            </div>
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Usuários */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Usuários</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Usuários Ativos:</span>
                <span className="font-semibold">{relatorioData.usuariosAtivos}</span>
              </div>
              <div className="flex justify-between">
                <span>Usuários Gratuitos:</span>
                <span className="font-semibold">{relatorioData.usuariosGratuitos}</span>
              </div>
              <div className="flex justify-between">
                <span>Usuários Premium:</span>
                <span className="font-semibold">{relatorioData.usuariosPremium}</span>
              </div>
            </div>
            <button
              onClick={() => downloadRelatorio('usuarios')}
              className="mt-4 w-full bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <i className="fas fa-download mr-2"></i>
              Baixar Relatório
            </button>
          </div>

          {/* Questões */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Questões</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Questões Ativas:</span>
                <span className="font-semibold">{relatorioData.questoesAtivas}</span>
              </div>
              <div className="flex justify-between">
                <span>Questões Inativas:</span>
                <span className="font-semibold">{relatorioData.totalQuestoes - relatorioData.questoesAtivas}</span>
              </div>
            </div>
            <button
              onClick={() => downloadRelatorio('questoes')}
              className="mt-4 w-full bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <i className="fas fa-download mr-2"></i>
              Baixar Relatório
            </button>
          </div>

          {/* Respostas */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Respostas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Respostas Corretas:</span>
                <span className="font-semibold">{relatorioData.respostasCorretas}</span>
              </div>
              <div className="flex justify-between">
                <span>Respostas Incorretas:</span>
                <span className="font-semibold">{relatorioData.totalRespostas - relatorioData.respostasCorretas}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Acerto:</span>
                <span className="font-semibold">{relatorioData.mediaAcertos.toFixed(1)}%</span>
              </div>
            </div>
            <button
              onClick={() => downloadRelatorio('respostas')}
              className="mt-4 w-full bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <i className="fas fa-download mr-2"></i>
              Baixar Relatório
            </button>
          </div>

          {/* Comentários */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Comentários</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Comentários Pendentes:</span>
                <span className="font-semibold">{relatorioData.comentariosPendentes}</span>
              </div>
              <div className="flex justify-between">
                <span>Comentários Aprovados:</span>
                <span className="font-semibold">{relatorioData.comentariosAprovados}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Comentários:</span>
                <span className="font-semibold">{relatorioData.totalComentarios}</span>
              </div>
            </div>
            <button
              onClick={() => downloadRelatorio('comentarios')}
              className="mt-4 w-full bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <i className="fas fa-download mr-2"></i>
              Baixar Relatório
            </button>
          </div>
          </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Disciplinas */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Top 5 Disciplinas</h3>
            <div className="space-y-3">
              {relatorioData.topDisciplinas.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.disciplina}</span>
                  <span className="font-semibold">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Bancas */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h3 className="text-lg font-semibold mb-4">Top 5 Bancas</h3>
            <div className="space-y-3">
              {relatorioData.topBancas.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.banca}</span>
                  <span className="font-semibold">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
            </div>

        {/* Botão Atualizar */}
        <div className="text-center">
          <button
            onClick={loadRelatorioData}
            className="bg-[#00c853] hover:bg-[#00a843] text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <i className="fas fa-sync-alt"></i>
            Atualizar Relatórios
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorios;
