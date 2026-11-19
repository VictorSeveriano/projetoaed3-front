import React from 'react';
import Button from '../Button';
import { obterAcoesDisponiveisCorrida } from './corridaPermissoes';
import { emitirAbrirModalEmbarque } from '../../../utils/appEvents';

const CorridaAcoes = ({
  corrida,
  permissoes,
  onAbrirCancelar,
  onAbrirConfirmarPagamento,
  onAbrirFinalizar,
}) => {
  const {
    ehPassageiro,
    podeAcaoCancelar,
    podeAcaoFinalizar,
    podeAcaoConfirmarPagamento,
    podeConfirmarEmbarque,
  } = obterAcoesDisponiveisCorrida(corrida, permissoes);

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {podeConfirmarEmbarque && (
        <Button
          id={`btn-embarque-${corrida.id}`}
          variant="primary"
          size="sm"
          onClick={() => emitirAbrirModalEmbarque(corrida)}
        >
          Confirmar Embarque
        </Button>
      )}
      {podeAcaoConfirmarPagamento && (
        <Button
          id={`btn-confirmar-pag-${corrida.id}`}
          variant="success"
          size="sm"
          onClick={() => onAbrirConfirmarPagamento(corrida.id)}
        >
          Confirmar Pagamento
        </Button>
      )}
      {podeAcaoCancelar && (
        <Button
          id={`btn-cancelar-${corrida.id}`}
          variant="danger"
          size="sm"
          onClick={() => onAbrirCancelar(corrida)}
        >
          {ehPassageiro ? 'Cancelar corrida' : 'Cancelar'}
        </Button>
      )}
      {podeAcaoFinalizar && (
        <Button
          id={`btn-finalizar-${corrida.id}`}
          variant="secondary"
          size="sm"
          onClick={() => onAbrirFinalizar(corrida.id)}
        >
          Finalizar
        </Button>
      )}
    </div>
  );
};

export default CorridaAcoes;
