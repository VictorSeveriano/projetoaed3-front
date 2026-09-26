import React, { useEffect, useRef, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import CorridaModal from '../../components/ui/CorridaModal';
import rotasService from '../../services/rotas.service';
import useLocationSearch from '../../hooks/useLocationSearch';
import { MapPin, Navigation, Route, Car, Clock, ArrowRight, Check, Search, X, Loader } from 'lucide-react';

/**
 * RotasPage — Pagina de solicitacao de corrida.
 *
 * Fluxo:
 * 1. Usuario digita origem (>= 3 chars) -> debounce 400ms -> sugestoes aparecem
 * 2. Usuario seleciona sugestao -> origemSelecionada = { ..., latitude, longitude }
 * 3. Repete para destino
 * 4. Clica "Calcular Rotas" -> backend recebe coordenadas -> Routes API -> rotas reais
 * 5. Usuario seleciona rota alternativa -> mapa atualiza
 * 6. Usuario confirma corrida no modal
 *
 * Regras:
 * - "Calcular Rotas" so funciona com origem e destino selecionados/validados
 * - Editar o texto apos selecionar invalida a selecao (handled pelo hook)
 * - GPS preenche a origem diretamente sem autocomplete
 */
const RotasPage = () => {
  // --- Autocomplete de Origem ---
  const origem  = useLocationSearch();
  // --- Autocomplete de Destino ---
  const destino = useLocationSearch();

  const [rotas, setRotas]                   = React.useState([]);
  const [rotaSelecionada, setRotaSelecionada] = React.useState(null);
  const [loading, setLoading]               = React.useState(false);
  const [loadingGps, setLoadingGps]         = React.useState(false);
  const [error, setError]                   = React.useState('');
  const [corridaModal, setCorridaModal]     = React.useState({ open: false });

  const containerRef    = useRef(null);
  const mapRef          = useRef(null);
  const markersRef      = useRef([]);
  const polylineRef     = useRef(null);
  const isMapInitRef    = useRef(false);
  const origemListRef   = useRef(null);
  const destinoListRef  = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const CENTER_ES = { lat: -20.2760, lng: -40.3520 };

  // --- Mapa ---
  const limparMarcadores = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  const limparPolyline = useCallback(() => {
    if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
  }, []);

  const renderizarMapa = useCallback((polyline = null) => {
    if (!mapRef.current || !window.google) return;
    limparMarcadores();
    limparPolyline();

    if (rotaSelecionada && rotaSelecionada.pontos) {
      rotaSelecionada.pontos.forEach((ponto, idx) => {
        if (!ponto.latitude || !ponto.longitude) return;
        const isOrigem  = idx === 0;
        const isDestino = idx === rotaSelecionada.pontos.length - 1;
        const icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: isOrigem ? '#6366f1' : isDestino ? '#10b981' : '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: isOrigem || isDestino ? 10 : 6,
        };
        const marker = new window.google.maps.Marker({
          position: { lat: ponto.latitude, lng: ponto.longitude },
          map: mapRef.current,
          title: ponto.nome,
          icon,
          animation: window.google.maps.Animation.DROP,
        });
        const iw = new window.google.maps.InfoWindow({
          content: `<div style="font-family:Inter,sans-serif;padding:4px;min-width:160px"><b style="font-size:13px;color:#1e293b">${ponto.nome}</b></div>`,
        });
        marker.addListener('click', () => iw.open(mapRef.current, marker));
        markersRef.current.push(marker);
      });
    }

    if (polyline && window.google.maps.geometry) {
      const decoded = window.google.maps.geometry.encoding.decodePath(polyline);
      polylineRef.current = new window.google.maps.Polyline({
        path: decoded, geodesic: true,
        strokeColor: '#6366f1', strokeOpacity: 0.9, strokeWeight: 5,
      });
      polylineRef.current.setMap(mapRef.current);
      const bounds = new window.google.maps.LatLngBounds();
      decoded.forEach((p) => bounds.extend(p));
      mapRef.current.fitBounds(bounds, { padding: 60 });
    } else if (rotaSelecionada && rotaSelecionada.pontos.length >= 2) {
      const bounds = new window.google.maps.LatLngBounds();
      rotaSelecionada.pontos
        .filter((p) => p.latitude && p.longitude)
        .forEach((p) => bounds.extend({ lat: p.latitude, lng: p.longitude }));
      if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, { padding: 80 });
    }
  }, [rotaSelecionada, limparMarcadores, limparPolyline]);

  const inicializarMapa = useCallback(() => {
    if (!containerRef.current || isMapInitRef.current) return;
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: CENTER_ES, zoom: 11,
      mapTypeId: 'roadmap', mapTypeControl: false, streetViewControl: false,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
        { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
      ],
    });

    const trafficLayer = new window.google.maps.TrafficLayer();
    trafficLayer.setMap(mapRef.current);

    isMapInitRef.current = true;
    renderizarMapa();
  }, [renderizarMapa]);

  useEffect(() => {
    if (!apiKey) return;
    if (window.google && window.google.maps) { inicializarMapa(); return; }
    if (document.getElementById('gm-script-rotas')) {
      const check = setInterval(() => { if (window.google?.maps) { clearInterval(check); inicializarMapa(); } }, 100);
      return () => clearInterval(check);
    }
    const s = document.createElement('script');
    s.id = 'gm-script-rotas';
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=geometry&language=pt-BR';
    s.async = true; s.defer = true; s.onload = inicializarMapa;
    document.head.appendChild(s);
  }, [apiKey, inicializarMapa]);

  useEffect(() => {
    if (isMapInitRef.current) renderizarMapa(rotaSelecionada?.polyline);
  }, [rotaSelecionada, renderizarMapa]);

  // --- Fechar sugestoes ao clicar fora ---
  useEffect(() => {
    const handleClickFora = (e) => {
      if (origemListRef.current && !origemListRef.current.contains(e.target)) {
        origem.setMostrarSugestoes(false);
      }
      if (destinoListRef.current && !destinoListRef.current.contains(e.target)) {
        destino.setMostrarSugestoes(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [origem, destino]);

  // --- GPS ---
  const usarGps = () => {
    if (!navigator.geolocation) { setError('GPS nao disponivel neste navegador.'); return; }
    setLoadingGps(true); setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Simula uma sugestao selecionada com os dados do GPS
        const sugestaoGps = {
          descricao: 'Localizacao Atual (GPS)',
          logradouro: '', numero: '', complemento: '',
          bairro: '', cidade: '', estado: '', cep: '',
          latitude,
          longitude,
        };
        origem.selecionar(sugestaoGps);
        setLoadingGps(false);
      },
      () => { setError('Nao foi possivel obter a localizacao GPS.'); setLoadingGps(false); },
      { timeout: 8000 },
    );
  };

  // --- Navega pelo teclado no dropdown ---
  const handleKeyDown = useCallback((e, campo, listId) => {
    if (!campo.mostrarSugestoes && !campo.sugestoes.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      campo.setActiveIndex((i) => Math.min(i + 1, campo.sugestoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      campo.setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (campo.activeIndex >= 0 && campo.sugestoes[campo.activeIndex]) {
        e.preventDefault();
        campo.selecionar(campo.sugestoes[campo.activeIndex]);
      }
    } else if (e.key === 'Escape') {
      campo.setMostrarSugestoes(false);
      campo.setActiveIndex(-1);
    }
  }, []);

  // --- Calcular rotas ---
  const calcularRotas = async () => {
    // Validar selecoes — nunca geocodificar no momento do clique
    if (!origem.selecionada) {
      setError('Nao foi selecionada uma localizacao valida para a origem.');
      return;
    }
    if (!destino.selecionada) {
      setError('Nao foi selecionada uma localizacao valida para o destino.');
      return;
    }

    const origemPayload = {
      nome: origem.selecionada.descricao,
      lat: origem.selecionada.latitude,
      lng: origem.selecionada.longitude,
    };
    const destinoPayload = {
      nome: destino.selecionada.descricao,
      lat: destino.selecionada.latitude,
      lng: destino.selecionada.longitude,
    };

    setLoading(true); setError(''); setRotas([]); setRotaSelecionada(null);
    try {
      const resultado = await rotasService.calcularCorrida(origemPayload, destinoPayload);
      setRotas(resultado.rotas || []);
      if (resultado.rotas && resultado.rotas.length > 0) {
        setRotaSelecionada(resultado.rotas[0]);
      } else {
        setError('Nenhuma rota encontrada entre os enderecos informados.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Nao foi possivel calcular a rota agora. Tente novamente.',
      );
    } finally { setLoading(false); }
  };

  const selecionarRota = (rota) => setRotaSelecionada(rota);

  const abrirCorridaModal = () => {
    if (!rotaSelecionada) { setError('Selecione uma rota antes de solicitar a corrida.'); return; }
    setCorridaModal({ open: true });
  };

  // --- Renderiza campo com autocomplete ---
  const renderCampoLocalizacao = (campo, id, label, placeholder, listRef, extraAcoes = null) => {
    const listId = id + '-sugestoes';
    const origemOuDestino = label.toLowerCase();
    return (
      <section className="rotas-section" aria-label={label}>
        <h2 className="rotas-section__title">
          <MapPin size={16} aria-hidden="true" />
          {label}
        </h2>
        <div className="autocomplete-wrapper" ref={listRef}>
          <div className="rotas-origem-row" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                id={id}
                className="input-field"
                placeholder={placeholder}
                value={campo.texto}
                autoComplete="off"
                aria-label={label}
                aria-autocomplete="list"
                aria-expanded={campo.mostrarSugestoes && campo.sugestoes.length > 0}
                aria-controls={listId}
                aria-activedescendant={
                  campo.activeIndex >= 0 ? `${listId}-item-${campo.activeIndex}` : undefined
                }
                onChange={(e) => { setError(''); campo.setTexto(e.target.value); }}
                onFocus={() => { if (campo.sugestoes.length > 0) campo.setMostrarSugestoes(true); }}
                onKeyDown={(e) => handleKeyDown(e, campo, listId)}
              />
              {/* Icone de status no campo */}
              <span className="autocomplete-field-icon" aria-hidden="true">
                {campo.buscando
                  ? <Loader size={14} className="spin-icon" />
                  : campo.selecionada
                    ? <Check size={14} style={{ color: 'var(--color-success)' }} />
                    : campo.texto.length >= 3
                      ? <Search size={14} />
                      : null
                }
              </span>
            </div>
            {/* Botao limpar campo */}
            {campo.texto && (
              <button
                type="button"
                className="autocomplete-clear-btn"
                aria-label={'Limpar ' + origemOuDestino}
                onClick={() => { campo.limpar(); setError(''); }}
              >
                <X size={14} />
              </button>
            )}
            {extraAcoes}
          </div>

          {/* Dropdown de sugestoes */}
          {campo.mostrarSugestoes && campo.sugestoes.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label={'Sugestoes de ' + origemOuDestino}
              className="autocomplete-list"
            >
              {campo.sugestoes.map((s, i) => (
                <li
                  key={i}
                  id={`${listId}-item-${i}`}
                  role="option"
                  aria-selected={campo.activeIndex === i}
                  className={'autocomplete-item' + (campo.activeIndex === i ? ' autocomplete-item--active' : '')}
                  onMouseDown={(e) => {
                    // mouseDown em vez de click para evitar fechar antes do clique ser processado
                    e.preventDefault();
                    campo.selecionar(s);
                    setError('');
                  }}
                  onMouseEnter={() => campo.setActiveIndex(i)}
                >
                  <MapPin size={12} className="autocomplete-item__icon" aria-hidden="true" />
                  <span className="autocomplete-item__texto">{s.descricao}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Estados de feedback sem sugestoes */}
          {campo.mostrarSugestoes && !campo.buscando && campo.sugestoes.length === 0 && campo.texto.length >= 3 && !campo.selecionada && (
            <p className="autocomplete-status autocomplete-status--empty" role="status">
              Nenhum local encontrado para esta busca.
            </p>
          )}
          {campo.erro && (
            <p className="autocomplete-status autocomplete-status--error" role="alert">
              {campo.erro}
            </p>
          )}

          {/* Badge de confirmacao */}
          {campo.selecionada && (
            <p className="rotas-geo-info" aria-live="polite">
              <Check size={14} aria-hidden="true" />
              Localizacao confirmada
            </p>
          )}
        </div>
      </section>
    );
  };

  // --- Render ---
  return (
    <div className="page animate-fade-in">
      <Header
        title="Solicitar Corrida"
        subtitle="Digite origem e destino, selecione uma sugestao e calcule a rota"
      />

      <div className="rotas-layout">
        {/* Painel esquerdo */}
        <div className="rotas-panel">

          {/* Campo Origem com autocomplete */}
          {renderCampoLocalizacao(
            origem,
            'input-origem',
            'Origem',
            'Digite a origem...',
            origemListRef,
            <Button id="btn-gps" variant="ghost" size="sm" onClick={usarGps} loading={loadingGps} title="Usar minha localizacao atual">
              <Navigation size={16} aria-hidden="true" />
              GPS
            </Button>,
          )}

          {/* Campo Destino com autocomplete */}
          {renderCampoLocalizacao(
            destino,
            'input-destino',
            'Destino',
            'Digite o destino...',
            destinoListRef,
          )}

          <Button id="btn-calcular-rotas" onClick={calcularRotas} loading={loading} className="w-full">
            <Route size={16} aria-hidden="true" />
            {loading ? 'Calculando...' : 'Calcular Rotas'}
          </Button>

          {error && (
            <div className="form-error" role="alert">{error}</div>
          )}

          {/* Cards de rotas alternativas */}
          {rotas.length > 0 && (
            <section className="rotas-resultados">
              <h2 className="rotas-section__title">
                Rotas Alternativas ({rotas.length})
              </h2>
              <div className="rotas-cards">
                {rotas.map((rota, idx) => {
                  const ativa = rotaSelecionada?.id === rota.id;
                  return (
                    <button
                      key={rota.id}
                      id={'btn-rota-' + rota.id}
                      type="button"
                      className={'rota-card' + (ativa ? ' rota-card--ativa' : '')}
                      onClick={() => selecionarRota(rota)}
                      aria-pressed={ativa}
                    >
                      <div className="rota-card__header">
                        <span className="rota-card__label">
                          {idx === 0 ? 'Rota Recomendada' : 'Rota ' + rota.id}
                        </span>
                        {idx === 0 && <span className="rota-card__badge">Melhor</span>}
                        {ativa && <Check size={14} className="rota-card__check" aria-hidden="true" />}
                      </div>
                      <div className="rota-card__metrics">
                        <span className="rota-card__metric">
                          <Route size={12} aria-hidden="true" />
                          {rota.distanciaFormatada}
                        </span>
                        <span className="rota-card__metric">
                          <Clock size={12} aria-hidden="true" />
                          {rota.duracaoFormatada}
                        </span>
                      </div>
                      <div className="rota-card__caminho">
                        {rota.caminho.map((loc, i) => (
                          <span key={i} className="rota-card__loc">
                            {i > 0 && <ArrowRight size={10} aria-hidden="true" />}
                            {loc}
                          </span>
                        ))}
                      </div>
                      {rota.fonte === 'google_maps' && (
                        <span className="rota-card__fonte">Rota pela malha viaria real</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                id="btn-solicitar-corrida"
                onClick={abrirCorridaModal}
                disabled={!rotaSelecionada}
                className="w-full"
              >
                <Car size={16} aria-hidden="true" />
                Solicitar Corrida
              </Button>
            </section>
          )}
        </div>

        {/* Mapa */}
        <div className="rotas-mapa">
          {!apiKey && (
            <div className="map-placeholder map-placeholder--config">
              <MapPin size={36} aria-hidden="true" />
              <h3 className="map-placeholder__title">Mapa desabilitado</h3>
              <p className="map-placeholder__desc">Configure VITE_GOOGLE_MAPS_API_KEY para visualizar o mapa.</p>
            </div>
          )}
          <div
            ref={containerRef}
            className="map-container"
            style={{ display: apiKey ? 'block' : 'none' }}
            role="application"
            aria-label="Mapa interativo de rotas"
          />
        </div>
      </div>

      <CorridaModal
        isOpen={corridaModal.open}
        onClose={() => setCorridaModal({ open: false })}
        rota={rotaSelecionada}
        origemNome={origem.selecionada?.descricao || ''}
        destinoNome={destino.selecionada?.descricao || ''}
        origemGeocodificada={origem.selecionada ? { lat: origem.selecionada.latitude, lng: origem.selecionada.longitude } : null}
        destinoGeocodificada={destino.selecionada ? { lat: destino.selecionada.latitude, lng: destino.selecionada.longitude } : null}
        onSuccess={() => {
          setRotas([]);
          setRotaSelecionada(null);
          origem.limpar();
          destino.limpar();
        }}
      />
    </div>
  );
};

export default RotasPage;
