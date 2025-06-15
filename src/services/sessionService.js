import api from '../api/apiService';

// Protection contre les requêtes multiples
let pendingRequests = new Map();

const withRequestProtection = async (key, requestFn) => {
  if (pendingRequests.has(key)) {
    console.log(`🚫 [SESSION_SERVICE] Requête ${key} déjà en cours, utilisation du cache`);
    return pendingRequests.get(key);
  }

  const promise = requestFn();
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    setTimeout(() => {
      pendingRequests.delete(key);
    }, 1000);
  }
};

const sessionService = {
  /**
   * ✅ Démarrer une session
   */
  demarrerSession: async (sessionData) => {
    try {
      // ✅ DEBUG: Log pour vérifier les données reçues
      console.log('📤 [SESSION_SERVICE] Envoi données session:', {
        posteId: sessionData.posteId,
        dureeMinutes: sessionData.dureeMinutes,
        clientId: sessionData.clientId,
        abonnementId: sessionData.abonnementId,
        dataType: typeof sessionData.dureeMinutes
      });

      // ✅ CORRECTION: S'assurer que dureeMinutes est bien formaté
      const formattedData = {
        ...sessionData,
        dureeMinutes: parseInt(sessionData.dureeMinutes) || 60 // Valeur par défaut si conversion échoue
      };

      console.log('📤 [SESSION_SERVICE] Données formatées:', formattedData);

      const response = await api.post('/sessions/demarrer', formattedData);
      
      console.log('📡 [SESSION_SERVICE] Réponse serveur:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur démarrage session:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors du démarrage de la session');
      }
      
      throw new Error('Erreur de connexion au serveur');
    }
  },

  /**
   * ✅ Récupérer les sessions actives avec protection
   */
  async getActiveSessions() {
    return withRequestProtection('getActiveSessions', async () => {
      try {
        console.log('📡 [SESSION_SERVICE] Récupération sessions actives...');
        const response = await api.get('/sessions/active');
        console.log('✅ [SESSION_SERVICE] Sessions actives reçues:', response.data);
        return response;
      } catch (error) {
        console.error('❌ [SESSION_SERVICE] Erreur sessions actives:', error);
        throw error;
      }
    });
  },

  /**
   * ✅ Récupérer les sessions en pause avec protection
   */
  async getPausedSessions() {
    return withRequestProtection('getPausedSessions', async () => {
      try {
        console.log('📡 [SESSION_SERVICE] Récupération sessions en pause...');
        const response = await api.get('/sessions/paused');
        console.log('✅ [SESSION_SERVICE] Sessions en pause reçues:', response.data);
        return response;
      } catch (error) {
        console.error('❌ [SESSION_SERVICE] Erreur sessions en pause:', error);
        throw error;
      }
    });
  },

  /**
   * ✅ Mettre en pause une session avec protection
   */
  async pauseSession(sessionId, raison = 'Session mise en pause') {
    const key = `pauseSession_${sessionId}`;
    
    return withRequestProtection(key, async () => {
      try {
        console.log(`⏸️ [SESSION_SERVICE] Mise en pause session ${sessionId}`);
        
        const response = await api.patch(`/sessions/${sessionId}/pause`, {
          raison: raison
        });
        
        console.log(`✅ [SESSION_SERVICE] Session ${sessionId} mise en pause`);
        return response;
      } catch (error) {
        console.error(`❌ [SESSION_SERVICE] Erreur pause session ${sessionId}:`, error);
        throw error;
      }
    });
  },

  /**
   * ✅ NOUVEAU: Reprendre une session avec protection
   */
  async resumeSession(sessionId) {
    const key = `resumeSession_${sessionId}`;
    
    return withRequestProtection(key, async () => {
      try {
        console.log(`▶️ [SESSION_SERVICE] Reprise session ${sessionId}`);
        
        const response = await api.patch(`/sessions/${sessionId}/reprendre`);
        
        console.log(`✅ [SESSION_SERVICE] Session ${sessionId} reprise`);
        return response;
      } catch (error) {
        console.error(`❌ [SESSION_SERVICE] Erreur reprise session ${sessionId}:`, error);
        throw error;
      }
    });
  },

  /**
   * ✅ Terminer une session
   */
  endSession: (sessionId, sessionEndData) => {
    console.log('🏁 [SESSION_SERVICE] Fin session:', sessionId, sessionEndData);
    return api.patch(`/sessions/${sessionId}/terminer`, sessionEndData);
  },

  /**
   * ✅ Prolonger une session
   */
  extendSession: (sessionId, additionalMinutes) => {
    console.log('⏱️ [SESSION_SERVICE] Prolonger session:', sessionId, 'minutes:', additionalMinutes);
    return api.patch(`/sessions/${sessionId}/prolonger`, { dureeSupplementaireMinutes: additionalMinutes });
  },

  /**
   * ✅ Annuler une session
   */
  cancelSession: (sessionId, raison) => {
    console.log('❌ [SESSION_SERVICE] Annuler session:', sessionId, 'raison:', raison);
    return api.patch(`/sessions/${sessionId}/annuler`, { raison });
  },

  /**
   * ✅ Calculer le prix d'une session
   */
  calculateSessionPrice: (data) => {
    console.log('💰 [SESSION_SERVICE] Calcul prix session:', data);
    return api.post('/sessions/calculer-cout', data);
  }
};

export default sessionService;