import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface RankingUser {
  id: string;
  nome: string;
  email: string;
  xp: number;
  questoes_respondidas: number;
  taxa_acerto: number;
  posicao: number;
  avatar?: string;
}

interface RankingPeriod {
  id: string;
  nome: string;
  descricao: string;
}

const Ranking: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rankingUsers, setRankingUsers] = useState<RankingUser[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('geral');
  const [userPosition, setUserPosition] = useState<number>(0);
  const [userStats, setUserStats] = useState<RankingUser | null>(null);

  const [periods] = useState<RankingPeriod[]>([
    { id: 'geral', nome: 'Geral', descricao: 'Ranking geral de todos os tempos' },
    { id: 'mes', nome: 'Este Mês', descricao: 'Ranking do mês atual' },
    { id: 'semana', nome: 'Esta Semana', descricao: 'Ranking da semana atual' },
    { id: 'dia', nome: 'Hoje', descricao: 'Ranking de hoje' }
  ]);

  useEffect(() => {
    if (user) {
      loadRanking();
    }
  }, [user, selectedPeriod]);

  const loadRanking = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('usuarios')
        .select('id, nome, email, xp, questoes_respondidas');

      // Aplicar filtros por período
      const now = new Date();
      switch (selectedPeriod) {
        case 'mes':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          query = query.gte('created_at', startOfMonth.toISOString());
          break;
        case 'semana':
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          query = query.gte('created_at', startOfWeek.toISOString());
          break;
        case 'dia':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          query = query.gte('created_at', startOfDay.toISOString());
          break;
      }

      const { data: usersData, error } = await query
        .order('xp', { ascending: false })
        .limit(100);

      if (usersData && !error) {
        // Calcular taxa de acerto para cada usuário
        const rankingWithStats = await Promise.all(
          usersData.map(async (userData: any, index: number) => {
            // Buscar respostas do usuário
            const { data: respostas, error: respostasError } = await supabase
              .from('respostas_usuarios')
              .select('acertou')
              .eq('usuario_id', userData.id);

            let taxaAcerto = 0;
            if (respostas && !respostasError && respostas.length > 0) {
              const acertos = respostas.filter((r: any) => r.acertou).length;
              taxaAcerto = Math.round((acertos / respostas.length) * 100);
            }

            return {
              ...userData,
              taxa_acerto: taxaAcerto,
              posicao: index + 1
            };
          })
        );

        setRankingUsers(rankingWithStats);

        // Encontrar posição do usuário atual
        const currentUserIndex = rankingWithStats.findIndex((u: any) => u.id === user?.id);
        if (currentUserIndex !== -1) {
          setUserPosition(currentUserIndex + 1);
          setUserStats(rankingWithStats[currentUserIndex]);
        } else {
          setUserPosition(0);
          setUserStats(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getLevelFromXP = (xp: number) => {
    if (xp < 1000) return { level: 1, title: 'Iniciante' };
    if (xp < 3000) return { level: 2, title: 'Estudante' };
    if (xp < 6000) return { level: 3, title: 'Avançado' };
    if (xp < 10000) return { level: 4, title: 'Expert' };
    if (xp < 15000) return { level: 5, title: 'Mestre' };
    return { level: 6, title: 'Lenda' };
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
            Ranking
          </h1>
          <p className="text-[#f2f2f2]/70">
            Veja como você está se saindo em relação aos outros estudantes
          </p>
        </div>

        {/* Períodos */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Período</h2>
          <div className="flex flex-wrap gap-3">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === period.id
                    ? 'bg-[#8b0000] text-white'
                    : 'bg-[#1b1b1b] text-gray-300 hover:bg-[#333333]'
                }`}
              >
                {period.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Posição do Usuário */}
        {userStats && (
          <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-4">Sua Posição</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-[#8b0000]">
                  {getMedalIcon(userPosition)}
                </div>
                <div>
                  <div className="text-lg font-semibold">{userStats.nome}</div>
                  <div className="text-sm text-[#f2f2f2]/70">
                    Posição #{userPosition} de {rankingUsers.length}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#8b0000]">{userStats.xp} XP</div>
                <div className="text-sm text-[#f2f2f2]/70">
                  {getLevelFromXP(userStats.xp).title} - Nível {getLevelFromXP(userStats.xp).level}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#8b0000]">{userStats.questoes_respondidas}</div>
                <div className="text-sm text-[#f2f2f2]/70">Questões Respondidas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#8b0000]">{userStats.taxa_acerto}%</div>
                <div className="text-sm text-[#f2f2f2]/70">Taxa de Acerto</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#8b0000]">
                  {Math.round(userStats.xp / Math.max(userStats.questoes_respondidas, 1))}
                </div>
                <div className="text-sm text-[#f2f2f2]/70">XP por Questão</div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking */}
        <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-6">Top 100</h2>
          
          {rankingUsers.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-trophy text-4xl text-[#333333] mb-4"></i>
              <p className="text-[#f2f2f2]/70">Nenhum usuário encontrado para este período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankingUsers.map((rankingUser, index) => (
                <div
                  key={rankingUser.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                    rankingUser.id === user?.id
                      ? 'border-[#8b0000] bg-[#8b0000]/10'
                      : 'border-[#333333] hover:border-[#8b0000]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-[#8b0000] w-12 text-center">
                      {getMedalIcon(rankingUser.posicao)}
                    </div>
                    <div>
                      <div className="font-semibold">{rankingUser.nome}</div>
                      <div className="text-sm text-[#f2f2f2]/70">
                        {getLevelFromXP(rankingUser.xp).title} - Nível {getLevelFromXP(rankingUser.xp).level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-[#f2f2f2]/70">Questões</div>
                      <div className="font-semibold">{rankingUser.questoes_respondidas}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#f2f2f2]/70">Taxa de Acerto</div>
                      <div className="font-semibold">{rankingUser.taxa_acerto}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-[#f2f2f2]/70">XP</div>
                      <div className="text-lg font-bold text-[#8b0000]">{rankingUser.xp}</div>
                    </div>
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

export default Ranking;
