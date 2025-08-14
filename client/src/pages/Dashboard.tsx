import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

interface Notification {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  prioridade: string;
  lida: boolean;
  created_at: string;
}

interface DicaEstudo {
  id: number;
  titulo: string;
  texto: string;
  categoria: string;
  prioridade: number;
}

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasDetalhadas | null>(null);
  const [dicasEstudo, setDicasEstudo] = useState<DicaEstudo[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEstatisticasDetalhadas(),
        loadDicasEstudo(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticasDetalhadas = async () => {
    try {
      // Verificar se a função existe antes de chamar
      const { data, error } = await supabase
        .rpc('get_estatisticas_dashboard');

      if (error) {
        console.warn('Função get_estatisticas_dashboard não disponível:', error);
        // Usar dados mock temporários
        setEstatisticas({
          total_respostas: 0,
          total_acertos: 0,
          total_erros: 0,
          percentual_acerto: 0,
          xp_total: 0,
          questoes_respondidas: 0,
          respostas_ultimos_30_dias: 0,
          acertos_ultimos_30_dias: 0,
          percentual_ultimos_30_dias: 0,
          streak_atual: 0,
          dias_estudo: 0
        });
        return;
      }
      
      setEstatisticas(data);
    } catch (error) {
      console.warn('Erro ao carregar estatísticas:', error);
      // Usar dados mock temporários
      setEstatisticas({
        total_respostas: 0,
        total_acertos: 0,
        total_erros: 0,
        percentual_acerto: 0,
        xp_total: 0,
        questoes_respondidas: 0,
        respostas_ultimos_30_dias: 0,
        acertos_ultimos_30_dias: 0,
        percentual_ultimos_30_dias: 0,
        streak_atual: 0,
        dias_estudo: 0
      });
    }
  };

  const loadDicasEstudo = async () => {
    try {
      const { data, error } = await supabase
        .from('dicas_estudo')
        .select('*')
        .eq('ativo', true)
        .order('prioridade', { ascending: false })
        .limit(3);

      if (error) {
        console.warn('Erro ao carregar dicas de estudo:', error);
        setDicasEstudo([]);
        return;
      }
      
      setDicasEstudo(data || []);
    } catch (error) {
      console.warn('Erro ao carregar dicas de estudo:', error);
      setDicasEstudo([]);
    }
  };

  const loadNotifications = async () => {
    try {
      // Verificar se a função existe antes de chamar
      const { data, error } = await supabase
        .rpc('get_notificacoes_dashboard');

      if (error) {
        console.warn('Função get_notificacoes_dashboard não disponível:', error);
        setNotifications([]);
        return;
      }
      
      setNotifications(data || []);
    } catch (error) {
      console.warn('Erro ao carregar notificações:', error);
      setNotifications([]);
    }
  };

  const marcarNotificacaoLida = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .rpc('marcar_notificacao_lida_segura', {
          notificacao_id: notificationId
        });

      if (error) {
        console.warn('Erro ao marcar notificação como lida:', error);
        return;
      }
      
      // Recarregar notificações
      loadNotifications();
    } catch (error) {
      console.warn('Erro ao marcar notificação como lida:', error);
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'MOTIVACIONAL': return '#4CAF50';
      case 'ESTUDO': return '#2196F3';
      case 'SAUDE': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE': return '#f44336';
      case 'ALTA': return '#ff9800';
      case 'NORMAL': return '#2196f3';
      case 'BAIXA': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      {/* Header com notificações */}
      <div className="dashboard-header">
        <h1>Meu Dashboard</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell"></i>
            Notificações
            {notifications.filter(n => !n.lida).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.lida).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Painel de Notificações */}
      {showNotifications && (
        <div className="notifications-panel">
          <h3>Notificações e Avisos</h3>
          {notifications.length === 0 ? (
            <p>Nenhuma notificação no momento.</p>
          ) : (
            <div className="notifications-grid">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-card ${!notification.lida ? 'unread' : ''}`}
                  style={{ borderLeftColor: getPrioridadeColor(notification.prioridade) }}
                >
                  <div className="notification-header">
                    <h4>{notification.titulo}</h4>
                    <span className="notification-priority">{notification.prioridade}</span>
                  </div>
                  <p>{notification.mensagem}</p>
                  <div className="notification-footer">
                    <small>{new Date(notification.created_at).toLocaleDateString()}</small>
                    {!notification.lida && (
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => marcarNotificacaoLida(notification.id)}
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Painel de Ações Rápidas */}
      <div className="quick-actions-panel">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/questoes')}
          >
            <div className="action-icon">📝</div>
            <div className="action-title">Resolver Questões</div>
            <div className="action-description">Pratique agora</div>
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/ranking')}
          >
            <div className="action-icon">🏆</div>
            <div className="action-title">Ranking</div>
            <div className="action-description">Veja sua posição</div>
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/estatisticas')}
          >
            <div className="action-icon">📊</div>
            <div className="action-title">Estatísticas</div>
            <div className="action-description">Análise detalhada</div>
          </button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      {estatisticas && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{estatisticas.total_respostas}</div>
            <div className="stat-label">Total de Respostas</div>
          </div>
          <div className="stat-card">
            <div className="stat-percentage">{estatisticas.percentual_acerto.toFixed(1)}%</div>
            <div className="stat-label">Taxa de Acerto</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estatisticas.xp_total}</div>
            <div className="stat-label">XP Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estatisticas.streak_atual}</div>
            <div className="stat-label">Dias Consecutivos</div>
          </div>
        </div>
      )}

      {/* Dicas de Estudo */}
      <div className="dicas-estudo-section">
        <h2>Dicas de Estudo</h2>
        <div className="dicas-grid">
          {dicasEstudo.map(dica => (
            <div 
              key={dica.id} 
              className="dica-card"
              style={{ borderLeftColor: getCategoriaColor(dica.categoria) }}
            >
              <div className="dica-header">
                <h4>{dica.titulo}</h4>
                <span className="dica-categoria">{dica.categoria}</span>
              </div>
              <p>{dica.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
