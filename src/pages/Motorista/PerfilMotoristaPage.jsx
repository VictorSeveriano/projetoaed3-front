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

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Perfil" subtitle="Seus dados cadastrais" />

      {error ? (
        <div className="form-error" role="alert">{error}</div>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 24px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="success" onClick={handleSave}>Salvar Alterações</Button>
                <Button size="sm" variant="outline" onClick={handleCancelClick}>Cancelar</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
            )}
          </div>
          
          {/* Dados Pessoais */}
          <div>
            <div className="card__header">
              <h2 className="card-section-title">Dados Pessoais</h2>
            </div>
            <div className="card__body">
              <div className="perfil-grid">
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
                  <span className="perfil-campo__label">CPF</span>
                  <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditing ? (
                      <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                    ) : <span>{u.cpf || '—'}</span>}
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
                  <span className="perfil-campo__label">E-mail</span>
                  <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditing ? (
                      <input type="email" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    ) : <span>{u.email || '—'}</span>}
                  </span>
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
                {isEditing ? (
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
                )}
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
                  <span className="perfil-campo__valor" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isEditing ? (
                      <input type="text" className="input-field" style={{ padding: '4px', height: 'auto', width: '100%' }} value={formData.cnh} onChange={e => setFormData({ ...formData, cnh: e.target.value })} />
                    ) : <span>{perfil?.cnh || '—'}</span>}
                  </span>
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
    </div>
  );
};

export default PerfilMotoristaPage;
