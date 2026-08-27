import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import grafoService from '../../services/grafo.service';
import { Compass, ArrowDown, ArrowRight, TriangleAlert, Search, CheckCircle2, Ruler } from 'lucide-react';

const NODE_POSITIONS = {
  'Centro':       { x: 300, y: 200 },
  'Shopping':     { x: 520, y: 120 },
  'Aeroporto':    { x: 700, y: 200 },
  'Rodoviaria':   { x: 300, y: 380 },
  'Praia':        { x: 480, y: 460 },
  'Universidade': { x: 660, y: 400 },
};

const GrafoVisualizacao = ({ grafoData, resultado }) => {
  if (!grafoData) return null;

  const caminho = resultado?.caminho || [];
  const arestas = grafoData.arestas || [];

  const isNoPath = (a, b) => {
    const idx = caminho.indexOf(a);
    return idx !== -1 && caminho[idx + 1] === b;
  };

  return (
    <div className="grafo-svg-wrapper">
      <svg viewBox="0 0 900 600" className="grafo-svg">
        {/* Arestas */}
        {arestas.map((a, i) => {
          const p1 = NODE_POSITIONS[a.origem];
          const p2 = NODE_POSITIONS[a.destino];
          if (!p1 || !p2) return null;
          const ativo = isNoPath(a.origem, a.destino) || isNoPath(a.destino, a.origem);
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          return (
            <g key={i}>
              <line
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                className={`grafo-edge ${ativo ? 'grafo-edge--active' : ''}`}
              />
              <text x={mx} y={my - 6} className="grafo-edge-label">{a.peso}km</text>
            </g>
          );
        })}
        {/* Vertices */}
        {Object.entries(NODE_POSITIONS).map(([nome, pos]) => {
          const noPath = caminho.includes(nome);
          const isFirst = caminho[0] === nome;
          const isLast  = caminho[caminho.length - 1] === nome;
          return (
            <g key={nome} className="grafo-node-group">
              <circle
                cx={pos.x} cy={pos.y} r={34}
                className={`grafo-node ${noPath ? 'grafo-node--active' : ''} ${isFirst || isLast ? 'grafo-node--endpoint' : ''}`}
              />
              <text x={pos.x} y={pos.y + 5} className="grafo-node-label">{nome}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const GrafoPage = () => {
  const [grafoData, setGrafoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [resultado, setResultado] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    grafoService.obterGrafo()
      .then((r) => setGrafoData(r.data))
      .catch(() => setError('Erro ao carregar locais.'))
      .finally(() => setLoading(false));
  }, []);

  const calcular = async () => {
    if (!origem || !destino) { setError('Selecione origem e destino.'); return; }
    setError(''); setResultado(null); setCalcLoading(true);
    try {
      const res = await grafoService.calcularRota(origem, destino);
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao calcular rota.');
    } finally { setCalcLoading(false); }
  };

  const vertices = grafoData?.vertices || [];

  return (
    <div className="page animate-fade-in">
      <Header
        title="Rotas"
        subtitle="Consulte e calcule os melhores trajetos entre os locais disponíveis."
      />

      <div className="grafo-layout">
        {/* Painel de controle */}
        <div className="grafo-panel">
          <h2 className="grafo-panel__title"><Compass size={24} aria-hidden="true" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Calcular Rota</h2>
          <p className="grafo-panel__desc">
            Selecione a origem e o destino. O sistema calculará a melhor rota e a menor distância para o trajeto.
          </p>

          <div className="grafo-panel__form">
            <div className="input-group">
              <label className="input-label" htmlFor="origem">Origem</label>
              <select id="origem" className="input-field input-field--select" value={origem} onChange={(e) => { setOrigem(e.target.value); setResultado(null); }}>
                <option value="">Selecione...</option>
                {vertices.map((v) => <option key={v.id} value={v.nome}>{v.nome}</option>)}
              </select>
            </div>

            <div className="grafo-panel__arrow"><ArrowDown size={20} /></div>

            <div className="input-group">
              <label className="input-label" htmlFor="destino">Destino</label>
              <select id="destino" className="input-field input-field--select" value={destino} onChange={(e) => { setDestino(e.target.value); setResultado(null); }}>
                <option value="">Selecione...</option>
                {vertices.map((v) => <option key={v.id} value={v.nome}>{v.nome}</option>)}
              </select>
            </div>

            {error && <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TriangleAlert size={16} /> {error}</div>}

            <Button id="btn-dijkstra" onClick={calcular} loading={calcLoading} className="w-full">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Search size={16} /> Calcular Rota</span>
            </Button>
          </div>

          {/* Resultado */}
          {resultado && (
            <div className="rota-result animate-fade-in">
              <h3 className="rota-result__title"><CheckCircle2 size={20} aria-hidden="true" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Melhor Rota Encontrada</h3>
              <div className="rota-result__info">
                <div><span className="rota-label">Origem:</span> <strong>{resultado.origem}</strong></div>
                <div><span className="rota-label">Destino:</span> <strong>{resultado.destino}</strong></div>
              </div>
              <div className="rota-result__path">
                {resultado.caminho?.map((no, i) => (
                  <React.Fragment key={no}>
                    <span className="rota-node">{no}</span>
                    {i < resultado.caminho.length - 1 && <span className="rota-arrow" style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px' }}><ArrowRight size={14} /></span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="rota-result__distance">
                Distância Total: <strong>{resultado.distanciaTotal} km</strong>
              </div>
            </div>
          )}

          {/* Info do grafo */}
          <div className="grafo-info">
            <h3 className="grafo-info__title"><Ruler size={20} aria-hidden="true" style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Informações dos Locais</h3>
            <div className="grafo-info__stats">
              <div className="grafo-stat">
                <span className="grafo-stat__value">{vertices.length}</span>
                <span className="grafo-stat__label">Locais</span>
              </div>
              <div className="grafo-stat">
                <span className="grafo-stat__value">{grafoData?.arestas?.length || 0}</span>
                <span className="grafo-stat__label">Trajetos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visualizacao do grafo */}
        <div className="grafo-visual-wrapper">
          {loading ? (
            <Loading message="Carregando mapa..." />
          ) : (
            <GrafoVisualizacao grafoData={grafoData} resultado={resultado} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GrafoPage;
