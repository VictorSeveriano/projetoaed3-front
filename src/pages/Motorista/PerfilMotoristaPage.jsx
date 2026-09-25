import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import motoistasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS } from '../../utils/formatters';
import { User, AtSign, Shield } from 'lucide-react';

const PERFIL_LABELS = {
  ADMINISTRADOR: 'Administrador',
  USUARIO: 'Passageiro',
  MOTORISTA: 'Motorista',
};

/**
 * PerfilMotoristaPage — Perfil do motorista autenticado.
 */
const PerfilMotoristaPage = () => {
  const { usuario } = useAuth();
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!usuario?.id) return;
    motoistasService.buscarPorId(usuario.id)
      .then((dados) => setPerfil(dados))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  if (loading) return <Loading message="Carregando perfil..." />;

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Perfil" subtitle="Seus dados cadastrais" />

      {error ? (
        <div className="form-error" role="alert">{error}</div>
      ) : (
        <div className="card">
          <div className="card__header">
            <h2 className="card-section-title">Informações da conta</h2>
          </div>
          <div className="card__body">
            <div className="perfil-grid">
              <div className="perfil-campo">
                <span className="perfil-campo__icon" aria-hidden="true"><User size={18} /></span>
                <div>
                  <span className="perfil-campo__label">Nome</span>
                  <span className="perfil-campo__valor">{perfil?.nome || '—'}</span>
                </div>
              </div>
              <div className="perfil-campo">
                <span className="perfil-campo__icon" aria-hidden="true"><AtSign size={18} /></span>
                <div>
                  <span className="perfil-campo__label">Usuário</span>
                  <span className="perfil-campo__valor">@{perfil?.usuario || '—'}</span>
                </div>
              </div>
              <div className="perfil-campo">
                <span className="perfil-campo__icon" aria-hidden="true"><Shield size={18} /></span>
                <div>
                  <span className="perfil-campo__label">Perfil</span>
                  <span className="perfil-campo__valor">
                    {PERFIL_LABELS[perfil?.perfil] || perfil?.perfil || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilMotoristaPage;
