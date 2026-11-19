import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificacoesService from '../../services/notificacoes.service';
import { APP_EVENTS, escutarEvento } from '../../utils/appEvents';

import {
  LayoutDashboard, Car, CalendarDays, Network, LogOut,
  ChevronLeft, ChevronRight, Map, Home, BarChart2, User, Bell, ShieldAlert, X
} from 'lucide-react';

/**
 * Itens de navegação por perfil.
 *
 * ADMINISTRADOR: mantém tudo que já existia (sem regressão).
 * USUARIO: solicitar corrida, minhas corridas, notificações, perfil.
 * MOTORISTA: início, corridas disponíveis, minhas corridas, relatório, perfil, meu veículo.
 *
 * Termos internos (Grafo, ABB, Dijkstra) não aparecem na UI.
 */
const NAV_ITEMS_ADMIN = [
  { to: '/dashboard',          icon: <LayoutDashboard size={19} />, label: 'Dashboard'             },
  { to: '/corridas',           icon: <CalendarDays size={19} />,    label: 'Corridas'              },
  { to: '/veiculos',           icon: <Car size={19} />,             label: 'Veículos'              },
  { to: '/veiculos/analise',   icon: <Car size={19} />,             label: 'Análise de Veículos'   },
  { to: '/rotas',              icon: <Network size={19} />,         label: 'Solicitar Corrida'     },
  { to: '/usuarios',           icon: <User size={19} />,            label: 'Usuários'              },
  { to: '/motoristas/analise', icon: <User size={19} />,            label: 'Análise de Motoristas' },
  { to: '/notificacoes',       icon: <Bell size={19} />,            label: 'Notificações'          },
  { to: '/auditoria',          icon: <ShieldAlert size={19} />,     label: 'Auditoria'             },
];

const NAV_ITEMS_USUARIO = [
  { to: '/solicitar-corrida', icon: <Map size={19} />,          label: 'Solicitar corrida' },
  { to: '/minhas-corridas',   icon: <CalendarDays size={19} />, label: 'Minhas corridas'   },
  { to: '/notificacoes',      icon: <Bell size={19} />,         label: 'Notificações'      },
  { to: '/perfil',            icon: <User size={19} />,         label: 'Meu perfil'        },
];

const NAV_ITEMS_MOTORISTA = [
  { to: '/inicio',                 icon: <Home size={19} />,         label: 'Início'               },
  { to: '/notificacoes-motorista', icon: <Bell size={19} />,         label: 'Corridas disponíveis' },
  { to: '/minhas-corridas',        icon: <CalendarDays size={19} />, label: 'Minhas corridas'      },
  { to: '/relatorio',              icon: <BarChart2 size={19} />,    label: 'Relatório mensal'     },
  { to: '/perfil',                 icon: <User size={19} />,         label: 'Meu perfil'           },
  { to: '/meu-veiculo',            icon: <Car size={19} />,          label: 'Meu veículo'          },
];

const PERFIL_LABELS = {
  ADMINISTRADOR: 'Administrador',
  USUARIO: 'Passageiro',
  MOTORISTA: 'Motorista',
};

const Sidebar = ({ isOpen, onClose, isDesktopClosed, onToggleDesktop }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [naoLidas, setNaoLidas] = useState(0);
  const [notificacoesLista, setNotificacoesLista] = useState([]);

  // Seleciona itens pelo campo perfil — nunca por nome/id
  const navItems = useMemo(() => {
    switch (usuario?.perfil) {
      case 'MOTORISTA':    return NAV_ITEMS_MOTORISTA;
      case 'USUARIO':      return NAV_ITEMS_USUARIO;
      case 'ADMINISTRADOR':
      default:             return NAV_ITEMS_ADMIN;
    }
  }, [usuario?.perfil]);

  useEffect(() => {
    if (usuario?.id) {
      const carregarNotificacoes = () => {
        notificacoesService.listar()
          .then((dados) => {
            const lista = dados?.notificacoes || [];
            setNotificacoesLista(lista);
            setNaoLidas(dados?.naoLidas ?? lista.filter((n) => !n.lida).length);
          })
          .catch(() => {
            setNotificacoesLista([]);
            setNaoLidas(0);
          });
      };

      carregarNotificacoes();

      return escutarEvento(APP_EVENTS.NOTIFICACOES_ATUALIZADAS, carregarNotificacoes);
    }
  }, [usuario?.id]);

  const contadoresPorRota = useMemo(() => {
    const naoLidasLista = notificacoesLista.filter((n) => !n.lida);
    const contarPorTipo = (...tipos) =>
      naoLidasLista.filter((n) => tipos.includes(n.tipo)).length;

    if (usuario?.perfil === 'ADMINISTRADOR') {
      return {
        '/notificacoes':       naoLidas,
        '/motoristas/analise': contarPorTipo('SOLICITACAO_MOTORISTA'),
        '/veiculos/analise':   contarPorTipo('SOLICITACAO_VEICULO'),
        '/corridas':           contarPorTipo('NOVA_CORRIDA', 'ATUALIZACAO_CORRIDA'),
      };
    }

    if (usuario?.perfil === 'MOTORISTA') {
      return {
        '/notificacoes-motorista': naoLidas,
        '/minhas-corridas':        contarPorTipo('ATUALIZACAO_CORRIDA'),
        '/perfil':                 contarPorTipo('CADASTRO_APROVADO'),
      };
    }

    if (usuario?.perfil === 'USUARIO') {
      return {
        '/notificacoes':    naoLidas,
        '/minhas-corridas': contarPorTipo('ATUALIZACAO_CORRIDA'),
      };
    }

    return {};
  }, [notificacoesLista, naoLidas, usuario?.perfil]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isDesktopClosed ? 'sidebar--desktop-closed' : ''}`}
        aria-label="Navegação lateral"
      >
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <span className="sidebar__logo-badge" aria-hidden="true">
              <Car size={20} />
            </span>
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-name">ReservaCar</span>
              <span className="sidebar__brand-sub">
                {PERFIL_LABELS[usuario?.perfil] || 'Sistema'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__toggle-btn"
            onClick={onToggleDesktop}
            title={isDesktopClosed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={isDesktopClosed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isDesktopClosed ? <ChevronRight size={17} aria-hidden="true" /> : <ChevronLeft size={17} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="sidebar__close-mobile"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Menu principal">
          {navItems.map((item) => {
            const qtdBadge = contadoresPorRota[item.to] || 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={onClose}
                title={isDesktopClosed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                <span className="sidebar__link-icon" aria-hidden="true">
                  {item.icon}
                  {qtdBadge > 0 && isDesktopClosed && (
                    <span className="sidebar__dot" />
                  )}
                </span>
                {!isDesktopClosed && (
                  <>
                    <span className="sidebar__link-label">{item.label}</span>
                    {qtdBadge > 0 && (
                      <span
                        className="sidebar__badge"
                        aria-label={`${qtdBadge} ${qtdBadge === 1 ? 'pendência' : 'pendências'}`}
                      >
                        {qtdBadge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user" title={usuario?.nome || 'Usuário'}>
            <div className="sidebar__avatar" aria-hidden="true">
              {usuario?.nome?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isDesktopClosed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{usuario?.nome || 'Usuário'}</span>
                <span className="sidebar__user-handle">@{usuario?.usuario || 'usuario'}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar__logout"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair do sistema"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
