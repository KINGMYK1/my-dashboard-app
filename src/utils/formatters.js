// src/utils/formatters.js

/**
 * Formate un montant en devise MAD.
 * @param {number|string} amount - Le montant à formater.
 * @returns {string} Le montant formaté.
 */
export const formatCurrency = (amount) => {
  return `${parseFloat(amount || 0).toFixed(2)} MAD`;
};

/**
 * Formate une chaîne de date en format local français.
 * @param {string} dateString - La date à formater.
 * @returns {string} La date formatée ou 'N/A' si invalide.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Erreur de formatage de date pour:", dateString, error);
    return 'Date invalide';
  }
};
