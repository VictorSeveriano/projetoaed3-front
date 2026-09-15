# projetoaed3-front

Frontend do Sistema de Corridas — Projeto da disciplina AED3 (Algoritmos e Estruturas de Dados III).

## Tecnologias

- **React 18** + **Vite**
- **React Router DOM** (roteamento)
- **Axios** (requisicoes HTTP)
- **Recharts** (graficos do dashboard)
- **Lucide React** (icones)
- **CSS Vanilla** (design system proprio)

## Estrutura de Pastas

```
src/
|-- components/
|   |-- ui/          # Button, Input, Modal, Badge, CorridaModal, Loading...
|   `-- layout/      # Sidebar, Header, Layout
|-- pages/
|   |-- Login/       # Autenticacao
|   |-- Dashboard/   # Metricas com graficos (Recharts)
|   |-- Carros/      # Listagem de veiculos
|   |-- Corridas/    # Historico de corridas + cancelamento
|   `-- Rotas/       # Fluxo principal: origem -> rotas -> confirmar corrida
|-- services/        # Chamadas HTTP para a API (Axios)
|-- context/         # AuthContext (autenticacao global)
|-- routes/          # React Router + PrivateRoute
|-- utils/           # formatters (formatarMoeda, STATUS_LABELS, etc.)
`-- styles/          # CSS design system
```

## Fluxo Principal (RotasPage)

```
1. Usuario digita origem e destino (CEP ou endereco livre)
2. Frontend envia para POST /api/rotas/calcular
3. Backend geocodifica -> Google Routes API -> retorna rotas reais
4. Frontend exibe mapa com polyline + lista de alternativas
5. Usuario seleciona uma rota e clica em "Confirmar Corrida"
6. CorridaModal exibe resumo com valor estimado (a partir de R$ X)
7. POST /api/corridas -> backend aloca veiculo + calcula valor real
8. Corrida criada com status SOLICITADA
```

## Como Instalar e Executar

```bash
npm install
npm run dev
# App disponivel em: http://localhost:5173
```

> A API deve estar rodando em `http://localhost:3001`

## Paginas

| Rota       | Descricao                                             |
|------------|-------------------------------------------------------|
| /login     | Login com usuario/senha                               |
| /dashboard | Painel com metricas, graficos de corridas e faturamento|
| /carros    | Listagem de veiculos disponiveis                      |
| /corridas  | Historico de corridas com cancelamento                |
| /rotas     | Fluxo de solicitacao: geocodificar -> rotas -> corrida|

## Status de Corrida (frontend)

| Status       | Exibicao       | Cor     |
|--------------|----------------|---------|
| SOLICITADA   | Solicitada     | info    |
| CONFIRMADA   | Confirmada     | success |
| EM_ANDAMENTO | Em Andamento   | warning |
| FINALIZADA   | Finalizada     | muted   |
| CANCELADA    | Cancelada      | danger  |

## Credenciais Padrao

```
Usuario: admin
Senha:   admin123
```

## Branches

- `main` -> versao estavel
- `hom`  -> homologacao/testes
- `dev`  -> desenvolvimento ativo

Fluxo: `dev -> hom -> main`
