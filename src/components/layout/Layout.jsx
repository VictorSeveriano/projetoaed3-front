import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import { Menu, Car } from 'lucide-react';
import GerenciadorConfirmacaoEmbarque from '../ui/GerenciadorConfirmacaoEmbarque';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuClosed, setDesktopMenuClosed] = useState(false);

  const handleCloseMobile = useCallback(() => setMobileMenuOpen(false), []);
  const handleToggleDesktop = useCallback(() => setDesktopMenuClosed((prev) => !prev), []);

  return (
    <div className={`app-layout ${desktopMenuClosed ? 'app-layout--sidebar-closed' : ''}`}>
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo principal
      </a>

      {/* Barra superior no mobile */}
      <header className="mobile-top-bar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={mobileMenuOpen}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <div className="mobile-top-bar__brand">
          <span className="mobile-top-bar__icon" aria-hidden="true">
            <Car size={20} />
          </span>
          <span className="mobile-top-bar__title">ReservaCar</span>
        </div>
      </header>

      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={handleCloseMobile}
        isDesktopClosed={desktopMenuClosed}
        onToggleDesktop={handleToggleDesktop}
      />

      <main id="main-content" className="app-main" tabIndex={-1}>
        <div className="app-content">
          {children}
        </div>
      </main>
      <GerenciadorConfirmacaoEmbarque />
    </div>
  );
};

export default Layout;
