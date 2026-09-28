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
    motoistasService.buscarPorUsuarioId(usuario.id)
      .then((dados) => setPerfil(dados))
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  if (loading) return <Loading message="Carregando perfil..." />;

  const u = perfil?.usuario || {};
  const e = u.endereco || {};
  const v = perfil?.veiculo;

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Perfil" subtitle="Seus dados cadastrais" />

      {error ? (
        <div className="form-error" role="alert">{error}</div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dados Pessoais */}
          <div>
            <div className="card__header">
              <h2 className="card-section-title">Dados Pessoais</h2>
            </div>
            <div className="card__body">
              <div className="perfil-grid">
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Nome</span>
                  <span className="perfil-campo__valor">{u.nome || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Usuário</span>
                  <span className="perfil-campo__valor">@{u.usuario || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">CPF</span>
                  <span className="perfil-campo__valor">{u.cpf || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Celular</span>
                  <span className="perfil-campo__valor">{u.celular || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">E-mail</span>
                  <span className="perfil-campo__valor">{u.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <div className="card__header">
              <h2 className="card-section-title">Endereço</h2>
            </div>
            <div className="card__body">
              <div className="perfil-grid">
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Rua</span>
                  <span className="perfil-campo__valor">{e.rua || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Número</span>
                  <span className="perfil-campo__valor">{e.numero || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Bairro</span>
                  <span className="perfil-campo__valor">{e.bairro || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Cidade</span>
                  <span className="perfil-campo__valor">{e.cidade || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Estado</span>
                  <span className="perfil-campo__valor">{e.estado || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">CEP</span>
                  <span className="perfil-campo__valor">{e.cep || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motorista */}
          <div>
            <div className="card__header">
              <h2 className="card-section-title">Motorista</h2>
            </div>
            <div className="card__body">
              <div className="perfil-grid">
                <div className="perfil-campo">
                  <span className="perfil-campo__label">CNH</span>
                  <span className="perfil-campo__valor">{perfil?.cnh || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Status do cadastro</span>
                  <div className="perfil-campo__valor">
                    {perfil?.statusCadastro ? (
                      <Badge label={perfil.statusCadastro} color={perfil.statusCadastro === 'APROVADO' ? 'success' : perfil.statusCadastro === 'PENDENTE' ? 'warning' : 'danger'} />
                    ) : '—'}
                  </div>
                </div>
                <div className="perfil-campo">
                  <span className="perfil-campo__label">Status de presença</span>
                  <span className="perfil-campo__valor">
                    {perfil?.statusPresenca ? (
                      <Badge label={STATUS_LABELS[perfil.statusPresenca]?.label || perfil.statusPresenca} color={STATUS_LABELS[perfil.statusPresenca]?.color || 'info'} />
                    ) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Veículo */}
          {v && (
            <div>
              <div className="card__header">
                <h2 className="card-section-title">Veículo</h2>
              </div>
              <div className="card__body">
                <div className="perfil-grid">
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Marca</span>
                    <span className="perfil-campo__valor">{v.marca || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Modelo</span>
                    <span className="perfil-campo__valor">{v.modelo || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Placa</span>
                    <span className="perfil-campo__valor">{v.placa || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Ano</span>
                    <span className="perfil-campo__valor">{v.ano || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Cor</span>
                    <span className="perfil-campo__valor">{v.cor || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Porte</span>
                    <span className="perfil-campo__valor">{v.porte || '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Classe</span>
                    <span className="perfil-campo__valor">{v.classe ? <Badge label={v.classe} color="info" /> : '—'}</span>
                  </div>
                  <div className="perfil-campo">
                    <span className="perfil-campo__label">Status de aprovação</span>
                    <div className="perfil-campo__valor">
                      {v.statusAprovacao ? (
                        <Badge label={v.statusAprovacao} color={v.statusAprovacao === 'APROVADO' ? 'success' : 'warning'} />
                      ) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default PerfilMotoristaPage;
