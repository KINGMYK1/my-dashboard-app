import { api } from '../api/apiService';

class TransactionService {
  /**
   * ✅ Récupérer les transactions en attente de paiement
   */
  async getTransactionsEnAttente(filters = {}) {
    try {
      console.log('📋 [TRANSACTION_SERVICE] Récupération transactions en attente:', filters);
      
      const response = await api.get('/transactions/pending', { params: filters });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur transactions en attente:', error);
      throw error;
    }
  }

  /**
   * ✅ Mettre à jour le paiement d'une transaction
   */
  async updatePayment(transactionId, paiementData) {
    try {
      console.log('💰 [TRANSACTION_SERVICE] Mise à jour paiement:', transactionId, paiementData);
      
      const response = await api.patch(`/transactions/${transactionId}/payment`, paiementData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur mise à jour paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ Annuler une transaction
   */
  async cancelTransaction(transactionId, raison) {
    try {
      console.log('❌ [TRANSACTION_SERVICE] Annulation transaction:', transactionId, raison);
      
      const response = await api.patch(`/transactions/${transactionId}/cancel`, { raison });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur annulation transaction:', error);
      throw error;
    }
  }

  /**
   * ✅ Récupérer toutes les transactions avec filtres
   */
  async getAllTransactions(filters = {}) {
    try {
      console.log('📋 [TRANSACTION_SERVICE] Récupération transactions:', filters);
      
      const response = await api.get('/transactions', { params: filters });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transactions:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;