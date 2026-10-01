import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import motoristasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS } from '../../utils/formatters';
import { User, AtSign, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import ModalInformacao from '../../components/ui/ModalInformacao';
import usuariosService from '../../services/usuarios.service';

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
  
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erroModal, setErroModal] = useState({ aberto: false, mensagem: '' });
  const [infoModal, setInfoModal] = useState(false);
  
  const [formData, setFormData] = useState({
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
  }, [usuario?.id]);

  if (loading) return <Loading message="Carregando perfil..." />;

  const isAddressDifferent = (addr1, addr2) => {
    const a1 = addr1 || {};
    const a2 = addr2 || {};
    return a1.rua !== a2.rua || a1.bairro !== a2.bairro || a1.cidade !== a2.cidade || a1.estado !== a2.estado || a1.numero !== a2.numero || a1.cep !== a2.cep;
  };

  const hasChanges = perfil && (
    perfil.usuario?.nome !== formData.nome || perfil.usuario?.usuario !== formData.usuario || 
    perfil.usuario?.cpf !== formData.cpf || perfil.usuario?.celular !== formData.celular || 
    perfil.usuario?.email !== formData.email || perfil.cnh !== formData.cnh || 
    isAddressDifferent(perfil.usuario?.endereco, formData.endereco)
  );

  const handleCancelClick = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setInfoModal(true);
      return;
    }
    try {
      // 1. Atualiza o usuario (dados pessoais e endereço)
      const uData = {
        nome: formData.nome, usuario: formData.usuario, cpf: formData.cpf, celular: formData.celular, email: formData.email, endereco: formData.endereco
      };
      await usuariosService.atualizar(usuario.id, uData);
      
      // 2. Atualiza o motorista (cnh)
      if (formData.cnh !== perfil.cnh) {
        await motoristasService.atualizar(perfil.id, { cnh: formData.cnh });
      }

      // Reload
      const dados = await motoristasService.buscarPorUsuarioId(usuario.id);
      setPerfil(dados);
      setIsEditing(false);
    } catch (err) {
      setErroModal({ aberto: true, mensagem: err.response?.data?.message || 'Erro ao salvar.' });
    }
  };

  const u = perfil?.usuario || {};
  const e = u.endereco || {};
  const v = perfil?.veiculo;

  const dadosBasicosFields = (
    <>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Nome</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
          ) : <span>{u.nome || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Usuário</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
          ) : <span>@{u.usuario || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">E-mail</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          ) : <span>{u.email || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Celular</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} />
          ) : <span>{u.celular || '—'}</span>}
        </span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">CNH (Motorista)</span>
        <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditing ? (
            <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cnh} onChange={e => setFormData({ ...formData, cnh: e.target.value })} />
          ) : <span>{perfil?.cnh || '—'}</span>}
        </span>
      </div>
    </>
  );

  const enderecoFields = isEditing ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
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
    </div>
  ) : (
    <>
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
      <div className="perfil-campo">
        <span className="perfil-campo__label">Marca</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.marca || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Modelo</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.modelo || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Placa</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.placa || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Ano</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.ano || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Cor</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.cor || '—'}</span>
      </div>
      <div className="perfil-campo">
        <span className="perfil-campo__label">Porte</span>
        <span className="perfil-campo__valor" style={{ color: isEditing ? 'var(--text-muted)' : 'inherit' }}>{v.porte || '—'}</span>
      </div>
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
              {/* SECÃO 1: CAMPOS EDITÁVEIS */}
              <div className="card" style={{ marginBottom: 0 }}>
                <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="card-section-title" style={{ color: 'var(--text-primary)' }}>Campos Editáveis</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button size="sm" variant="success" onClick={handleSave}>Salvar Alterações</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelClick}>Cancelar</Button>
                  </div>
                </div>
                <div className="card__body">
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>Dados Básicos</h3>
                  <div className="perfil-grid" style={{ marginBottom: '24px' }}>
                    {dadosBasicosFields}
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)' }}>Endereço</h3>
                  <div className="perfil-grid">
                    {enderecoFields}
                  </div>
                </div>
              </div>

              {/* SECÃO 2: CAMPOS SOMENTE LEITURA */}
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
                      {enderecoFields}
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
          setShowConfirm(false);
          setIsEditing(false);
          const uData = perfil.usuario || {};
          setFormData({
            nome: uData.nome || '', usuario: uData.usuario || '', cpf: uData.cpf || '', celular: uData.celular || '', email: uData.email || '',
            endereco: uData.endereco || { rua: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' },
            cnh: perfil.cnh || ''
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

export default PerfilMotoristaPage;
