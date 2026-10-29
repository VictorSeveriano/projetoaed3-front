export const BUSINESS_TIMEZONE = 'America/Sao_Paulo';

const NUMERIC_STRING_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const ISO_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i;

function lerNumeroFinito(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : undefined;
  }
  if (typeof valor === 'string') {
    const limpo = valor.trim();
    if (limpo === '' || !NUMERIC_STRING_RE.test(limpo)) return undefined;
    const n = Number(limpo);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Valida e normaliza uma coordenada geográfica opcional.
 * - `undefined` ou `null` -> `null` (ausência legítima de coordenada).
 * - `0` ou `-0` -> `0` (preserva zero na linha do Equador / meridiano de Greenwich).
 * - Números finitos dentro de [min, max] -> preservados.
 * - Valores fora dos limites ou não numéricos -> lança Error.
 */
export function normalizarCoordenadaOpcional(valor, campo, min, max) {
  if (valor === undefined || valor === null) {
    return null;
  }
  const numero = lerNumeroFinito(valor);
  if (numero === undefined || numero < min || numero > max) {
    throw new Error(`${campo} inválida: deve ser um número finito entre ${min} e ${max}.`);
  }
  return Object.is(numero, -0) ? 0 : numero;
}

export function normalizarLatitudeOpcional(valor, campo = 'latitude') {
  return normalizarCoordenadaOpcional(valor, campo, -90, 90);
}

export function normalizarLongitudeOpcional(valor, campo = 'longitude') {
  return normalizarCoordenadaOpcional(valor, campo, -180, 180);
}

/**
 * Verifica se um par (lat, lng) contém coordenadas numéricas finitas e dentro dos limites geográficos,
 * preservando `0` como coordenada válida.
 */
export function possuiCoordenadasValidas(lat, lng) {
  const nLat = lerNumeroFinito(lat);
  const nLng = lerNumeroFinito(lng);
  if (nLat === undefined || nLng === undefined) return false;
  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
}

/**
 * Extrai `{ lat, lng }` de um ponto geocodificado preservando `0` com `?? null` e validando limites.
 */
export function extrairCoordenadasGeocodificadas(ponto, prefixo = 'coordenada') {
  if (ponto === undefined || ponto === null) {
    return { lat: null, lng: null };
  }
  if (typeof ponto !== 'object' || Array.isArray(ponto)) {
    throw new Error(`${prefixo} inválida: objeto de coordenadas esperado.`);
  }
  const rawLat = ponto.lat ?? ponto.latitude ?? null;
  const rawLng = ponto.lng ?? ponto.longitude ?? null;

  const lat = normalizarLatitudeOpcional(rawLat, `${prefixo}Lat`);
  const lng = normalizarLongitudeOpcional(rawLng, `${prefixo}Lng`);

  if ((lat === null) !== (lng === null)) {
    throw new Error(`${prefixo} incompleta: latitude e longitude devem ser informadas juntas.`);
  }

  return { lat, lng };
}

function offsetDoFusoMs(timeZone, instanteMs) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instanteMs));
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  const comoUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return comoUtc - Math.floor(instanteMs / 1000) * 1000;
}

function horarioDeParedeParaInstanteMs(timeZone, utcComoParede) {
  let instante = utcComoParede - offsetDoFusoMs(timeZone, utcComoParede);
  instante = utcComoParede - offsetDoFusoMs(timeZone, instante);
  return instante;
}

/**
 * Converte o valor do `<input type="datetime-local">` (ou string ISO 8601) para ISO UTC,
 * interpretando strings sem offset explicitamente no fuso comercial `America/Sao_Paulo`.
 */
