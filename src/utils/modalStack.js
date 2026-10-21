/**
 * modalStack.js — Rastreador global de modais abertos.
 *
 * Mantém um contador de nível para que apenas o modal do topo
 * responda ao evento de tecla Escape. Cada modal recebe seu
 * próprio nível ao ser aberto e o libera ao ser fechado.
 *
 * Uso:
 *   const myLevel = pushModal();   // ao abrir
 *   popModal();                     // ao fechar
 *   isTopModal(myLevel)            // true se este é o modal mais recente
 */

let count = 0;

/** Registra a abertura de um modal e retorna o nível atribuído. */
export const pushModal = () => {
  count += 1;
  return count;
};

/** Registra o fechamento de um modal. */
export const popModal = () => {
  if (count > 0) count -= 1;
};

/**
 * Retorna true se o nível informado corresponde ao modal do topo da pilha.
 * @param {number} level - Nível retornado por pushModal() para este modal.
 */
export const isTopModal = (level) => level === count;

