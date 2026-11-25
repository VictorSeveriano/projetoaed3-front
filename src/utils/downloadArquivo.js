import api from '../services/api.js';

function extrairNomeArquivoContentDisposition(headerValue, fallback) {
  if (!headerValue || typeof headerValue !== 'string') return fallback;
  const match = headerValue.match(/filename="?([^";]+)"?/i);
  return match && match[1] ? match[1].trim() : fallback;
}

/**
 * Monta URLSearchParams apenas com os filtros efetivamente preenchidos.
 */
export function construirParamsFiltroLimpos(filtros = {}, extras = {}) {
  const params = new URLSearchParams();
  const combinado = { ...filtros, ...extras };

  for (const [chave, valor] of Object.entries(combinado)) {
    if (valor === undefined || valor === null) continue;
    if (typeof valor === 'boolean') {
      if (valor) params.set(chave, 'true');
      continue;
    }
    const str = String(valor).trim();
    if (str !== '') {
      params.set(chave, str);
    }
  }
  return params;
}

/**
 * Realiza o download de um relatório CSV ou PDF na API enviando exatamente os filtros ativos.
 */
export async function baixarRelatorioApi(
  endpoint,
  formato = 'csv',
  filtros = {},
  prefixoFallback = 'relatorio-corridas-ucl'
) {
  const fmt = String(formato || 'csv').trim().toLowerCase();
  const params = construirParamsFiltroLimpos(filtros, { formato: fmt });

  try {
    const response = await api.get(`${endpoint}?${params.toString()}`, {
      responseType: 'blob',
    });

    const fallbackName = `${prefixoFallback}.${fmt}`;
    const filename = extrairNomeArquivoContentDisposition(
      response.headers?.['content-disposition'],
      fallbackName
    );

    const blob = new Blob([response.data], {
      type: fmt === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return { filename };
  } catch (err) {
    if (err?.response?.data instanceof Blob) {
      try {
        const texto = await err.response.data.text();
        const json = JSON.parse(texto);
        if (json?.message) {
          throw new Error(json.message);
        }
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message && !parseErr.message.includes('JSON')) {
          throw parseErr;
        }
      }
    }
    throw new Error(err?.response?.data?.message || err?.message || 'Falha ao exportar relatório.');
  }
}
