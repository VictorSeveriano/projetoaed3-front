import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import motoristasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import ModalInformacao from '../../components/ui/ModalInformacao';
import usuariosService from '../../services/usuarios.service';
import { usePerfilEdicao } from '../../hooks/usePerfilEdicao';
import { CamposEnderecoPerfil } from '../../components/ui/CamposEnderecoPerfil';
import CampoPerfil from '../../components/ui/CampoPerfil';

/**
 * PerfilMotoristaPage — Perfil do motorista autenticado.
 */
const PerfilMotoristaPage = () => {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    isEditing, setIsEditing,
    showConfirm, setShowConfirm,
    erroModal, setErroModal,
    infoModal, setInfoModal,
    formData, setFormData,
    isAddressDifferent,
    handleCancelClick,
    resetForm,
  } = usePerfilEdicao({
    nome: '', usuario: '', cpf: '', celular: '', email: '',
    endereco: { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
    cnh: '',
  });

  useEffect(() => {
    if (!usuario?.id) return;
    motoristasService.buscarPorUsuarioId(usuario.id)
      .then((dados) => {
        setPerfil(dados);
        const u = dados.usuario || {};
        setFormData({
          nome: u.nome || '', usuario: u.usuario || '', cpf: u.cpf || '', celular: u.celular || '', email: u.email || '',
          endereco: u.endereco || { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
          cnh: dados.cnh || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [usuario?.id, setFormData]);

  if (loading) return <Loading message="Carregando perfil..." />;

  const hasChanges = Boolean(
    perfil && (
      perfil.usuario?.nome !== formData.nome || perfil.usuario?.usuario !== formData.usuario ||
      perfil.usuario?.cpf !== formData.cpf || perfil.usuario?.celular !== formData.celular ||
      perfil.usuario?.email !== formData.email || perfil.cnh !== formData.cnh ||
      isAddressDifferent(perfil.usuario?.endereco, formData.endereco)
    )
  );

  const handleSave = async () => {
    if (!hasChanges) {
      setInfoModal(true);
      return;
    }
    try {
      const uData = {
        nome: formData.nome, usuario: formData.usuario, cpf: formData.cpf,
        celular: formData.celular, email: formData.email, endereco: formData.endereco,
      };
      await usuariosService.atualizar(usuario.id, uData);

      if (formData.cnh !== perfil.cnh) {
        await motoristasService.atualizar(perfil.id, { cnh: formData.cnh });
      }

      const dados = await motoristasService.buscarPorUsuarioId(usuario.id);
      setPerfil(dados);
      setIsEditing(false);
    } catch (err) {
      setErroModal({ aberto: true, mensagem: err.response?.data?.message || 'Erro ao salvar.' });
    }
  };

  const u = perfil?.usuario || {};
  const v = perfil?.veiculo;

  const dadosBasicosFields = (
    <>
      <CampoPerfil label="Nome"            valor={u.nome || '—'}        isEditing={isEditing} inputProps={{ type: 'text',  value: formData.nome,    onChange: (e) => setFormData({ ...formData, nome:    e.target.value }) }} />
      <CampoPerfil label="Usuário"         valor={`@${u.usuario || '—'}`} isEditing={isEditing} inputProps={{ type: 'text',  value: formData.usuario, onChange: (e) => setFormData({ ...formData, usuario: e.target.value }) }} />
      <CampoPerfil label="E-mail"          valor={u.email || '—'}       isEditing={isEditing} inputProps={{ type: 'email', value: formData.email,   onChange: (e) => setFormData({ ...formData, email:   e.target.value }) }} />
      <CampoPerfil label="Celular"         valor={u.celular || '—'}     isEditing={isEditing} inputProps={{ type: 'text',  value: formData.celular, onChange: (e) => setFormData({ ...formData, celular: e.target.value }) }} />
      <CampoPerfil label="CNH (Motorista)" valor={perfil?.cnh || '—'}   isEditing={isEditing} inputProps={{ type: 'text',  value: formData.cnh,     onChange: (e) => setFormData({ ...formData, cnh:     e.target.value }) }} />
    </>
  );

  const contaStatusFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">CPF</span>
        <span className={`perfil-campo__valor tabular-nums ${isEditing ? 'text-muted' : ''}`.trim()}>{u.cpf || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status do cadastro</span>
        <div className="perfil-campo__valor">
          {perfil?.statusCadastro ? (
            <Badge
              label={perfil.statusCadastro}
              color={perfil.statusCadastro === 'APROVADO' ? 'success' : perfil.statusCadastro === 'PENDENTE' ? 'warning' : 'danger'}
              dot
            />
          ) : '—'}
        </div>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status de presença</span>
        <div className="perfil-campo__valor">
          {perfil?.statusPresenca ? (
            <Badge
              label={STATUS_LABELS[perfil.statusPresenca]?.label || perfil.statusPresenca}
              color={STATUS_LABELS[perfil.statusPresenca]?.color || 'info'}
              dot
            />
          ) : '—'}
        </div>
      </div>
    </>
  );

  const veiculoFields = v ? (
    <>
      <div className="perfil-campo"><span className="perfil-campo__label">Marca</span><span className={`perfil-campo__valor ${isEditing ? 'text-muted' : ''}`.trim()}>{v.marca || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Modelo</span><span className={`perfil-campo__valor ${isEditing ? 'text-muted' : ''}`.trim()}>{v.modelo || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Placa</span><span className={`perfil-campo__valor tabular-nums ${isEditing ? 'text-muted' : ''}`.trim()}>{v.placa || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Ano</span><span className={`perfil-campo__valor tabular-nums ${isEditing ? 'text-muted' : ''}`.trim()}>{v.ano || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Cor</span><span className={`perfil-campo__valor ${isEditing ? 'text-muted' : ''}`.trim()}>{v.cor || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Porte</span><span className={`perfil-campo__valor ${isEditing ? 'text-muted' : ''}`.trim()}>{v.porte === 'Medio' ? 'Médio' : (v.porte || '—')}</span></div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Classe</span>
        <div className="perfil-campo__valor">{v.classe ? <Badge label={v.classe} color="info" /> : '—'}</div>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status de aprovação</span>
        <div className="perfil-campo__valor">
          {v.statusAprovacao ? (
            <Badge label={v.statusAprovacao} color={v.statusAprovacao === 'APROVADO' ? 'success' : 'warning'} dot />
          ) : '—'}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Perfil" subtitle="Seus dados cadastrais" />

      {error ? (
        <div className="form-error" role="alert">{error}</div>
      ) : isEditing ? (
        <div className="perfil-stack">
          <div className="card">
            <div className="card__header">
              <h2 className="card-section-title">Campos Editáveis</h2>
              <div className="btn-group">
                <Button type="button" size="sm" variant="outline" onClick={() => handleCancelClick(hasChanges)}>Cancelar</Button>
                <Button type="button" size="sm" variant="success" onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </div>
            <div className="card__body perfil-stack">
              <div className="perfil-section">
                <h3 className="perfil-section__title perfil-section__title--muted">Dados Básicos</h3>
                <div className="perfil-grid">{dadosBasicosFields}</div>
              </div>
              <div className="perfil-section">
                <h3 className="perfil-section__title perfil-section__title--muted">Endereço</h3>
                <div className="perfil-grid">
                  <CamposEnderecoPerfil
                    isEditing={isEditing}
                    enderecoAtual={u.endereco}
                    formEndereco={formData.endereco}
                    onChangeEndereco={(endereco) => setFormData({ ...formData, endereco })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card card--subtle">
            <div className="card__header">
              <h2 className="card-section-title text-muted">Campos Somente Leitura</h2>
            </div>
            <div className="card__body perfil-stack">
              <div className="perfil-section">
                <h3 className="perfil-section__title perfil-section__title--muted">Conta e Status</h3>
                <div className="perfil-grid">{contaStatusFields}</div>
              </div>
              {v && (
                <div className="perfil-section">
                  <h3 className="perfil-section__title perfil-section__title--muted">Veículo Vinculado</h3>
                  <div className="perfil-grid">{veiculoFields}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card__header">
            <h2 className="card-section-title">Informações do Motorista</h2>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
          </div>
          <div className="card__body perfil-stack">
            <div className="perfil-section">
              <h3 className="perfil-section__title">Dados Básicos</h3>
              <div className="perfil-grid">
                {dadosBasicosFields}
                {contaStatusFields}
              </div>
            </div>

            <div className="perfil-section">
              <h3 className="perfil-section__title">Endereço</h3>
              <div className="perfil-grid">
                <CamposEnderecoPerfil
                  isEditing={false}
                  enderecoAtual={u.endereco}
                  formEndereco={formData.endereco}
                  onChangeEndereco={(endereco) => setFormData({ ...formData, endereco })}
                />
              </div>
            </div>

            {v && (
              <div className="perfil-section">
                <h3 className="perfil-section__title">Veículo Vinculado</h3>
                <div className="perfil-grid">{veiculoFields}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Você possui alterações não salvas. Deseja perder essas alterações?"
        onConfirm={() => {
          const uData = perfil.usuario || {};
          resetForm({
            nome: uData.nome || '', usuario: uData.usuario || '', cpf: uData.cpf || '', celular: uData.celular || '', email: uData.email || '',
            endereco: uData.endereco || { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
            cnh: perfil.cnh || '',
          });
        }}
        onClose={() => setShowConfirm(false)}
      />
      <ModalErro
        isOpen={erroModal.aberto}
        onClose={() => setErroModal({ aberto: false, mensagem: '' })}
        titulo="Erro"
        mensagem={erroModal.mensagem}
      />
      <ModalInformacao
        isOpen={infoModal}
        onClose={() => setInfoModal(false)}
        titulo="Nenhuma alteração"
        mensagem="Nenhum dado foi alterado. Modifique alguma informação antes de salvar."
      />
    </div>
  );
};

export default PerfilMotoristaPage;
