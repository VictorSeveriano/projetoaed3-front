import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import reservasService from '../../services/reservas.service';
import grafoService from '../../services/grafo.service';
import { isEndAfterStart } from '../../utils/validators';
import { Route, TriangleAlert, Check } from 'lucide-react';

const ReservaModal = ({ isOpen, onClose, carro, localizacoes, onSuccess }) => {
  const [form, setForm] = useState({ dataInicio: '', dataFim: '', localRetirada: '', localDevolucao: '' });
  const [rota, setRota] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && carro) {
      setForm({ dataInicio: '', dataFim: '', localRetirada: carro.localizacao, localDevolucao: '' });
      setRota(null);
      setFormError('');
      setSuccessMsg('');
    }
  }, [isOpen, carro]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRota(null); setFormError('');
  };

  const calcularRota = async () => {
    if (!form.localRetirada || !form.localDevolucao) { setFormError('Informe os locais de retirada e devolucao.'); return; }
    if (form.localRetirada === form.localDevolucao) { setRota({ caminho: [form.localRetirada], distanciaTotal: 0 }); return; }
    try {
      const res = await grafoService.calcularRota(form.localRetirada, form.localDevolucao);
      setRota(res.data);
    } catch { setFormError('Nao foi possivel calcular a rota entre os pontos selecionados.'); }
  };

  const confirmarReserva = async () => {
    setFormError('');
    if (!form.dataInicio || !form.dataFim || !form.localRetirada || !form.localDevolucao) {
      setFormError('Preencha todos os campos.'); return;
    }
    if (!isEndAfterStart(form.dataInicio, form.dataFim)) {
      setFormError('A data de fim deve ser posterior a data de inicio.'); return;
    }
    setFormLoading(true);
    try {
      await reservasService.criar({
        usuarioId: '1',
        carroId: carro.id,
        ...form,
      });
      setSuccessMsg('Reserva criada com sucesso!');
      if (onSuccess) onSuccess();
      setTimeout(() => { onClose(); setSuccessMsg(''); }, 1800);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao criar reserva.');
    } finally { setFormLoading(false); }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reservar: ${carro?.marca} ${carro?.modelo}`}
      size="lg"
      footer={
        !successMsg && (
          <div className="reserva-form__actions">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button id="btn-confirmar-reserva" onClick={confirmarReserva} loading={formLoading}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Check size={16} /> Confirmar Reserva</span>
            </Button>
          </div>
        )
      }
    >
      {successMsg ? (
        <div className="success-banner">{successMsg}</div>
      ) : (
        <div className="reserva-form">
          <div className="reserva-form__row">
            <Input id="dataInicio" name="dataInicio" label="Data Início" type="date" value={form.dataInicio} onChange={handleFormChange} />
            <Input id="dataFim"    name="dataFim"    label="Data Fim"   type="date" value={form.dataFim}    onChange={handleFormChange} />
          </div>
          <div className="reserva-form__row">
            <Select id="localRetirada"   name="localRetirada"   label="Local de Retirada"   value={form.localRetirada}   onChange={handleFormChange}>
              <option value="">Selecione...</option>
              {localizacoes.map((l) => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </Select>
            <Select id="localDevolucao"  name="localDevolucao"  label="Local de Devolução"  value={form.localDevolucao}  onChange={handleFormChange}>
              <option value="">Selecione...</option>
              {localizacoes.map((l) => <option key={l.id} value={l.nome}>{l.nome}</option>)}
            </Select>
          </div>

          <Button id="btn-calcular-rota" variant="secondary" onClick={calcularRota} size="sm">
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Route size={16} /> Calcular Rota (Dijkstra)</span>
          </Button>

          {rota && (
            <div className="rota-preview">
              <p className="rota-preview__title">Menor Caminho Encontrado</p>
              <p className="rota-preview__path">{rota.caminho?.join(' → ')}</p>
              <p className="rota-preview__distance">Distância Total: <strong>{rota.distanciaTotal} km</strong></p>
            </div>
          )}

          {formError && <div className="form-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TriangleAlert size={16} /> {formError}</div>}
        </div>
      )}
    </Modal>
  );
};

export default ReservaModal;
