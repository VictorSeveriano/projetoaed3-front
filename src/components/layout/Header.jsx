import React from 'react';

const Header = ({ title, subtitle, actions }) => (
  <header className="page-header">
    <div className="page-header__text">
      <h1 className="page-header__title">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </header>
);

export default Header;
