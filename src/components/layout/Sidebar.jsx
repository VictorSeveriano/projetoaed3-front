import React, { useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard, Car, CalendarDays, Network, LogOut,
  ChevronLeft, ChevronRight, Map, Home, BarChart2, User, Bell
} from 'lucide-react';

/**
 * Itens de navegação por perfil.
 *
 * ADMINISTRADOR: mantém tudo que já existia (sem regressão).
 * USUARIO: solicitar corrida, minhas corridas, perfil.
 * MOTORISTA: início, minhas corridas, relatório, perfil, meu veículo.
 *
 * Termos internos (Grafo, ABB, Dijkstra) não aparecem na UI.
 */
const NAV_ITEMS_ADMIN = [
  { to: '/dashboard',             icon: <LayoutDashboard size={20} />, label: 'Dashboard'             },
  { to: '/corridas',              icon: <CalendarDays size={20} />,    label: 'Corridas'              },
  { to: '/carros',                icon: <Car size={20} />,             label: 'Veículos'              },
  { to: '/veiculos/analise',      icon: <Car size={20} />,             label: 'Análise de Veículos'   },
  { to: '/rotas',                 icon: <Network size={20} />,         label: 'Solicitar Corrida'     },
  { to: '/usuarios',              icon: <User size={20} />,            label: 'Usuários'              },
  { to: '/motoristas',            icon: <User size={20} />,            label: 'Motoristas'            },
  { to: '/motoristas/analise',    icon: <User size={20} />,            label: 'Análise de Motoristas' },
  { to: '/notificacoes',          icon: <Bell size={20} />,            label: 'Notificações'          },
];

const NAV_ITEMS_USUARIO = [
  { to: '/solicitar-corrida', icon: <Map size={20} />,         label: 'Solicitar corrida' },
  { to: '/minhas-corridas',   icon: <CalendarDays size={20} />, label: 'Minhas corridas'  },
  { to: '/perfil',            icon: <User size={20} />,         label: 'Meu perfil'       },
];

const NAV_ITEMS_MOTORISTA = [
  { to: '/inicio',            icon: <Home size={20} />,         label: 'Início'           },
  { to: '/minhas-corridas',   icon: <CalendarDays size={20} />, label: 'Minhas corridas'  },
  { to: '/relatorio',         icon: <BarChart2 size={20} />,    label: 'Relatório mensal' },
  { to: '/perfil',            icon: <User size={20} />,         label: 'Meu perfil'       },
  { to: '/meu-veiculo',       icon: <Car size={20} />,          label: 'Meu veículo'      },
];

const PERFIL_LABELS = {
  ADMINISTRADOR: 'Administrador',
  USUARIO: 'Passageiro',
  MOTORISTA: 'Motorista',
};

const Sidebar = ({ isOpen, onClose, isDesktopClosed, onToggleDesktop }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

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
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isDesktopClosed ? 'sidebar--closed' : ''}`}
        aria-expanded={!isDesktopClosed}
      >
        <div className="sidebar__brand">
          <div className="sidebar__brand-content">
            <span className="sidebar__logo"><Car size={28} aria-hidden="true" /></span>
            <div className="sidebar__brand-text">
              <span className="sidebar__title">ReservaCar</span>
              <span className="sidebar__subtitle">
                {PERFIL_LABELS[usuario?.perfil] || 'AED3'}
              </span>
            </div>
          </div>
          <button
            className="sidebar__toggle"
            onClick={onToggleDesktop}
            aria-label={isDesktopClosed ? 'Abrir menu' : 'Fechar menu'}
          >
            {isDesktopClosed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Menu principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={onClose}
              data-tooltip={item.label}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div
            className="sidebar__user"
            data-tooltip={usuario?.nome || 'Usuário'}
          >
            <div className="sidebar__user-avatar" aria-hidden="true">
              {usuario?.nome?.[0] || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{usuario?.nome || 'Usuário'}</span>
              <span className="sidebar__user-role">@{usuario?.usuario || 'usuario'}</span>
            </div>
          </div>
          <button
            className="sidebar__logout"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair do sistema"
            data-tooltip="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
