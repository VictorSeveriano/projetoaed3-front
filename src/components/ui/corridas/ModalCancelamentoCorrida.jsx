import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { MOTIVO_MAX } from '../../../utils/confirmacaoEmbarque';
import { formatarDataHorario, formatarMoeda } from '../../../utils/formatters';
import { MapPin } from 'lucide-react';

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
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
        <Button variant="ghost" disabled={loading} onClick={onClose}>
          Voltar
        </Button>
        <Button
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
          <div style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.04))', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Corrida #{String(corrida.id).substring(0, 6)}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <MapPin size={14} aria-hidden="true" /> {corrida.origemNome}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
              <MapPin size={14} aria-hidden="true" /> {corrida.destinoNome}
            </div>
            <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
              {formatarDataHorario(corrida.dataHorario)} • {formatarMoeda(corrida.valor)}
            </div>
          </div>
        )}

        <label htmlFor="motivo-cancelamento-corrida" style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
          {ehMotorista ? 'Motivo do cancelamento *' : 'Motivo do cancelamento (opcional)'}
        </label>
        <textarea
          id="motivo-cancelamento-corrida"
          value={motivo}
          maxLength={MOTIVO_MAX}
          rows={3}
          disabled={loading}
          placeholder={ehMotorista ? 'Informe o motivo do cancelamento (mínimo 5 caracteres)...' : 'Informe o motivo caso deseje...'}
          onChange={(e) => onChangeMotivo(e.target.value)}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: 10,
            borderRadius: 8,
            background: 'transparent',
            color: 'inherit',
            border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
          }}
        />
        <small style={{ color: 'var(--text-secondary)' }}>
          {MOTIVO_MAX - motivo.length} caracteres restantes
        </small>

        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.5 }}>
          Tem certeza que deseja cancelar esta corrida? Essa ação não pode ser desfeita.
        </p>

        {error && (
          <p role="alert" className="form-error" style={{ marginTop: 10 }}>
            {error}
          </p>
        )}
      </div>
    )}
  </Modal>
);

export default ModalCancelamentoCorrida;
