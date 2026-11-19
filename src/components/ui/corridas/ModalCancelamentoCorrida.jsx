import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { MOTIVO_MAX } from '../../../utils/confirmacaoEmbarque';
import { formatarDataHorario, formatarMoeda } from '../../../utils/formatters';
import { MapPin, TriangleAlert } from 'lucide-react';

const ModalCancelamentoCorrida = ({
  corrida,
  ehMotorista,
  motivo,
  loading,
  error,
  onChangeMotivo,
  onClose,
  onConfirm,
}) => (
  <Modal
    isOpen={!!corrida}
    onClose={onClose}
    title="Cancelar corrida?"
    size="sm"
    footer={
      <div className="modal-actions">
        <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
          Voltar
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={loading}
          disabled={ehMotorista && !motivo.trim()}
          onClick={onConfirm}
        >
          Cancelar corrida
        </Button>
      </div>
    }
  >
    {corrida && (
      <div>
        {corrida.origemNome && (
          <div className="modal-summary">
            <div className="modal-summary__title">
              Corrida #{String(corrida.id).substring(0, 6)}
            </div>
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
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="motivo-cancelamento-corrida">
            {ehMotorista ? 'Motivo do cancelamento' : 'Motivo do cancelamento (opcional)'}
            {ehMotorista && <span className="input-required" aria-hidden="true">*</span>}
          </label>
          <textarea
            id="motivo-cancelamento-corrida"
            className={`input-textarea ${error ? 'input-field--error' : ''}`.trim()}
            value={motivo}
            maxLength={MOTIVO_MAX}
            rows={3}
            disabled={loading}
            aria-invalid={error ? true : undefined}
            placeholder={
              ehMotorista
                ? 'Informe o motivo do cancelamento (mínimo 5 caracteres)...'
                : 'Informe o motivo caso deseje...'
            }
            onChange={(e) => onChangeMotivo(e.target.value)}
          />
          <small className="char-counter">
            {MOTIVO_MAX - motivo.length} caracteres restantes
          </small>
        </div>

        <p className="text-secondary" style={{ fontSize: 'var(--font-sm)', marginTop: 12, lineHeight: 1.55 }}>
          Tem certeza que deseja cancelar esta corrida? Essa ação não pode ser desfeita.
        </p>

        {error && (
          <p role="alert" className="form-error" style={{ marginTop: 12 }}>
            <TriangleAlert size={16} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    )}
  </Modal>
);

export default ModalCancelamentoCorrida;
