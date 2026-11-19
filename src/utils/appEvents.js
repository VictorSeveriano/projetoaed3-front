export const APP_EVENTS = Object.freeze({
  NOTIFICACOES_ATUALIZADAS: 'notificacoes-atualizadas',
  CORRIDAS_ATUALIZADAS: 'corridas-atualizadas',
  ABRIR_MODAL_EMBARQUE: 'abrir-modal-embarque',
});

export function emitirEvento(nome, detail) {
  if (typeof window === 'undefined') return;
  const event = detail !== undefined ? new CustomEvent(nome, { detail }) : new Event(nome);
  window.dispatchEvent(event);
}

export function emitirNotificacoesAtualizadas() {
  emitirEvento(APP_EVENTS.NOTIFICACOES_ATUALIZADAS);
}

export function emitirCorridasAtualizadas() {
  emitirEvento(APP_EVENTS.CORRIDAS_ATUALIZADAS);
}

export function emitirAbrirModalEmbarque(corrida) {
  emitirEvento(APP_EVENTS.ABRIR_MODAL_EMBARQUE, corrida);
}

export function escutarEvento(nome, handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(nome, handler);
  return () => window.removeEventListener(nome, handler);
}
