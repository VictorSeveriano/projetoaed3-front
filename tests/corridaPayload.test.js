import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarLatitudeOpcional,
  normalizarLongitudeOpcional,
  possuiCoordenadasValidas,
  extrairCoordenadasGeocodificadas,
  converterDataHorarioComercialParaISO,
  obterMinDatetimeComercial,
  ehEnderecoGenericoGps,
  obterEnderecoOrigemPorGps,
  traduzirErroGeolocalizacao,
  montarPayloadCriacaoCorrida,
} from '../src/utils/corridaPayload.js';
import { formatarDataHorario } from '../src/utils/formatters.js';

test('Preserva latitude 0 e longitude 0 na normalização e no payload final da corrida', () => {
  assert.equal(normalizarLatitudeOpcional(0, 'origemLat'), 0);
  assert.equal(normalizarLongitudeOpcional(0, 'origemLng'), 0);
  assert.equal(normalizarLatitudeOpcional(-0, 'origemLat'), 0);
  assert.equal(possuiCoordenadasValidas(0, 0), true);
  assert.equal(possuiCoordenadasValidas(0, -40.3376), true);
  assert.equal(possuiCoordenadasValidas(-20.3197, 0), true);

  const payload = montarPayloadCriacaoCorrida({
    origemNome: 'Marco Zero Equador / Greenwich',
    destinoNome: 'Vitória - ES',
    origemGeocodificada: { lat: 0, lng: 0 },
    destinoGeocodificada: { lat: -20.3197, lng: -40.3376 },
    rota: {
      caminho: ['Marco Zero', 'Vitória'],
      polyline: 'abc123',
      distanciaKm: 12.5,
      duracaoMin: 25,
    },
    dataHorario: '2026-10-01T10:00',
    classe: 'NORMAL',
    formaPagamento: 'PIX',
  });

  assert.equal(payload.origemLat, 0);
  assert.equal(payload.origemLng, 0);
  assert.equal(payload.destinoLat, -20.3197);
  assert.equal(payload.destinoLng, -40.3376);
  assert.equal('usuarioId' in payload, false);
});

test('Preserva coordenadas negativas e trata coordenadas ausentes como null', () => {
  assert.equal(normalizarLatitudeOpcional(-20.3197), -20.3197);
  assert.equal(normalizarLongitudeOpcional(-40.3376), -40.3376);
  assert.equal(normalizarLatitudeOpcional(null), null);
  assert.equal(normalizarLatitudeOpcional(undefined), null);
  assert.equal(normalizarLongitudeOpcional(null), null);
  assert.equal(normalizarLongitudeOpcional(undefined), null);

  const payloadSemCoords = montarPayloadCriacaoCorrida({
    origemNome: 'Origem A',
    destinoNome: 'Destino B',
    origemGeocodificada: null,
    destinoGeocodificada: undefined,
    rota: {
      caminho: ['Origem A', 'Destino B'],
      distanciaKm: 8,
      duracaoMin: 15,
    },
    dataHorario: '2026-10-01T14:30',
    classe: 'BASICO',
    formaPagamento: 'DINHEIRO',
  });

  assert.equal(payloadSemCoords.origemLat, null);
  assert.equal(payloadSemCoords.origemLng, null);
  assert.equal(payloadSemCoords.destinoLat, null);
  assert.equal(payloadSemCoords.destinoLng, null);
  assert.equal(payloadSemCoords.polyline, null);
});

test('Rejeita coordenadas fora dos limites [-90, 90] e [-180, 180] ou valores não numéricos', () => {
  for (const latInvalida of [-90.001, 90.001, 120, NaN, Infinity, -Infinity, '', 'abc', true, false, {}, []]) {
    assert.throws(() => normalizarLatitudeOpcional(latInvalida, 'origemLat'));
  }

  for (const lngInvalida of [-180.001, 180.001, 250, NaN, Infinity, -Infinity, '', 'xyz', true, false, {}, []]) {
    assert.throws(() => normalizarLongitudeOpcional(lngInvalida, 'origemLng'));
  }

  assert.throws(() =>
    extrairCoordenadasGeocodificadas({ lat: 0, lng: null }, 'origem')
  );
  assert.equal(possuiCoordenadasValidas(null, 0), false);
  assert.equal(possuiCoordenadasValidas(95, 0), false);
  assert.equal(possuiCoordenadasValidas(0, 190), false);
});

