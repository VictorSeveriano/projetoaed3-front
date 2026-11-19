import React from 'react';

const Loading = ({ message = 'Carregando...' }) => (
  <div className="loading-wrapper" role="status" aria-live="polite">
    <div className="loading-spinner" aria-hidden="true" />
    <p className="loading-text">{message}</p>
  </div>
);

export default Loading;
