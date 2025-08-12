import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Questoes from './pages/Questoes';
import QuestaoDetalhe from './pages/QuestaoDetalhe';
import Perfil from './pages/Perfil';
import Ranking from './pages/Ranking';
import Planos from './pages/Planos';
import AdminDashboard from './pages/admin/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireGestor?: boolean }> = ({ 
  children, 
  requireGestor = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireGestor && user.tipo_usuario !== 'gestor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/questoes" element={<Questoes />} />
          <Route path="/questoes/:id" element={<QuestaoDetalhe />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/planos" element={<Planos />} />

          {/* Rotas protegidas (usuários logados) */}
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de administrador */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireGestor>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  {/* Adicionar outras rotas admin aqui */}
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
