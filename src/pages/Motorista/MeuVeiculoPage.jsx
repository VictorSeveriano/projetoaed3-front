import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Loading from '../../components/ui/Loading';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import motoistasService from '../../services/motoristas.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_LABELS, formatarMoeda } from '../../utils/formatters';
import { Car, Tag, Hash, Calendar, DollarSign } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ModalErro from '../../components/ui/ModalErro';
import veiculosService from '../../services/veiculos.service';
import api from '../../services/api';
import { VeiculoFormCadastro } from '../../components/ui/VeiculoFormCadastro';
import { VeiculoCardEdicao } from '../../components/ui/VeiculoCardEdicao';

/**
 * MeuVeiculoPage — Veículo associado ao motorista autenticado.
 *
 * Tela separada (não incorporada ao perfil) porque o veículo possui
 * status, categoria e tarifaBase além do que cabe no perfil confortavelmente.
 * Decisão documentada: seção 4 do documento de requisitos.
 */
const MeuVeiculoPage = () => {
  const { usuario } = useAuth();
  const [veiculo, setVeiculo] = useState(null);
  const [motoristaPerfil, setMotoristaPerfil] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erroModal, setErroModal] = useState({ aberto: false, mensagem: '' });
  
  const [form, setForm] = useState({ 
    modelo: '', marca: '', ano: '', placa: '', porte: 'Pequeno', cor: '', quilometragem: '', quantidadePassageiros: 4,
    possuiArCondicionado: false, possuiExtintor: false, possuiCintoSeguranca: false, documentacaoRegularizada: false
  });
  const [submitting, setSubmitting] = useState(false);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      motoistasService.buscarVeiculo(usuario.id),
      motoistasService.buscarPorUsuarioId(usuario.id),
    ])
      .then(([dados, perfil]) => {
        setVeiculo(dados);
        setMotoristaPerfil(perfil);
        if (dados) {
          setForm({
            modelo: dados.modelo || '', marca: dados.marca || '', ano: dados.ano || '', placa: dados.placa || '', porte: dados.porte || 'Pequeno', cor: dados.cor || '', quilometragem: dados.quilometragem || '', quantidadePassageiros: dados.quantidadePassageiros || 4,
            possuiArCondicionado: dados.possuiArCondicionado || false, possuiExtintor: dados.possuiExtintor || false, possuiCintoSeguranca: dados.possuiCintoSeguranca || false, documentacaoRegularizada: dados.documentacaoRegularizada || false
          });
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Erro ao carregar veículo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (usuario?.id) carregar();
  }, [usuario?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.modelo || !form.marca || !form.ano || !form.placa) {
      setError('Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/veiculos', { ...form, ano: parseInt(form.ano, 10), usuarioId: usuario.id });
      carregar();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar veículo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Carregando veículo..." />;

  if (error) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Veículo associado à sua conta" />
        <div className="form-error" role="alert">{error}</div>
      </div>
    );
  }

  if (motoristaPerfil?.statusCadastro !== 'APROVADO') {
    const mensagem = motoristaPerfil?.statusCadastro === 'PENDENTE'
      ? 'Sua CNH ainda aguarda aprovação de um administrador. O cadastro do veículo ficará disponível após a aprovação do perfil. Você só poderá receber e aceitar corridas quando o perfil e o veículo estiverem aprovados.'
      : motoristaPerfil
        ? 'Seu perfil de motorista não está aprovado. Entre em contato com um administrador para verificar os requisitos antes de cadastrar um veículo ou receber corridas.'
        : 'Envie sua solicitação de motorista e aguarde a aprovação da CNH antes de cadastrar um veículo ou receber corridas.';

    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Veículo associado à sua conta" />
        <EmptyState
          icon={<Car size={48} strokeWidth={1.5} />}
          title="Requisitos pendentes"
          description={mensagem}
        />
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div className="page animate-fade-in">
        <Header title="Meu Veículo" subtitle="Cadastre seu veículo para realizar corridas" />
        <VeiculoFormCadastro form={form} setForm={setForm} handleSubmit={handleSubmit} submitting={submitting} />
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[veiculo.status] || { label: veiculo.status, color: 'muted' };

  const hasChanges = veiculo && (
    veiculo.marca !== form.marca || veiculo.modelo !== form.modelo || veiculo.placa !== form.placa || String(veiculo.ano) !== String(form.ano) || veiculo.cor !== form.cor || veiculo.porte !== form.porte ||
    String(veiculo.quilometragem || '') !== String(form.quilometragem || '') || String(veiculo.quantidadePassageiros) !== String(form.quantidadePassageiros) ||
    veiculo.possuiArCondicionado !== form.possuiArCondicionado || veiculo.possuiExtintor !== form.possuiExtintor || veiculo.possuiCintoSeguranca !== form.possuiCintoSeguranca || veiculo.documentacaoRegularizada !== form.documentacaoRegularizada
  );

  const handleCancelClick = () => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveEdits = async () => {
    try {
      const dataUpdate = { ...form, ano: parseInt(form.ano, 10), quilometragem: parseInt(form.quilometragem, 10) || 0, quantidadePassageiros: parseInt(form.quantidadePassageiros, 10) || 4 };
      await veiculosService.atualizar(veiculo.id, dataUpdate);
      carregar();
      setIsEditing(false);
    } catch (err) {
      setErroModal({ aberto: true, mensagem: err.response?.data?.message || 'Erro ao salvar.' });
    }
  };

  return (
    <div className="page animate-fade-in">
      <Header title="Meu Veículo" subtitle="Informações do veículo vinculado à sua conta" />

      {veiculo.statusAprovacao !== 'APROVADO' && (
        <div className="form-error" role="status" style={{ marginBottom: '16px' }}>
          O administrador ainda precisa aprovar seu veículo. Até a aprovação, você não receberá nem poderá aceitar corridas.
        </div>
      )}

      <VeiculoCardEdicao
        veiculo={veiculo}
        form={form}
        setForm={setForm}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleCancelClick={handleCancelClick}
        handleSaveEdits={handleSaveEdits}
      />
      <ConfirmationModal 
        isOpen={showConfirm} 
        title="Descartar alterações?" 
        message="Você possui alterações não salvas. Deseja perder essas alterações?" 
        onConfirm={() => {
          setShowConfirm(false);
          setIsEditing(false);
          setForm({
            modelo: veiculo.modelo || '', marca: veiculo.marca || '', ano: veiculo.ano || '', placa: veiculo.placa || '', porte: veiculo.porte || 'Pequeno', cor: veiculo.cor || '', quilometragem: veiculo.quilometragem || '', quantidadePassageiros: veiculo.quantidadePassageiros || 4,
            possuiArCondicionado: veiculo.possuiArCondicionado || false, possuiExtintor: veiculo.possuiExtintor || false, possuiCintoSeguranca: veiculo.possuiCintoSeguranca || false, documentacaoRegularizada: veiculo.documentacaoRegularizada || false
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

export default MeuVeiculoPage;
