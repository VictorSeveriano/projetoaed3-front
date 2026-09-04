import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import CorridaModal from '../../components/ui/CorridaModal';
import rotasService from '../../services/rotas.service';
import { MapPin, Navigation, Route, Car, Clock, ArrowRight, Check } from 'lucide-react';

/**
 * RotasPage — Pagina de solicitacao de corrida.
 *
 * Fluxo:
 * 1. Usuario informa ORIGEM e DESTINO (texto livre, CEP, ou GPS)
 * 2. Ao clicar em Calcular Rotas, o sistema geocodifica os enderecos se necessario
 * 3. Sistema calcula multiplas rotas via backend 
 * 4. Usuario ve cards com rotas alternativas
 * 5. Usuario seleciona rota preferida e confirma a corrida no modal
 */
const RotasPage = () => {
  const [origemInput, setOrigemInput] = useState('');
  const [origemGeocodificada, setOrigemGeocodificada] = useState(null);
  
  const [destinoInput, setDestinoInput] = useState('');
  const [destinoGeocodificada, setDestinoGeocodificada] = useState(null);

  const [rotas, setRotas] = useState([]);
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [error, setError] = useState('');
  const [corridaModal, setCorridaModal] = useState({ open: false });
  
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const isMapInitRef = useRef(false);

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

    // Renderiza marcadores da rota selecionada
    if (rotaSelecionada && rotaSelecionada.pontos) {
      rotaSelecionada.pontos.forEach((ponto, idx) => {
        if (!ponto.latitude || !ponto.longitude) return;
        
        const isOrigem = idx === 0;
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

    // Renderiza polyline da rota selecionada
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
      // Fallback: conecta os pontos da rota com linha reta
      const path = rotaSelecionada.pontos
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({ lat: p.latitude, lng: p.longitude }));
      if (path.length >= 2) {
        polylineRef.current = new window.google.maps.Polyline({
          path, geodesic: true,
          strokeColor: '#6366f1', strokeOpacity: 0.7, strokeWeight: 4,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 }, offset: '0', repeat: '20px' }],
        });
        polylineRef.current.setMap(mapRef.current);
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        mapRef.current.fitBounds(bounds, { padding: 80 });
      }
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

  // --- GPS ---
  const usarGps = () => {
    if (!navigator.geolocation) { setError('GPS nao disponivel neste navegador.'); return; }
    setLoadingGps(true); setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nomeGerado = 'Localizacao Atual';
        setOrigemGeocodificada({ lat: latitude, lng: longitude, nome: nomeGerado, textoOriginal: nomeGerado });
        setOrigemInput(nomeGerado);
        setLoadingGps(false);
      },
      () => { setError('Nao foi possivel obter a localizacao GPS.'); setLoadingGps(false); },
      { timeout: 8000 },
    );
  };

  // --- Calcula multiplas rotas ---
  const calcularRotas = async () => {
    if (!origemInput.trim()) { setError('Informe um endereco de origem.'); return; }
    if (!destinoInput.trim()) { setError('Informe um endereco de destino.'); return; }

    setLoading(true); setError(''); setRotas([]); setRotaSelecionada(null);

    try {
      let origemPayload = origemGeocodificada;
      let destinoPayload = destinoGeocodificada;

      // Geocodifica Origem se necessario
      if (!origemPayload || origemInput !== origemPayload.textoOriginal) {
        try {
          const resO = await rotasService.geocodificarCep(origemInput);
          const end = resO.endereco;
          const label = [end.logradouro, end.bairro, end.cidade].filter(Boolean).join(', ') || origemInput;
          origemPayload = { nome: label, lat: resO.latitude, lng: resO.longitude, textoOriginal: origemInput };
          setOrigemGeocodificada(origemPayload);
          setOrigemInput(origemPayload.nome);
        } catch(e) {
          throw new Error('Nao foi possivel localizar o endereco de origem.');
        }
      }

      // Geocodifica Destino se necessario
      if (!destinoPayload || destinoInput !== destinoPayload.textoOriginal) {
        try {
          const resD = await rotasService.geocodificarCep(destinoInput);
          const end = resD.endereco;
          const label = [end.logradouro, end.bairro, end.cidade].filter(Boolean).join(', ') || destinoInput;
          destinoPayload = { nome: label, lat: resD.latitude, lng: resD.longitude, textoOriginal: destinoInput };
          setDestinoGeocodificada(destinoPayload);
          setDestinoInput(destinoPayload.nome);
        } catch(e) {
          throw new Error('Nao foi possivel localizar o endereco de destino.');
        }
      }

      const resultado = await rotasService.calcularCorrida(origemPayload, destinoPayload);
      setRotas(resultado.rotas || []);
      if (resultado.rotas && resultado.rotas.length > 0) {
        setRotaSelecionada(resultado.rotas[0]);
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Nao foi possivel calcular a rota agora. Tente novamente.');
    } finally { setLoading(false); }
  };

  const selecionarRota = (rota) => { setRotaSelecionada(rota); };

  const abrirCorridaModal = () => {
    if (!rotaSelecionada) { setError('Selecione uma rota antes de solicitar a corrida.'); return; }
    setCorridaModal({ open: true });
  };

  return (
    <div className="page animate-fade-in">
      <Header
        title="Solicitar Corrida"
        subtitle="Informe origem e destino para calcular as melhores rotas"
      />

      <div className="rotas-layout">
        {/* Painel esquerdo: formulario e resultados */}
        <div className="rotas-panel">
          {/* Origem */}
          <section className="rotas-section">
            <h2 className="rotas-section__title">
              <MapPin size={16} aria-hidden="true" />
              Origem
            </h2>
            <div className="rotas-origem-row">
              <input
                id="input-origem"
                className="input-field"
                placeholder="Digite a origem..."
                value={origemInput}
                onChange={(e) => { setOrigemInput(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') calcularRotas(); }}
              />
              <Button id="btn-gps" variant="ghost" size="sm" onClick={usarGps} loading={loadingGps}>
                <Navigation size={16} aria-hidden="true" />
                GPS
              </Button>
            </div>
            {origemGeocodificada && origemInput === origemGeocodificada.textoOriginal && (
              <p className="rotas-geo-info">
                <Check size={14} aria-hidden="true" />
                Localizacao confirmada
              </p>
            )}
          </section>

          {/* Destino */}
          <section className="rotas-section">
            <h2 className="rotas-section__title">
              <MapPin size={16} aria-hidden="true" />
              Destino
            </h2>
            <div className="rotas-origem-row">
              <input
                id="input-destino"
                className="input-field"
                placeholder="Digite o destino..."
                value={destinoInput}
                onChange={(e) => setDestinoInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') calcularRotas(); }}
              />
            </div>
          </section>

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
                        <span className="rota-card__fonte">Distancia real via OpenStreetMap</span>
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
        origemNome={rotaSelecionada?.caminho?.[0] || ''}
        destinoNome={rotaSelecionada?.caminho?.[rotaSelecionada?.caminho.length - 1] || ''}
        onSuccess={() => { setRotas([]); setRotaSelecionada(null); setDestinoInput(''); setOrigemInput(''); setOrigemGeocodificada(null); setDestinoGeocodificada(null); }}
      />
    </div>
  );
};

export default RotasPage;
