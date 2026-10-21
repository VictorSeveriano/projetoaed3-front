/**
 * Utilitários de endereço compartilhados por formulários e modais de perfil.
 */

export const ENDERECO_VAZIO = {
  rua: '',
  bairro: '',
  cidade: '',
  estado: '',
  numero: '',
  cep: '',
};

export const isAddressDifferent = (addr1, addr2) => {
  const a1 = addr1 || {};
  const a2 = addr2 || {};
  return (
    (a1.rua || '') !== (a2.rua || '') ||
    (a1.bairro || '') !== (a2.bairro || '') ||
    (a1.cidade || '') !== (a2.cidade || '') ||
    (a1.estado || '') !== (a2.estado || '') ||
    (a1.numero || '') !== (a2.numero || '') ||
    (a1.cep || '') !== (a2.cep || '')
  );
};
