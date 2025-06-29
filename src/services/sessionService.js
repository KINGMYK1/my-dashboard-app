import api from '../api/apiService';

// Protection contre les requêtes multiples (conservée)
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

class SessionService {
  constructor() {
    this.baseUrl = '/sessions';
  }

  /**
   * ✅ CONSERVÉ: Démarrer une session avec votre structure
   */
  async demarrerSession(sessionData) {
    try {
      // ✅ PROTECTION: Vérifier que sessionData existe et a les propriétés minimales
      if (!sessionData || typeof sessionData !== 'object') {
        console.error('❌ [SESSION_SERVICE] sessionData invalide:', sessionData);
        throw new Error('Données de session invalides');
      }

      if (!sessionData.posteId || !sessionData.dureeMinutes) {
        console.error('❌ [SESSION_SERVICE] Propriétés manquantes:', {
          posteId: sessionData.posteId,
          dureeMinutes: sessionData.dureeMinutes
        });
        throw new Error('Poste et durée requis pour démarrer une session');
      }

      console.log('📤 [SESSION_SERVICE] Envoi données session:', {
        posteId: sessionData?.posteId,
        dureeMinutes: sessionData?.dureeMinutes,
        clientId: sessionData?.clientId,
        abonnementId: sessionData?.abonnementId,
        dataType: typeof sessionData?.dureeMinutes,
        sessionDataKeys: Object.keys(sessionData || {}),
        sessionDataComplete: sessionData
      });

      const formattedData = {
        ...sessionData,
        dureeMinutes: parseInt(sessionData.dureeMinutes) || 60
      };

      console.log('📤 [SESSION_SERVICE] Données formatées:', formattedData);

      const response = await api.post('/sessions/demarrer', formattedData);
      
      console.log('📡 [SESSION_SERVICE] Réponse serveur:', response);
      
      // ✅ CORRECTION: Normaliser la session créée dans la réponse
      console.log('🔍 [SESSION_SERVICE] Structure complète réponse:', JSON.stringify(response, null, 2));
      console.log('🔍 [SESSION_SERVICE] response.data:', response.data);
      console.log('🔍 [SESSION_SERVICE] response.data.data:', response.data?.data);
      
      if (response.data && response.data.data && typeof response.data.data === 'object') {
        console.log('🔧 [SESSION_SERVICE] Normalisation de la session créée:', response.data.data);
        try {
          const normalizedSession = this.normalizeSessionData(response.data.data);
          console.log('✅ [SESSION_SERVICE] Session normalisée:', normalizedSession);
          
          return {
            ...response,
            data: {
              ...response.data,
              data: normalizedSession
            }
          };
        } catch (normalizeError) {
          console.error('❌ [SESSION_SERVICE] Erreur lors de la normalisation:', normalizeError);
          console.log('📄 [SESSION_SERVICE] Données brutes envoyées à normalizeSessionData:', response.data.data);
          // Retourner la réponse originale en cas d'erreur de normalisation
          return response;
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur démarrage session:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors du démarrage de la session');
      }
      
      throw new Error('Erreur de connexion au serveur');
    }
  }

  /**
   * ✅ CONSERVÉ: Récupérer les sessions actives avec protection
   */
  async getActiveSessions() {
    return withRequestProtection('getActiveSessions', async () => {
      try {
        console.log('📡 [SESSION_SERVICE] Récupération sessions actives...');
        const response = await api.get('/sessions/active');
        console.log('✅ [SESSION_SERVICE] Sessions actives reçues:', response);
        return response;
      } catch (error) {
        console.error('❌ [SESSION_SERVICE] Erreur sessions actives:', error);
        throw error;
      }
    });
  }

  /**
   * ✅ NOUVEAU ALIAS: Pour compatibilité avec les hooks
   */
  async getSessionsActives() {
    return this.getActiveSessions();
  }

  /**
   * ✅ CONSERVÉ: Récupérer les sessions en pause avec protection
   */
  async getPausedSessions() {
    return withRequestProtection('getPausedSessions', async () => {
      try {
        console.log('📡 [SESSION_SERVICE] Récupération sessions en pause...');
        const response = await api.get('/sessions/paused');
        console.log('✅ [SESSION_SERVICE] Sessions en pause reçues:', response);
        return response;
      } catch (error) {
        console.error('❌ [SESSION_SERVICE] Erreur sessions en pause:', error);
        throw error;
      }
    });
  }

  /**
   * ✅ NOUVEAU ALIAS: Pour compatibilité avec les hooks
   */
  async getSessionsEnPause() {
    return this.getPausedSessions();
  }

  /**
   * ✅ CONSERVÉ: Mettre en pause une session avec protection
   */
  async pauseSession(sessionId, data = {}) {
    const key = `pauseSession_${sessionId}`;
    
    return withRequestProtection(key, async () => {
      try {
        console.log(`⏸️ [SESSION_SERVICE] Mise en pause session ${sessionId}`, data);
        
        const id = parseInt(sessionId);
        if (isNaN(id) || id <= 0) {
          throw new Error(`ID de session invalide: ${sessionId}`);
        }
        
        const payload = {
          raison: data.raison || data || 'Session mise en pause',
          notes: data.notes || ''
        };
        
        const response = await api.patch(`/sessions/${id}/pause`, payload);
        
        console.log(`✅ [SESSION_SERVICE] Session ${sessionId} mise en pause`);
        return response;
      } catch (error) {
        console.error(`❌ [SESSION_SERVICE] Erreur pause session ${sessionId}:`, error);
        throw error;
      }
    });
  }

  /**
   * ✅ CONSERVÉ: Reprendre une session avec protection
   */
  async resumeSession(sessionId) {
    const key = `resumeSession_${sessionId}`;
    
    return withRequestProtection(key, async () => {
      try {
        console.log(`▶️ [SESSION_SERVICE] Reprise session ${sessionId}`);
        
        const id = parseInt(sessionId);
        if (isNaN(id) || id <= 0) {
          throw new Error(`ID de session invalide: ${sessionId}`);
        }
        
        const response = await api.patch(`/sessions/${id}/reprendre`);
        
        console.log(`✅ [SESSION_SERVICE] Session ${sessionId} reprise`);
        return response;
      } catch (error) {
        console.error(`❌ [SESSION_SERVICE] Erreur reprise session ${sessionId}:`, error);
        throw error;
      }
    });
  }

  /**
   * ✅ CONSERVÉ: Terminer une session
   */
  async endSession(sessionId, sessionEndData = {}) {
    try {
      console.log('🏁 [SESSION_SERVICE] Fin session:', sessionId, sessionEndData);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const response = await api.patch(`/sessions/${id}/terminer`, sessionEndData);
      
      console.log('✅ [SESSION_SERVICE] Session terminée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur terminaison session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU ALIAS: Pour compatibilité avec les hooks
   */
  async terminerSession(sessionId, options = {}) {
    return this.endSession(sessionId, options);
  }

  /**
   * ✅ CONSERVÉ: Prolonger une session avec validation stricte
   */
  async extendSession(sessionId, dureeSupplementaireMinutes) {
    try {
      console.log('➕ [SESSION_SERVICE] Prolonger session:', sessionId, 'minutes:', dureeSupplementaireMinutes);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const duree = parseInt(dureeSupplementaireMinutes);
      if (isNaN(duree) || duree <= 0) {
        throw new Error(`Durée supplémentaire invalide: ${dureeSupplementaireMinutes}`);
      }

      if (duree > 240) {
        throw new Error(`Durée supplémentaire trop élevée: ${duree} minutes (maximum: 240)`);
      }

      const payload = {
        dureeSupplementaireMinutes: duree
      };

      const response = await api.patch(`/sessions/${id}/prolonger`, payload);
      
      console.log('✅ [SESSION_SERVICE] Session prolongée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur prolongation session:', error);
      throw error;
    }
  }

  /**
   * ✅ CONSERVÉ: Annuler une session
   */
  async cancelSession(sessionId, raison) {
    try {
      console.log('❌ [SESSION_SERVICE] Annuler session:', sessionId, 'raison:', raison);
      
      if (!raison || !raison.trim()) {
        throw new Error('Raison d\'annulation requise');
      }

      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const response = await api.patch(`/sessions/${id}/annuler`, { raison: raison.trim() });
      
      console.log('✅ [SESSION_SERVICE] Session annulée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur annulation session:', error);
      throw error;
    }
  }

  /**
   * ✅ CONSERVÉ: Calculer le prix d'une session
   */
  async calculateSessionPrice(data) {
    try {
      console.log('💰 [SESSION_SERVICE] Calcul prix session:', data);
      
      const payload = {
        posteId: parseInt(data.posteId),
        dureeMinutes: parseInt(data.dureeMinutes),
        abonnementId: data.abonnementId ? parseInt(data.abonnementId) : null,
        planTarifaireId: data.planTarifaireId ? parseInt(data.planTarifaireId) : null
      };

      const response = await api.post('/sessions/calculer-cout', payload);
      
      console.log('✅ [SESSION_SERVICE] Coût calculé:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur calcul coût:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU ALIAS: Pour compatibilité
   */
  async calculerPrixSession(data) {
    return this.calculateSessionPrice(data);
  }

  /**
   * ✅ CONSERVÉ: Récupérer l'historique des sessions
   */
  async getSessionsHistory(filters = {}) {
    try {
      console.log('📋 [SESSION_SERVICE] Récupération historique sessions:', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (v !== null && v !== undefined && v !== '') {
                params.append(key, v);
              }
            });
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await api.get(`/sessions/historique?${params.toString()}`);
      
      console.log('✅ [SESSION_SERVICE] Historique récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération historique:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU ALIAS: Pour compatibilité avec les hooks
   */
  async getHistoriqueSessions(filters = {}) {
    return this.getSessionsHistory(filters);
  }

  /**
   * ✅ CONSERVÉ: Récupérer les statistiques d'un poste
   */
  async getPosteStatistics(posteId, options = {}) {
    try {
      console.log('📊 [SESSION_SERVICE] Récupération statistiques poste:', posteId, options);
      
      const params = new URLSearchParams();
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      
      const response = await api.get(`/sessions/poste/${parseInt(posteId)}/statistics?${params.toString()}`);
      
      console.log('✅ [SESSION_SERVICE] Stats poste récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération stats poste:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Traiter un paiement de session
   */
  async processSessionPayment(sessionId, paymentData) {
    try {
      console.log('💳 [SESSION_SERVICE] Traitement paiement session:', sessionId, paymentData);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const payload = {
        modePaiement: paymentData.modePaiement,
        montantPaye: parseFloat(paymentData.montantPaye) || 0,
        notes: paymentData.notes || '',
        marquerCommePayee: Boolean(paymentData.marquerCommePayee)
      };

      const response = await api.post(`/sessions/${id}/paiement`, payload);
      
      console.log('✅ [SESSION_SERVICE] Paiement traité:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur traitement paiement:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Payer une session (alias)
   */
  async payerSession(sessionId, paiementData) {
    return this.processSessionPayment(sessionId, paiementData);
  }

  /**
   * ✅ NOUVEAU: Corriger une session
   */
  async correctionSession(sessionId, correctionData) {
    try {
      console.log('🔧 [SESSION_SERVICE] Correction session:', sessionId, correctionData);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const response = await api.patch(`/sessions/${id}/correction`, correctionData);
      
      console.log('✅ [SESSION_SERVICE] Session corrigée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur correction session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer une session par ID
   */
  async getSessionById(sessionId) {
    try {
      console.log('🔍 [SESSION_SERVICE] Récupération session par ID:', sessionId);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      const response = await api.get(`/sessions/${id}`);
      
      console.log('✅ [SESSION_SERVICE] Session récupérée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les statistiques de sessions
   */
  async getSessionStatistics(filters = {}) {
    try {
      console.log('📊 [SESSION_SERVICE] Récupération statistiques sessions:', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/sessions/statistics?${params.toString()}`);
      
      console.log('✅ [SESSION_SERVICE] Statistiques récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération statistiques:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les plans tarifaires
   */
  async getPlansTarifaires() {
    try {
      console.log('💰 [SESSION_SERVICE] Récupération plans tarifaires');
      
      const response = await api.get('/plans-tarifaires');
      
      console.log('✅ [SESSION_SERVICE] Plans tarifaires récupérés:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération plans tarifaires:', error);
      throw error;
    }
  }

  /**
   * ✅ CONSERVÉ: Normaliser les données de session
   */
  normalizeSessionData(session) {
    if (!session || typeof session !== 'object') {
      return session;
    }

    return {
      id: session.id,
      numeroSession: session.numeroSession || `SESS-${session.id}`,
      statut: session.statut || 'INCONNU',
      dateHeureDebut: session.dateHeureDebut || session.dateDebut,
      dateHeureFin: session.dateHeureFin || session.dateFin,
      dureeEstimeeMinutes: session.dureeEstimeeMinutes || 0,
      dureeReelleMinutes: session.dureeReelleMinutes || session.dureeEffectiveMinutes || 0,
      tempsPauseTotalMinutes: session.tempsPauseTotalMinutes || 0,
      
      // ✅ AJOUT: posteId extrait des relations
      posteId: session.posteId || session.poste?.id || session.Poste?.id,
      
      // Informations de tarification
      montantTotal: parseFloat(session.montantTotal || session.coutCalculeFinal || 0),
      montantPaye: parseFloat(session.montantPaye || 0),
      resteAPayer: parseFloat(session.resteAPayer || 0),
      estPayee: session.estPayee === true || session.estPayee === 'true',
      modePaiement: session.modePaiement || null,
      typeCalcul: session.typeCalcul || 'TARIF_LIBRE',
      planTarifaireUtilise: session.planTarifaireUtilise || null,
      
      // Informations relationnelles
      poste: session.poste ? {
        id: session.poste.id,
        nom: session.poste.nom,
        typePoste: session.poste.typePoste ? {
          nom: session.poste.typePoste.nom,
          tarifHoraireBase: session.poste.typePoste.tarifHoraireBase
        } : null
      } : null,
      
      client: session.client ? {
        id: session.client.id,
        nom: session.client.nom,
        prenom: session.client.prenom,
        isSystemClient: session.client.isSystemClient
      } : null,
      
      // Métadonnées
      jeuPrincipal: session.jeuPrincipal || '',
      notes: session.notes || '',
      createdAt: session.createdAt || session.dateCreation,
      updatedAt: session.updatedAt || session.dateMiseAJour,
      
      // Utilisateurs
      utilisateurDemarrage: session.utilisateurDemarrage,
      utilisateurCloture: session.utilisateurCloture
    };
  }
}

// ✅ EXPORT UNIFIÉ FINAL - Compatible avec tous les styles d'import
const sessionService = new SessionService();

export default sessionService;
export { sessionService };

// ✅ EXPORTS INDIVIDUELS pour compatibilité totale
export const {
  demarrerSession,
  getActiveSessions,
  getSessionsActives,
  getPausedSessions,
  getSessionsEnPause,
  pauseSession,
  resumeSession,
  endSession,
  terminerSession,
  extendSession,
  cancelSession,
  calculateSessionPrice,
  calculerPrixSession,
  getSessionsHistory,
  getHistoriqueSessions,
  getPosteStatistics,
  processSessionPayment,
  payerSession,
  correctionSession,
  getSessionById,
  getSessionStatistics,
  getPlansTarifaires,
  normalizeSessionData
} = sessionService;