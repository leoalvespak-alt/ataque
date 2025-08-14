import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface Plan {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  preco_original?: number;
  periodo: string;
  recursos: string[];
  popular?: boolean;
  cor: string;
}

const Planos: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [mockPlans] = useState<Plan[]>([
    {
      id: 'gratuito',
      nome: 'Gratuito',
      descricao: 'Perfeito para começar seus estudos',
      preco: 0,
      periodo: 'Sempre',
      recursos: [
        'Até 50 questões por mês',
        'Acesso básico ao ranking',
        'Questões de nível fácil',
        'Suporte por email'
      ],
      cor: '#6b7280'
    },
    {
      id: 'basico',
      nome: 'Básico',
      descricao: 'Ideal para estudantes dedicados',
      preco: 29.90,
      preco_original: 39.90,
      periodo: 'Mensal',
      recursos: [
        'Questões ilimitadas',
        'Acesso completo ao ranking',
        'Questões de todos os níveis',
        'Explicações detalhadas',
        'Simulados básicos',
        'Suporte prioritário'
      ],
      popular: true,
      cor: '#8b0000'
    },
    {
      id: 'premium',
      nome: 'Premium',
      descricao: 'Para quem quer ir além',
      preco: 79.90,
      preco_original: 99.90,
      periodo: 'Mensal',
      recursos: [
        'Tudo do plano Básico',
        'Simulados avançados',
        'Relatórios detalhados',
        'Aulas em vídeo',
        'Grupo de estudos exclusivo',
        'Mentoria individual',
        'Suporte 24/7'
      ],
      cor: '#ffab00'
    },
    {
      id: 'anual',
      nome: 'Anual',
      descricao: 'Melhor custo-benefício',
      preco: 599.90,
      preco_original: 1198.80,
      periodo: 'Anual',
      recursos: [
        'Tudo do plano Premium',
        '2 meses grátis',
        'Desconto de 50%',
        'Acesso antecipado a novos recursos',
        'Certificado de conclusão',
        'Garantia de 30 dias'
      ],
      cor: '#00c853'
    }
  ]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        
        // Buscar planos do banco de dados
        const { data: plansData, error } = await supabase
          .from('planos')
          .select('*')
          .order('preco', { ascending: true });

        if (plansData && !error) {
          // Garantir que todos os campos obrigatórios estejam presentes
          const validatedPlans = plansData.map((plan: any) => ({
            id: plan.id || 'unknown',
            nome: plan.nome || 'Plano',
            descricao: plan.descricao || 'Descrição não disponível',
            preco: plan.preco || 0,
            preco_original: plan.preco_original,
            periodo: plan.periodo || 'Mensal',
            recursos: plan.recursos || [],
            popular: plan.popular || false,
            cor: plan.cor || '#6b7280'
          }));
          setPlans(validatedPlans);
        } else {
          setPlans(mockPlans);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        setPlans(mockPlans);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    try {
      // Simular processo de pagamento
      console.log('Processando pagamento para o plano:', selectedPlan);
      
      // Aqui você integraria com um gateway de pagamento real
      // Por exemplo: Stripe, PayPal, etc.
      
      // Atualizar status do usuário
      const { error } = await supabase
        .from('usuarios')
        .update({ 
          status: selectedPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (!error) {
        alert('Pagamento processado com sucesso! Seu plano foi ativado.');
        setShowPaymentModal(false);
        setSelectedPlan('');
      } else {
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === user?.status) || plans[0];
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
        <div className="bg-[#242424] border-b border-[#333333] p-4 rounded-lg mb-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#8b0000]">Planos e Assinaturas</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-crown text-[#ffab00]"></i>
                <span className="font-semibold">Seu plano: {getCurrentPlan()?.nome}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {/* Current Plan Info */}
          <div className="bg-[#242424] rounded-lg p-6 mb-8 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-4">Seu Plano Atual</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#8b0000] rounded-full flex items-center justify-center">
                <i className="fas fa-crown text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{getCurrentPlan()?.nome}</h3>
                <p className="text-gray-400">{getCurrentPlan()?.descricao}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className="px-2 py-1 bg-[#00c853] text-[#f2f2f2] text-xs rounded-full">
                    Ativo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-[#242424] rounded-lg p-6 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-[#8b0000] shadow-lg shadow-[#8b0000]/20' 
                    : 'border-[#333333] hover:border-[#8b0000]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#8b0000] text-[#f2f2f2] px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.nome}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.descricao}</p>
                  
                  <div className="mb-4">
                    {plan.preco === 0 ? (
                      <div className="text-3xl font-bold text-[#00c853]">Grátis</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold">
                          R$ {plan.preco.toFixed(2).replace('.', ',')}
                        </div>
                        {plan.preco_original && (
                          <div className="text-sm text-gray-400 line-through">
                            R$ {plan.preco_original.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-gray-400">
                      por {(plan.periodo || 'Mensal').toLowerCase()}
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {(plan.recursos || []).map((recurso, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <i className="fas fa-check text-[#00c853] text-sm"></i>
                      <span className="text-sm">{recurso}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.id === user?.status}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.id === user?.status
                      ? 'bg-[#333333] text-gray-500 cursor-not-allowed'
                      : plan.preco === 0
                      ? 'bg-[#00c853] hover:bg-[#00a844] text-[#f2f2f2]'
                      : 'bg-[#8b0000] hover:bg-[#6b0000] text-[#f2f2f2]'
                  }`}
                >
                  {plan.id === user?.status ? 'Plano Atual' : 'Escolher Plano'}
                </button>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold mb-6">Comparativo de Recursos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1b1b1b]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Recurso</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                        {plan.nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  <tr>
                    <td className="px-4 py-3 text-sm">Questões por mês</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm">
                        {plan.id === 'gratuito' ? '50' : 'Ilimitadas'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Níveis de dificuldade</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm">
                        {plan.id === 'gratuito' ? 'Fácil' : 'Todos'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Simulados</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm">
                        {plan.id === 'gratuito' ? 'Não' : plan.id === 'basico' ? 'Básicos' : 'Avançados'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Aulas em vídeo</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm">
                        {plan.id === 'gratuito' || plan.id === 'basico' ? 'Não' : 'Sim'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Suporte</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center text-sm">
                        {plan.id === 'gratuito' ? 'Email' : plan.id === 'basico' ? 'Prioritário' : '24/7'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242424] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirmar Assinatura</h3>
            <p className="text-gray-400 mb-6">
              Você está prestes a assinar o plano{' '}
              <strong>{plans.find(p => p.id === selectedPlan)?.nome}</strong>
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span>{plans.find(p => p.id === selectedPlan)?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span>
                  R$ {plans.find(p => p.id === selectedPlan)?.preco.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Período:</span>
                <span>{plans.find(p => p.id === selectedPlan)?.periodo}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 bg-[#333333] text-[#f2f2f2] rounded-lg hover:bg-[#444444] transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-2 px-4 bg-[#8b0000] text-[#f2f2f2] rounded-lg hover:bg-[#6b0000] transition-colors duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planos;
