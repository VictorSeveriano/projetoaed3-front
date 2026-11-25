import React, { useState, useMemo } from 'react';
import ConfirmationModal from './ConfirmationModal';
import Loading from './Loading';
import CorridasFiltros from './corridas/CorridasFiltros';
import CorridasTabela from './corridas/CorridasTabela';
import ModalCancelamentoCorrida from './corridas/ModalCancelamentoCorrida';
import ModalDetalhesCorrida from './corridas/ModalDetalhesCorrida';
import {
  podeExibirBotaoCancelar,
  resolverPapeisCorrida,
  filtrarCorridasPorAba,
  contarCorridasPorAba,
} from './corridas/corridaPermissoes';
import { useCorridasAcoes } from '../../hooks/useCorridasAcoes';

export { podeExibirBotaoCancelar };

/**
 * CorridasTabs — Coordenador da listagem, modais de ação e modal de detalhes/linha do tempo.
 *
 * Aceita `ocultarAbasLocais` quando a filtragem e a paginação são conduzidas pelo backend
 * (como em `CorridasPage` / Histórico), mantendo total retrocompatibilidade quando usado isoladamente.
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
  ocultarAbasLocais = false,
  emptyTitle,
  emptyDescription,
  onAcao,
}) => {
  const [abaAtiva, setAbaAtiva] = useState('TODAS');
  const [corridaDetalheSelecionada, setCorridaDetalheSelecionada] = useState(null);

  const permissoes = useMemo(
    () => ({ podeCancelar, podeFinalizar, podeConfirmarPagamento, perfil }),
    [podeCancelar, podeFinalizar, podeConfirmarPagamento, perfil]
  );
  const { ehMotorista } = resolverPapeisCorrida(permissoes);

  const corridasFiltradas = useMemo(
    () => (ocultarAbasLocais ? corridas : filtrarCorridasPorAba(corridas, abaAtiva)),
    [corridas, abaAtiva, ocultarAbasLocais]
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
      {!ocultarAbasLocais && (
        <CorridasFiltros
          abaAtiva={abaAtiva}
          contadores={contadores}
          onSelecionarAba={setAbaAtiva}
        />
      )}

      <CorridasTabela
        corridas={corridasFiltradas}
        abaAtiva={ocultarAbasLocais ? 'TODAS' : abaAtiva}
        carrosMap={carrosMap}
        permissoes={permissoes}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onAbrirDetalhes={(corrida) => setCorridaDetalheSelecionada(corrida)}
        onAbrirCancelar={acoes.abrirCancelamento}
        onAbrirConfirmarPagamento={acoes.abrirConfirmarPagamento}
        onAbrirFinalizar={acoes.abrirFinalizacao}
      />

      <ModalDetalhesCorrida
        corridaId={corridaDetalheSelecionada?.id || null}
        corridaInicial={corridaDetalheSelecionada}
        isOpen={Boolean(corridaDetalheSelecionada)}
        onClose={() => setCorridaDetalheSelecionada(null)}
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
