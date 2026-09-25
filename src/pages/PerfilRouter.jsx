import React from 'react';
import { useAuth } from '../context/AuthContext';
import PerfilUsuarioPage from './Usuario/PerfilUsuarioPage';
import PerfilMotoristaPage from './Motorista/PerfilMotoristaPage';

/**
 * PerfilRouter — Decide qual componente de perfil renderizar conforme perfil.
 */
const PerfilRouter = () => {
  const { usuario } = useAuth();

  if (usuario?.perfil === 'MOTORISTA') {
    return <PerfilMotoristaPage />;
  }

  return <PerfilUsuarioPage />;
};

export default PerfilRouter;
