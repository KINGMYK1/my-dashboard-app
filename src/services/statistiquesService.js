import apiService from '../api/apiService';

class StatistiquesService {
  constructor() {
    this.baseURL = '/statistiques';
  }

  /**
   * ✅ CORRECTION: Récupérer le dashboard des postes
   */
  async getDashboardPostes(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération dashboard postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      
      const queryString = params.toString();
      const url = `/sessions/dashboard/postes${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      console.log('✅ [STATS_SERVICE] Dashboard postes récupéré:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur dashboard postes:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir les statistiques complètes des transactions
   */
  async obtenirStatistiquesCompletes(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération statistiques complètes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.posteId) params.append('posteId', filtres.posteId);
      if (filtres.clientId) params.append('clientId', filtres.clientId);
      if (filtres.groupBy) params.append('groupBy', filtres.groupBy);
      
      const queryString = params.toString();
      const url = `/transactions/statistiques/completes${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      console.log('✅ [STATS_SERVICE] Statistiques complètes récupérées:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur statistiques complètes:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer les statistiques par poste
   */
  async getStatistiquesPoste(posteId, filtres = {}) {
    try {
      console.log(`📊 [STATS_SERVICE] Récupération stats poste ${posteId}:`, filtres);
      
      const params = new URLSearchParams();
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.periode) params.append('periode', filtres.periode);
      
      const queryString = params.toString();
      const url = `/sessions/poste/${posteId}/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      console.log('✅ [STATS_SERVICE] Stats poste récupérées:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur stats poste:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Tableau de bord financier
   */
  async getTableauDeBordFinancier(options = {}) {
    try {
      console.log('💰 [STATS_SERVICE] Récupération tableau de bord financier:', options);
      
      const params = new URLSearchParams();
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      
      const queryString = params.toString();
      const url = `/transactions/tableau-de-bord${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      console.log('✅ [STATS_SERVICE] Tableau de bord financier récupéré:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur tableau de bord financier:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Comparaison de périodes
   */
  async comparerPeriodes(periodeActuelle, periodeComparaison) {
    try {
      console.log('📈 [STATS_SERVICE] Comparaison périodes:', periodeActuelle, periodeComparaison);
      
      const response = await apiService.post('/transactions/comparer-periodes', {
        periodeActuelle,
        periodeComparaison
      });
      
      console.log('✅ [STATS_SERVICE] Comparaison récupérée:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur comparaison périodes:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Statistiques par type de poste
   */
  async getStatistiquesTypePoste(typePosteId, filtres = {}) {
    try {
      console.log(`📊 [STATS_SERVICE] Stats type poste ${typePosteId}:`, filtres);
      
      const params = new URLSearchParams();
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      
      const queryString = params.toString();
      const url = `/types-postes/${typePosteId}/statistiques${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get(url);
      
      console.log('✅ [STATS_SERVICE] Stats type poste récupérées:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur stats type poste:', error);
      throw error;
    }
  }

  /**
   * ✅ Formater une devise
   */
  formatCurrency(amount, currency = 'MAD') {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  /**
   * ✅ Formater un pourcentage
   */
  formatPercentage(value, decimals = 1) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format((value || 0) / 100);
  }

  /**
   * ✅ Calculer l'évolution entre deux valeurs
   */
  calculerEvolution(valeurActuelle, valeurPrecedente) {
    if (!valeurPrecedente || valeurPrecedente === 0) {
      return valeurActuelle > 0 ? 100 : 0;
    }
    return ((valeurActuelle - valeurPrecedente) / valeurPrecedente) * 100;
  }
}

export const statistiquesService = new StatistiquesService();
export default statistiquesService;