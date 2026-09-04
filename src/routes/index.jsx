import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CarrosPage from '../pages/Carros/CarrosPage';
import CorridasPage from '../pages/Corridas/CorridasPage';
import RotasPage from '../pages/Rotas/RotasPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/*"
      element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard"  element={<DashboardPage />} />
              <Route path="/carros"     element={<CarrosPage />} />
              <Route path="/corridas"   element={<CorridasPage />} />
              <Route path="/rotas"      element={<RotasPage />} />
              <Route path="*"           element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
