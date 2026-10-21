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
  const [perfil, setPerfil]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  
  const {
    isEditing, setIsEditing,
    showConfirm, setShowConfirm,
    erroModal, setErroModal,
    infoModal, setInfoModal,
    formData, setFormData,
    isAddressDifferent,
    handleCancelClick,
    resetForm
  } = usePerfilEdicao({
    nome: '', usuario: '', cpf: '', celular: '', email: '',
    endereco: { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
    cnh: ''
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
          cnh: dados.cnh || ''
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
        celular: formData.celular, email: formData.email, endereco: formData.endereco
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
      <CampoPerfil label="Nome"          valor={u.nome    || '—'} isEditing={isEditing} inputProps={{ type: 'text',  value: formData.nome,    onChange: e => setFormData({ ...formData, nome:    e.target.value }) }} />
      <CampoPerfil label="Usuário"       valor={`@${u.usuario || '—'}`} isEditing={isEditing} inputProps={{ type: 'text',  value: formData.usuario, onChange: e => setFormData({ ...formData, usuario: e.target.value }) }} />
      <CampoPerfil label="E-mail"        valor={u.email   || '—'} isEditing={isEditing} inputProps={{ type: 'email', value: formData.email,   onChange: e => setFormData({ ...formData, email:   e.target.value }) }} />
      <CampoPerfil label="Celular"       valor={u.celular || '—'} isEditing={isEditing} inputProps={{ type: 'text',  value: formData.celular, onChange: e => setFormData({ ...formData, celular: e.target.value }) }} />
      <CampoPerfil label="CNH (Motorista)" valor={perfil?.cnh || '—'} isEditing={isEditing} inputProps={{ type: 'text', value: formData.cnh, onChange: e => setFormData({ ...formData, cnh: e.target.value }) }} />
    </>
  );

  const contaStatusFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">CPF</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{u.cpf || '—'}</span>
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
    </>
  );

  const veiculoFields = v ? (
    <>
      <div className="perfil-campo"><span className="perfil-campo__label">Marca</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.marca || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Modelo</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.modelo || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Placa</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.placa || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Ano</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.ano || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Cor</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.cor || '—'}</span></div>
      <div className="perfil-campo"><span className="perfil-campo__label">Porte</span><span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.porte || '—'}</span></div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Classe</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.classe ? <Badge label={v.classe} color="info" /> : '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Status de aprovação</span>
        <div className="perfil-campo__valor">
          {v.statusAprovacao ? (
            <Badge label={v.statusAprovacao} color={v.statusAprovacao === 'APROVADO' ? 'success' : 'warning'} />
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
      ) : (
        <div className="card" style={isEditing ? { display: 'flex', flexDirection: 'column', gap: '24px', background: 'transparent', boxShadow: 'none' } : {}}>
          {isEditing ? (
            <>
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="card-section-title" style={{ color: 'var(--text-primary)' }}>Campos Editáveis</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" variant="success" onClick={handleSave}>Salvar Alterações</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancelClick(hasChanges)}>Cancelar</Button>
                  </div>
                </div>
                <div className="card__body">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>Dados Básicos</h3>
                  <div className="perfil-grid" style={{ marginBottom: '24px' }}>
                    {dadosBasicosFields}
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>Endereço</h3>
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

              <div className="card" style={{ marginBottom: 0, background: 'var(--bg-800)' }}>
                <div className="card__header">
                  <h2 className="card-section-title" style={{ color: 'var(--text-muted)' }}>Campos Somente Leitura</h2>
                </div>
                <div className="card__body">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>Conta e Status</h3>
                  <div className="perfil-grid" style={{ marginBottom: '24px' }}>
                    {contaStatusFields}
                  </div>

                  {v && (
                    <>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>Veículo</h3>
                      <div className="perfil-grid">
                        {veiculoFields}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-section-title">Informações do Motorista</h2>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
              </div>
              <div className="card__body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Dados Básicos</h3>
                    <div className="perfil-grid">
                      {dadosBasicosFields}
                      {contaStatusFields}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Endereço</h3>
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
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Veículo Vinculado</h3>
                      <div className="perfil-grid">
                        {veiculoFields}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
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
            cnh: perfil.cnh || ''
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
