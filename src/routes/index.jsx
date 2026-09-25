import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';

// Páginas existentes (admin)
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CarrosPage from '../pages/Carros/CarrosPage';
import CorridasPage from '../pages/Corridas/CorridasPage';
import RotasPage from '../pages/Rotas/RotasPage';

// Páginas do usuário/passageiro
import PerfilUsuarioPage from '../pages/Usuario/PerfilUsuarioPage';

// Roteador de perfil (mantido)
import PerfilRouter from '../pages/PerfilRouter';

// Páginas do motorista
import InicioMotoristaPage from '../pages/Motorista/InicioMotoristaPage';
import RelatorioMotoristaPage from '../pages/Motorista/RelatorioMotoristaPage';
import MeuVeiculoPage from '../pages/Motorista/MeuVeiculoPage';

// Páginas Admin (novas)
import UsuariosPage from '../pages/Admin/UsuariosPage';
import MotoristasPage from '../pages/Admin/MotoristasPage';
import MotoristasAnalisePage from '../pages/Admin/MotoristasAnalisePage';
import VeiculosAnalisePage from '../pages/Admin/VeiculosAnalisePage';
import NotificacoesPage from '../pages/Admin/NotificacoesPage';

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
            <Routes>
              {/* --- Administrador --- */}
              <Route path="/dashboard"         element={<DashboardPage />} />
              <Route path="/corridas"          element={<CorridasPage />} />
              <Route path="/carros"            element={<CarrosPage />} />
              <Route path="/veiculos/analise"  element={<VeiculosAnalisePage />} />
              <Route path="/rotas"             element={<RotasPage />} />
              <Route path="/usuarios"          element={<UsuariosPage />} />
              <Route path="/motoristas"        element={<MotoristasPage />} />
              <Route path="/motoristas/analise" element={<MotoristasAnalisePage />} />
              <Route path="/notificacoes"      element={<NotificacoesPage />} />

              {/* --- Usuário/Passageiro --- */}
              <Route path="/solicitar-corrida" element={<RotasPage />} />
              <Route path="/minhas-corridas"   element={<CorridasPage />} />
              <Route path="/perfil"            element={<PerfilRouter />} />

              {/* --- Motorista --- */}
              <Route path="/inicio"            element={<InicioMotoristaPage />} />
              <Route path="/minhas-corridas"   element={<CorridasPage />} />
              <Route path="/relatorio"         element={<RelatorioMotoristaPage />} />
              <Route path="/meu-veiculo"       element={<MeuVeiculoPage />} />

              {/* Rota padrão — redireciona conforme perfil */}
              <Route path="*" element={<RedirectInicial />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
