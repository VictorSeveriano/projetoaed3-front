import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import usuariosService from '../../services/usuarios.service';
import { useAuth } from '../../context/AuthContext';
import { User, AtSign, Shield } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import ModalInformacao from '../../components/ui/ModalInformacao';
import { formatarData } from '../../utils/formatters';
import { usePerfilEdicao } from '../../hooks/usePerfilEdicao';

const PERFIL_LABELS = {
  ADMINISTRADOR: 'Administrador',
  USUARIO: 'Passageiro',
  MOTORISTA: 'Motorista',
};

/**
 * PerfilUsuarioPage — Perfil do usuário/passageiro autenticado.
 */
const PerfilUsuarioPage = () => {
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
    resetForm
  } = usePerfilEdicao({ 
    nome: '', usuario: '', cpf: '', email: '', celular: '', 
    endereco: { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
  });

  useEffect(() => {
    if (!usuario?.id) return;
    usuariosService.buscarPorId(usuario.id)
      .then((dados) => {
        setPerfil(dados);
        setFormData({
          nome: dados.nome || '',
          usuario: dados.usuario || '',
          cpf: dados.cpf || '',
          email: dados.email || '',
          celular: dados.celular || '',
          endereco: dados.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar perfil.'))
      .finally(() => setLoading(false));
  }, [usuario?.id]);

  if (loading) return <Loading message="Carregando perfil..." />;

  const hasChanges = perfil && (perfil.nome !== formData.nome || perfil.usuario !== formData.usuario || perfil.cpf !== formData.cpf || perfil.email !== formData.email || perfil.celular !== formData.celular || isAddressDifferent(perfil.endereco, formData.endereco));

  const handleSave = async () => {
    if (!hasChanges) {
      setInfoModal(true);
      return;
    }
    try {
      const updated = await usuariosService.atualizar(usuario.id, formData);
      setPerfil(updated);
      setIsEditing(false);
    } catch (err) {
      setErroModal({ aberto: true, mensagem: err.response?.data?.message || 'Erro ao salvar.' });
    }
  };

  const editableFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome Completo</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
          ) : <span>{perfil?.nome || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
          ) : <span>@{perfil?.usuario || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : <span>{perfil?.email || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : <span>{perfil?.celular || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Endereço</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isEditing ? (
            <>
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Rua" value={formData.endereco.rua || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, rua: e.target.value } })} />
              <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Bairro" value={formData.endereco.bairro || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Número" value={formData.endereco.numero || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })} />
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="CEP" value={formData.endereco.cep || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="Cidade" value={formData.endereco.cidade || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })} />
                <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} placeholder="UF" value={formData.endereco.estado || ''} onChange={e => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })} />
              </div>
            </>
          ) : (
            <span>
              {perfil?.endereco ? (
                <>
                  {perfil.endereco.rua}, {perfil.endereco.numero} - {perfil.endereco.bairro}<br />
                  {perfil.endereco.cidade}/{perfil.endereco.estado} - CEP: {perfil.endereco.cep}
                </>
              ) : '—'}
            </span>
          )}
        </span>
      </div>
    </>
  );

  const readonlyFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">CPF</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{perfil?.cpf || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Perfil</span>
        <span className="perfil-campo__valor">
          <Badge label={PERFIL_LABELS[perfil?.perfil] || perfil?.perfil || '—'} color={perfil?.perfil === 'ADMINISTRADOR' ? 'danger' : perfil?.perfil === 'MOTORISTA' ? 'warning' : 'info'} />
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cadastro</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{perfil?.criadoEm ? formatarData(perfil.criadoEm) : '—'}</span>
      </div>
    </>
  );

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Perfil" subtitle="Seus dados cadastrais" />

      {error ? (
        <div className="form-error" role="alert">{error}</div>
      ) : (
        <div className="card">
          <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-section-title">Informações da conta</h2>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => handleCancelClick(hasChanges)}>Cancelar</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
            )}
          </div>
          <div className="card__body">
            {isEditing ? (
              <>
                <div className="perfil-section">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    Campos Editáveis
                  </h3>
                  <div className="perfil-grid" style={{ marginBottom: '24px' }}>
                    {editableFields}
                  </div>
                </div>

                <div className="perfil-section" style={{ background: 'var(--bg-800)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>
                    Campos Somente Leitura
                  </h3>
                  <div className="perfil-grid">
                    {readonlyFields}
                  </div>
                </div>
              </>
            ) : (
              <div className="perfil-grid">
                {editableFields}
                {readonlyFields}
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
          resetForm({
            nome: perfil.nome || '', usuario: perfil.usuario || '', cpf: perfil.cpf || '',
            email: perfil.email || '', celular: perfil.celular || '',
            endereco: perfil.endereco || { rua: '', bairro: '', cidade: '', estado: '', numero: '', cep: '' }
          });
        }} 
        onCancel={() => setShowConfirm(false)} 
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

export default PerfilUsuarioPage;
