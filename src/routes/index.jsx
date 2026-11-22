import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';
import Loading from '../components/ui/Loading';

// Login mantido eagerly carregado para primeira abertura imediata sem round-trip extra de chunk
import LoginPage from '../pages/Login/LoginPage';

// Code-splitting por rota: páginas pesadas (ex.: Dashboard/Relatório com Recharts, Rotas com Maps)
// só são baixadas quando realmente acessadas pelo perfil correspondente.
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const VeiculosPage = lazy(() => import('../pages/Veiculos/VeiculosPage'));
const CorridasPage = lazy(() => import('../pages/Corridas/CorridasPage'));
const RotasPage = lazy(() => import('../pages/Rotas/RotasPage'));
const PerfilRouter = lazy(() => import('../pages/PerfilRouter'));

// Páginas do motorista
const InicioMotoristaPage = lazy(() => import('../pages/Motorista/InicioMotoristaPage'));
const RelatorioMotoristaPage = lazy(() => import('../pages/Motorista/RelatorioMotoristaPage'));
const MeuVeiculoPage = lazy(() => import('../pages/Motorista/MeuVeiculoPage'));
const NotificacoesMotoristaPage = lazy(() => import('../pages/Motorista/NotificacoesMotoristaPage'));

// Páginas Admin
const UsuariosPage = lazy(() => import('../pages/Admin/UsuariosPage'));
const MotoristasAnalisePage = lazy(() => import('../pages/Admin/MotoristasAnalisePage'));
const VeiculosAnalisePage = lazy(() => import('../pages/Admin/VeiculosAnalisePage'));
const NotificacoesPage = lazy(() => import('../pages/Admin/NotificacoesPage'));
const AuditoriaPage = lazy(() => import('../pages/Admin/AuditoriaPage'));

/**
 * RedirectInicial — Redireciona para a rota home correta conforme perfil.
 * Decisão: admin → /dashboard, usuario → /solicitar-corrida, motorista → /inicio.
 */
const RedirectInicial = () => {
  const { usuario } = useAuth();
  switch (usuario?.perfil) {
    case 'MOTORISTA': return <Navigate to="/inicio" replace />;
    case 'USUARIO':   return <Navigate to="/solicitar-corrida" replace />;
    default:          return <Navigate to="/dashboard" replace />;
  }
};

const FallbackPagina = () => (
  <div className="page">
    <Loading message="Carregando página..." />
  </div>
);

/**
 * AppRoutes — Rotas dinâmicas por perfil.
 *
 * Uma única arvore de rotas com Layout e PrivateRoute compartilhados.
 * As rotas de cada perfil coexistem — o acesso é controlado pelo backend
 * (filtragem por usuarioId/motoristaId nos endpoints).
 * No frontend, a Sidebar oculta rotas não pertencentes ao perfil, mas
 * a proteção real de dados é sempre no backend.
 */
const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/*"
      element={
        <PrivateRoute>
          <Layout>
            <Suspense fallback={<FallbackPagina />}>
              <Routes>
                {/* --- Administrador --- */}
                <Route path="/dashboard"         element={<DashboardPage />} />
                <Route path="/corridas"          element={<CorridasPage />} />
                <Route path="/veiculos"          element={<VeiculosPage />} />
                <Route path="/veiculos/analise"  element={<VeiculosAnalisePage />} />
                <Route path="/rotas"             element={<RotasPage />} />
                <Route path="/usuarios"          element={<UsuariosPage />} />
                <Route path="/motoristas/analise" element={<MotoristasAnalisePage />} />
                <Route path="/notificacoes"      element={<NotificacoesPage />} />
                <Route path="/auditoria"         element={<AuditoriaPage />} />

                {/* --- Usuário/Passageiro e Compartilhadas --- */}
                <Route path="/solicitar-corrida" element={<RotasPage />} />
                <Route path="/minhas-corridas"   element={<CorridasPage />} />
                <Route path="/perfil"            element={<PerfilRouter />} />

                {/* --- Motorista --- */}
                <Route path="/inicio"            element={<InicioMotoristaPage />} />
                <Route path="/relatorio"         element={<RelatorioMotoristaPage />} />
                <Route path="/meu-veiculo"       element={<MeuVeiculoPage />} />
                <Route path="/notificacoes-motorista" element={<NotificacoesMotoristaPage />} />

                {/* Rota padrão — redireciona conforme perfil */}
                <Route path="*" element={<RedirectInicial />} />
              </Routes>
            </Suspense>
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
