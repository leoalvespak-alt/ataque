import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import RichTextEditor from '../../components/RichTextEditor';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
}

const AdminPoliticasTermos: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [politicasPrivacidade, setPoliticasPrivacidade] = useState('');
  const [termosUso, setTermosUso] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadContent();
  }, [user]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      const [politicasResult, termosResult] = await Promise.all([
        supabase
          .from('configuracoes_plataforma')
          .select('*')
          .eq('chave', 'politicas_privacidade')
          .single(),
        supabase
          .from('configuracoes_plataforma')
          .select('*')
          .eq('chave', 'termos_uso')
          .single()
      ]);

      if (politicasResult.data) {
        setPoliticasPrivacidade(politicasResult.data.valor || 'nada');
      }
      
      if (termosResult.data) {
        setTermosUso(termosResult.data.valor || 'nada');
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar conteúdo' });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (tipo: 'politicas' | 'termos') => {
    try {
      setSaving(true);
      setMessage(null);

      const chave = tipo === 'politicas' ? 'politicas_privacidade' : 'termos_uso';
      const valor = tipo === 'politicas' ? politicasPrivacidade : termosUso;

      // Primeiro, verificar se o registro já existe
      const { data: existingRecord } = await supabase
        .from('configuracoes_plataforma')
        .select('id')
        .eq('chave', chave)
        .single();

      let result;
      
      if (existingRecord) {
        // Se existe, fazer update
        result = await supabase
          .from('configuracoes_plataforma')
          .update({
            valor,
            descricao: tipo === 'politicas' ? 'Políticas de Privacidade da Plataforma' : 'Termos de Uso da Plataforma'
          })
          .eq('chave', chave);
      } else {
        // Se não existe, fazer insert
        result = await supabase
          .from('configuracoes_plataforma')
          .insert({
            chave,
            valor,
            descricao: tipo === 'politicas' ? 'Políticas de Privacidade da Plataforma' : 'Termos de Uso da Plataforma'
          });
      }

      if (result.error) throw result.error;

      setMessage({ type: 'success', text: `${tipo === 'politicas' ? 'Políticas' : 'Termos'} salvos com sucesso!` });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar conteúdo' });
    } finally {
      setSaving(false);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#f2f2f2]">
            Gerenciar Políticas e Termos
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Políticas de Privacidade */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#f2f2f2]">
                Políticas de Privacidade
              </h2>
              <button
                onClick={() => saveContent('politicas')}
                disabled={saving}
                className="bg-[#00c853] hover:bg-[#00a843] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Salvar
                  </>
                )}
              </button>
            </div>
            
            <RichTextEditor
              value={politicasPrivacidade}
              onChange={setPoliticasPrivacidade}
              placeholder="Digite as políticas de privacidade..."
              rows={20}
            />
          </div>

          {/* Termos de Uso */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#333333]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#f2f2f2]">
                Termos de Uso
              </h2>
              <button
                onClick={() => saveContent('termos')}
                disabled={saving}
                className="bg-[#00c853] hover:bg-[#00a843] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Salvar
                  </>
                )}
              </button>
            </div>
            
            <RichTextEditor
              value={termosUso}
              onChange={setTermosUso}
              placeholder="Digite os termos de uso..."
              rows={20}
            />
          </div>
        </div>

        {/* Instruções */}
        <div className="mt-8 bg-[#242424] rounded-lg p-6 border border-[#333333]">
          <h3 className="text-lg font-semibold text-[#f2f2f2] mb-4">
            Instruções de Formatação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#f2f2f2]/70">
            <div>
              <h4 className="font-semibold text-[#f2f2f2] mb-2">Formatação de Texto:</h4>
              <ul className="space-y-1">
                <li><strong>**texto**</strong> - Negrito</li>
                <li><em>*texto*</em> - Itálico</li>
                <li><u>__texto__</u> - Sublinhado</li>
                <li>Quebra de linha automática</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#f2f2f2] mb-2">Atalhos de Teclado:</h4>
              <ul className="space-y-1">
                <li><strong>Ctrl+B</strong> - Negrito</li>
                <li><strong>Ctrl+I</strong> - Itálico</li>
                <li><strong>Ctrl+U</strong> - Sublinhado</li>
                <li>Botão ↵ - Quebra de linha</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPoliticasTermos;
