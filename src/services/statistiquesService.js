class StatistiquesService {
  /**
   * Récupérer les statistiques détaillées d'un poste
   */
  async getStatistiquesPosteDetaillees(posteId, params = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération stats détaillées poste:', posteId, params);
      
      const response = await api.get(`/sessions/poste/${posteId}/statistics-detaillees`, { params });
      console.log('✅ [STATS_SERVICE] Stats détaillées récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur stats poste:', error);
      throw error;
    }
  }

  /**
   * Récupérer le dashboard global des postes
   */
  async getDashboardPostes(periode = 'semaine') {
    try {
      console.log('📊 [STATS_SERVICE] Récupération dashboard postes, période:', periode);
      
      const response = await api.get('/sessions/dashboard/postes', { 
        params: { periode } 
      });
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur dashboard postes:', error);
      throw error;
    }
  }

  /**
   * Comparer les performances entre postes
   */
  async comparerPostes(posteIds, dateDebut = null, dateFin = null) {
    try {
      console.log('📊 [STATS_SERVICE] Comparaison postes:', { posteIds, dateDebut, dateFin });
      
      const payload = { posteIds };
      if (dateDebut) payload.dateDebut = dateDebut;
      if (dateFin) payload.dateFin = dateFin;
      
      const response = await api.post('/sessions/comparer-postes', payload);
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur comparaison postes:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique d'un poste
   */
  async getHistoriquePoste(posteId, params = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération historique poste:', posteId, params);
      
      const response = await api.get(`/sessions/poste/${posteId}/historique`, { params });
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur historique poste:', error);
      throw error;
    }
  }

  /**
   * Analyser les créneaux horaires d'un poste
   */
  async getAnalyseCreneauxHoraires(posteId, dateDebut = null, dateFin = null) {
    try {
      console.log('📊 [STATS_SERVICE] Analyse créneaux horaires:', { posteId, dateDebut, dateFin });
      
      const params = {};
      if (dateDebut) params.dateDebut = dateDebut;
      if (dateFin) params.dateFin = dateFin;
      
      const response = await api.get(`/sessions/poste/${posteId}/creneaux-horaires`, { params });
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur analyse créneaux:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'historique général des sessions
   */
  async getHistoriqueGeneralSessions(params = {}) {
    try {
      console.log('📊 [STATS_SERVICE] Récupération historique général:', params);
      
      const response = await api.get('/sessions/historique', { params });
      
      return response;
    } catch (error) {
      console.error('❌ [STATS_SERVICE] Erreur historique général:', error);
      throw error;
    }
  }
}

export const statistiquesService = new StatistiquesService();
export default statistiquesService;