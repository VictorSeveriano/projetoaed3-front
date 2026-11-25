import React from 'react';
import Badge from '../Badge';
import { classificarPontualidadeCorrida } from '../../../utils/indicadorAtrasoCorrida';

/**
 * BadgePontualidade — Indicador visual padronizado de pontualidade, atraso e expiração.
 *
 * Quando `sempreVisivel = false` (listagens compactas), evita repetir o mesmo texto do
 * badge principal de status para `EM_ANDAMENTO`, `FINALIZADA` e `CANCELADA` manual,
 * destacando `No horário`, `Aguardando embarque`, `Em atraso` e `Expirada`.
 */
const BadgePontualidade = ({
  corrida,
  pontualidade: pontualidadeProp = null,
  sempreVisivel = false,
  exibirNotaInicioAtrasado = false,
}) => {
  const info = pontualidadeProp || corrida?.pontualidade || classificarPontualidadeCorrida(corrida);
  if (!info) return null;

  const textoBadge =
    info.codigo === 'EM_ATRASO' && info.minutosAtraso > 0
      ? `Em atraso (+${info.minutosAtraso} min)`
      : info.rotulo;

  const redundanteComStatus =
    !sempreVisivel &&
    (info.codigo === 'EM_ANDAMENTO' ||
      info.codigo === 'FINALIZADA' ||
      info.codigo === 'CANCELADA');

  return (
    <>
      {!redundanteComStatus && <Badge label={textoBadge} color={info.cor} />}
      {exibirNotaInicioAtrasado && info.iniciouComAtraso && info.atrasoInicioMinutos > 0 && (
        <span className="corrida-status-note corrida-status-note--warning">
          Embarque +{info.atrasoInicioMinutos} min após agendado
        </span>
      )}
    </>
  );
};

export default BadgePontualidade;
