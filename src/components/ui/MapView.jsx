import React, { useEffect, useRef, useCallback } from 'react';
import { MapPin, AlertTriangle, Loader } from 'lucide-react';

/**
 * MapView — Componente reutilizável de mapa Google Maps.
 *
 * Responsabilidades deste componente:
 * - Carregar a Google Maps JavaScript API de forma assíncrona
 * - Renderizar o mapa centrado na Grande Vitória / ES
 * - Exibir marcadores profissionais para cada local
 * - Exibir InfoWindow ao clicar em um marcador (nome, cidade, categoria)
 * - Renderizar a polyline da rota quando disponível
 * - Tratar estados: carregando, sem chave configurada, erro de API
 *
 * O componente NÃO contém regras de negócio de reservas ou rotas.
 * Toda a lógica de negócio fica na RotasPage.
 *
 * Props:
 * @param {Array}       locations   - Lista de locais com { id, nome, cidade, estado, categoria, latitude, longitude }
 * @param {object|null} origin      - Local de origem selecionado (mesmo shape de locations[])
 * @param {object|null} destination - Local de destino selecionado (mesmo shape de locations[])
 * @param {string|null} polyline    - Encoded polyline retornado pela Directions API
 * @param {boolean}     loading     - Estado de carregamento externo (ex: calculando rota)
 */
const MapView = ({ locations = [], origin = null, destination = null, polyline = null, loading = false }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);
  const isInitializedRef = useRef(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Ponto central: Grande Vitória - ES
  const CENTER_ES = { lat: -20.2760, lng: -40.3520 };
  const DEFAULT_ZOOM = 11;

  /**
   * Limpa todos os marcadores do mapa sem recriar o mapa inteiro.
   */
  const limparMarcadores = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  /**
   * Limpa a polyline de rota do mapa.
   */
  const limparPolyline = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  }, []);

  /**
   * Retorna o ícone do marcador baseado no tipo do local e no estado
   * (origem, destino ou ponto comum).
   */
  const obterIconesMarcador = (local) => {
    if (origin && origin.id === local.id) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#6366f1',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5,
        scale: 10,
      };
    }
    if (destination && destination.id === local.id) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5,
        scale: 10,
      };
    }
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: '#06b6d4',
      fillOpacity: 0.85,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 7,
    };
  };

  /**
   * Renderiza os marcadores no mapa.
   * Evita recriar marcadores que não mudaram.
   */
  const renderizarMarcadores = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    limparMarcadores();

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    locations.forEach((local) => {
      if (!local.latitude || !local.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: local.latitude, lng: local.longitude },
        map: mapRef.current,
        title: local.nome,
        icon: obterIconesMarcador(local),
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        const conteudo = `
          <div style="font-family:'Inter',sans-serif;padding:4px 2px;min-width:180px;">
            <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:4px;">${local.nome}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:2px;">${local.cidade} - ${local.estado}</div>
            <div style="display:inline-block;font-size:11px;font-weight:600;color:#6366f1;background:rgba(99,102,241,0.1);padding:2px 8px;border-radius:99px;margin-top:4px;">${local.categoria}</div>
          </div>
        `;
        infoWindowRef.current.setContent(conteudo);
        infoWindowRef.current.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [locations, origin, destination, limparMarcadores]);

  /**
   * Renderiza a polyline de rota no mapa quando disponível.
   */
  const renderizarPolyline = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    limparPolyline();

    if (!polyline) return;

    const decodedPath = window.google.maps.geometry.encoding.decodePath(polyline);

    polylineRef.current = new window.google.maps.Polyline({
      path: decodedPath,
      geodesic: true,
      strokeColor: '#6366f1',
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });

    polylineRef.current.setMap(mapRef.current);

    // Ajusta o zoom para mostrar toda a rota
    const bounds = new window.google.maps.LatLngBounds();
    decodedPath.forEach((point) => bounds.extend(point));
    mapRef.current.fitBounds(bounds, { padding: 60 });
  }, [polyline, limparPolyline]);

  /**
   * Inicializa o mapa Google Maps no container.
   * Chamado apenas uma vez após a API ser carregada.
   */
  const inicializarMapa = useCallback(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: CENTER_ES,
      zoom: DEFAULT_ZOOM,
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
        { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
        { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
        { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] },
        { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
        { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
        { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
      ],
    });

    isInitializedRef.current = true;
    renderizarMarcadores();
  }, [renderizarMarcadores]);

  /**
   * Carrega o script da Google Maps JavaScript API de forma assíncrona.
   * Evita carregar múltiplas vezes se já estiver disponível.
   */
  useEffect(() => {
    if (!apiKey) return;

    // Já carregado
    if (window.google && window.google.maps) {
      inicializarMapa();
      return;
    }

    // Evita duplicar o script
    if (document.getElementById('google-maps-script')) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          inicializarMapa();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    script.onload = inicializarMapa;
    script.onerror = () => {
      console.error('[MapView] Falha ao carregar a Google Maps JavaScript API.');
    };
    document.head.appendChild(script);
  }, [apiKey, inicializarMapa]);

  // Re-renderiza marcadores quando locais, origem ou destino mudam
  useEffect(() => {
    if (isInitializedRef.current) {
      renderizarMarcadores();
    }
  }, [locations, origin, destination, renderizarMarcadores]);

  // Re-renderiza polyline quando a rota muda
  useEffect(() => {
    if (isInitializedRef.current) {
      renderizarPolyline();
    }
  }, [polyline, renderizarPolyline]);

  // Se não há chave configurada
  if (!apiKey) {
    return (
      <div className="map-placeholder map-placeholder--config">
        <MapPin size={40} className="map-placeholder__icon" aria-hidden="true" />
        <h3 className="map-placeholder__title">Configuração necessária</h3>
        <p className="map-placeholder__desc">
          Para visualizar o mapa, configure a variável de ambiente{' '}
          <code>VITE_GOOGLE_MAPS_API_KEY</code> com sua chave da{' '}
          <strong>Google Maps JavaScript API</strong>.
        </p>
        <p className="map-placeholder__hint">
          Os locais do Espírito Santo estão cadastrados e o cálculo de rotas
          funcionará normalmente após a configuração.
        </p>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      {/* Overlay de carregamento externo (calculando rota) */}
      {loading && (
        <div className="map-overlay" aria-live="polite" aria-label="Calculando rota">
          <div className="map-overlay__content">
            <Loader size={24} className="map-overlay__spinner" aria-hidden="true" />
            <span>Calculando rota...</span>
          </div>
        </div>
      )}

      {/* Container do mapa */}
      <div
        ref={containerRef}
        className="map-container"
        role="application"
        aria-label="Mapa interativo — Grande Vitória, Espírito Santo"
      />
    </div>
  );
};

export default MapView;
