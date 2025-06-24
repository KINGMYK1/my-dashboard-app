import { api } from '../api/apiService';

class TransactionService {
  constructor() {
    this.baseUrl = '/transactions';
  }

  /**
   * ✅ CORRECTION: Récupérer toutes les transactions avec données enrichies
   */
  async getAllTransactions(params = {}) {
    try {
      console.log('📋 [TRANSACTION_SERVICE] Récupération transactions:', params);
      
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Filtres
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.typeTransaction) queryParams.append('typeTransaction', params.typeTransaction);
      if (params.modePaiement) queryParams.append('modePaiement', params.modePaiement);
      if (params.dateDebut) queryParams.append('dateDebut', params.dateDebut);
      if (params.dateFin) queryParams.append('dateFin', params.dateFin);
      if (params.montantMin) queryParams.append('montantMin', params.montantMin);
      if (params.montantMax) queryParams.append('montantMax', params.montantMax);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await api.get(`${this.baseUrl}?${queryParams.toString()}`);
      console.log('✅ [TRANSACTION_SERVICE] Transactions récupérées:', response);
      
      // ✅ CORRECTION: Normaliser les données
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(transaction => this.normalizeTransactionData(transaction));
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer les transactions en attente avec calculs corrects
   */
  async getTransactionsEnAttente(filters = {}) {
    try {
      console.log('⏳ [TRANSACTION_SERVICE] Récupération transactions en attente:', filters);
      
      const queryParams = new URLSearchParams();
      if (filters.includePartielles) queryParams.append('includePartielles', 'true');
      
      const response = await api.get(`${this.baseUrl}/en-attente?${queryParams.toString()}`);
      console.log('✅ [TRANSACTION_SERVICE] Transactions en attente récupérées:', response);
      
      // ✅ CORRECTION: Normaliser et calculer les montants corrects
      if (response.data && Array.isArray(response.data)) {
        response.data = response.data.map(transaction => {
          const normalized = this.normalizeTransactionData(transaction);
          
          // ✅ CORRECTION CRITIQUE: Recalculer les montants si incorrects
          if (normalized.montantPaye === normalized.resteAPayer && normalized.montantTotal > 0) {
            normalized.montantPaye = Math.max(0, normalized.montantTotal - normalized.resteAPayer);
          }
          
          return normalized;
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur transactions en attente:', error);
      throw error;
    }
  }

  /**
   * ✅ MISE À JOUR: Mettre à jour le paiement d'une transaction
   */
  async updatePayment(transactionId, paiementData) {
    try {
      console.log('💳 [TRANSACTION_SERVICE] Mise à jour paiement:', transactionId, paiementData);
      
      const payload = {
        montantSupplementaire: parseFloat(paiementData.montantSupplementaire) || 0,
        modePaiement: paiementData.modePaiement || 'ESPECES',
        marquerCommePayee: paiementData.marquerCommePayee || false,
        notes: paiementData.notes || '',
        derniersChiffresCarte: paiementData.derniersChiffresCarte || null,
        typeCarte: paiementData.typeCarte || null
      };

      const response = await api.patch(`${this.baseUrl}/${transactionId}/paiement`, payload);
      console.log('✅ [TRANSACTION_SERVICE] Paiement mis à jour:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur mise à jour paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION CRITIQUE: Normaliser les données de transaction
   */
  normalizeTransactionData(transaction) {
    const normalized = {
      ...transaction,
      
      // ✅ Montants normalisés
      montantTotal: parseFloat(transaction.montantTTC) || parseFloat(transaction.totalTTC) || 0,
      montantTTC: parseFloat(transaction.montantTTC) || parseFloat(transaction.totalTTC) || 0,
      montantHT: parseFloat(transaction.montantHT) || parseFloat(transaction.totalHT) || 0,
      montantPaye: parseFloat(transaction.montantPaye) || 0,
      resteAPayer: parseFloat(transaction.resteAPayer) || 0,
      
      // ✅ État de transaction
      statutTransaction: transaction.statutTransaction || transaction.statut || 'EN_ATTENTE',
      estComplete: transaction.estComplete || false,
      
      // ✅ Informations de paiement
      modePaiement: transaction.modePaiement || 'ESPECES',
      
      // ✅ Dates normalisées
      dateTransaction: transaction.dateHeure || transaction.createdAt,
      dateCreation: transaction.createdAt,
      dateMiseAJour: transaction.updatedAt,
      
      // ✅ Relations
      session: transaction.session ? {
        id: transaction.session.id,
        numeroSession: transaction.session.numeroSession,
        poste: transaction.session.poste,
        client: transaction.session.client,
        dureeEffectiveMinutes: transaction.session.dureeEffectiveMinutes
      } : null,
      
      // ✅ Lignes de transaction
      lignes: transaction.lignes || transaction.LigneTransactions || []
    };

    // ✅ CORRECTION: Recalculer resteAPayer si incohérent
    if (normalized.montantTotal > 0) {
      const resteCalcule = Math.max(0, normalized.montantTotal - normalized.montantPaye);
      if (Math.abs(normalized.resteAPayer - resteCalcule) > 0.01) {
        console.warn('⚠️ [TRANSACTION] Recalcul resteAPayer:', {
          original: normalized.resteAPayer,
          recalcule: resteCalcule,
          montantTotal: normalized.montantTotal,
          montantPaye: normalized.montantPaye
        });
        normalized.resteAPayer = resteCalcule;
      }
      
      // ✅ Déterminer si la transaction est complète
      normalized.estComplete = normalized.resteAPayer <= 0.01;
    }

    return normalized;
  }

  /**
   * ✅ Autres méthodes de service (conservées)
   */
  async getTransactionById(id) {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return {
        ...response,
        data: this.normalizeTransactionData(response.data)
      };
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur récupération transaction:', error);
      throw error;
    }
  }

  async processPayment(transactionId, modePaiement, detailsPaiement = {}) {
    try {
      const payload = {
        modePaiement,
        ...detailsPaiement
      };
      
      const response = await api.post(`${this.baseUrl}/${transactionId}/process-payment`, payload);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur traitement paiement:', error);
      throw error;
    }
  }

  async refundTransaction(transactionId, raisonRemboursement) {
    try {
      const response = await api.post(`${this.baseUrl}/${transactionId}/refund`, {
        raison: raisonRemboursement
      });
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur remboursement:', error);
      throw error;
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${transactionId}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur suppression:', error);
      throw error;
    }
  }

  async getSalesStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.periode) queryParams.append('periode', filters.periode);
      if (filters.dateDebut) queryParams.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) queryParams.append('dateFin', filters.dateFin);
      
      const response = await api.get(`${this.baseUrl}/statistics?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur statistiques:', error);
      throw error;
    }
  }

  async createTransaction(transactionData) {
    try {
      const response = await api.post(this.baseUrl, transactionData);
      return response;
    } catch (error) {
      console.error('❌ [TRANSACTION_SERVICE] Erreur création transaction:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;