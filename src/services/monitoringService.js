import { api } from '../api/apiService';

class MonitoringService {
  // ✅ Récupérer les sessions actives
  async getActiveSessions(params = {}) {
    try {
      console.log('📊 [MONITORING] Récupération des sessions actives');
      
      const response = await api.get('/monitoring/sessions', {
        params: {
          inactivityPeriod: 30,
          ...params
        }
      });
      
      // ✅ CORRECTION: Retour direct car api.interceptor retourne déjà response.data
      console.log('✅ [MONITORING] Sessions récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération sessions:', error);
      throw error;
    }
  }

  // ✅ Récupérer les logs d'activité
  async getActivityLogs(params = {}) {
    try {
      console.log('📋 [MONITORING] Récupération logs d\'activité');
      
      const response = await api.get('/monitoring/activities', {
        params: {
          page: 1,
          limit: 50,
          ...params
        }
      });
      
      // ✅ CORRECTION: Retour direct car api.interceptor retourne déjà response.data
      console.log('✅ [MONITORING] Logs récupérés:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération logs:', error);
      throw error;
    }
  }

  // ✅ Récupérer les statistiques d'activité
  async getActivityStats(days = 30) {
    try {
      console.log(`📊 [MONITORING] Récupération statistiques (${days} jours)`);
      
      const response = await api.get('/monitoring/activities/stats', {
        params: { days }
      });
      
      console.log('✅ [MONITORING] Statistiques récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération statistiques:', error);
      throw error;
    }
  }

  // ✅ Récupérer l'historique de connexion d'un utilisateur
  async getUserConnectionHistory(userId, params = {}) {
    try {
      console.log(`👤 [MONITORING] Récupération historique utilisateur ${userId}`);
      
      const response = await api.get(`/monitoring/users/${userId}/connections`, {
        params: {
          page: 1,
          limit: 20,
          ...params
        }
      });
      
      console.log('✅ [MONITORING] Historique récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération historique:', error);
      throw error;
    }
  }

  // ✅ Récupérer les activités d'un utilisateur
  async getUserActivities(userId, params = {}) {
    try {
      console.log(`👤 [MONITORING] Récupération activités utilisateur ${userId}`);
      
      const response = await api.get(`/monitoring/users/${userId}/activities`, {
        params: {
          page: 1,
          limit: 50,
          ...params
        }
      });
      
      console.log('✅ [MONITORING] Activités récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération activités:', error);
      throw error;
    }
  }

  // ✅ Terminer une session
  async terminateSession(sessionId) {
    try {
      console.log(`🛑 [MONITORING] Terminaison session ${sessionId}`);
      
      const response = await api.delete(`/monitoring/sessions/${sessionId}`);
      
      console.log('✅ [MONITORING] Session terminée:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur terminaison session:', error);
      throw error;
    }
  }

  // ✅ Récupérer les actions disponibles
  async getAvailableActions() {
    try {
      console.log('📋 [MONITORING] Récupération actions disponibles');
      
      const response = await api.get('/monitoring/activities/actions');
      
      console.log('✅ [MONITORING] Actions récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur récupération actions:', error);
      throw error;
    }
  }

  // ✅ Récupérer les stats du dashboard
  async getDashboardStats() {
    try {
      console.log('📊 [MONITORING] Récupération stats dashboard');
      
      const response = await api.get('/monitoring/dashboard/stats');
      
      console.log('✅ [MONITORING] Stats dashboard récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [MONITORING] Erreur stats dashboard:', error);
      throw error;
    }
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;