import React from 'react';
import { useAuth } from '../context/AuthContext';
import MinhasCorridasUsuarioPage from './Usuario/MinhasCorridasUsuarioPage';
import MinhasCorridasMotoristaPage from './Motorista/MinhasCorridasMotoristaPage';

/**
 * MinhasCorridasRouter — Decide qual componente renderizar conforme perfil.
 *
 * Ambos usuário e motorista usam /minhas-corridas, mas consomem
 * endpoints distintos e têm permissões diferentes (motorista pode finalizar).
 * A decisão aqui é apenas de renderização — a proteção de dados está no backend.
 */
const MinhasCorridasRouter = () => {
  const { usuario } = useAuth();

  if (usuario?.perfil === 'MOTORISTA') {
    return <MinhasCorridasMotoristaPage />;
  }

  // USUARIO e ADMINISTRADOR usam a visão do passageiro
  return <MinhasCorridasUsuarioPage />;
};

export default MinhasCorridasRouter;
