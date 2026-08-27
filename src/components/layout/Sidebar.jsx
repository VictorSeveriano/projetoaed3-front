import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { LayoutDashboard, Car, CalendarDays, Network, LogOut, ChevronLeft, ChevronRight, Map } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: <LayoutDashboard size={20} />, label: 'Dashboard'   },
  { to: '/carros',     icon: <Car size={20} />, label: 'Carros'       },
  { to: '/reservas',   icon: <CalendarDays size={20} />, label: 'Reservas'     },
  { to: '/grafo',      icon: <Map size={20} />, label: 'Rotas' },
];

const Sidebar = ({ isOpen, onClose, isDesktopClosed, onToggleDesktop }) => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
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
      <div className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isDesktopClosed ? 'sidebar--closed' : ''}`} aria-expanded={!isDesktopClosed}>
      <div className="sidebar__brand">
        <div className="sidebar__brand-content">
          <span className="sidebar__logo"><Car size={28} aria-hidden="true" /></span>
          <div className="sidebar__brand-text">
            <span className="sidebar__title">ReservaCar</span>
            <span className="sidebar__subtitle">AED3</span>
          </div>
        </div>
        <button 
          className="sidebar__toggle" 
          onClick={onToggleDesktop} 
          aria-label={isDesktopClosed ? "Abrir menu" : "Fechar menu"}
        >
          {isDesktopClosed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            data-tooltip={item.label}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user" data-tooltip={usuario?.nome || 'Administrador'}>
          <div className="sidebar__user-avatar">{usuario?.nome?.[0] || 'A'}</div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{usuario?.nome || 'Administrador'}</span>
            <span className="sidebar__user-role">@{usuario?.usuario || 'admin'}</span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} title="Sair" aria-label="Sair do sistema" data-tooltip="Sair">
          <LogOut size={20} />
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
