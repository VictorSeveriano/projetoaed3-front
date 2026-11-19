import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { MOTIVO_MIN, MOTIVO_MAX, validarMotivo } from '../../utils/confirmacaoEmbarque';
import { useConfirmacaoEmbarque } from '../../hooks/useConfirmacaoEmbarque';
import { formatarDataHorario, formatarMoeda } from '../../utils/formatters';
import { MapPin, TriangleAlert } from 'lucide-react';

export { MOTIVO_MIN, MOTIVO_MAX, validarMotivo };

/**
 * ModalConfirmacaoEmbarque — Interface de confirmação de embarque para motorista e passageiro.
 * A lógica de envio, validação e transições de decisão reside no hook useConfirmacaoEmbarque.
 *
 * @param {object}   corrida
 * @param {'MOTORISTA'|'USUARIO'} perfil
 * @param {function} onClose      - Fecha sem decidir (a corrida pode ser reapresentada depois)
 * @param {function} onConcluido  - Chamado após registrar uma decisão com sucesso
 */
const ModalConfirmacaoEmbarque = ({ corrida, perfil, onClose, onConcluido }) => {
  const {
    ehMotorista,
    etapa,
    motivo,
    erro,
    loading,
    aCaminho,
    motoristaACaminho,
    irParaEtapa,
    atualizarMotivo,
    confirmarEmbarque,
    informarACaminho,
    registrarAguardando,
    confirmarCancelamento,
  } = useConfirmacaoEmbarque({ corrida, perfil, onConcluido });

  if (!corrida) return null;

  const resumo = (
    <div className="modal-summary">
      <div className="modal-summary__row">
        <MapPin size={14} aria-hidden="true" />
        <span>{corrida.origemNome}</span>
      </div>
      <div className="modal-summary__row">
        <MapPin size={14} aria-hidden="true" />
        <span>{corrida.destinoNome}</span>
      </div>
      <div className="modal-summary__meta">
        {formatarDataHorario(corrida.dataHorario)} • {formatarMoeda(corrida.valor)}
      </div>
    </div>
  );

  let titulo = ehMotorista ? 'O passageiro embarcou?' : 'Você embarcou na viagem?';
  let corpo;

  if (etapa === 'inicial') {
    corpo = (
      <>
        {resumo}
        {motoristaACaminho && (
          <p role="status" className="form-warning" style={{ marginBottom: 14 }}>
            O motorista informou que está a caminho.
          </p>
        )}
        <div className="modal-stack">
          <Button type="button" variant="success" loading={loading} onClick={confirmarEmbarque}>
            {ehMotorista ? 'Sim, o passageiro embarcou' : 'Sim, embarquei'}
          </Button>
          <Button type="button" variant="secondary" disabled={loading} onClick={() => irParaEtapa('naoEmbarcou')}>
            {ehMotorista ? 'Não embarcou' : 'Ainda não embarquei'}
          </Button>
        </div>
      </>
    );
  } else if (etapa === 'naoEmbarcou') {
    titulo = ehMotorista ? 'O que aconteceu?' : 'Ainda não embarcou';
    corpo = (
      <>
        {resumo}
        <div className="modal-stack">
          {ehMotorista ? (
            <>
              {!aCaminho && (
                <Button type="button" variant="secondary" loading={loading} onClick={informarACaminho}>
                  Estou a caminho
                </Button>
              )}
              <Button type="button" variant="danger" disabled={loading} onClick={() => irParaEtapa('motivo')}>
                Não vou embarcar o passageiro
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" loading={loading} onClick={registrarAguardando}>
                Aguardar o motorista
              </Button>
              <Button type="button" variant="danger" disabled={loading} onClick={() => irParaEtapa('motivo')}>
                Cancelar a viagem
              </Button>
            </>
          )}
          <Button type="button" variant="ghost" disabled={loading} onClick={() => irParaEtapa('inicial')}>
            Voltar
          </Button>
        </div>
      </>
    );
  } else {
    titulo = 'Cancelar viagem';
    const restante = MOTIVO_MAX - motivo.length;
    corpo = (
      <>
        {resumo}
        <div className="input-group">
          <label className="input-label" htmlFor="motivo-cancelamento-embarque">
            Motivo do cancelamento
            <span className="input-required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="motivo-cancelamento-embarque"
            className={`input-textarea ${erro ? 'input-field--error' : ''}`.trim()}
            value={motivo}
            maxLength={MOTIVO_MAX}
            rows={4}
            disabled={loading}
            placeholder="Descreva o motivo do cancelamento (mínimo 5 caracteres)..."
            onChange={(e) => atualizarMotivo(e.target.value)}
            aria-invalid={erro ? true : undefined}
          />
          <small className="char-counter">{restante} caracteres restantes</small>
        </div>
        <p className="text-secondary" style={{ marginTop: 12, fontSize: 'var(--font-sm)', lineHeight: 1.55 }}>
          Esta ação cancela a viagem e notifica {ehMotorista ? 'o passageiro' : 'o motorista'}. Não pode ser desfeita.
        </p>
        <div className="modal-stack" style={{ marginTop: 14 }}>
          <Button type="button" variant="danger" loading={loading} disabled={!motivo.trim()} onClick={confirmarCancelamento}>
            Confirmar cancelamento da viagem
          </Button>
          <Button type="button" variant="ghost" disabled={loading} onClick={() => irParaEtapa('naoEmbarcou')}>
            Voltar
          </Button>
        </div>
      </>
    );
  }

  return (
    <Modal isOpen onClose={loading ? () => {} : onClose} title={titulo} size="sm">
      {corpo}
      {erro && (
        <p role="alert" className="form-error" style={{ marginTop: 12 }}>
          <TriangleAlert size={16} aria-hidden="true" />
          <span>{erro}</span>
        </p>
      )}
    </Modal>
  );
};

export default ModalConfirmacaoEmbarque;
