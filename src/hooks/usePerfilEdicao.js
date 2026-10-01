import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estado de edição de perfil, formulários e modais de confirmação.
 */
export const usePerfilEdicao = (initialData = {}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erroModal, setErroModal] = useState({ aberto: false, titulo: 'Erro', mensagem: '' });
  const [infoModal, setInfoModal] = useState(false);
  const [formData, setFormData] = useState(initialData);

  // Helper para comparar endereços
  const isAddressDifferent = useCallback((addr1, addr2) => {
    const a1 = addr1 || {};
    const a2 = addr2 || {};
    return a1.rua !== a2.rua || a1.bairro !== a2.bairro || a1.cidade !== a2.cidade || a1.estado !== a2.estado || a1.numero !== a2.numero || a1.cep !== a2.cep;
  }, []);

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