test('Converte dataHorario no fuso comercial America/Sao_Paulo (-03:00) com consistência nas fronteiras tarifárias', () => {
  // 04:59 BRT -> 07:59 UTC (noite)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T04:59'),
    '2026-10-01T07:59:00.000Z'
  );
  // 05:00 BRT -> 08:00 UTC (manhã)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T05:00'),
    '2026-10-01T08:00:00.000Z'
  );
  // 12:59 BRT -> 15:59 UTC (manhã)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T12:59'),
    '2026-10-01T15:59:00.000Z'
  );
  // 13:00 BRT -> 16:00 UTC (tarde)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T13:00'),
    '2026-10-01T16:00:00.000Z'
  );
  // 18:59 BRT -> 21:59 UTC (tarde)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T18:59'),
    '2026-10-01T21:59:00.000Z'
  );
  // 19:00 BRT -> 22:00 UTC (noite)
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T19:00'),
    '2026-10-01T22:00:00.000Z'
  );

  // Preserva instante quando já vem com offset explícito ou Z
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T16:00:00.000Z'),
    '2026-10-01T16:00:00.000Z'
  );
  assert.equal(
    converterDataHorarioComercialParaISO('2026-10-01T13:00:00-03:00'),
    '2026-10-01T16:00:00.000Z'
  );

  // Rejeita datas inválidas ou inexistentes
  for (const dataInvalida of ['', '   ', 'data-invalida', '2026-02-30T10:00', '2026-10-01T25:00', null, undefined]) {
    assert.throws(() => converterDataHorarioComercialParaISO(dataInvalida));
  }

  // Formatação no fuso comercial America/Sao_Paulo e minDatetime
  const minStr = obterMinDatetimeComercial(Date.parse('2026-10-01T16:00:00.000Z'));
  assert.equal(minStr, '2026-10-01T13:00');
  const exibicao = formatarDataHorario('2026-10-01T16:00:00.000Z');
  assert.match(exibicao, /01\/10\/2026.*13:00/);
});

test('GPS: obtém coordenadas reais, converte via geocodificação reversa (com e sem número) e preserva coordenadas originais', async () => {
  const geolocationMock = {
    getCurrentPosition(success) {
      success({ coords: { latitude: -20.297618, longitude: -40.295776 } });
    },
  };

  // Caso 1: Com número do imóvel
  const enderecoComNumero = await obterEnderecoOrigemPorGps({
    geolocation: geolocationMock,
    geocodificarReverso: async (lat, lng) => {
      assert.equal(lat, -20.297618);
      assert.equal(lng, -40.295776);
      return {
        descricao: 'Avenida Nossa Senhora da Penha, 1234, Santa Luíza, Vitória - ES',
        logradouro: 'Avenida Nossa Senhora da Penha',
        numero: '1234',
        bairro: 'Santa Luíza',
        cidade: 'Vitória',
        estado: 'Espírito Santo',
        uf: 'ES',
        cep: '29045-402',
        latitude: -20.298, // centroide aproximado retornado pela API externa
        longitude: -40.296,
      };
    },
  });

  assert.equal(
    enderecoComNumero.descricao,
    'Avenida Nossa Senhora da Penha, 1234, Santa Luíza, Vitória - ES'
  );
  assert.equal(enderecoComNumero.numero, '1234');
  // Coordenadas reais do GPS preservadas
  assert.equal(enderecoComNumero.latitude, -20.297618);
  assert.equal(enderecoComNumero.longitude, -40.295776);

  // Caso 2: Sem número do imóvel (não inventa número)
  const enderecoSemNumero = await obterEnderecoOrigemPorGps({
    geolocation: geolocationMock,
    geocodificarReverso: async () => ({
      descricao: 'Avenida Nossa Senhora da Penha, Santa Luíza, Vitória - ES',
      logradouro: 'Avenida Nossa Senhora da Penha',
      numero: '',
      bairro: 'Santa Luíza',
      cidade: 'Vitória',
      estado: 'Espírito Santo',
      uf: 'ES',
      cep: '29045-402',
    }),
  });

  assert.equal(
    enderecoSemNumero.descricao,
    'Avenida Nossa Senhora da Penha, Santa Luíza, Vitória - ES'
  );
  assert.equal(enderecoSemNumero.numero, '');
  assert.equal(enderecoSemNumero.latitude, -20.297618);
  assert.equal(enderecoSemNumero.longitude, -40.295776);

  // Payload de criação da corrida persiste endereço legível, endereço estruturado e coordenadas reais
  const payload = montarPayloadCriacaoCorrida({
    origemNome: enderecoComNumero.descricao,
    destinoNome: 'Rodovia ES-010, KM 6, Manguinhos, Serra - ES',
    origemGeocodificada: { lat: enderecoComNumero.latitude, lng: enderecoComNumero.longitude },
    destinoGeocodificada: { lat: -20.195432, lng: -40.217891 },
    origemEndereco: enderecoComNumero,
    rota: {
      caminho: [enderecoComNumero.descricao, 'Rodovia ES-010, KM 6, Manguinhos, Serra - ES'],
      polyline: 'poly123',
      distanciaKm: 17.92,
      duracaoMin: 39,
    },
    dataHorario: '2026-10-29T11:14',
    classe: 'BASICO',
    formaPagamento: 'DINHEIRO',
  });

  assert.equal(payload.origemNome, 'Avenida Nossa Senhora da Penha, 1234, Santa Luíza, Vitória - ES');
  assert.equal(payload.origemLat, -20.297618);
  assert.equal(payload.origemLng, -40.295776);
  assert.equal(payload.origemEndereco.logradouro, 'Avenida Nossa Senhora da Penha');
  assert.equal(payload.origemEndereco.numero, '1234');
  assert.equal(payload.origemEndereco.cidade, 'Vitória');
});

