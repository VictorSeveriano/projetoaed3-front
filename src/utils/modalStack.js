/**
 * modalStack.js — Pilha global de modais abertos.
 *
 * Utiliza uma pilha real baseada em IDs únicos (strings geradas por crypto.randomUUID
 * ou um fallback seguro). Isso garante que:
 *   - Somente o modal do topo responde ao Escape.
 *   - Fechar um modal intermediário não corrompe a posição dos demais.
 *   - Não sobram registros residuais após desmontagem.
 *   - O bloqueio de scroll permanece ativo enquanto houver qualquer modal aberto.
 *
 * API pública:
 *   pushModal()         → string  — registra o modal e retorna seu ID único
 *   popModal(id)        → void    — remove o modal com esse ID da pilha
 *   isTopModal(id)      → boolean — true se o ID informado é o topo atual
 */

/** Gera um ID único compatível com todos os browsers modernos e com o Node.js ≥ 15. */
const gerarId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: concatenação de timestamp + bytes aleatórios
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

/** Pilha de IDs de modais abertos. O último elemento é o topo. */
const stack = [];

/**
 * Registra a abertura de um modal.
 * @returns {string} ID único atribuído a este modal.
 */
export const pushModal = () => {
  const id = gerarId();
  stack.push(id);
  return id;
};

/**
 * Remove o modal com o ID informado da pilha.
 * Remove de qualquer posição para suportar fechamento de modais intermediários.
 * @param {string} id - ID retornado por pushModal().
 */
export const popModal = (id) => {
  const index = stack.indexOf(id);
  if (index !== -1) {
    stack.splice(index, 1);
  }
};

/**
 * Retorna true se o ID informado corresponde ao modal do topo da pilha.
 * @param {string} id - ID retornado por pushModal() para este modal.
 */
export const isTopModal = (id) => stack.length > 0 && stack[stack.length - 1] === id;

/**
 * Retorna true se há pelo menos um modal aberto.
 * Útil para manter o bloqueio de scroll do body.
 */
export const hasOpenModals = () => stack.length > 0;

/**
 * Retorna o número atual de modais abertos (somente leitura).
 * Exposto para testes e depuração.
 */
export const getStackSize = () => stack.length;

/**
 * Remove todos os modais da pilha. Use apenas em testes.
 * @internal
 */
export const _resetStack = () => { stack.length = 0; };
