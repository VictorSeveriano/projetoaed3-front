import React from 'react';

const Loading = ({ message = 'Carregando...' }) => (
  <div className="loading-wrapper">
    <div className="loading-spinner" />
    <p className="loading-text">{message}</p>
  </div>
);

export default Loading;