test('GPS: trata permissão negada, GPS indisponível, timeout, falha de geocodificação reversa e bloqueia rótulo genérico', async () => {
  // Permissão negada (code 1)
  await assert.rejects(
    () =>
      obterEnderecoOrigemPorGps({
        geolocation: {
          getCurrentPosition(_ok, fail) {
            fail({ code: 1 });
          },
        },
        geocodificarReverso: async () => ({}),
      }),
    /Permissão de localização negada/i
  );

  // GPS indisponível (code 2)
  await assert.rejects(
    () =>
      obterEnderecoOrigemPorGps({
        geolocation: {
          getCurrentPosition(_ok, fail) {
            fail({ code: 2 });
          },
        },
        geocodificarReverso: async () => ({}),
      }),
    /indisponível ou desativada/i
  );

  // Timeout (code 3)
  await assert.rejects(
    () =>
      obterEnderecoOrigemPorGps({
        geolocation: {
          getCurrentPosition(_ok, fail) {
            fail({ code: 3 });
          },
        },
        geocodificarReverso: async () => ({}),
      }),
    /Tempo limite esgotado/i
  );

  // Falha no serviço de geocodificação reversa seguida de nova tentativa bem-sucedida
  let tentativas = 0;
  const geoOk = {
    getCurrentPosition(success) {
      success({ coords: { latitude: -20.3155, longitude: -40.3128 } });
    },
  };
  const fnReversoComFalhaInicial = async () => {
    tentativas += 1;
    if (tentativas === 1) {
      throw new Error('Serviço de geocodificação reversa indisponível no momento.');
    }
    return {
      descricao: 'Avenida Jerônimo Monteiro, 1000, Centro, Vitória - ES',
      logradouro: 'Avenida Jerônimo Monteiro',
      numero: '1000',
      bairro: 'Centro',
      cidade: 'Vitória',
      estado: 'Espírito Santo',
      uf: 'ES',
    };
  };

  await assert.rejects(
    () => obterEnderecoOrigemPorGps({ geolocation: geoOk, geocodificarReverso: fnReversoComFalhaInicial }),
    /indisponível/i
  );
  const aposRetry = await obterEnderecoOrigemPorGps({
    geolocation: geoOk,
    geocodificarReverso: fnReversoComFalhaInicial,
  });
  assert.equal(aposRetry.descricao, 'Avenida Jerônimo Monteiro, 1000, Centro, Vitória - ES');

  // Bloqueia rótulo genérico "Localizacao Atual (GPS)" / "Localização atual (GPS)"
  assert.equal(ehEnderecoGenericoGps('Localizacao Atual (GPS)'), true);
  assert.equal(ehEnderecoGenericoGps('Localização atual (GPS)'), true);
  assert.throws(
    () =>
      montarPayloadCriacaoCorrida({
        origemNome: 'Localizacao Atual (GPS)',
        destinoNome: 'Vitória - ES',
        origemGeocodificada: { lat: -20.3, lng: -40.3 },
        destinoGeocodificada: { lat: -20.2, lng: -40.2 },
        rota: { caminho: ['A', 'B'], distanciaKm: 5, duracaoMin: 10 },
        dataHorario: '2026-10-29T12:00',
        classe: 'NORMAL',
        formaPagamento: 'PIX',
      }),
    /convertido em um endereço legível/i
  );
  assert.equal( typeof traduzirErroGeolocalizacao({ code: 1 }), 'string');
});

