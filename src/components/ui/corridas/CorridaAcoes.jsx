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

  const possuiAlgumaAcao =
    podeConfirmarEmbarque ||
    podeAcaoConfirmarPagamento ||
    podeAcaoCancelar ||
    podeAcaoFinalizar;

  if (!possuiAlgumaAcao) return null;

  return (
    <div className="corrida-acoes">
      {podeConfirmarEmbarque && (
        <Button
          id={`btn-embarque-${corrida.id}`}
          type="button"
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
          type="button"
          variant="success"
          size="sm"
          onClick={() => onAbrirConfirmarPagamento(corrida.id)}
        >
          Confirmar Pagamento
        </Button>
      )}
      {podeAcaoFinalizar && (
        <Button
          id={`btn-finalizar-${corrida.id}`}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAbrirFinalizar(corrida.id)}
        >
          Finalizar
        </Button>
      )}
      {podeAcaoCancelar && (
        <Button
          id={`btn-cancelar-${corrida.id}`}
          type="button"
          variant="danger"
          size="sm"
          onClick={() => onAbrirCancelar(corrida)}
        >
          {ehPassageiro ? 'Cancelar corrida' : 'Cancelar'}
        </Button>
      )}
    </div>
  );
};

export default CorridaAcoes;