export function converterDataHorarioComercialParaISO(
  valor,
  timeZone = BUSINESS_TIMEZONE
) {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) {
      throw new Error('dataHorario inválido.');
    }
    return valor.toISOString();
  }

  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error('dataHorario inválido: informe data e horário.');
  }

  const m = ISO_DATETIME_RE.exec(valor.trim());
  if (!m) {
    throw new Error('dataHorario inválido: formato esperado YYYY-MM-DDTHH:mm.');
  }

  const [, ano, mes, dia, hora, minuto, segundo = '0', fracao = '0', zona] = m;
  const [A, M, D, H, Mi, S] = [ano, mes, dia, hora, minuto, segundo].map(Number);
  const ms = Number(fracao.padEnd(3, '0').slice(0, 3));

  const check = new Date(Date.UTC(A, M - 1, D, H, Mi, S, ms));
  if (
    check.getUTCFullYear() !== A ||
    check.getUTCMonth() !== M - 1 ||
    check.getUTCDate() !== D ||
    H > 23 ||
    Mi > 59 ||
    S > 59
  ) {
    throw new Error('dataHorario inválido: data ou hora inexistente.');
  }

  const paredeUtc = check.getTime();
  let instanteMs;
  if (!zona) {
    instanteMs = horarioDeParedeParaInstanteMs(timeZone, paredeUtc);
  } else if (zona.toUpperCase() === 'Z') {
    instanteMs = paredeUtc;
  } else {
    const sinal = zona[0] === '-' ? -1 : 1;
    const digitos = zona.slice(1).replace(':', '');
    const oh = Number(digitos.slice(0, 2));
    const om = Number(digitos.slice(2) || '0');
    if (oh > 23 || om > 59) {
      throw new Error('dataHorario inválido: offset de fuso horário inválido.');
    }
    instanteMs = paredeUtc - sinal * (oh * 60 + om) * 60000;
  }

  const dataFinal = new Date(instanteMs);
  if (Number.isNaN(dataFinal.getTime())) {
    throw new Error('dataHorario inválido.');
  }
  return dataFinal.toISOString();
}

/**
 * Formata um instante para o valor `YYYY-MM-DDTHH:mm` de `<input type="datetime-local">`
 * no fuso comercial `America/Sao_Paulo`.
 */
export function obterMinDatetimeComercial(
  instanteBaseMs = Date.now() + 5 * 60 * 1000,
  timeZone = BUSINESS_TIMEZONE
) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(instanteBaseMs));
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/**
 * Verifica se o texto é o rótulo genérico de GPS sem endereço legível.
 */
export function ehEnderecoGenericoGps(texto) {
  if (typeof texto !== 'string') return false;
  return /^localiza[cç][aã]o\s+atual\s*\(gps\)$/i.test(texto.trim());
}

/**
 * Mapeia códigos de erro da Geolocation API para mensagens claras ao usuário.
 * @param {object} err
 * @returns {string}
 */
export function traduzirErroGeolocalizacao(err) {
  const code = err?.code;
  if (code === 1) {
    return 'Permissão de localização negada. Permita o acesso ao GPS no navegador ou digite o endereço manualmente.';
  }
  if (code === 2) {
    return 'Localização GPS indisponível ou desativada no dispositivo. Verifique o GPS ou digite o endereço manualmente.';
  }
  if (code === 3) {
    return 'Tempo limite esgotado ao obter a localização pelo GPS. Tente novamente ou digite o endereço manualmente.';
  }
  return 'Não foi possível obter a localização GPS. Tente novamente ou digite o endereço manualmente.';
}

/**
 * Obtém as coordenadas reais do dispositivo via Geolocation API e converte em
 * um endereço legível por geocodificação reversa, preservando as coordenadas originais.
 */
export async function obterEnderecoOrigemPorGps({
  geolocation = typeof navigator !== 'undefined' ? navigator.geolocation : null,
  geocodificarReverso,
  timeout = 10000,
} = {}) {
  if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') {
    throw new Error('GPS não disponível neste navegador ou dispositivo. Digite o endereço manualmente.');
  }
  if (typeof geocodificarReverso !== 'function') {
    throw new Error('Serviço de geocodificação reversa não configurado.');
  }

  const coords = await new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          reject(new Error('Coordenadas inválidas retornadas pelo GPS. Tente novamente ou digite o endereço manualmente.'));
          return;
        }
        resolve({ latitude: lat, longitude: lng });
      },
      (geoErr) => {
        reject(new Error(traduzirErroGeolocalizacao(geoErr)));
      },
      {
        enableHighAccuracy: true,
        timeout,
        maximumAge: 0,
      }
    );
  });

  let endereco;
  try {
    endereco = await geocodificarReverso(coords.latitude, coords.longitude);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Não foi possível converter sua localização em um endereço legível. Tente novamente ou digite o endereço manualmente.';
    throw new Error(msg);
  }

  const descricao = typeof endereco?.descricao === 'string' ? endereco.descricao.trim() : '';
  if (!descricao || ehEnderecoGenericoGps(descricao)) {
    throw new Error(
      'Não foi possível identificar um endereço legível para a sua localização atual. Tente novamente ou digite o endereço manualmente.'
    );
  }

  return {
    descricao,
    logradouro: typeof endereco.logradouro === 'string' ? endereco.logradouro.trim() : '',
    numero: endereco.numero != null ? String(endereco.numero).trim() : '',
    complemento: typeof endereco.complemento === 'string' ? endereco.complemento.trim() : '',
    bairro: typeof endereco.bairro === 'string' ? endereco.bairro.trim() : '',
    cidade: typeof endereco.cidade === 'string' ? endereco.cidade.trim() : '',
    estado: typeof endereco.estado === 'string' ? endereco.estado.trim() : '',
    uf: typeof endereco.uf === 'string' ? endereco.uf.trim() : '',
    cep: typeof endereco.cep === 'string' ? endereco.cep.trim() : '',
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
}

