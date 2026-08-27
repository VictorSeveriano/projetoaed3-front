export const isValidDate = (dateStr) => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

export const isEndAfterStart = (inicio, fim) => new Date(fim) > new Date(inicio);
