import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarLatitudeOpcional,
  normalizarLongitudeOpcional,
  possuiCoordenadasValidas,
  extrairCoordenadasGeocodificadas,
  converterDataHorarioComercialParaISO,
  obterMinDatetimeComercial,
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

