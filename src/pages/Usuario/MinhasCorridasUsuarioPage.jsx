import React, { useEffect, useState, useCallback } from 'react';
import Header from '../../components/layout/Header';
import CorridasTabs from '../../components/ui/CorridasTabs';
import usuariosService from '../../services/usuarios.service';
import carrosService from '../../services/carros.service';
import { useAuth } from '../../context/AuthContext';

/**
 * MinhasCorridasUsuarioPage — Corridas do usuário autenticado.
 *
 * Usuário vê e opera somente suas próprias corridas (usuarioId).
 * Pode cancelar corridas SOLICITADAS ou CONFIRMADAS.
 * Não vê corridas de outros usuários — filtragem garantida no backend.
 */
const MinhasCorridasUsuarioPage = () => {
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
        usuariosService.listarCorridas(usuario.id),
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
        subtitle="Acompanhe todas as suas corridas por status"
      />
      <CorridasTabs
        corridas={corridas}
        carrosMap={carrosMap}
        loading={loading}
        error={error}
        podeCancelar={true}
        onAcao={carregar}
      />
    </div>
  );
};

export default MinhasCorridasUsuarioPage;
