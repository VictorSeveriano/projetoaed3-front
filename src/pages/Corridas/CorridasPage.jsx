import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import CorridasTabs from '../../components/ui/CorridasTabs';
import corridasService from '../../services/corridas.service';
import veiculosService from '../../services/veiculos.service';

/**
 * CorridasPage — Página de corridas compartilhada entre Admin, Usuário e Motorista.
 *
 * - Admin: vê todas as corridas, pode cancelar/finalizar.
 * - Motorista: vê suas corridas aceitas, pode confirmar pagamento.
 * - Usuário/Passageiro: vê suas corridas, pode cancelar as SOLICITADAS/CONFIRMADAS.
 *
 * Usa o componente CorridasTabs reutilizável para exibição.
 */
const CorridasPage = () => {
  const { usuario } = useAuth();
  const [corridas, setCorridas]   = useState([]);
  const [carrosMap, setCarrosMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const carregar = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    setError('');
    try {
      const [corridasRes, carrosRes] = await Promise.all([
        corridasService.listarPorPerfil(usuario.id, usuario.perfil, ''),
        veiculosService.listarTodos().catch(() => ({ data: [] })),
      ]);
      setCorridas(corridasRes || []);
      const mapa = {};
      (carrosRes?.data || carrosRes || []).forEach((c) => { mapa[c.id] = c; });
      setCarrosMap(mapa);
    } catch (err) {
      setError('Erro ao carregar corridas.');
      setCorridas([]);
    } finally { setLoading(false); }
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  const isAdmin    = usuario?.perfil === 'ADMINISTRADOR';
  const isMotorista = usuario?.perfil === 'MOTORISTA';
  const isUsuario  = usuario?.perfil === 'USUARIO';

  const subtitulo = isAdmin
    ? 'Gerencie as corridas de todos os perfis'
    : isMotorista
      ? 'Suas corridas — confirme o pagamento ao finalizar'
      : 'Acompanhe suas corridas';

  return (
    <div className="page animate-fade-in">
      <Header title="Corridas" subtitle={subtitulo} />

      <CorridasTabs
        corridas={corridas}
        carrosMap={carrosMap}
        loading={loading}
        error={error}
        podeCancelar={isAdmin || isUsuario}
        podeFinalizar={isAdmin}
        podeConfirmarPagamento={isMotorista}
        motoristaUsuarioId={isMotorista ? usuario?.id : null}
        onAcao={carregar}
      />
    </div>
  );
};

export default CorridasPage;
