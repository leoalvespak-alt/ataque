import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Comment {
  id: number;
  texto: string;
  tipo: string;
  usuario_id: number;
  questao_id: number;
  likes: number;
  aprovado: boolean;
  respondido: boolean;
  resposta_admin?: string;
  data_criacao: string;
  data_resposta?: string;
  // Campos relacionados
  usuario_nome?: string;
  usuario_email?: string;
  questao_enunciado?: string;
}

const AdminComentarios: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.tipo_usuario !== 'gestor') {
      return;
    }
    loadComments();
  }, [user]);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm, statusFilter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('comentarios_alunos')
        .select(`
          *,
          usuarios!inner(nome, email),
          questoes!inner(enunciado)
        `)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar comentários:', error);
        throw error;
      }

      const processedComments = data?.map(c => ({
        ...c,
        usuario_nome: c.usuarios.nome,
        usuario_email: c.usuarios.email,
        questao_enunciado: c.questoes.enunciado
      })) || [];

      setComments(processedComments);
      console.log('Comentários carregados:', processedComments);
      
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar comentários: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const filterComments = () => {
    let filtered = comments;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(comment =>
        comment.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.usuario_nome && comment.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (comment.questao_enunciado && comment.questao_enunciado.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      switch (statusFilter) {
        case 'pendentes':
          filtered = filtered.filter(comment => !comment.aprovado && !comment.respondido);
          break;
        case 'aprovados':
          filtered = filtered.filter(comment => comment.aprovado);
          break;
        case 'respondidos':
          filtered = filtered.filter(comment => comment.respondido);
          break;
        case 'rejeitados':
          filtered = filtered.filter(comment => !comment.aprovado && comment.respondido);
          break;
      }
    }

    setFilteredComments(filtered);
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from('comentarios_alunos')
        .update({ 
          aprovado: true,
          respondido: true,
          data_resposta: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(comment =>
        comment.id === commentId 
          ? { ...comment, aprovado: true, respondido: true, data_resposta: new Date().toISOString() }
          : comment
      ));

      setMessage({ type: 'success', text: 'Comentário aprovado com sucesso!' });
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      setMessage({ type: 'error', text: 'Erro ao aprovar comentário: ' + (error as Error).message });
    }
  };

  const handleRejectComment = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from('comentarios_alunos')
        .update({ 
          aprovado: false,
          respondido: true,
          data_resposta: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(comment =>
        comment.id === commentId 
          ? { ...comment, aprovado: false, respondido: true, data_resposta: new Date().toISOString() }
          : comment
      ));

      setMessage({ type: 'success', text: 'Comentário rejeitado com sucesso!' });
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error);
      setMessage({ type: 'error', text: 'Erro ao rejeitar comentário: ' + (error as Error).message });
    }
  };

  const handleReplyToComment = async () => {
    if (!selectedComment || !replyText.trim()) {
      setMessage({ type: 'error', text: 'Resposta é obrigatória' });
      return;
    }

    try {
      const { error } = await supabase
        .from('comentarios_alunos')
        .update({ 
          resposta_admin: replyText.trim(),
          respondido: true,
          data_resposta: new Date().toISOString()
        })
        .eq('id', selectedComment.id);

      if (error) throw error;

      setComments(comments.map(comment =>
        comment.id === selectedComment.id 
          ? { 
              ...comment, 
              resposta_admin: replyText.trim(),
              respondido: true,
              data_resposta: new Date().toISOString()
            }
          : comment
      ));

      setMessage({ type: 'success', text: 'Resposta enviada com sucesso!' });
      setShowReplyModal(false);
      setReplyText('');
      setSelectedComment(null);
    } catch (error) {
      console.error('Erro ao responder comentário:', error);
      setMessage({ type: 'error', text: 'Erro ao responder comentário: ' + (error as Error).message });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      const { error } = await supabase
        .from('comentarios_alunos')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      setMessage({ type: 'success', text: 'Comentário excluído com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir comentário: ' + (error as Error).message });
    }
  };

  const openReplyModal = (comment: Comment) => {
    setSelectedComment(comment);
    setReplyText(comment.resposta_admin || '');
    setShowReplyModal(true);
  };

  const getStatusLabel = (comment: Comment) => {
    if (comment.respondido) {
      return comment.aprovado ? 'Aprovado' : 'Rejeitado';
    }
    return 'Pendente';
  };

  const getStatusColor = (comment: Comment) => {
    if (comment.respondido) {
      return comment.aprovado 
        ? 'text-green-400 bg-green-900/20' 
        : 'text-red-400 bg-red-900/20';
    }
    return 'text-yellow-400 bg-yellow-900/20';
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            Gerenciar Comentários
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

        {/* Filtros */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Texto, usuário ou questão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="pendentes">Pendentes</option>
                <option value="aprovados">Aprovados</option>
                <option value="respondidos">Respondidos</option>
                <option value="rejeitados">Rejeitados</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                }}
                className="w-full bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-[#242424] rounded-lg p-6 mb-6 border border-[#333333]">
          <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {comments.length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Total de Comentários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {comments.filter(c => !c.aprovado && !c.respondido).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {comments.filter(c => c.aprovado).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Aprovados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8b0000] mb-2">
                {comments.filter(c => c.respondido).length}
              </div>
              <div className="text-sm text-[#f2f2f2]">Respondidos</div>
            </div>
          </div>
        </div>

        {/* Lista de Comentários */}
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div key={comment.id} className="bg-[#242424] rounded-lg p-6 border border-[#333333] hover:border-[#8b0000] transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(comment)}`}>
                      {getStatusLabel(comment)}
                    </span>
                    <span className="text-sm text-[#f2f2f2]/70">
                      {comment.usuario_nome} ({comment.usuario_email})
                    </span>
                    <span className="text-sm text-[#f2f2f2]/70">•</span>
                    <span className="text-sm text-[#f2f2f2]/70">
                      {new Date(comment.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                    {comment.likes > 0 && (
                      <>
                        <span className="text-sm text-[#f2f2f2]/70">•</span>
                        <span className="text-sm text-[#f2f2f2]/70">
                          <i className="fas fa-heart text-red-400 mr-1"></i>
                          {comment.likes}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-[#8b0000] mb-2">Questão:</h4>
                    <p className="text-sm text-[#f2f2f2]/80 mb-3">
                      {truncateText(comment.questao_enunciado || '', 150)}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-[#f2f2f2] mb-2">Comentário:</h4>
                    <p className="text-[#f2f2f2]">
                      {comment.texto}
                    </p>
                  </div>
                  
                  {comment.resposta_admin && (
                    <div className="bg-[#1b1b1b] rounded-lg p-4 mt-3">
                      <h4 className="text-sm font-medium text-[#8b0000] mb-2">Resposta do Admin:</h4>
                      <p className="text-[#f2f2f2]">
                        {comment.resposta_admin}
                      </p>
                      {comment.data_resposta && (
                        <p className="text-xs text-[#f2f2f2]/50 mt-2">
                          Respondido em {new Date(comment.data_resposta).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {!comment.respondido && (
                    <>
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejectComment(comment.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openReplyModal(comment)}
                    className="bg-[#8b0000] hover:bg-[#6b0000] text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-reply mr-1"></i>
                    {comment.respondido ? 'Editar Resposta' : 'Responder'}
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredComments.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-comments text-4xl text-[#333333] mb-4"></i>
            <p className="text-[#f2f2f2]/70">Nenhum comentário encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Resposta */}
      {showReplyModal && selectedComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242424] rounded-lg p-6 w-full max-w-2xl border border-[#333333]">
            <h3 className="text-xl font-semibold mb-4">
              {selectedComment.respondido ? 'Editar Resposta' : 'Responder ao Comentário'}
            </h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[#f2f2f2] mb-2">Comentário original:</h4>
              <div className="bg-[#1b1b1b] rounded-lg p-3 text-[#f2f2f2]/80">
                {selectedComment.texto}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sua resposta:</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none"
                placeholder="Digite sua resposta..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleReplyToComment}
                className="flex-1 bg-[#8b0000] hover:bg-[#6b0000] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {selectedComment.respondido ? 'Atualizar Resposta' : 'Enviar Resposta'}
              </button>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedComment(null);
                }}
                className="flex-1 bg-[#333333] hover:bg-[#444444] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComentarios;