function normalizarEnderecoEstruturado(end, coords) {
  if (!end || typeof end !== 'object' || Array.isArray(end)) return undefined;
  const temCampo =
    Boolean(end.logradouro) ||
    Boolean(end.bairro) ||
    Boolean(end.cidade) ||
    Boolean(end.estado) ||
    Boolean(end.uf) ||
    Boolean(end.cep);
  if (!temCampo) return undefined;

  return {
    logradouro: typeof end.logradouro === 'string' ? end.logradouro.trim() : '',
    numero: end.numero != null ? String(end.numero).trim() : '',
    complemento: typeof end.complemento === 'string' ? end.complemento.trim() : '',
    bairro: typeof end.bairro === 'string' ? end.bairro.trim() : '',
    cidade: typeof end.cidade === 'string' ? end.cidade.trim() : '',
    estado: typeof end.estado === 'string' ? end.estado.trim() : '',
    uf: typeof end.uf === 'string' ? end.uf.trim() : '',
    cep: typeof end.cep === 'string' ? end.cep.trim() : '',
    latitude: coords?.lat ?? normalizarLatitudeOpcional(end.latitude, 'endereco.latitude'),
    longitude: coords?.lng ?? normalizarLongitudeOpcional(end.longitude, 'endereco.longitude'),
  };
}

/**
 * Monta o payload de criação de corrida garantindo:
 * - Preservação de coordenadas iguais a `0` e negativas;
 * - Ausência de coordenadas representada como `null`;
 * - Rejeição de coordenadas fora dos limites geográficos;
 * - Rejeição de rótulo genérico de GPS sem endereço legível;
 * - Conversão consistente de `dataHorario` no fuso `America/Sao_Paulo`;
 * - Não envio de `usuarioId` (determinado pelo token no backend).
 */
export function montarPayloadCriacaoCorrida({
  origemNome,
  destinoNome,
  origemGeocodificada,
  destinoGeocodificada,
  origemEndereco,
  destinoEndereco,
  rota,
  dataHorario,
  classe,
  formaPagamento,
}) {
  if (!rota || typeof rota !== 'object') {
    throw new Error('Selecione uma rota válida primeiro.');
  }

  const origemLimpa = typeof origemNome === 'string' ? origemNome.trim() : '';
  const destinoLimpo = typeof destinoNome === 'string' ? destinoNome.trim() : '';

  if (!origemLimpa) {
    throw new Error('Informe um endereço de origem válido.');
  }
  if (ehEnderecoGenericoGps(origemLimpa)) {
    throw new Error('O endereço de origem obtido pelo GPS deve ser convertido em um endereço legível antes de solicitar a corrida.');
  }
  if (!destinoLimpo) {
    throw new Error('Informe um endereço de destino válido.');
  }
  if (ehEnderecoGenericoGps(destinoLimpo)) {
    throw new Error('O endereço de destino obtido pelo GPS deve ser convertido em um endereço legível antes de solicitar a corrida.');
  }

  const coordsOrigem = extrairCoordenadasGeocodificadas(origemGeocodificada, 'origem');
  const coordsDestino = extrairCoordenadasGeocodificadas(destinoGeocodificada, 'destino');
  const dataHorarioIso = converterDataHorarioComercialParaISO(dataHorario);

  const payload = {
    origemNome: origemLimpa,
    destinoNome: destinoLimpo,
    origemLat: coordsOrigem.lat ?? null,
    origemLng: coordsOrigem.lng ?? null,
    destinoLat: coordsDestino.lat ?? null,
    destinoLng: coordsDestino.lng ?? null,
    rotaCaminho: rota.caminho,
    polyline: rota.polyline ?? null,
    distanciaKm: rota.distanciaKm,
    duracaoMin: rota.duracaoMin,
    dataHorario: dataHorarioIso,
    classe,
    formaPagamento,
  };

  const origemEndNorm = normalizarEnderecoEstruturado(origemEndereco, coordsOrigem);
  if (origemEndNorm) {
    payload.origemEndereco = origemEndNorm;
  }
  const destinoEndNorm = normalizarEnderecoEstruturado(destinoEndereco, coordsDestino);
  if (destinoEndNorm) {
    payload.destinoEndereco = destinoEndNorm;
  }

  return payload;
}

