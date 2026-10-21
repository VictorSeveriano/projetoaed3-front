import { useState, useCallback } from 'react';
import { isAddressDifferent } from '../utils/endereco';

/**
 * Hook para gerenciar estado de edição de perfil, formulários e modais de confirmação.
 */
export const usePerfilEdicao = (initialData = {}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });
  const [infoModal, setInfoModal] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleCancelClick = useCallback((hasChanges) => {
    if (isEditing && hasChanges) {
      setShowConfirm(true);
    } else {
      setIsEditing(false);
    }
  }, [isEditing]);

  const resetForm = useCallback((newData) => {
    setFormData(newData);
    setIsEditing(false);
    setShowConfirm(false);
  }, []);

  return {
    isEditing, setIsEditing,
    showConfirm, setShowConfirm,
    erroModal, setErroModal,
    infoModal, setInfoModal,
    formData, setFormData,
    isAddressDifferent,
    handleCancelClick,
    resetForm
  };
};
