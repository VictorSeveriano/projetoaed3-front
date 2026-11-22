import { AUTH_STORAGE_KEYS, registrarLimpezaSessao } from './api.js';

/**
 * CacheSessao — Cache curto em memória + deduplicação de requisições em andamento,
 * estritamente isolado pelo token da sessão autenticada atual.
 *
 * Garantias:
 *  - Nunca retorna dados em cache de outra sessão/usuário (escopo por token).
 *  - Limpo automaticamente no logout e em respostas 401 via `registrarLimpezaSessao`.
 *  - Impede condição de corrida entre requisição antiga em voo e invalidação pós-mutação.
 */
export function criarCacheSessao({ obterToken, maxEntries = 100 } = {}) {
  const getToken = obterToken || (() => {
    if (typeof sessionStorage === 'undefined') return '';
    return sessionStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) || '';
  });

  let ultimoToken = '';
  const entradas = new Map();
  const emAndamento = new Map();

  const sincronizarSessao = () => {
    const tokenAtual = getToken();
    if (tokenAtual !== ultimoToken) {
      entradas.clear();
      emAndamento.clear();
      ultimoToken = tokenAtual;
    }
    return tokenAtual;
  };

  const limpar = () => {
    entradas.clear();
    emAndamento.clear();
    ultimoToken = '';
  };

  const salvar = (chave, valor, expiraEm, versao) => {
    if (entradas.has(chave)) {
      entradas.delete(chave);
    } else if (entradas.size >= maxEntries) {
      const maisAntiga = entradas.keys().next().value;
      if (maisAntiga !== undefined) entradas.delete(maisAntiga);
    }
    entradas.set(chave, { valor, expiraEm, versao });
  };

  const invalidar = (chave) => {
    const existente = entradas.get(chave);
    const proximaVersao = existente ? existente.versao + 1 : 1;
    if (emAndamento.has(chave)) {
      entradas.set(chave, { valor: undefined, expiraEm: 0, versao: proximaVersao });
    } else {
      entradas.delete(chave);
    }
  };

  const invalidarPrefixo = (prefixo) => {
    for (const chave of Array.from(entradas.keys())) {
      if (chave.startsWith(prefixo)) invalidar(chave);
    }
    for (const chave of Array.from(emAndamento.keys())) {
      if (chave.startsWith(prefixo)) invalidar(chave);
    }
  };

  const obterOuCarregar = async (chave, ttlMs, carregador, { forcar = false } = {}) => {
    const tokenInicio = sincronizarSessao();

    if (!forcar && ttlMs > 0) {
      const existente = entradas.get(chave);
      if (existente && Date.now() < existente.expiraEm) {
        return existente.valor;
      }
      if (emAndamento.has(chave)) {
        return emAndamento.get(chave);
      }
    } else if (forcar) {
      invalidar(chave);
    }

    const existenteInicio = entradas.get(chave);
    const versaoInicio = existenteInicio ? existenteInicio.versao : 0;

    const promessa = Promise.resolve()
      .then(() => carregador())
      .then((valor) => {
        if (getToken() === tokenInicio && ttlMs > 0) {
          const atual = entradas.get(chave);
          if (!atual || atual.versao === versaoInicio) {
            salvar(chave, valor, Date.now() + ttlMs, versaoInicio);
          }
        }
        return valor;
      })
      .finally(() => {
        if (emAndamento.get(chave) === promessa) {
          emAndamento.delete(chave);
        }
      });

    emAndamento.set(chave, promessa);
    return promessa;
  };

  return {
    obterOuCarregar,
    invalidar,
    invalidarPrefixo,
    limpar,
  };
}

const cacheSessao = criarCacheSessao();
registrarLimpezaSessao(cacheSessao.limpar);

export default cacheSessao;
