import { api } from '../api/apiService';

class SessionService {
  constructor() {
    this.baseUrl = '/sessions';
  }

  /**
   * ✅ CORRECTION: Démarrer une session avec plans tarifaires
   */
  async demarrerSession(sessionData) {
    try {
      console.log('🚀 [SESSION_SERVICE] Démarrage session:', sessionData);
      
      // ✅ Validation côté client
      if (!sessionData.posteId) {
        throw new Error('ID du poste requis');
      }
      
      if (!sessionData.dureeMinutes || sessionData.dureeMinutes <= 0) {
        throw new Error('Durée en minutes requise et doit être positive');
      }

      // ✅ Structurer correctement les données
      const payload = {
        posteId: parseInt(sessionData.posteId),
        dureeMinutes: parseInt(sessionData.dureeMinutes),
        clientId: sessionData.clientId ? parseInt(sessionData.clientId) : null,
        abonnementId: sessionData.abonnementId ? parseInt(sessionData.abonnementId) : null,
        notes: sessionData.notes || '',
        jeuPrincipal: sessionData.jeuPrincipal || '',
        planTarifaireId: sessionData.planTarifaireId ? parseInt(sessionData.planTarifaireId) : null
      };

      console.log('📤 [SESSION_SERVICE] Payload envoyé:', payload);

      const response = await api.post(`${this.baseUrl}/demarrer`, payload);
      
      console.log('✅ [SESSION_SERVICE] Session démarrée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur démarrage session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Calculer le coût avec plan tarifaire
   */
  async calculerCoutSession(posteId, dureeMinutes, options = {}) {
    try {
      console.log('💰 [SESSION_SERVICE] Calcul coût session:', { posteId, dureeMinutes, options });
      
      const payload = {
        posteId: parseInt(posteId),
        dureeMinutes: parseInt(dureeMinutes),
        abonnementId: options.abonnementId ? parseInt(options.abonnementId) : null,
        planTarifaireId: options.planTarifaireId ? parseInt(options.planTarifaireId) : null
      };

      const response = await api.post(`${this.baseUrl}/calculer-cout`, payload);
      
      console.log('✅ [SESSION_SERVICE] Coût calculé:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur calcul coût:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Terminer une session avec gestion du paiement
   */
  async terminerSession(sessionId, optionsPaiement = {}) {
    try {
      console.log('🛑 [SESSION_SERVICE] Terminaison session:', sessionId, optionsPaiement);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }

      // ✅ Structurer les options de paiement
      const payload = {
        modePaiement: optionsPaiement.modePaiement || 'ESPECES',
        montantPaye: parseFloat(optionsPaiement.montantPaye) || 0,
        marquerCommePayee: Boolean(optionsPaiement.marquerCommePayee),
        notes: optionsPaiement.notes || ''
      };

      console.log('📤 [SESSION_SERVICE] Options paiement:', payload);

      const response = await api.patch(`${this.baseUrl}/${id}/terminer`, payload);
      
      console.log('✅ [SESSION_SERVICE] Session terminée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur terminaison session:', error);
      throw error;
    }
  }

  // ✅ CORRECTION: Actions simples avec validation d'ID
  async pauseSession(sessionId) {
    try {
      console.log('⏸️ [SESSION_SERVICE] Mise en pause session:', sessionId);
      
      // ✅ VALIDATION STRICTE DE L'ID
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }
      
      const response = await api.patch(`${this.baseUrl}/${id}/pause`);
      
      console.log('✅ [SESSION_SERVICE] Session mise en pause:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur pause session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Pause avec raison
   */
  async pauseSessionWithReason(sessionId, data) {
    try {
      console.log('⏸️ [SESSION_SERVICE] Mise en pause avec raison:', sessionId, data);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }
      
      const payload = {
        raison: data.raison || '',
        notes: data.notes || ''
      };
      
      const response = await api.patch(`${this.baseUrl}/${id}/pause`, payload);
      
      console.log('✅ [SESSION_SERVICE] Session mise en pause avec raison:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur pause avec raison:', error);
      throw error;
    }
  }

  async resumeSession(sessionId) {
    try {
      console.log('▶️ [SESSION_SERVICE] Reprise session:', sessionId);
      
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }
      
      const response = await api.patch(`${this.baseUrl}/${id}/reprendre`);
      
      console.log('✅ [SESSION_SERVICE] Session reprise:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur reprise session:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Annuler une session
   */
  async cancelSession(sessionId, raison) {
    try {
      console.log('❌ [SESSION_SERVICE] Annulation session:', sessionId, raison);
      
      if (!raison || !raison.trim()) {
        throw new Error('Raison d\'annulation requise');
      }

      const response = await api.patch(`${this.baseUrl}/${parseInt(sessionId)}/annuler`, {
        raison: raison.trim()
      });
      
      console.log('✅ [SESSION_SERVICE] Session annulée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur annulation session:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Prolonger une session avec logs détaillés
   */
  async extendSession(sessionId, dureeSupplementaireMinutes) {
    try {
      console.log('➕ [SESSION_SERVICE] DÉBUT extendSession:', {
        sessionId: sessionId,
        dureeSupplementaireMinutes: dureeSupplementaireMinutes,
        sessionIdType: typeof sessionId,
        dureeType: typeof dureeSupplementaireMinutes,
        parametres: arguments
      });
      
      // ✅ VALIDATION STRICTE DE L'ID
      const id = parseInt(sessionId);
      if (isNaN(id) || id <= 0) {
        throw new Error(`ID de session invalide: ${sessionId} (type: ${typeof sessionId})`);
      }

      // ✅ VALIDATION STRICTE DE LA DURÉE AVEC LOGS DÉTAILLÉS
      console.log('🔍 [SESSION_SERVICE] Validation durée:', {
        valueReceived: dureeSupplementaireMinutes,
        typeReceived: typeof dureeSupplementaireMinutes,
        isUndefined: dureeSupplementaireMinutes === undefined,
        isNull: dureeSupplementaireMinutes === null,
        isNaN: isNaN(dureeSupplementaireMinutes),
        parseInt: parseInt(dureeSupplementaireMinutes)
      });

      const duree = parseInt(dureeSupplementaireMinutes);
      if (isNaN(duree) || duree <= 0) {
        throw new Error(`Durée supplémentaire invalide: ${dureeSupplementaireMinutes} (reçu: ${typeof dureeSupplementaireMinutes}, parsé: ${duree})`);
      }

      if (duree > 240) {
        throw new Error(`Durée supplémentaire trop élevée: ${duree} minutes (maximum: 240)`);
      }

      const payload = {
        dureeSupplementaireMinutes: duree
      };

      console.log('📤 [SESSION_SERVICE] Payload prolongation FINAL:', payload);

      const response = await api.patch(`${this.baseUrl}/${id}/prolonger`, payload);
      
      console.log('✅ [SESSION_SERVICE] Session prolongée avec succès:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur prolongation session:', {
        error: error,
        message: error.message,
        stack: error.stack,
        parametres: { sessionId, dureeSupplementaireMinutes }
      });
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer les sessions actives
   */
  async getSessionsActives() {
    try {
      console.log('📋 [SESSION_SERVICE] Récupération sessions actives');
      
      const response = await api.get(`${this.baseUrl}/active`);
      
      console.log('✅ [SESSION_SERVICE] Sessions actives récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération sessions actives:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les sessions en pause
   */
  async getSessionsEnPause() {
    try {
      console.log('📋 [SESSION_SERVICE] Récupération sessions en pause');
      
      const response = await api.get(`${this.baseUrl}/paused`);
      
      console.log('✅ [SESSION_SERVICE] Sessions en pause récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération sessions en pause:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer une session par ID
   */
  async getSessionById(sessionId) {
    try {
      console.log('🔍 [SESSION_SERVICE] Récupération session par ID:', sessionId);
      
      const response = await api.get(`${this.baseUrl}/${parseInt(sessionId)}`);
      
      console.log('✅ [SESSION_SERVICE] Session récupérée:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération session:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les détails complets d'une session
   */
  async getSessionDetails(sessionId) {
    try {
      console.log('🔍 [SESSION_SERVICE] Récupération détails session:', sessionId);
      
      const response = await api.get(`${this.baseUrl}/${parseInt(sessionId)}/details`);
      
      console.log('✅ [SESSION_SERVICE] Détails session récupérés:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération détails:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer l'historique avec filtres améliorés
   */
  async getHistoriqueSessions(filtres = {}) {
    try {
      console.log('📋 [SESSION_SERVICE] Récupération historique avec filtres:', filtres);
      
      // ✅ Construction des paramètres avec gestion des arrays
      const params = new URLSearchParams();
      
      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
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

      const response = await api.get(`${this.baseUrl}/historique?${params.toString()}`);
      
      console.log('✅ [SESSION_SERVICE] Historique récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération historique:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les statistiques d'un poste
   */
  async getStatistiquesPoste(posteId, options = {}) {
    try {
      console.log('📊 [SESSION_SERVICE] Récupération stats poste:', posteId, options);
      
      const params = new URLSearchParams();
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      
      const response = await api.get(`${this.baseUrl}/poste/${parseInt(posteId)}/statistics?${params.toString()}`);
      
      console.log('✅ [SESSION_SERVICE] Stats poste récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [SESSION_SERVICE] Erreur récupération stats poste:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Normaliser les données de session pour l'affichage
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
      
      // ✅ NOUVEAU: Informations de tarification
      montantTotal: parseFloat(session.montantTotal || session.coutCalculeFinal || 0),
      montantPaye: parseFloat(session.montantPaye || 0),
      resteAPayer: parseFloat(session.resteAPayer || 0),
      estPayee: Boolean(session.estPayee),
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

export const sessionService = new SessionService();
export default sessionService;