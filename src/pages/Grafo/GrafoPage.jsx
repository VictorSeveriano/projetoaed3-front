import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import MapView from '../../components/ui/MapView';
import rotasService from '../../services/rotas.service';
import {
  Compass,
  ArrowRight,
  TriangleAlert,
  Search,
  CheckCircle2,
  Ruler,
  Clock,
  MapPin,
  RefreshCw,
  Navigation,
} from 'lucide-react';

/**
 * RotasPage — Tela de Rotas do ReservaCar.
 *
 * Permite ao usuário:
 * - Selecionar um local de origem entre os pontos reais do Espírito Santo
 * - Selecionar um local de destino
 * - Calcular a melhor rota entre os dois pontos
 * - Visualizar o trajeto no mapa (Google Maps)
 * - Conferir distância real e tempo estimado de deslocamento
 *
 * Arquitetura:
 * - Esta página contém apenas lógica de interface e interação
 * - O cálculo de rota (Dijkstra + Directions API) é responsabilidade do backend
 * - A exibição do mapa é responsabilidade do componente MapView
 *
 * Terminologia ao usuário: "Rotas", "Origem", "Destino", "Melhor Rota"
 * Terminologia interna (código): grafo, dijkstra, vértice, aresta (apenas nos services)
 */
const RotasPage = () => {
  // --- Estado principal ---
  const [locais, setLocais] = useState([]);
  const [carregandoLocais, setCarregandoLocais] = useState(true);
  const [erroLocais, setErroLocais] = useState('');

  // --- Seleção de origem ---
  const [origemTexto, setOrigemTexto] = useState('');
  const [coordenadasGps, setCoordenadasGps] = useState(null);

  // --- Resultado da rota ---
  const [resultado, setResultado] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [erroCalculo, setErroCalculo] = useState('');

  // --- Carrega os locais disponíveis ao montar a página ---
  useEffect(() => {
    rotasService
      .listarLocais()
      .then((data) => setLocais(data))
      .catch(() => setErroLocais('Não foi possível carregar os locais disponíveis.'))
      .finally(() => setCarregandoLocais(false));
  }, []);

  // Resolve os objetos para o mapa a partir do resultado (se houver)
  const localOrigem = resultado?.pontos[0] || null;
  const localDestino = resultado?.pontos[resultado.pontos.length - 1] || null;

  /**
   * Captura a localização atual do usuário via HTML5 Geolocation API
   */
  const handleGpsClick = () => {
    if (!navigator.geolocation) {
      setErroCalculo('Seu navegador não suporta geolocalização.');
      return;
    }

    setCalcLoading(true);
    setErroCalculo('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCalcLoading(false);
        setCoordenadasGps({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setOrigemTexto('Usando localização atual (GPS)');
        setResultado(null);
      },
      (error) => {
        setCalcLoading(false);
        setErroCalculo('Não foi possível obter sua localização. Verifique as permissões.');
      }
    );
  };

  /**
   * Valida os campos e aciona o cálculo de rota no backend.
   */
  const calcularRota = useCallback(async () => {
    if (!origemTexto && !coordenadasGps) {
      setErroCalculo('Informe o CEP/Endereço ou use a localização atual.');
      return;
    }

    setErroCalculo('');
    setResultado(null);
    setCalcLoading(true);

    try {
      // Se tivermos coordenadas de GPS, envia elas; senão envia o texto
      const reqLat = coordenadasGps ? coordenadasGps.lat : null;
      const reqLng = coordenadasGps ? coordenadasGps.lng : null;
      const reqCep = coordenadasGps ? null : origemTexto;

      const rota = await rotasService.calcularMaisProximo(reqCep, reqLat, reqLng);
      setResultado(rota);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Não foi possível calcular a rota.';
      setErroCalculo(msg);
    } finally {
      setCalcLoading(false);
    }
  }, [origemTexto, coordenadasGps]);

  /**
   * Limpa a seleção e o resultado, voltando ao estado inicial.
   */
  const limpar = useCallback(() => {
    setOrigemTexto('');
    setCoordenadasGps(null);
    setResultado(null);
    setErroCalculo('');
  }, []);

  const handleOrigemChange = (e) => {
    setOrigemTexto(e.target.value);
    if (coordenadasGps) setCoordenadasGps(null); // Reseta o GPS se o usuário voltar a digitar
    setResultado(null);
    setErroCalculo('');
  };

  // --- Renderização de estado de carregamento inicial ---
  if (carregandoLocais) {
    return (
      <div className="page animate-fade-in">
        <Header
          title="Rotas"
          subtitle="Consulte e calcule os melhores trajetos entre os locais disponíveis."
        />
        <Loading message="Carregando locais..." />
      </div>
    );
  }

  // --- Renderização de erro ao carregar locais ---
  if (erroLocais) {
    return (
      <div className="page animate-fade-in">
        <Header
          title="Rotas"
          subtitle="Consulte e calcule os melhores trajetos entre os locais disponíveis."
        />
        <div className="rotas-error-state">
          <TriangleAlert size={40} aria-hidden="true" />
          <p>{erroLocais}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-fade-in">
      <Header
        title="Rotas"
        subtitle="Selecione a origem e o destino para calcular o melhor trajeto entre os locais do Espírito Santo."
      />

      <div className="rotas-layout">
        {/* ===== PAINEL DE CONTROLE ===== */}
        <div className="rotas-panel">
          <div className="rotas-panel__header">
            <Compass size={22} aria-hidden="true" className="rotas-panel__icon" />
            <h2 className="rotas-panel__title">Calcular Rota</h2>
          </div>

          <p className="rotas-panel__desc">
            Digite seu CEP/Endereço ou use sua localização atual. O sistema encontrará a agência mais próxima para devolver o carro.
          </p>

          {/* --- Formulário de seleção --- */}
          <div className="rotas-panel__form">
            {/* Origem (Texto) */}
            <div className="input-group">
              <label className="input-label" htmlFor="input-origem">Onde você está?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="input-origem"
                  type="text"
                  className="input-field"
                  placeholder="Ex: 29010-000 ou Av. Vitória"
                  value={origemTexto}
                  onChange={handleOrigemChange}
                  disabled={coordenadasGps !== null}
                  aria-label="Digitar CEP ou Endereço"
                  style={{ flex: 1 }}
                />
                <Button 
                  variant="secondary" 
                  onClick={handleGpsClick} 
                  disabled={calcLoading}
                  title="Usar localização atual"
                  style={{ padding: '0 12px' }}
                >
                  <Navigation size={20} />
                </Button>
              </div>
            </div>

            {/* Mensagem de erro de validação / cálculo */}
            {erroCalculo && (
              <div className="form-error rotas-form-error" role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{erroCalculo}</span>
              </div>
            )}

            {/* Botões de ação */}
            <div className="rotas-panel__actions">
              <Button
                id="btn-calcular-rota"
                onClick={calcularRota}
                loading={calcLoading}
                disabled={(!origemTexto && !coordenadasGps) || calcLoading}
                className="w-full"
                aria-label="Encontrar agência mais próxima"
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Search size={16} aria-hidden="true" />
                  {calcLoading ? 'Buscando...' : 'Encontrar Agência'}
                </span>
              </Button>

              {(origemTexto || resultado) && (
                <Button
                  id="btn-limpar-rota"
                  variant="secondary"
                  onClick={limpar}
                  disabled={calcLoading}
                  className="w-full"
                  aria-label="Limpar seleção e resultado"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* ===== RESULTADO DA ROTA ===== */}
          {resultado && (
            <div className="rota-result animate-fade-in" role="region" aria-label="Resultado da rota">
              <h3 className="rota-result__title">
                <CheckCircle2 size={18} aria-hidden="true" />
                Melhor Rota Encontrada
              </h3>

              {/* Origem → Destino resumo */}
              <div className="rota-result__info">
                <div>
                  <span className="rota-label">Sua Localização:</span>
                  <strong>{resultado.origem}</strong>
                </div>
                <div>
                  <span className="rota-label">Agência Mais Próxima:</span>
                  <strong style={{ color: 'var(--primary-color)' }}>{resultado.destino}</strong>
                </div>
              </div>

              {/* Trajeto visual */}
              <div className="rota-result__path" aria-label="Trajeto">
                {resultado.caminho.map((nome, i) => (
                  <React.Fragment key={nome}>
                    <span className="rota-node">{nome}</span>
                    {i < resultado.caminho.length - 1 && (
                      <span className="rota-arrow" aria-hidden="true">
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Métricas da rota */}
              <div className="rota-result__metrics">
                <div className="rota-metric">
                  <Ruler size={16} aria-hidden="true" className="rota-metric__icon" />
                  <div>
                    <span className="rota-metric__label">Distância</span>
                    <span className="rota-metric__value">{resultado.distanciaFormatada}</span>
                  </div>
                </div>

                {resultado.duracaoFormatada && (
                  <div className="rota-metric">
                    <Clock size={16} aria-hidden="true" className="rota-metric__icon" />
                    <div>
                      <span className="rota-metric__label">Tempo estimado</span>
                      <span className="rota-metric__value">{resultado.duracaoFormatada}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fonte dos dados */}
              {resultado.fonte === 'grafo_interno' && (
                <p className="rota-result__fonte">
                  Distância calculada internamente. Configure a API do Google Maps para dados em tempo real.
                </p>
              )}
            </div>
          )}

          {/* ===== INFORMAÇÕES DOS LOCAIS ===== */}
          <div className="rotas-info">
            <h3 className="rotas-info__title">
              <MapPin size={16} aria-hidden="true" />
              Locais Disponíveis
            </h3>
            <div className="rotas-info__stats">
              <div className="grafo-stat">
                <span className="grafo-stat__value">{locais.length}</span>
                <span className="grafo-stat__label">Locais</span>
              </div>
              <div className="grafo-stat">
                <span className="grafo-stat__value">
                  {[...new Set(locais.map((l) => l.cidade))].length}
                </span>
                <span className="grafo-stat__label">Cidades</span>
              </div>
            </div>

            {/* Lista resumida de locais */}
            <ul className="rotas-locais-list" aria-label="Lista de locais cadastrados">
              {locais.map((local) => (
                <li key={local.id} className="rotas-local-item">
                  <span className="rotas-local-item__nome">{local.nome}</span>
                  <span className="rotas-local-item__cidade">{local.cidade} · {local.categoria}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== MAPA ===== */}
        <div className="rotas-visual-wrapper">
          <MapView
            locations={locais}
            origin={localOrigem}
            destination={localDestino}
            polyline={resultado?.polyline || null}
            loading={calcLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RotasPage;
