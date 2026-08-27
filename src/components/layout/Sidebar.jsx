import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard'   },
  { to: '/carros',     icon: '🚗', label: 'Carros'       },
  { to: '/reservas',   icon: '📋', label: 'Reservas'     },
  { to: '/grafo',      icon: '🗺️', label: 'Grafo / Rotas' },
];

const Sidebar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">🚗</span>
        <div>
          <span className="sidebar__title">ReservaCar</span>
          <span className="sidebar__subtitle">AED3</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">{usuario?.nome?.[0] || 'A'}</div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{usuario?.nome || 'Administrador'}</span>
            <span className="sidebar__user-role">@{usuario?.usuario || 'admin'}</span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} title="Sair">
          ⬅️
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
