import { api } from '../api/apiService';  // Importer api, pas apiService

const monitoringService = {
  // Récupérer les sessions actives
  getActiveSessions: async (inactivityPeriod = 30) => {
    try {
      const response = await api.get('/monitoring/sessions', {
        params: { inactivityPeriod }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Récupérer les logs d'activité avec filtres
  getActivityLogs: async (filters = {}) => {
    try {
      const response = await api.get('/monitoring/activities', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Récupérer les statistiques d'activité
  getActivityStats: async (days = 30) => {
    try {
      const response = await api.get('/monitoring/activities/stats', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Récupérer l'historique de connexion d'un utilisateur
  getUserConnectionHistory: async (userId) => {
    try {
      const response = await api.get(`/monitoring/users/${userId}/connections`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Terminer une session utilisateur
  terminateSession: async (sessionId) => {
    try {
      const response = await api.delete(`/monitoring/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default monitoringService;