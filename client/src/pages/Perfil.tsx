import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
  status: string;
  xp: number;
  questoes_respondidas: number;
  ultimo_login: string | null;
  profile_picture_url: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  desbloqueado: boolean;
  data_desbloqueio?: string;
}

interface StudySession {
  id: string;
  data: string;
  questoes_respondidas: number;
  acertos: number;
  tempo_estudo: number;
  categoria: string;
}

interface UserStats {
  total_questoes: number;
  questoes_acertadas: number;
  questoes_erradas: number;
  taxa_acerto: number;
  xp_total: number;
  nivel_atual: number;
  titulo_nivel: string;
  dias_estudo: number;
  streak_atual: number;
}

const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileData && !profileError) {
        setProfile(profileData);
        setFormData({
          nome: profileData.nome || '',
          email: profileData.email || ''
        });
      }

      // Carregar estatísticas do usuário
      await loadUserStats();

      // Carregar conquistas
      await loadAchievements();

      // Carregar sessões de estudo
      await loadStudySessions();

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Buscar todas as respostas do usuário
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas_usuarios')
        .select('acertou, data_resposta')
        .eq('usuario_id', user?.id);

      if (respostas && !respostasError) {
        const totalQuestoes = respostas.length;
        const questoesAcertadas = respostas.filter((r: any) => r.acertou).length;
        const questoesErradas = totalQuestoes - questoesAcertadas;
        const taxaAcerto = totalQuestoes > 0 ? Math.round((questoesAcertadas / totalQuestoes) * 100) : 0;

        // Calcular nível baseado no XP
        const xpTotal = user?.xp || 0;
        const nivelAtual = getLevelFromXP(xpTotal);
        const tituloNivel = getTitleFromLevel(nivelAtual);

        // Calcular dias de estudo (dias únicos com respostas)
        const diasUnicos = new Set(
          respostas.map((r: any) => new Date(r.data_resposta).toDateString())
        ).size;

        // Calcular streak atual (dias consecutivos)
        const streakAtual = calculateStreak(respostas);

        setUserStats({
          total_questoes: totalQuestoes,
          questoes_acertadas: questoesAcertadas,
          questoes_erradas: questoesErradas,
          taxa_acerto: taxaAcerto,
          xp_total: xpTotal,
          nivel_atual: nivelAtual,
          titulo_nivel: tituloNivel,
          dias_estudo: diasUnicos,
          streak_atual: streakAtual
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadAchievements = async () => {
    // Conquistas baseadas em estatísticas reais
    const achievementsList: Achievement[] = [
    {
      id: '1',
      nome: 'Primeiro Passo',
      descricao: 'Respondeu sua primeira questão',
      icone: 'fas fa-star',
      cor: '#ffab00',
        desbloqueado: (userStats?.total_questoes || 0) >= 1
    },
    {
      id: '2',
      nome: 'Dedicado',
      descricao: 'Respondeu 100 questões',
      icone: 'fas fa-fire',
      cor: '#f44336',
        desbloqueado: (userStats?.total_questoes || 0) >= 100
    },
    {
      id: '3',
      nome: 'Mestre',
      descricao: 'Atingiu 1000 XP',
      icone: 'fas fa-crown',
      cor: '#ffab00',
        desbloqueado: (userStats?.xp_total || 0) >= 1000
    },
    {
      id: '4',
      nome: 'Perfeccionista',
      descricao: 'Taxa de acerto acima de 90%',
      icone: 'fas fa-trophy',
      cor: '#00c853',
        desbloqueado: (userStats?.taxa_acerto || 0) >= 90
    },
    {
      id: '5',
      nome: 'Maratona',
      descricao: 'Estudou por 7 dias consecutivos',
      icone: 'fas fa-running',
      cor: '#2196f3',
        desbloqueado: (userStats?.streak_atual || 0) >= 7
    },
    {
      id: '6',
        nome: 'Veterano',
        descricao: 'Respondeu 500 questões',
      icone: 'fas fa-medal',
      cor: '#9c27b0',
        desbloqueado: (userStats?.total_questoes || 0) >= 500
      },
      {
        id: '7',
        nome: 'Lenda',
        descricao: 'Atingiu 5000 XP',
        icone: 'fas fa-gem',
        cor: '#e91e63',
        desbloqueado: (userStats?.xp_total || 0) >= 5000
      },
      {
        id: '8',
        nome: 'Consistente',
        descricao: 'Estudou por 30 dias',
        icone: 'fas fa-calendar-check',
        cor: '#4caf50',
        desbloqueado: (userStats?.dias_estudo || 0) >= 30
      }
    ];

    setAchievements(achievementsList);
  };

  const loadStudySessions = async () => {
    try {
      // Buscar respostas agrupadas por dia
      const { data: respostas, error: respostasError } = await supabase
        .from('respostas_usuarios')
        .select('correta, created_at')
        .eq('aluno_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (respostas && !respostasError) {
        // Agrupar por dia
        const sessionsByDay = respostas.reduce((acc: any, r: any) => {
          const date = new Date(r.created_at).toDateString();
          if (!acc[date]) {
            acc[date] = {
              questoes_respondidas: 0,
              acertos: 0,
              data: date
            };
          }
          acc[date].questoes_respondidas++;
          if (r.correta) acc[date].acertos++;
          return acc;
        }, {});

        const sessions = Object.values(sessionsByDay).map((session: any, index: number) => ({
          id: index.toString(),
          data: session.data,
          questoes_respondidas: session.questoes_respondidas,
          acertos: session.acertos,
          tempo_estudo: session.questoes_respondidas * 2, // Estimativa de 2 min por questão
          categoria: 'Geral'
        }));

        setStudySessions(sessions.slice(0, 7)); // Últimas 7 sessões
      }
      } catch (error) {
      console.error('Erro ao carregar sessões de estudo:', error);
    }
  };

  const getLevelFromXP = (xp: number) => {
    if (xp < 1000) return 1;
    if (xp < 3000) return 2;
    if (xp < 6000) return 3;
    if (xp < 10000) return 4;
    if (xp < 15000) return 5;
    return 6;
  };

  const getTitleFromLevel = (level: number) => {
    switch (level) {
      case 1: return 'Iniciante';
      case 2: return 'Estudante';
      case 3: return 'Avançado';
      case 4: return 'Expert';
      case 5: return 'Mestre';
      case 6: return 'Lenda';
      default: return 'Iniciante';
    }
  };

  const calculateStreak = (respostas: any[]) => {
    if (respostas.length === 0) return 0;

    const dates = respostas
      .map((r: any) => new Date(r.created_at).toDateString())
      .sort()
      .reverse();

    let streak = 1;
    let currentDate = new Date(dates[0]);
    currentDate.setDate(currentDate.getDate() - 1);

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: formData.nome,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...formData } : null);
        setEditingProfile(false);
        if (updateUser) {
          updateUser({ ...user, ...formData });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2] mb-2">
            Meu Perfil
          </h1>
          <p className="text-[#f2f2f2]/70">
            Gerencie suas informações e acompanhe seu progresso
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Perfil */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Informações Pessoais</h2>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2] px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {editingProfile ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f2f2f2]/70">Nome</label>
                    <p className="text-lg">{profile?.nome || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f2f2f2]/70">Email</label>
                    <p className="text-lg">{profile?.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#f2f2f2]/70">Membro desde</label>
                    <p className="text-lg">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Estatísticas */}
            {userStats && (
              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
                <h2 className="text-xl font-semibold mb-6">Estatísticas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2] mb-2">
                      {userStats.total_questoes}
                    </div>
                    <div className="text-sm text-[#f2f2f2]/70">Questões Respondidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2] mb-2">
                      {userStats.taxa_acerto}%
                    </div>
                    <div className="text-sm text-[#f2f2f2]/70">Taxa de Acerto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2] mb-2">
                      {userStats.xp_total}
                    </div>
                    <div className="text-sm text-[#f2f2f2]/70">XP Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f2f2f2] mb-2">
                      {userStats.dias_estudo}
                    </div>
                    <div className="text-sm text-[#f2f2f2]/70">Dias de Estudo</div>
                  </div>
                </div>

                {/* Progresso do Nível */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Nível {userStats.nivel_atual} - {userStats.titulo_nivel}</span>
                    <span className="text-sm text-[#f2f2f2]/70">{userStats.xp_total} XP</span>
                  </div>
                  <div className="w-full bg-[#1b1b1b] rounded-full h-2">
                    <div
                      className="bg-[#8b0000] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((userStats.xp_total % 1000) / 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessões de Estudo Recentes */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6">Sessões de Estudo Recentes</h2>
              {studySessions.length > 0 ? (
                <div className="space-y-3">
                  {studySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-[#1b1b1b] rounded-lg">
                      <div>
                        <div className="font-medium">{session.data}</div>
                        <div className="text-sm text-[#f2f2f2]/70">
                          {session.questoes_respondidas} questões • {session.acertos} acertos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#f2f2f2]/70">{session.tempo_estudo} min</div>
                        <div className="text-sm text-[#8b0000]">
                          {Math.round((session.acertos / session.questoes_respondidas) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-book text-4xl text-[#333333] mb-4"></i>
                  <p className="text-[#f2f2f2]/70">Nenhuma sessão de estudo registrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conquistas */}
            <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
              <h2 className="text-xl font-semibold mb-6">Conquistas</h2>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors duration-200 ${
                      achievement.desbloqueado
                        ? 'border-[#8b0000] bg-[#8b0000]/10'
                        : 'border-[#333333] opacity-50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[#f2f2f2]"
                      style={{ backgroundColor: achievement.cor }}
                    >
                      <i className={achievement.icone}></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.nome}</div>
                      <div className="text-sm text-[#f2f2f2]/70">{achievement.descricao}</div>
                    </div>
                    {achievement.desbloqueado && (
                      <i className="fas fa-check text-[#00c853]"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            {userStats && (
              <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
                <h2 className="text-xl font-semibold mb-4">Sequência de Estudo</h2>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#f2f2f2] mb-2">
                    {userStats.streak_atual}
                  </div>
                  <div className="text-sm text-[#f2f2f2]/70">dias consecutivos</div>
                  <div className="mt-4 text-xs text-[#f2f2f2]/50">
                    Continue estudando para manter sua sequência!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
