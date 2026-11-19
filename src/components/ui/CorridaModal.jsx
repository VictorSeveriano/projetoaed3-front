import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import ModalErro from './ModalErro';
import Input from './Input';
import Button from './Button';
import corridasService from '../../services/corridas.service';
import { formatarMoeda } from '../../utils/formatters';
import {
  converterDataHorarioComercialParaISO,
  obterMinDatetimeComercial,
  montarPayloadCriacaoCorrida,
} from '../../utils/corridaPayload';
import { Route, Check, TriangleAlert, MapPin, Clock } from 'lucide-react';

/**
 * CorridaModal — Modal de confirmação de solicitação de corrida.
 */
const CorridaModal = ({
  isOpen, onClose, rota, origemNome, destinoNome,
  origemGeocodificada, destinoGeocodificada,
  origemEndereco, destinoEndereco, onSuccess,
}) => {
  const [dataHorario, setDataHorario] = useState('');
  const [classe, setClasse] = useState('NORMAL');
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [erroModal, setErroModal] = useState({ open: false, mensagem: '' });

  const [valorCalculado, setValorCalculado] = useState(null);
  const [calculandoValor, setCalculandoValor] = useState(false);
  const [erroPrevia, setErroPrevia] = useState(null);

  const isDirty = dataHorario !== '';

  useEffect(() => {
    if (isOpen) {
      setDataHorario('');
      setClasse('NORMAL');
      setFormaPagamento('DINHEIRO');
      setError('');
      setSuccessMsg('');
      setValorCalculado(null);
      setCalculandoValor(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!dataHorario || !classe || !rota?.distanciaKm) {
      setValorCalculado(null);
      setErroPrevia(null);
      return;
    }

    const dist = Number(rota.distanciaKm);
    if (!Number.isFinite(dist) || dist <= 0) {
      setValorCalculado(null);
      setErroPrevia({
        titulo: 'Falha na distância',
        mensagem: 'Não foi possível calcular o valor porque a distância da rota não está disponível. Selecione uma rota válida e tente novamente.',
      });
      return;
    }

    let dataHorarioIso;
    try {
      dataHorarioIso = converterDataHorarioComercialParaISO(dataHorario);
    } catch {
      setValorCalculado(null);
      setErroPrevia({
        titulo: 'Data inválida',
        mensagem: 'Não foi possível calcular o valor porque a data e o horário informados são inválidos. Verifique os dados e tente novamente.',
      });
      return;
    }

    let isActive = true;
    setCalculandoValor(true);
    setErroPrevia(null);

    const calcular = async () => {
      try {
        const resposta = await corridasService.calcularValorPrevia({
          distanciaKm: dist,
          classe,
          dataHorario: dataHorarioIso,
        });

        const valorRecebido = resposta?.valor;
        if (
          valorRecebido == null ||
          typeof valorRecebido !== 'number' ||
          !Number.isFinite(valorRecebido) ||
          valorRecebido <= 0
        ) {
          if (isActive) {
            setValorCalculado(null);
            setErroPrevia({
              titulo: 'Resposta inválida',
              mensagem: 'O sistema não recebeu um valor válido para esta corrida. A solicitação não pode continuar.',
            });
          }
          return;
        }

        if (isActive) {
          setValorCalculado(valorRecebido);
          setErroPrevia(null);
        }
      } catch (err) {
        if (isActive) {
          setValorCalculado(null);
          const msg = err?.response?.data?.message || '';
          if (msg.toLowerCase().includes('distancia') || msg.toLowerCase().includes('dist\u00e2ncia')) {
            setErroPrevia({
              titulo: 'Falha na distância',
              mensagem: 'Não foi possível calcular o valor porque a distância da rota não está disponível. Selecione uma rota válida e tente novamente.',
            });
          } else if (msg.toLowerCase().includes('datahora') || msg.toLowerCase().includes('data') || msg.toLowerCase().includes('hor')) {
            setErroPrevia({
              titulo: 'Data inválida',
              mensagem: 'Não foi possível calcular o valor porque a data e o horário informados são inválidos. Verifique os dados e tente novamente.',
            });
          } else {
            setErroPrevia({
              titulo: 'Serviço indisponível',
              mensagem: 'Não foi possível calcular o valor da corrida no momento. Tente novamente em alguns instantes.',
            });
          }
        }
      } finally {
        if (isActive) setCalculandoValor(false);
      }
    };

    const timeout = setTimeout(calcular, 300);
    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [classe, dataHorario, rota]);

  const handleCloseRequest = () => {
    if (isDirty && !successMsg && !loading) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmarCorrida = async () => {
    if (!dataHorario) {
      setError('Informe a data e horário desejados para a corrida.');
      return;
    }
    if (!rota) { setError('Selecione uma rota primeiro.'); return; }

    let payload;
    try {
      payload = montarPayloadCriacaoCorrida({
        origemNome,
        destinoNome,
        origemGeocodificada,
        destinoGeocodificada,
        origemEndereco,
        destinoEndereco,
        rota,
        dataHorario,
        classe,
        formaPagamento,
      });
    } catch (validationErr) {
      setError(validationErr.message || 'Dados da corrida inválidos.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const corridaCriada = await corridasService.criar(payload);

      const valorRetornado = corridaCriada?.valor;
      if (
        valorRetornado == null ||
        typeof valorRetornado !== 'number' ||
        !Number.isFinite(valorRetornado) ||
        valorRetornado <= 0
      ) {
        setErroModal({
          open: true,
          mensagem: 'A corrida foi criada, mas o sistema não retornou um valor válido. Entre em contato com o suporte.',
        });
        return;
      }

      setSuccessMsg('Corrida solicitada com sucesso! Os motoristas elegíveis serão notificados.');
      if (onSuccess) onSuccess();
      setTimeout(() => { onClose(); setSuccessMsg(''); }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao solicitar a corrida. Tente novamente.';
      if (msg.toLowerCase().includes('nao ha veiculos') || msg.toLowerCase().includes('classe')) {
        setErroModal({
          open: true,
          mensagem: 'Não há carros do tipo selecionado disponíveis para alugar. Selecione outro, por favor.',
        });
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const minDatetime = obterMinDatetimeComercial();

  const CLASSES = [
    { value: 'BASICO',  label: 'Pequeno', desc: 'Hatch ou sedan compacto' },
    { value: 'NORMAL',  label: 'Médio',   desc: 'Sedan médio ou SUV compacto' },
    { value: 'PREMIUM', label: 'Grande',  desc: 'SUV grande ou veículo de luxo' },
  ];

  const FORMAS_PAGAMENTO = [
    { value: 'DINHEIRO',       label: 'Dinheiro' },
    { value: 'CARTAO_DEBITO',  label: 'Cartão de Débito' },
    { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
    { value: 'PIX',            label: 'PIX' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseRequest}
        title="Confirmar Corrida"
        size="lg"
        footer={
          !successMsg && (
            <div className="reserva-form__actions">
              <Button type="button" variant="outline" onClick={handleCloseRequest} disabled={loading}>
                Cancelar
              </Button>
              <Button id="btn-confirmar-corrida" type="button" onClick={confirmarCorrida} loading={loading}>
                <Check size={16} aria-hidden="true" />
                Confirmar Corrida
              </Button>
            </div>
          )
        }
      >
        {successMsg ? (
          <div className="success-banner" role="status">{successMsg}</div>
        ) : (
          <div className="reserva-form">
            {/* Resumo do trajeto */}
            {rota && (
              <div className="corrida-resumo">
                <div className="corrida-resumo__row">
                  <MapPin size={14} aria-hidden="true" />
                  <span className="corrida-resumo__label">Origem:</span>
                  <span className="corrida-resumo__valor">{origemNome}</span>
                </div>
                <div className="corrida-resumo__row">
                  <MapPin size={14} aria-hidden="true" />
                  <span className="corrida-resumo__label">Destino:</span>
                  <span className="corrida-resumo__valor">{destinoNome}</span>
                </div>

                {/* Caminho visual */}
                <div className="corrida-caminho">
                  {rota.caminho.map((loc, i) => (
                    <span key={i} className="corrida-caminho__step">
                      {i > 0 && <span className="corrida-caminho__arrow" aria-hidden="true">→</span>}
                      <span className="corrida-caminho__loc">{loc}</span>
                    </span>
                  ))}
                </div>

                <div className="corrida-metrics">
                  <div className="corrida-metric">
                    <Route size={14} aria-hidden="true" />
                    <span>{rota.distanciaFormatada}</span>
                  </div>
                  <div className="corrida-metric">
                    <Clock size={14} aria-hidden="true" />
                    <span>{rota.duracaoFormatada}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Seleção de classe do veículo */}
            <div className="input-group">
              <span className="input-label" id="label-classe-veiculo">
                Porte do Veículo <span className="input-required" aria-hidden="true">*</span>
              </span>
              <div
                role="radiogroup"
                aria-labelledby="label-classe-veiculo"
                className="option-card-grid"
              >
                {CLASSES.map((c) => (
                  <label
                    key={c.value}
                    htmlFor={`classe-${c.value}`}
                    className={`option-card ${classe === c.value ? 'option-card--selected' : ''}`.trim()}
                  >
                    <input
                      id={`classe-${c.value}`}
                      type="radio"
                      name="classe"
                      value={c.value}
                      checked={classe === c.value}
                      onChange={() => setClasse(c.value)}
                      className="sr-only"
                    />
                    <span className="option-card__title">{c.label}</span>
                    <span className="option-card__desc">{c.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seleção de forma de pagamento */}
            <div className="input-group">
              <span className="input-label" id="label-forma-pagamento">
                Forma de Pagamento <span className="input-required" aria-hidden="true">*</span>
                <span className="input-hint">
                  (pagamento realizado presencialmente no ato da viagem)
                </span>
              </span>
              <div
                role="radiogroup"
                aria-labelledby="label-forma-pagamento"
                className="option-card-grid"
              >
                {FORMAS_PAGAMENTO.map((fp) => (
                  <label
                    key={fp.value}
                    htmlFor={`pagamento-${fp.value}`}
                    className={`option-card ${formaPagamento === fp.value ? 'option-card--selected' : ''}`.trim()}
                  >
                    <input
                      id={`pagamento-${fp.value}`}
                      type="radio"
                      name="formaPagamento"
                      value={fp.value}
                      checked={formaPagamento === fp.value}
                      onChange={() => setFormaPagamento(fp.value)}
                      className="sr-only"
                    />
                    <span className="option-card__title">{fp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data e horário */}
            <Input
              id="input-data-horario"
              name="dataHorario"
              label="Data e Horário da Corrida"
              required
              type="datetime-local"
              value={dataHorario}
              min={minDatetime}
              onChange={(e) => setDataHorario(e.target.value)}
            />

            {/* Exibição Dinâmica do Valor */}
            <div className="valor-corrida-container" aria-live="polite">
              <div>
                <span className="valor-corrida-container__label">Valor da corrida</span>
                {(!dataHorario || !classe) && (
                  <span className="valor-corrida-container__hint">
                    Selecione o porte e o horário para calcular
                  </span>
                )}
              </div>
              <div className="valor-corrida-container__price">
                {calculandoValor
                  ? 'Calculando...'
                  : valorCalculado !== null
                    ? formatarMoeda(valorCalculado)
                    : '—'}
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => { setShowExitConfirm(false); onClose(); }}
        title="Sair sem confirmar?"
        message="Você preencheu dados nesta corrida. Se sair agora, os dados serão perdidos."
        confirmText="Sair sem confirmar"
        cancelText="Continuar preenchendo"
        variant="warning"
      />

      {/* Modal de erro para indisponibilidade de classe ou falha na prévia */}
      <ModalErro
        isOpen={erroModal.open || !!erroPrevia}
        onClose={() => {
          setErroModal({ open: false, mensagem: '' });
          setErroPrevia(null);
        }}
        titulo={erroModal.open ? 'Classe indisponível' : (erroPrevia?.titulo || 'Erro')}
        mensagem={erroModal.open ? erroModal.mensagem : (erroPrevia?.mensagem || '')}
      />
    </>
  );
};

export default CorridaModal;
