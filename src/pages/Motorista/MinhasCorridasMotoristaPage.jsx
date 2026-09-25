import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import CorridasTabs from '../../components/ui/CorridasTabs';
import motoistasService from '../../services/motoristas.service';
import carrosService from '../../services/carros.service';
import { useAuth } from '../../context/AuthContext';

/**
 * MinhasCorridasMotoristaPage — Corridas atribuídas ao motorista autenticado.
 *
 * Motorista vê somente corridas onde motoristaId === seu id.
 * Pode finalizar corridas CONFIRMADAS ou EM_ANDAMENTO.
 * Pode cancelar corridas SOLICITADAS ou CONFIRMADAS.
 * Não vê corridas de outros motoristas — filtragem garantida no backend.
 */
const MinhasCorridasMotoristaPage = () => {
  const { usuario } = useAuth();
  const [corridas, setCorridas]   = useState([]);
  const [carrosMap, setCarrosMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true); setError('');
    try {
      const [corridasRes, carrosRes] = await Promise.all([
        motoistasService.listarCorridas(usuario.id),
        carrosService.listarTodos().catch(() => []),
      ]);
      setCorridas(corridasRes || []);
      const mapa = {};
      (Array.isArray(carrosRes) ? carrosRes : carrosRes?.data || [])
        .forEach((c) => { mapa[c.id] = c; });
      setCarrosMap(mapa);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar corridas.');
    } finally {
      setLoading(false);
    }
  }, [usuario?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="page animate-fade-in">
      <Header
        title="Minhas Corridas"
        subtitle="Corridas atribuídas a você — gerencie por status"
      />
      <CorridasTabs
        corridas={corridas}
        carrosMap={carrosMap}
        loading={loading}
        error={error}
        podeCancelar={true}
        podeFinalizar={true}
        onAcao={carregar}
      />
    </div>
  );
};

export default MinhasCorridasMotoristaPage;
