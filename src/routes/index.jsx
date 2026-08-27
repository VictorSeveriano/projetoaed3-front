import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import CarrosPage from '../pages/Carros/CarrosPage';
import ReservasPage from '../pages/Reservas/ReservasPage';
import GrafoPage from '../pages/Grafo/GrafoPage';

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
              <Route path="/reservas"   element={<ReservasPage />} />
              <Route path="/grafo"      element={<GrafoPage />} />
              <Route path="*"           element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
