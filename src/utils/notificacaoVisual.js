/**
 * notificacaoVisual — Mapeamento puramente visual de tipos de notificação
 * para categoria legível, cor semântica e identificador de ícone.
 * Não altera regras de negócio, persistência ou tipos da API.
 */
export function classificarNotificacaoVisual(notificacao = {}) {
  const tipo = notificacao.tipo || '';
  const texto = `${notificacao.titulo || ''} ${notificacao.mensagem || ''}`.toLowerCase();

  if (tipo === 'NOVA_CORRIDA') {
    return { categoria: 'Nova corrida', cor: 'warning', icone: 'car' };
  }

  if (tipo === 'SOLICITACAO_MOTORISTA') {
    return { categoria: 'Solicitação de motorista', cor: 'info', icone: 'user' };
  }

  if (tipo === 'SOLICITACAO_VEICULO') {
    return { categoria: 'Análise de veículo', cor: 'info', icone: 'shield' };
  }

  if (tipo === 'CADASTRO_APROVADO') {
    return { categoria: 'Cadastro aprovado', cor: 'success', icone: 'check' };
  }

  if (tipo === 'ATUALIZACAO_CORRIDA') {
    if (texto.includes('cancelad') || texto.includes('recusad') || texto.includes('expirad')) {
      return { categoria: 'Cancelamento', cor: 'danger', icone: 'cancel' };
    }
    if (texto.includes('embarque') || texto.includes('a caminho') || texto.includes('aguardando')) {
      return { categoria: 'Embarque', cor: 'warning', icone: 'navigation' };
    }
    if (texto.includes('finalizad') || texto.includes('pagamento') || texto.includes('conclu')) {
      return { categoria: 'Concluída', cor: 'success', icone: 'check' };
    }
    return { categoria: 'Atualização de corrida', cor: 'primary', icone: 'route' };
  }

  return { categoria: 'Sistema', cor: 'muted', icone: 'bell' };
}
