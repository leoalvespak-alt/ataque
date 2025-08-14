import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { LogoProvider } from './contexts/LogoContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import './styles/App.css';

// Componentes de páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Questoes from './pages/Questoes';
import Ranking from './pages/Ranking';
import Planos from './pages/Planos';
import Perfil from './pages/Perfil';
import Estatisticas from './pages/Estatisticas';
import Admin from './pages/admin/Admin';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminQuestoes from './pages/admin/AdminQuestoes';
import AdminRelatorios from './pages/admin/AdminRelatorios';
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes';
import AdminPlanos from './pages/admin/AdminPlanos';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminComentarios from './pages/admin/AdminComentarios';
import AdminScripts from './pages/admin/AdminScripts';
import AdminNotificacoes from './pages/admin/AdminNotificacoes';
import AdminDicasEstudo from './pages/admin/AdminDicasEstudo';
import AdminPoliticasTermos from './pages/admin/AdminPoliticasTermos';
import AdminDesign from './pages/admin/AdminDesign';
import MeusCadernos from './pages/MeusCadernos';
import PoliticasPrivacidade from './pages/PoliticasPrivacidade';
import TermosUso from './pages/TermosUso';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';

// Componente de rota protegida
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.tipo_usuario !== 'gestor') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal da aplicação
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/cadastro" element={user ? <Navigate to="/dashboard" replace /> : <Cadastro />} />
          
          {/* Rota raiz - redireciona baseado no status de autenticação */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Rotas protegidas para usuários */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/questoes" element={
            <ProtectedRoute>
              <Layout>
                <Questoes />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/estatisticas" element={
            <ProtectedRoute>
              <Layout>
                <Estatisticas />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/ranking" element={
            <ProtectedRoute>
              <Layout>
                <Ranking />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/planos" element={
            <ProtectedRoute>
              <Layout>
                <Planos />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Layout>
                <Perfil />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/meus-cadernos" element={
            <ProtectedRoute>
              <Layout>
                <MeusCadernos />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Rotas protegidas para administradores */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/usuarios" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsuarios />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/questoes" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminQuestoes />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/relatorios" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminRelatorios />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/configuracoes" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminConfiguracoes />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/planos" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPlanos />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categorias" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCategorias />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/comentarios" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminComentarios />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/scripts" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminScripts />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/notificacoes" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminNotificacoes />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dicas-estudo" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDicasEstudo />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/politicas-termos" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPoliticasTermos />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/design" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDesign />
            </ProtectedRoute>
          } />
          
          {/* Rotas públicas para políticas e termos */}
          <Route path="/politicas-privacidade" element={<PoliticasPrivacidade />} />
          <Route path="/termos-uso" element={<TermosUso />} />
          
          {/* Rota para capturar rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Componente principal com providers
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CategoriesProvider>
          <LogoProvider>
            <AppContent />
          </LogoProvider>
        </CategoriesProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
