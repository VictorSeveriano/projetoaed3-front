import { useState, useCallback, useRef, useEffect } from 'react';
import localizacaoService from '../services/localizacao.service';

/**
 * useLocationSearch — Hook reutilizavel para autocomplete de localizacao.
 *
 * Encapsula toda a logica de autocomplete de um campo de localizacao:
 * - Estado separado entre texto digitado e localizacao selecionada
 * - Debounce de 400ms para nao disparar uma requisicao por tecla
 * - Cancelamento de requisicao anterior via AbortController
 * - Minimo de 3 caracteres antes de buscar
 * - Invalidacao automatica de selecionada ao editar o texto
 * - Navegacao por teclado (activeIndex)
 * - Estados de UI: normal, buscando, com resultados, sem resultados, erro
 *
 * @returns {{
 *   texto: string,
 *   setTexto: (t: string) => void,
 *   sugestoes: Array,
 *   selecionada: object|null,
 *   buscando: boolean,
 *   erro: string|null,
 *   activeIndex: number,
 *   setActiveIndex: (i: number) => void,
 *   selecionar: (sugestao: object) => void,
 *   limpar: () => void,
 *   mostrarSugestoes: boolean,
 *   setMostrarSugestoes: (b: boolean) => void,
 * }}
 */
const useLocationSearch = () => {
  const [texto, setTextoInterno]       = useState('');
  const [sugestoes, setSugestoes]      = useState([]);
  const [selecionada, setSelecionada]  = useState(null);
  const [buscando, setBuscando]        = useState(false);
  const [erro, setErro]                = useState(null);
  const [activeIndex, setActiveIndex]  = useState(-1);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Referencia ao AbortController da ultima requisicao
  const abortRef  = useRef(null);
  // Referencia ao timer do debounce
  const timerRef  = useRef(null);
  // Contador para evitar que resposta antiga sobrescreva resposta recente
  const seqRef    = useRef(0);

  /**
   * Dispara a busca de sugestoes apos debounce de 400ms.
   * Cancela a requisicao anterior antes de iniciar a nova.
   */
  const buscar = useCallback((query) => {
    // Limpa debounce anterior
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query || query.trim().length < 3) {
      setSugestoes([]);
      setMostrarSugestoes(false);
      setBuscando(false);
      setErro(null);
      return;
    }

    // Mostra loading imediatamente ao digitar (antes do debounce de 400ms),
    // e limpa sugestões antigas para não exibir resultados desatualizados durante a espera.
    setBuscando(true);
    setSugestoes([]);
    setMostrarSugestoes(false);
    setErro(null);

    timerRef.current = setTimeout(async () => {
      // Cancela requisicao anterior
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (_) {}
      }
      abortRef.current = new AbortController();

      // Incrementa sequencia para detectar resposta desatualizada (race condition)
      const seq = ++seqRef.current;

      try {
        const resultados = await localizacaoService.buscarSugestoes(
          query.trim(),
          abortRef.current.signal,
        );

        // Ignora se ja chegou uma resposta mais recente
        if (seq !== seqRef.current) return;

        setSugestoes(resultados);
        setMostrarSugestoes(true);
        setActiveIndex(-1);
      } catch (err) {
        if (seq !== seqRef.current) return;

        // Requisicao cancelada intencionalmente — nao e erro de UI
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          return;
        }

        setSugestoes([]);
        setErro('Nao foi possivel buscar sugestoes de localizacao.');
        setMostrarSugestoes(false);
      } finally {
        if (seq === seqRef.current) setBuscando(false);
      }
    }, 400);
  }, []);

  /**
   * Atualiza o texto e invalida a selecao anterior se o usuario editar manualmente.
   * Dispara a busca de sugestoes via debounce.
   */
  const setTexto = useCallback((novoTexto) => {
    setTextoInterno(novoTexto);

    // Invalidar selecao se o texto foi editado apos uma selecao
    setSelecionada(null);

    buscar(novoTexto);
  }, [buscar]);

  /**
   * Confirma a selecao de uma sugestao.
   * Preenche o texto com a descricao da sugestao e fecha o dropdown.
   */
  const selecionar = useCallback((sugestao) => {
    setTextoInterno(sugestao.descricao);
    setSelecionada(sugestao);
    setSugestoes([]);
    setMostrarSugestoes(false);
    setActiveIndex(-1);
    setErro(null);

    // Cancela qualquer busca pendente
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (_) {}
    }
  }, []);

  /**
   * Limpa todos os estados do campo.
   */
  const limpar = useCallback(() => {
    setTextoInterno('');
    setSelecionada(null);
    setSugestoes([]);
    setMostrarSugestoes(false);
    setActiveIndex(-1);
    setErro(null);
    setBuscando(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (_) {}
    }
  }, []);

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  return {
    texto,
    setTexto,
    sugestoes,
    selecionada,
    buscando,
    erro,
    activeIndex,
    setActiveIndex,
    selecionar,
    limpar,
    mostrarSugestoes,
    setMostrarSugestoes,
  };
};

export default useLocationSearch;
