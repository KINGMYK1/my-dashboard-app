import api from '../api/apiService';

class TransactionService {
  constructor() {
    this.baseUrl = '/transactions';
  }

  /**
   * ✅ RÉCUPÉRER LES TRANSACTIONS
   */
  async getTransactions(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transactions:', error);
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRER LES TRANSACTIONS EN ATTENTE
   */
  async getTransactionsEnAttente(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.includePartielles) {
        params.append('includePartielles', 'true');
      }

      const response = await api.get(`${this.baseUrl}/en-attente?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur transactions en attente:', error);
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRER LES STATISTIQUES DE VENTES
   */
  async getSalesStatistics(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`${this.baseUrl}/statistics?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur statistiques ventes:', error);
      throw error;
    }
  }

  /**
   * ✅ METTRE À JOUR UN PAIEMENT
   */
  async updatePayment(transactionId, paiementData) {
    try {
      const response = await api.patch(`${this.baseUrl}/${transactionId}/payment`, paiementData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur mise à jour paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ SUPPRIMER UNE TRANSACTION
   */
  async deleteTransaction(transactionId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${transactionId}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur suppression transaction:', error);
      throw error;
    }
  }

  /**
   * ✅ REMBOURSER UNE TRANSACTION
   */
  async refundTransaction(transactionId, refundData) {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/refund`, refundData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur remboursement:', error);
      throw error;
    }
  }

  /**
   * ✅ MODIFIER UNE TRANSACTION (fonction existante conservée)
   */
  async modifierTransaction(transactionId, action, donnees) {
    try {
      const response = await api.patch(`${this.baseUrl}/${transactionId}/modifier`, {
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
   * ✅ METTRE À JOUR LE PAIEMENT (fonction existante conservée)
   */
  async mettreAJourPaiement(transactionId, paiementData) {
    try {
      const response = await api.patch(`${this.baseUrl}/${transactionId}/paiement`, paiementData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur MAJ paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ STATISTIQUES COMPLÈTES DES TRANSACTIONS (fonction existante conservée)
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
}

const transactionService = new TransactionService();

export default transactionService;
export { transactionService };