import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

interface DicaEstudo {
  id: number;
  titulo: string;
  texto: string;
  categoria: string;
  prioridade: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

interface DicaForm {
  titulo: string;
  texto: string;
  categoria: string;
  prioridade: number;
  ativa: boolean;
}

const AdminDicasEstudo: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dicas, setDicas] = useState<DicaEstudo[]>([]);
  const [editingDica, setEditingDica] = useState<DicaEstudo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DicaForm>({
    titulo: '',
    texto: '',
    categoria: 'GERAL',
    prioridade: 1,
    ativa: true
  });

  const categorias = [
    { value: 'GERAL', label: 'Geral' },
    { value: 'MOTIVACIONAL', label: 'Motivacional' },
    { value: 'ESTUDO', label: 'Estudo' },
    { value: 'SAUDE', label: 'Saúde' },
    { value: 'TECNICA', label: 'Técnica' },
    { value: 'DICA', label: 'Dica' }
  ];

  const prioridades = [
    { value: 1, label: 'Baixa' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Alta' },
    { value: 4, label: 'Urgente' }
  ];

  useEffect(() => {
    if (user) {
      loadDicas();
    }
  }, [user]);

  const loadDicas = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('dicas_estudo')
        .select('*')
        .order('prioridade', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDicas(data || []);
    } catch (error) {
      console.error('Erro ao carregar dicas de estudo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDica) {
        // Atualizar dica existente
        const { error } = await supabase
          .rpc('atualizar_dica_estudo', {
            p_id: editingDica.id,
            p_titulo: formData.titulo,
            p_texto: formData.texto,
            p_categoria: formData.categoria,
            p_prioridade: formData.prioridade,
            p_ativa: formData.ativa
          });

        if (error) throw error;
        alert('Dica de estudo atualizada com sucesso!');
      } else {
        // Criar nova dica
        const { error } = await supabase
          .rpc('criar_dica_estudo', {
            p_titulo: formData.titulo,
            p_texto: formData.texto,
            p_categoria: formData.categoria,
            p_prioridade: formData.prioridade
          });

        if (error) throw error;
        alert('Dica de estudo criada com sucesso!');
      }
      
      resetForm();
      loadDicas();
    } catch (error) {
      console.error('Erro ao salvar dica de estudo:', error);
      alert('Erro ao salvar dica de estudo: ' + (error as any).message);
    }
  };

  const handleEdit = (dica: DicaEstudo) => {
    setEditingDica(dica);
    setFormData({
      titulo: dica.titulo,
      texto: dica.texto,
      categoria: dica.categoria,
      prioridade: dica.prioridade,
      ativa: dica.ativa
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta dica de estudo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .rpc('excluir_dica_estudo', { p_id: id });

      if (error) throw error;
      alert('Dica de estudo excluída com sucesso!');
      loadDicas();
    } catch (error) {
      console.error('Erro ao excluir dica de estudo:', error);
      alert('Erro ao excluir dica de estudo: ' + (error as any).message);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      texto: '',
      categoria: 'GERAL',
      prioridade: 1,
      ativa: true
    });
    setEditingDica(null);
    setShowForm(false);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'MOTIVACIONAL': return '#4CAF50';
      case 'ESTUDO': return '#2196F3';
      case 'SAUDE': return '#FF9800';
      case 'TECNICA': return '#9C27B0';
      case 'DICA': return '#607D8B';
      default: return '#9E9E9E';
    }
  };

  const getPrioridadeColor = (prioridade: number) => {
    switch (prioridade) {
      case 4: return '#f44336';
      case 3: return '#ff9800';
      case 2: return '#2196f3';
      case 1: return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dicas-estudo">
      <div className="header">
        <h1>Gerenciar Dicas de Estudo</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Nova Dica
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingDica ? 'Editar' : 'Nova'} Dica de Estudo</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="texto">Texto *</label>
              <textarea
                id="texto"
                value={formData.texto}
                onChange={(e) => setFormData({...formData, texto: e.target.value})}
                required
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                >
                  {categorias.map(categoria => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prioridade">Prioridade</label>
                <select
                  id="prioridade"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: Number(e.target.value)})}
                >
                  {prioridades.map(prioridade => (
                    <option key={prioridade.value} value={prioridade.value}>
                      {prioridade.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({...formData, ativa: e.target.checked})}
                />
                Ativa
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingDica ? 'Atualizar' : 'Criar'} Dica
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dicas-list">
        <h2>Dicas de Estudo Existentes</h2>
        {dicas.length === 0 ? (
          <p>Nenhuma dica de estudo encontrada.</p>
        ) : (
          <div className="dicas-grid">
            {dicas.map(dica => (
              <div key={dica.id} className="dica-card">
                <div className="dica-header">
                  <h3>{dica.titulo}</h3>
                  <div className="dica-meta">
                    <span 
                      className="badge categoria"
                      style={{ backgroundColor: getCategoriaColor(dica.categoria) }}
                    >
                      {dica.categoria}
                    </span>
                    <span 
                      className="badge prioridade"
                      style={{ backgroundColor: getPrioridadeColor(dica.prioridade) }}
                    >
                      Prioridade {dica.prioridade}
                    </span>
                    {!dica.ativa && (
                      <span className="badge inactive">Inativa</span>
                    )}
                  </div>
                </div>
                
                <p className="dica-texto">{dica.texto}</p>
                
                <div className="dica-details">
                  <p><strong>Criado em:</strong> {new Date(dica.created_at).toLocaleString()}</p>
                  {dica.updated_at !== dica.created_at && (
                    <p><strong>Atualizado em:</strong> {new Date(dica.updated_at).toLocaleString()}</p>
                  )}
                </div>

                <div className="dica-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(dica)}
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(dica.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDicasEstudo;
