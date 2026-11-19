import React, { useState, useMemo } from 'react';
import ConfirmationModal from './ConfirmationModal';
import Loading from './Loading';
import CorridasFiltros from './corridas/CorridasFiltros';
import CorridasTabela from './corridas/CorridasTabela';
import ModalCancelamentoCorrida from './corridas/ModalCancelamentoCorrida';
import {
  podeExibirBotaoCancelar,
  resolverPapeisCorrida,
  filtrarCorridasPorAba,
  contarCorridasPorAba,
} from './corridas/corridaPermissoes';
import { useCorridasAcoes } from '../../hooks/useCorridasAcoes';

export { podeExibirBotaoCancelar };

/**
 * CorridasTabs — Coordenador da listagem em abas, filtros por status e modais
 * de ação de corridas (cancelamento, finalização e confirmação de pagamento).
 */
const CorridasTabs = ({
  corridas = [],
  carrosMap = {},
  loading = false,
  error = '',
  podeCancelar = false,
  podeFinalizar = false,
  podeConfirmarPagamento = false,
  perfil = '',
  onAcao,
}) => {
  const [abaAtiva, setAbaAtiva] = useState('TODAS');

  const permissoes = useMemo(
    () => ({ podeCancelar, podeFinalizar, podeConfirmarPagamento, perfil }),
    [podeCancelar, podeFinalizar, podeConfirmarPagamento, perfil]
  );
  const { ehMotorista } = resolverPapeisCorrida(permissoes);

  const corridasFiltradas = useMemo(
    () => filtrarCorridasPorAba(corridas, abaAtiva),
    [corridas, abaAtiva]
  );
  const contadores = useMemo(() => contarCorridasPorAba(corridas), [corridas]);

  const acoes = useCorridasAcoes({ corridas, ehMotorista, onAcao });

  if (loading) {
    return <Loading message="Carregando corridas..." />;
  }

  if (error) {
    return (
      <div className="form-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <CorridasFiltros
        abaAtiva={abaAtiva}
        contadores={contadores}
        onSelecionarAba={setAbaAtiva}
      />

      <CorridasTabela
        corridas={corridasFiltradas}
        abaAtiva={abaAtiva}
        carrosMap={carrosMap}
        permissoes={permissoes}
        onAbrirCancelar={acoes.abrirCancelamento}
        onAbrirConfirmarPagamento={acoes.abrirConfirmarPagamento}
        onAbrirFinalizar={acoes.abrirFinalizacao}
      />

      <ModalCancelamentoCorrida
        corrida={acoes.corridaCancelamentoObj}
        ehMotorista={ehMotorista}
        motivo={acoes.motivoCancelamento}
        loading={acoes.cancelando}
        error={acoes.actionError}
        onChangeMotivo={acoes.atualizarMotivoCancelamento}
        onClose={acoes.fecharCancelamento}
        onConfirm={acoes.handleCancelar}
      />

      <ConfirmationModal
        isOpen={!!acoes.corridaToFinalizar}
        onClose={acoes.fecharFinalizacao}
        onConfirm={acoes.handleFinalizar}
        title="Finalizar corrida?"
        message={acoes.actionError || 'Confirmar finalização desta corrida?'}
        confirmText="Finalizar corrida"
        cancelText="Voltar"
        variant="primary"
        loading={acoes.finalizando}
      />

      <ConfirmationModal
        isOpen={!!acoes.corridaToConfirmarPag}
        onClose={acoes.fecharConfirmarPagamento}
        onConfirm={acoes.handleConfirmarPagamento}
        title="Confirmar recebimento do pagamento?"
        message={
          acoes.actionError ||
          'Confirme que o pagamento foi recebido presencialmente. A corrida será marcada como FINALIZADA.'
        }
        confirmText="Confirmar Pagamento"
        cancelText="Voltar"
        variant="primary"
        loading={acoes.confirmandoPag}
      />
    </>
  );
};

export default CorridasTabs;
