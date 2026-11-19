import { useState, useEffect, useCallback } from 'react';

/**
 * useModalEdicao — Hook reutilizável para controlar estado de edição, sincronização
 * inicial e ações de salvar/cancelar em modais baseados em ModalPerfilBase.
 */
export function useModalEdicao({ item, criarEstadoInicial, onSave, transformarPayload }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => criarEstadoInicial(item));

  useEffect(() => {
    if (item) {
      setFormData(criarEstadoInicial(item));
    }
    setIsEditing(false);
  }, [item, criarEstadoInicial]);

  const iniciarEdicao = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelarEdicao = useCallback(() => {
    setFormData(criarEstadoInicial(item));
    setIsEditing(false);
  }, [item, criarEstadoInicial]);

  const salvarEdicao = useCallback(async () => {
    if (!item) return;
    const payload = transformarPayload ? transformarPayload(formData) : formData;
    if (onSave) {
      await onSave(item.id, payload);
    }
    setIsEditing(false);
  }, [item, formData, transformarPayload, onSave]);

  return {
    isEditing,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
  };
}
