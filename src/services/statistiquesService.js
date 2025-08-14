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
   * ✅ NOUVEAU: Obtenir les statistiques avancées des transactions avec calculs corrects
   */
  async getAdvancedTransactionStatistics(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Statistiques avancées transactions:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.groupBy) params.append('groupBy', filtres.groupBy);
      if (filtres.includeComparison) params.append('includeComparison', filtres.includeComparison);
      
      const response = await apiService.get(`/transactions/statistiques/advanced?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur statistiques avancées:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir le chiffre d'affaires détaillé avec calculs corrects
   */
  async getDetailedChiffreAffaires(filtres = {}) {
    try {
      console.log('💰 [STATS_SERVICE] Chiffre d\'affaires détaillé:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.groupBy) params.append('groupBy', filtres.groupBy);
      if (filtres.includeBreakdown) params.append('includeBreakdown', 'true');
      if (filtres.includeTrends) params.append('includeTrends', 'true');
      
      const response = await apiService.get(`/finances/chiffre-affaires/detailed?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur CA détaillé:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir les tendances des transactions
   */
  async getTransactionTrends(filtres = {}) {
    try {
      console.log('📈 [STATS_SERVICE] Tendances transactions:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.groupBy) params.append('groupBy', filtres.groupBy);
      if (filtres.includeForecast) params.append('includeForecast', 'true');
      
      const response = await apiService.get(`/transactions/trends?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur tendances:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Comparaison de périodes pour les transactions
   */
  async getTransactionComparison(filtres = {}) {
    try {
      console.log('🔄 [STATS_SERVICE] Comparaison transactions:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periodeActuelle) params.append('periodeActuelle', filtres.periodeActuelle);
      if (filtres.periodeComparaison) params.append('periodeComparaison', filtres.periodeComparaison);
      if (filtres.metriques) params.append('metriques', filtres.metriques.join(','));
      
      const response = await apiService.get(`/transactions/comparison?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur comparaison:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Métriques financières avancées
   */
  async getAdvancedFinancialMetrics(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Métriques financières avancées:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.includeMargins) params.append('includeMargins', 'true');
      if (filtres.includeKPI) params.append('includeKPI', 'true');
      if (filtres.includeForecast) params.append('includeForecast', 'true');
      
      const response = await apiService.get(`/finances/metrics/advanced?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur métriques financières:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Alertes financières basées sur des seuils
   */
  async getFinancialAlerts(seuils = {}) {
    try {
      console.log('🚨 [STATS_SERVICE] Alertes financières:', seuils);
      
      const params = new URLSearchParams();
      if (seuils.caMinimum) params.append('caMinimum', seuils.caMinimum);
      if (seuils.margeMinimum) params.append('margeMinimum', seuils.margeMinimum);
      if (seuils.baisseCAToleree) params.append('baisseCAToleree', seuils.baisseCAToleree);
      
      const response = await apiService.get(`/finances/alerts?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur alertes financières:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Statistiques correctes des postes
   */
  async getCorrectPosteStatistics(filtres = {}) {
    try {
      console.log('🎮 [STATS_SERVICE] Statistiques correctes postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.dateDebut) params.append('dateDebut', filtres.dateDebut);
      if (filtres.dateFin) params.append('dateFin', filtres.dateFin);
      if (filtres.includeInactifs) params.append('includeInactifs', filtres.includeInactifs);
      if (filtres.groupByType) params.append('groupByType', filtres.groupByType);
      
      const response = await apiService.get(`/postes/statistiques/correct?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur stats correctes postes:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Taux d'occupation réels des postes
   */
  async getPosteOccupationRates(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Taux occupation postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.granularite) params.append('granularite', filtres.granularite); // heure, jour, semaine
      if (filtres.heuresOuverture) params.append('heuresOuverture', JSON.stringify(filtres.heuresOuverture));
      
      const response = await apiService.get(`/postes/occupation/rates?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur taux occupation:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Revenus par poste avec détails
   */
  async getPosteRevenues(filtres = {}) {
    try {
      console.log('💰 [STATS_SERVICE] Revenus par poste:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.includeOperatingCosts) params.append('includeOperatingCosts', 'true');
      if (filtres.includeProfitability) params.append('includeProfitability', 'true');
      
      const response = await apiService.get(`/postes/revenues?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur revenus postes:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Comparaison de performance entre postes
   */
  async getPostePerformanceComparison(filtres = {}) {
    try {
      console.log('🏆 [STATS_SERVICE] Comparaison performance postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.metriques) params.append('metriques', filtres.metriques.join(','));
      if (filtres.includeRanking) params.append('includeRanking', 'true');
      
      const response = await apiService.get(`/postes/performance/comparison?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur comparaison performance:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Analyse des heures de pointe par poste
   */
  async getPostePeakHours(filtres = {}) {
    try {
      console.log('⏰ [STATS_SERVICE] Heures de pointe postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.granularite) params.append('granularite', filtres.granularite);
      if (filtres.seuil) params.append('seuil', filtres.seuil); // Seuil pour définir les heures de pointe
      
      const response = await apiService.get(`/postes/peak-hours?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur heures de pointe:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Analyse des sessions par poste spécifique
   */
  async getSessionAnalysisByPoste(posteId, filtres = {}) {
    try {
      console.log('🎯 [STATS_SERVICE] Analyse sessions par poste:', posteId, filtres);
      
      const params = new URLSearchParams();
      if (filtres.periode) params.append('periode', filtres.periode);
      if (filtres.includeTemporalAnalysis) params.append('includeTemporalAnalysis', 'true');
      if (filtres.includeProfitability) params.append('includeProfitability', 'true');
      if (filtres.includeComparison) params.append('includeComparison', 'true');
      
      const response = await apiService.get(`/postes/${posteId}/sessions/analysis?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur analyse sessions poste:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Analyse de maintenance et optimisation des postes
   */
  async getPosteMaintenanceAnalysis(filtres = {}) {
    try {
      console.log('🔧 [STATS_SERVICE] Analyse maintenance postes:', filtres);
      
      const params = new URLSearchParams();
      if (filtres.includePerformanceDegradation) params.append('includePerformanceDegradation', 'true');
      if (filtres.includeOptimizationSuggestions) params.append('includeOptimizationSuggestions', 'true');
      if (filtres.alertThreshold) params.append('alertThreshold', filtres.alertThreshold);
      
      const response = await apiService.get(`/postes/maintenance/analysis?${params.toString()}`);
      return response.data;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur analyse maintenance:', error);
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

  /**
   * ✅ TEMPORAIRE: Récupérer l'évolution du chiffre d'affaires
   * Fonction manquante ajoutée pour corriger le bug
   */
  async obtenirEvolutionChiffreAffaires(filtres = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération évolution chiffre d\'affaires:', filtres);
      
      // Utiliser getDetailedChiffreAffaires en attendant
      const response = await this.getDetailedChiffreAffaires(filtres);
      
      // Adapter la réponse au format attendu
      const evolutionData = {
        data: {
          evolution: response?.data?.evolution || [],
          total: response?.data?.total || 0,
          variation: response?.data?.variation || 0
        }
      };
      
      console.log('✅ [STATS_SERVICE] Évolution chiffre d\'affaires récupérée:', evolutionData);
      return evolutionData;
      
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur évolution chiffre d\'affaires:', error);
      
      // Retourner des données vides en cas d'erreur pour éviter le crash
      return {
        data: {
          evolution: [],
          total: 0,
          variation: 0
        }
      };
    }
  }
}

export const statistiquesService = new StatistiquesService();
export default statistiquesService;