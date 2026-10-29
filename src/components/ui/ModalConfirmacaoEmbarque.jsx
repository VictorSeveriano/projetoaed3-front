import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import corridasService from '../../services/corridas.service';
import { formatarDataHorario, formatarMoeda } from '../../utils/formatters';
import { MapPin } from 'lucide-react';

export const MOTIVO_MIN = 5;
export const MOTIVO_MAX = 500;

/** Valida o motivo (trim, mínimo e máximo) — espelha a validação do backend. */
export function validarMotivo(motivo) {
  const limpo = (motivo || '').trim();
  if (!limpo) return 'Informe o motivo.';
  if (limpo.length < MOTIVO_MIN) return `O motivo deve ter ao menos ${MOTIVO_MIN} caracteres.`;
  if (limpo.length > MOTIVO_MAX) return `O motivo deve ter no máximo ${MOTIVO_MAX} caracteres.`;
  return '';
}

const colunaStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };

/**
 * ModalConfirmacaoEmbarque — confirmação de embarque para motorista e passageiro.
 *
 * @param {object}   corrida
 * @param {'MOTORISTA'|'USUARIO'} perfil
 * @param {function} onClose      - Fecha sem decidir (a corrida pode ser reapresentada depois)
 * @param {function} onConcluido  - Chamado após registrar uma decisão com sucesso
 */
const ModalConfirmacaoEmbarque = ({ corrida, perfil, onClose, onConcluido }) => {
  const ehMotorista = perfil === 'MOTORISTA';
  const [etapa, setEtapa] = useState('inicial'); // inicial | naoEmbarcou | motivo
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEtapa('inicial'); setMotivo(''); setErro(''); setLoading(false);
  }, [corrida?.id]);

  if (!corrida) return null;

  const executar = async (fn) => {
    if (loading) return; // evita envio duplicado
    setLoading(true); setErro('');
    try {
      await fn();
      window.dispatchEvent(new Event('notificacoes-atualizadas'));
      onConcluido && onConcluido(corrida);
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const enviar = (payload) => executar(() =>
    ehMotorista
      ? corridasService.registrarEmbarqueMotorista(corrida.id, payload)
      : corridasService.registrarEmbarquePassageiro(corrida.id, payload));

  const confirmarCancelamento = () => {
    const msg = validarMotivo(motivo);
    if (msg) { setErro(msg); return; }
    enviar(ehMotorista
      ? { acao: 'NAO_VOU_EMBARCAR', motivo: motivo.trim() }
      : { acao: 'NAO_EMBARQUEI', cancelarViagem: true, motivo: motivo.trim() });
  };

  const aCaminho = ehMotorista && corrida.situacaoMotorista === 'A_CAMINHO';
  const motoristaACaminho = !ehMotorista && corrida.situacaoMotorista === 'A_CAMINHO';

  const resumo = (
    <div style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.04))', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={14} aria-hidden="true" /> {corrida.origemNome}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><MapPin size={14} aria-hidden="true" /> {corrida.destinoNome}</div>
      <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
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
          <p role="status" style={{ color: 'var(--color-warning)', marginBottom: 12 }}>
            O motorista informou que está a caminho.
          </p>
        )}
        <div style={colunaStyle}>
          <Button variant="success" loading={loading} onClick={() => enviar({ acao: 'CONFIRMAR_EMBARQUE' })}>
            {ehMotorista ? 'Sim, o passageiro embarcou' : 'Sim, embarquei'}
          </Button>
          <Button variant="secondary" disabled={loading} onClick={() => { setErro(''); setEtapa('naoEmbarcou'); }}>
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
        <div style={colunaStyle}>
          {ehMotorista ? (
            <>
              {!aCaminho && (
                <Button variant="secondary" loading={loading} onClick={() => enviar({ acao: 'ESTOU_A_CAMINHO' })}>
                  Estou a caminho
                </Button>
              )}
              <Button variant="danger" disabled={loading} onClick={() => { setErro(''); setEtapa('motivo'); }}>
                Não vou embarcar o passageiro
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" loading={loading} onClick={() => enviar({ acao: 'NAO_EMBARQUEI' })}>
                Aguardar o motorista
              </Button>
              <Button variant="danger" disabled={loading} onClick={() => { setErro(''); setEtapa('motivo'); }}>
                Cancelar a viagem
              </Button>
            </>
          )}
          <Button variant="ghost" disabled={loading} onClick={() => { setErro(''); setEtapa('inicial'); }}>Voltar</Button>
        </div>
      </>
    );
  } else {
    titulo = 'Cancelar viagem';
    const restante = MOTIVO_MAX - motivo.length;
    corpo = (
      <>
        {resumo}
        <label htmlFor="motivo-cancelamento-embarque" style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
          Motivo do cancelamento *
        </label>
        <textarea
          id="motivo-cancelamento-embarque"
          value={motivo}
          maxLength={MOTIVO_MAX}
          rows={4}
          disabled={loading}
          onChange={(e) => { setMotivo(e.target.value); setErro(''); }}
          aria-invalid={!!erro}
          style={{ width: '100%', resize: 'vertical', padding: 10, borderRadius: 8, background: 'transparent', color: 'inherit', border: '1px solid var(--border-color, rgba(255,255,255,0.2))' }}
        />
        <small style={{ color: 'var(--text-secondary)' }}>{restante} caracteres restantes</small>
        <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
          Esta ação cancela a viagem e notifica {ehMotorista ? 'o passageiro' : 'o motorista'}. Não pode ser desfeita.
        </p>
        <div style={{ ...colunaStyle, marginTop: 12 }}>
          <Button variant="danger" loading={loading} disabled={!motivo.trim()} onClick={confirmarCancelamento}>
            Confirmar cancelamento da viagem
          </Button>
          <Button variant="ghost" disabled={loading} onClick={() => { setErro(''); setEtapa('naoEmbarcou'); }}>Voltar</Button>
        </div>
      </>
    );
  }

  return (
    <Modal isOpen onClose={loading ? () => {} : onClose} title={titulo} size="sm">
      {corpo}
      {erro && <p role="alert" className="form-error" style={{ marginTop: 12 }}>{erro}</p>}
    </Modal>
  );
};

export default ModalConfirmacaoEmbarque;

