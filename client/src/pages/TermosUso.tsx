import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import FormattedText from '../components/FormattedText';

const TermosUso: React.FC = () => {
  const [content, setContent] = useState<string>('nada');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_plataforma')
        .select('valor')
        .eq('chave', 'termos_uso')
        .single();

      if (data && !error) {
        setContent(data.valor);
      }
    } catch (error) {
      console.error('Erro ao carregar termos de uso:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[#f2f2f2]/70 hover:text-[#f2f2f2] transition-colors mb-4"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#f2f2f2] mb-4">
            Termos de Uso
          </h1>
          <p className="text-[#f2f2f2]/70">
            Última atualização: Janeiro de 2025
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-[#242424] rounded-lg p-8 border border-[#333333]">
          <div className="prose prose-invert max-w-none">
            <FormattedText text={content} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;
