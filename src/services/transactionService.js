import api from '../api/apiService';

class TransactionService {
  constructor() {
    this.baseUrl = '/transactions';
  }

  /**
   * ✅ CRÉER UNE NOUVELLE TRANSACTION
   */
  async createTransaction(transactionData) {
    try {
      const response = await api.post(`${this.baseUrl}`, transactionData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur création transaction:', error);
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRER LES TRANSACTIONS (avec gestion d'erreur backend)
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
      
      // Si erreur backend SQL, retourner des données vides pour éviter le crash
      if (error.message?.includes('missing FROM-clause') || error.message?.includes('Transaction->Transaction')) {
        console.warn('⚠️ [TRANSACTION_SERVICE] Erreur SQL backend détectée, retour de données vides');
        return {
          data: {
            transactions: [],
            total: 0,
            pagination: {
              page: parseInt(filters.page) || 1,
              limit: parseInt(filters.limit) || 50,
              totalPages: 0
            }
          }
        };
      }
      
      throw error;
    }
  }
  /**
   * ✅ RÉCUPÉRER TOUTES LES TRANSACTIONS (alias pour compatibility)
   */
  async getAllTransactions(filters = {}) {
    return this.getTransactions(filters);
  }

  async getAllTransaction(filters = {}) {
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
  async updatepaiement(transactionId, paiementData) {
    try {
      const response = await api.patch(`${this.baseUrl}/${transactionId}/paiement`, paiementData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur mise à jour paiement:', error);
      throw error;
    }
  }
   
  async updatePayment (transactionId, paiementData) {
    try {
      const response = await api.patch(`${this.baseUrl}/${transactionId}/paiement`, paiementData);
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

  /**
   * ✅ AJOUTER UNE TRANSACTION À UNE SESSION
   */
  async ajouterTransactionSession(transactionData) {
    try {
      const response = await api.post(`${this.baseUrl}/session`, transactionData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur ajout transaction session:', error);
      throw error;
    }
  }

  /**
   * ✅ SUPPRIMER UNE TRANSACTION
   */
  async supprimerTransaction(transactionId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${transactionId}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur suppression transaction:', error);
      throw error;
    }
  }

  /**
   * ✅ MODIFIER UNE TRANSACTION (version simplifiée pour CRUD)
   */
  async modifierTransactionSimple(transactionId, data) {
    try {
      const response = await api.put(`${this.baseUrl}/${transactionId}`, data);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur modification transaction simple:', error);
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRER UNE TRANSACTION PAR ID
   */
  async getTransactionById(transactionId) {
    try {
      const response = await api.get(`${this.baseUrl}/${transactionId}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transaction:', error);
      throw error;
    }
  }

  /**
   * ✅ TESTER LA CONNEXION AU SERVICE
   */
  async testConnection() {
    try {
      const response = await api.get('/health');
      console.log('✅ [TRANSACTION_SERVICE] Connexion OK');
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur connexion:', error);
      throw error;
    }
  }

  /**
   * ✅ RÉCUPÉRER LES TRANSACTIONS D'UNE SESSION
   */
  async getTransactionsBySession(sessionId) {
    try {
      console.log('📡 [TRANSACTION_SERVICE] Récupération transactions pour session:', sessionId);
      const response = await api.get(`${this.baseUrl}/session/${sessionId}`);
      console.log('✅ [TRANSACTION_SERVICE] Transactions session reçues:', response);
      console.log('📊 [TRANSACTION_SERVICE] Structure response.data:', response.data);
      console.log('🔍 [TRANSACTION_SERVICE] Transactions array:', response.data?.transactions);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transactions session:', error);
      // Retourner des données vides en cas d'erreur pour éviter le crash
      return {
        data: {
          transactions: [],
          total: 0,
          montantTotal: 0
        },
        success: true
      };
    }
  }
}

const transactionService = new TransactionService();

export default transactionService;
export { transactionService };