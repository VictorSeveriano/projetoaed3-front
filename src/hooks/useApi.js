import { useState, useCallback } from 'react';

/**
 * Hook generico para chamadas de API com estado de loading/error.
 */
const useApi = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result.data);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro desconhecido';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute };
};

export default useApi;
