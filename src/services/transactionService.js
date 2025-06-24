import { api } from '../api/apiService';

class TransactionService {
  
  /**
   * 📊 STATISTIQUES COMPLÈTES DES TRANSACTIONS
   */
  async getStatistiquesCompletes(filtres = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.posteId) params.append('posteId', filtres.posteId);
      if (filtres.clientId) params.append('clientId', filtres.clientId);
      if (filtres.utilisateurId) params.append('utilisateurId', filtres.utilisateurId);
      if (filtres.groupBy) params.append('groupBy', filtres.groupBy);

      const response = await api.get(`/statistiques/completes?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur statistiques complètes:', error);
      throw error;
    }
  }

  /**
   * 📊 TABLEAU DE BORD FINANCIER
   */
  async getTableauDeBordFinancier(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);

      const response = await api.get(`/statistiques/tableau-de-bord?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur tableau de bord:', error);
      throw error;
    }
  }

  /**
   * 📈 ÉVOLUTION DU CHIFFRE D'AFFAIRES
   */
  async getEvolutionChiffreAffaires(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.periode) params.append('periode', options.periode);
      if (options.groupBy) params.append('groupBy', options.groupBy);

      const response = await api.get(`/statistiques/evolution-ca?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur évolution CA:', error);
      throw error;
    }
  }

  /**
   * 📊 COMPARER DEUX PÉRIODES
   */
  async comparerPeriodes(params) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await api.get(`/statistiques/comparaison?${searchParams.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur comparaison périodes:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES PAR POSTE
   */
  async getStatistiquesParPoste(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      if (options.top) params.append('top', options.top);

      const response = await api.get(`/statistiques/par-poste?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur stats par poste:', error);
      throw error;
    }
  }

  /**
   * 💰 TRANSACTIONS EN ATTENTE
   */
  async getTransactionsEnAttente(filtres = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtres.page) params.append('page', filtres.page);
      if (filtres.limit) params.append('limit', filtres.limit);
      if (filtres.posteId) params.append('posteId', filtres.posteId);
      if (filtres.clientId) params.append('clientId', filtres.clientId);
      if (filtres.montantMin) params.append('montantMin', filtres.montantMin);
      if (filtres.montantMax) params.append('montantMax', filtres.montantMax);
      if (filtres.includePartielles !== undefined) {
        params.append('includePartielles', filtres.includePartielles);
      }

      const response = await api.get(`/transactions/en-attente?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur transactions en attente:', error);
      throw error;
    }
  }

  /**
   * 🔧 MODIFIER UNE TRANSACTION
   */
  async modifierTransaction(transactionId, action, donnees) {
    try {
      const response = await api.patch(`/transactions/${transactionId}/modifier`, {
        action,
        donnees
      });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur modification transaction:', error);
      throw error;
    }
  }

  /**
   * 💳 METTRE À JOUR LE PAIEMENT
   */
  async mettreAJourPaiement(transactionId, paiementData) {
    try {
      const response = await api.patch(`/transactions/${transactionId}/paiement`, paiementData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur MAJ paiement:', error);
      throw error;
    }
  }

  /**
   * 📤 EXPORT DES DONNÉES
   */
  async exporterDonnees(type, filtres = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/statistiques/export/${type}?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur export:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR TOUTES LES TRANSACTIONS
   */
  async getTransactions(filtres = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/transactions?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transactions:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UNE TRANSACTION
   */
  async deleteTransaction(transactionId) {
    try {
      const response = await api.delete(`/transactions/${transactionId}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur suppression transaction:', error);
      throw error;
    }
  }

  /**
   * 💸 REMBOURSER UNE TRANSACTION
   */
  async refundTransaction(transactionId, raison = '') {
    try {
      const response = await api.patch(`/transactions/${transactionId}/remboursement`, {
        raison
      });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur remboursement transaction:', error);
      throw error;
    }
  }

  /**
   * 📊 STATISTIQUES DE VENTE
   */
  async getSalesStatistics(filtres = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/transactions/statistics?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur statistiques ventes:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;