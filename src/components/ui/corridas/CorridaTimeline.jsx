import React from 'react';
import Badge from '../Badge';
import { formatarDataHorario, formatarMoeda } from '../../../utils/formatters';
import { FORMA_PAGAMENTO_LABELS } from './corridaPermissoes';
import {
  Clock,
  CheckCircle2,
  Navigation,
  PlayCircle,
  UserCheck,
  AlertCircle,
  XCircle,
  Flag,
  Sparkles,
} from 'lucide-react';

const ESTILO_POR_TIPO = {
  CORRIDA_SOLICITADA: {
    cor: 'primary',
    icone: <Sparkles size={15} aria-hidden="true" />,
  },
  CORRIDA_ACEITA: {
    cor: 'info',
    icone: <CheckCircle2 size={15} aria-hidden="true" />,
  },
  MOTORISTA_A_CAMINHO: {
    cor: 'warning',
    icone: <Navigation size={15} aria-hidden="true" />,
  },
  EMBARQUE_MOTORISTA_CONFIRMADO: {
    cor: 'success',
    icone: <PlayCircle size={15} aria-hidden="true" />,
  },
  CORRIDA_INICIADA: {
    cor: 'info',
    icone: <PlayCircle size={15} aria-hidden="true" />,
  },
  EMBARQUE_PASSAGEIRO_CONFIRMADO: {
    cor: 'success',
    icone: <UserCheck size={15} aria-hidden="true" />,
  },
  PASSAGEIRO_NAO_EMBARCOU: {
    cor: 'warning',
    icone: <AlertCircle size={15} aria-hidden="true" />,
  },
  CORRIDA_FINALIZADA: {
    cor: 'success',
    icone: <Flag size={15} aria-hidden="true" />,
  },
  CORRIDA_CANCELADA: {
    cor: 'danger',
    icone: <XCircle size={15} aria-hidden="true" />,
  },
  CORRIDA_EXPIRADA: {
    cor: 'muted',
    icone: <Clock size={15} aria-hidden="true" />,
  },
};

const COR_PERFIL = {
  USUARIO: 'info',
  PASSAGEIRO: 'info',
  MOTORISTA: 'warning',
  ADMINISTRADOR: 'primary',
  SISTEMA: 'muted',
};

function extrairComplementosEvento(evento) {
  const meta = evento?.metadados;
  if (!meta || typeof meta !== 'object') return [];
  const itens = [];

  if (meta.dataHorarioProgramado) {
    itens.push(`Agendada para ${formatarDataHorario(meta.dataHorarioProgramado)}`);
  }
  if (meta.veiculo) {
    itens.push(`Veículo: ${meta.veiculo}`);
  }
  if (meta.prazoConfirmacaoEm) {
    itens.push(`Prazo estendido até ${formatarDataHorario(meta.prazoConfirmacaoEm)}`);
  }
  if (meta.formaPagamento) {
    itens.push(`Pagamento: ${FORMA_PAGAMENTO_LABELS[meta.formaPagamento] || meta.formaPagamento}`);
  }
  if (meta.valor != null && Number(meta.valor) > 0) {
    itens.push(`Valor: ${formatarMoeda(meta.valor)}`);
  }
  return itens;
}

/**
 * CorridaTimeline — Linha do tempo vertical cronológica dos eventos reais da corrida.
 */
const CorridaTimeline = ({ eventos = [] }) => {
  if (!Array.isArray(eventos) || eventos.length === 0) {
    return (
      <p className="text-secondary" style={{ fontSize: 'var(--font-sm)' }}>
        Nenhum evento registrado para esta corrida até o momento.
      </p>
    );
  }

  return (
    <ol className="corrida-timeline" aria-label="Linha do tempo da corrida">
      {eventos.map((ev) => {
        const config = ESTILO_POR_TIPO[ev.tipo] || {
          cor: 'muted',
          icone: <Clock size={15} aria-hidden="true" />,
        };
        const complementos = extrairComplementosEvento(ev);

        return (
          <li key={ev.id} className={`corrida-timeline__item corrida-timeline__item--${config.cor}`}>
            <span className={`corrida-timeline__marker corrida-timeline__marker--${config.cor}`} aria-hidden="true">
              {config.icone}
            </span>

            <div className="corrida-timeline__content">
              <div className="corrida-timeline__header">
                <strong className="corrida-timeline__title">{ev.titulo}</strong>
                <time className="corrida-timeline__time tabular-nums" dateTime={ev.dataHorario || ''}>
                  {formatarDataHorario(ev.dataHorario)}
                </time>
              </div>

              <p className="corrida-timeline__desc">{ev.descricao}</p>

              <div className="corrida-timeline__meta">
                <Badge
                  label={ev.responsavel || 'Sistema'}
                  color={COR_PERFIL[ev.autorPerfil] || 'muted'}
                />
                {complementos.map((item, idx) => (
                  <span key={idx} className="corrida-timeline__pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default CorridaTimeline;
