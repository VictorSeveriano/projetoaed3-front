import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuClosed, setDesktopMenuClosed] = useState(false);

  return (
    <div className={`app-layout ${desktopMenuClosed ? 'app-layout--sidebar-closed' : ''}`}>
      {/* Barra superior no mobile */}
      <div className="mobile-top-bar">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
          <Menu size={24} />
        </button>
        <span className="mobile-top-bar__title">ReservaCar</span>
      </div>

      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isDesktopClosed={desktopMenuClosed}
        onToggleDesktop={() => setDesktopMenuClosed(!desktopMenuClosed)}
      />
      
      <main className="app-main">
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
