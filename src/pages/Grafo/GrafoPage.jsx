import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import {
  GitBranch,
  ArrowRight,
  TriangleAlert,
  Info,
  Network,
} from 'lucide-react';
import api from '../../services/api';

/**
 * GrafoPage — Visualização do Grafo Dinâmico e da ABB.
 *
 * Exibe a estrutura do grafo construído para uma operação de rota real.
 * O grafo só contém dados após ser consultado com origem, destino e distância —
 * nunca possui pontos fixos pré-cadastrados.
 *
 * Para consultar o grafo de uma operação específica, forneça os parâmetros
 * de query ao endpoint GET /api/grafo.
 */
const GrafoPage = () => {
  const [origemNome, setOrigemNome] = useState('');
  const [destinoNome, setDestinoNome] = useState('');
  const [origemLat, setOrigemLat] = useState('');
  const [origemLng, setOrigemLng] = useState('');
  const [destinoLat, setDestinoLat] = useState('');
  const [destinoLng, setDestinoLng] = useState('');
  const [distanciaMetros, setDistanciaMetros] = useState('');

  const [grafo, setGrafo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const consultarGrafo = async () => {
    if (!origemNome || !destinoNome || !origemLat || !origemLng || !destinoLat || !destinoLng || !distanciaMetros) {
      setErro('Preencha todos os campos, incluindo a distância, para visualizar o grafo da operação.');
      return;
    }
    
    const distM = parseFloat(distanciaMetros);
    if (isNaN(distM) || distM <= 0) {
      setErro('Informe uma distância válida maior que zero.');
      return;
    }

    setErro('');
    setGrafo(null);
    setLoading(true);

    try {
      const { data } = await api.get('/grafo', {
        params: {
          origemNome,
          origemLat,
          origemLng,
          destinoNome,
          destinoLat,
          destinoLng,
          distanciaMetros: distM,
        },
      });
      setGrafo(data.data);
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível consultar o grafo.');
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setGrafo(null);
    setErro('');
  };

  return (
    <div className="page animate-fade-in">
      <Header
        title="Grafo Dinâmico"
        subtitle="Visualize a estrutura do grafo construído para cada operação de rota."
      />

      <div className="rotas-layout">
        {/* Painel de controle */}
        <div className="rotas-panel">
          <div className="rotas-panel__header">
            <Network size={22} aria-hidden="true" className="rotas-panel__icon" />
            <h2 className="rotas-panel__title">Consultar Grafo da Operação</h2>
          </div>

          {/* Explicação do grafo dinâmico */}
          <div
            className="rota-result__fonte"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <span>
              O grafo é construído dinamicamente a cada operação: vértice Origem, vértice Destino e
              aresta com a distância real retornada pelo serviço de roteamento. Nenhum ponto fixo
              é pré-cadastrado.
            </span>
          </div>

          <div className="rotas-panel__form">
            <div className="input-group">
              <label className="input-label" htmlFor="grafo-origem-nome">Nome da Origem</label>
              <input
                id="grafo-origem-nome"
                type="text"
                className="input-field"
                placeholder="Ex: Digite o nome da origem"
                value={origemNome}
                onChange={(e) => { setOrigemNome(e.target.value); setErro(''); }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="grafo-origem-lat">Lat. Origem</label>
                <input
                  id="grafo-origem-lat"
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="-20.1234"
                  value={origemLat}
                  onChange={(e) => { setOrigemLat(e.target.value); setErro(''); }}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="grafo-origem-lng">Lng. Origem</label>
                <input
                  id="grafo-origem-lng"
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="-40.3456"
                  value={origemLng}
                  onChange={(e) => { setOrigemLng(e.target.value); setErro(''); }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="grafo-destino-nome">Nome do Destino</label>
              <input
                id="grafo-destino-nome"
                type="text"
                className="input-field"
                placeholder="Ex: Digite o nome do destino"
                value={destinoNome}
                onChange={(e) => { setDestinoNome(e.target.value); setErro(''); }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="grafo-destino-lat">Lat. Destino</label>
                <input
                  id="grafo-destino-lat"
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="-20.3197"
                  value={destinoLat}
                  onChange={(e) => { setDestinoLat(e.target.value); setErro(''); }}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="grafo-destino-lng">Lng. Destino</label>
                <input
                  id="grafo-destino-lng"
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="-40.3376"
                  value={destinoLng}
                  onChange={(e) => { setDestinoLng(e.target.value); setErro(''); }}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="grafo-distancia">Distância (metros)</label>
              <input
                id="grafo-distancia"
                type="number"
                min="1"
                className="input-field"
                placeholder="Ex: 12500"
                value={distanciaMetros}
                onChange={(e) => { setDistanciaMetros(e.target.value); setErro(''); }}
              />
            </div>

            {erro && (
              <div className="form-error" role="alert">
                <TriangleAlert size={16} aria-hidden="true" />
                <span>{erro}</span>
              </div>
            )}

            <div className="rotas-panel__actions">
              <Button
                id="btn-consultar-grafo"
                onClick={consultarGrafo}
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                <GitBranch size={16} aria-hidden="true" />
                {loading ? 'Consultando...' : 'Visualizar Grafo'}
              </Button>
              {grafo && (
                <Button
                  id="btn-limpar-grafo"
                  variant="secondary"
                  onClick={limpar}
                  className="w-full"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Resultado: estrutura do grafo */}
          {loading && <Loading message="Construindo grafo..." />}

          {grafo && !loading && (
            <div className="rota-result animate-fade-in" role="region" aria-label="Estrutura do grafo">
              <h3 className="rota-result__title">
                <GitBranch size={18} aria-hidden="true" />
                Grafo da Operação
              </h3>

              {/* Estatísticas */}
              <div className="rota-result__metrics" style={{ marginBottom: '16px' }}>
                <div className="rota-metric">
                  <div>
                    <span className="rota-metric__label">Vértices</span>
                    <span className="rota-metric__value">{grafo.vertices?.length ?? 0}</span>
                  </div>
                </div>
                <div className="rota-metric">
                  <div>
                    <span className="rota-metric__label">Arestas</span>
                    <span className="rota-metric__value">{grafo.arestas?.length ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Vértices */}
              <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Vértices
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                {(grafo.vertices || []).map((v, i) => (
                  <li key={i} className="rotas-local-item">
                    <span className="rotas-local-item__nome">{v.nome}</span>
                    <span className="rotas-local-item__cidade">{v.categoria}</span>
                  </li>
                ))}
              </ul>

              {/* Arestas */}
              <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Arestas (relações da operação)
              </h4>
              {(grafo.arestas || []).map((a, i) => (
                <div key={i} className="rota-result__path" style={{ marginBottom: '8px' }}>
                  <span className="rota-node">{a.origem}</span>
                  <span className="rota-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </span>
                  <span className="rota-node">{a.destino}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                    {a.peso.toFixed(2)} km
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel informativo sobre ABB */}
        <div className="rotas-visual-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <div className="rota-result">
            <h3 className="rota-result__title">
              <GitBranch size={18} aria-hidden="true" />
              Árvore Binária de Busca (ABB)
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Quando o usuário solicita uma corrida, as alternativas reais retornadas pelo serviço
              de roteamento são organizadas pela ABB usando a <strong>distância em metros</strong> como chave.
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              O percurso <strong>in-order</strong> (esquerda → raiz → direita) retorna as rotas
              ordenadas do menor para o maior percurso — sem usar <code>Array.sort()</code>.
            </p>
            <div style={{ background: 'var(--bg-tertiary, #1e293b)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
              <div>inserir(5400, rotaA)</div>
              <div>inserir(8200, rotaB)</div>
              <div>inserir(11000, rotaC)</div>
              <div style={{ marginTop: '8px', color: 'var(--color-success, #10b981)' }}>
                percorrerEmOrdem() →
              </div>
              <div style={{ paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                5.4 km → 8.2 km → 11.0 km
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
              Rotas com distâncias iguais são ambas preservadas no mesmo nó — nenhuma alternativa
              é descartada por empate.
            </p>
          </div>

          <div className="rota-result">
            <h3 className="rota-result__title">
              <Network size={18} aria-hidden="true" />
              Grafo Dinâmico
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              O grafo é construído dinamicamente para a operação atual. Seus vértices representam a
              origem e o destino informados pelo usuário, enquanto a aresta representa a relação entre
              esses pontos utilizando como peso a distância da rota obtida pelo serviço de roteamento.
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Não há pontos fixos pré-cadastrados. Uma operação Serra → Vitória produz um grafo
              diferente de Vila Velha → Cariacica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrafoPage;
