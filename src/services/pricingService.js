import api from '../api/apiService';

class PricingService {
  /**
   * ✅ CALCUL DU PRIX ESTIMÉ D'UNE SESSION
   */
  static async calculerPrixEstime(posteId, dureeMinutes = 60, abonnementId = null) {
    try {
      console.log(`💰 [PRICING] Calcul prix estimé - Poste: ${posteId}, Durée: ${dureeMinutes}min`);

      const response = await api.post('/sessions/calculer-prix', {
        posteId,
        dureeMinutes,
        abonnementId
      });

      console.log('✅ [PRICING] Prix calculé:', response);
      return response;

    } catch (error) {
      console.error('❌ [PRICING] Erreur calcul prix:', error);
      throw error;
    }
  }

  /**
   * ✅ VÉRIFIER LE STATUT DE PAIEMENT D'UNE SESSION
   */
  static async verifierStatutPaiement(sessionId) {
    try {
      const response = await api.get(`/sessions/${sessionId}/paiement/statut`);
      return response;
    } catch (error) {
      console.error('❌ [PRICING] Erreur vérification paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ CALCULER LE PRIX FINAL D'UNE SESSION TERMINÉE
   */
  static async calculerPrixFinal(sessionId) {
    try {
      console.log(`💰 [PRICING_SERVICE] Calcul prix final pour session ${sessionId}`);
      const response = await api.post(`/sessions/${sessionId}/calculer-prix-final`);
      console.log('✅ [PRICING_SERVICE] Réponse prix final:', response);
      console.log('📊 [PRICING_SERVICE] Données reçues:', response.data);
      return response.data; // Retourner response.data au lieu de response
    } catch (error) {
      console.error('❌ [PRICING] Erreur calcul prix final:', error);
      throw error;
    }
  }

  /**
   * ✅ FORMATER UNE DEVISE
   */
  static formatCurrency(amount, currency = 'MAD') {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  /**
   * ✅ FORMATER UNE DURÉE
   */
  static formatDuree(minutes) {
    if (!minutes || minutes < 0) return '0 min';
    
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (heures === 0) return `${mins} min`;
    if (mins === 0) return `${heures}h`;
    return `${heures}h ${mins.toString().padStart(2, '0')}min`;
  }
}

export default PricingService;