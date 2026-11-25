import React from 'react';
import Button from './Button';
import { Download, FileText } from 'lucide-react';

/**
 * BotoesExportacao — Grupo reutilizável de ações de exportação em CSV e PDF.
 */
const BotoesExportacao = ({
  exportandoFormato = '',
  onExportar,
  idPrefix = 'btn-exportar',
  size = 'sm',
}) => (
  <div className="btn-group" role="group" aria-label="Exportar relatório">
    <Button
      id={`${idPrefix}-csv`}
      type="button"
      variant="outline"
      size={size}
      loading={exportandoFormato === 'csv'}
      disabled={Boolean(exportandoFormato)}
      onClick={() => onExportar('csv')}
      title="Exportar registros filtrados em CSV (Excel)"
    >
      <Download size={15} aria-hidden="true" />
      CSV
    </Button>
    <Button
      id={`${idPrefix}-pdf`}
      type="button"
      variant="outline"
      size={size}
      loading={exportandoFormato === 'pdf'}
      disabled={Boolean(exportandoFormato)}
      onClick={() => onExportar('pdf')}
      title="Exportar relatório filtrado em PDF"
    >
      <FileText size={15} aria-hidden="true" />
      PDF
    </Button>
  </div>
);

export default BotoesExportacao;
