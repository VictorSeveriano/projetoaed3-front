# projetoaed3-front

Frontend do Sistema de Reserva de Carros — Projeto da disciplina AED3 (Algoritmos e Estruturas de Dados III).

## Tecnologias

- **React 18** + **Vite**
- **React Router DOM** (roteamento)
- **Axios** (requisicoes HTTP)
- **CSS Vanilla** (design system proprio)

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/          # Componentes reutilizaveis (Button, Input, Modal, Card, Badge...)
│   └── layout/      # Sidebar, Header, Layout
├── pages/
│   ├── Login/       # Pagina de login
│   ├── Dashboard/   # Visao geral do sistema
│   ├── Carros/      # Listagem + filtros + modal de reserva
│   ├── Reservas/    # Lista de reservas + cancelamento
│   └── Grafo/       # Visualizacao interativa + Dijkstra
├── services/        # Chamadas HTTP para a API
├── context/         # AuthContext (autenticacao global)
├── hooks/           # useApi (hook generico)
├── routes/          # React Router + PrivateRoute
├── utils/           # formatadores, validadores
└── styles/          # CSS design system completo
```

## Como Instalar

```bash
npm install
```

## Como Executar

```bash
npm run dev
# App disponivel em: http://localhost:5173
```

> A API deve estar rodando em `http://localhost:3001`

## Paginas

| Rota        | Descricao                                |
|-------------|------------------------------------------|
| /login      | Login com usuario/senha                  |
| /dashboard  | Painel com metricas e info do grafo      |
| /carros     | Listagem, filtros e modal de reserva     |
| /reservas   | Listagem de reservas com cancelamento    |
| /grafo      | Visualizacao SVG do grafo + Dijkstra     |

## Credenciais Padrao

```
Usuario: admin
Senha:   admin123
```

## Branches

- `main` → versao estavel
- `hom`  → homologacao/testes
- `dev`  → desenvolvimento ativo

Fluxo: `dev -> hom -> main`
