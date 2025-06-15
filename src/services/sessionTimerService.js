class SessionTimerService {
  constructor() {
    this.activeTimers = new Map();
    this.notificationCallbacks = new Map();
    this.userPreferences = this.loadUserPreferences();
    this.expiredSessions = new Map(); // ✅ NOUVEAU: Tracker les sessions expirées
  }

  // ✅ NOUVEAU: Méthode pour vérifier et terminer les sessions expirées en pause
  async checkAndTerminateExpiredPausedSessions() {
    console.log('🔍 [TIMER] Vérification sessions expirées en pause...');
    
    for (const [sessionId, sessionData] of this.expiredSessions) {
      try {
        // Vérifier si la session est toujours en pause après l'expiration
        const sessionStatus = await this.getSessionStatusFromAPI(sessionId);
        
        if (sessionStatus && sessionStatus.estEnPause && sessionStatus.etatSession === 'EN_PAUSE') {
          const timeExpired = Date.now() - sessionData.expiredAt;
          const graceTimeMs = this.userPreferences.graceMinutes * 60 * 1000;
          
          if (timeExpired > graceTimeMs) {
            console.log(`⏰ [TIMER] Auto-terminaison session ${sessionId} (en pause depuis ${Math.floor(timeExpired/60000)}min)`);
            
            // Terminer automatiquement la session
            await this.autoTerminateExpiredSession(sessionId, sessionData);
            
            // Nettoyer le tracker
            this.expiredSessions.delete(sessionId);
          }
        } else {
          // La session n'est plus en pause, nettoyer le tracker
          this.expiredSessions.delete(sessionId);
        }
      } catch (error) {
        console.error(`❌ [TIMER] Erreur vérification session ${sessionId}:`, error);
      }
    }
  }

  // ✅ NOUVEAU: Auto-terminer une session expirée
  async autoTerminateExpiredSession(sessionId, sessionData) {
    const callbacks = this.notificationCallbacks.get(sessionId);
    
    if (callbacks?.onAutoTerminate) {
      try {
        await callbacks.onAutoTerminate(sessionData.session, {
          reason: 'AUTO_TERMINATE_EXPIRED',
          message: 'Session terminée automatiquement - temps écoulé',
          modePaiement: this.userPreferences.defaultPaymentMethod || 'ESPECES',
          marquerCommePayee: this.userPreferences.autoMarkAsPaid || false,
          montantPaye: sessionData.session.coutCalculeProvisoire || 0,
          notes: `Session terminée automatiquement après ${this.userPreferences.graceMinutes} minutes de grâce`
        });
        
        console.log(`✅ [TIMER] Session ${sessionId} terminée automatiquement`);
      } catch (error) {
        console.error(`❌ [TIMER] Erreur auto-terminaison session ${sessionId}:`, error);
        
        // En cas d'erreur, notifier l'utilisateur
        if (callbacks?.onAutoTerminateError) {
          callbacks.onAutoTerminateError(sessionData.session, error);
        }
      }
    }
  }

  // ✅ CORRECTION: Gestion améliorée de l'expiration avec tracking
  async handleSessionExpired(session, callbacks) {
    const sessionId = session.id;
    console.log(`⏰ [TIMER] Session ${sessionId} expirée`);
    
    // Nettoyer le timer
    this.clearSessionTimer(sessionId);
    
    // Marquer comme expirée
    this.expiredSessions.set(sessionId, {
      session,
      expiredAt: Date.now(),
      callbacks
    });
    
    if (this.userPreferences.autoSuspendOnExpire) {
      console.log(`⏸️ [TIMER] Auto-suspension session ${sessionId}`);
      
      if (callbacks?.onAutoSuspend) {
        await callbacks.onAutoSuspend(session, 'Session expirée - mise en pause automatique');
        
        // Démarrer le timer de grâce pour l'auto-terminaison
        this.startGraceTimer(sessionId);
      }
    } else if (callbacks?.onExpired) {
      callbacks.onExpired({
        sessionId,
        session,
        message: 'Session expirée'
      });
    }

    if (this.userPreferences.notificationSound) {
      this.playNotificationSound('expired');
    }
  }

  // ✅ NOUVEAU: Timer de grâce pour l'auto-terminaison
  startGraceTimer(sessionId) {
    const graceTimeMs = this.userPreferences.graceMinutes * 60 * 1000;
    
    console.log(`⏳ [TIMER] Démarrage timer de grâce pour session ${sessionId} (${this.userPreferences.graceMinutes}min)`);
    
    setTimeout(async () => {
      if (this.expiredSessions.has(sessionId)) {
        await this.checkAndTerminateExpiredPausedSessions();
      }
    }, graceTimeMs);
  }

  // ✅ NOUVEAU: Méthode pour obtenir le statut d'une session depuis l'API
  async getSessionStatusFromAPI(sessionId) {
    try {
      // Cette méthode doit être injectée ou configurée selon votre architecture
      if (this.apiClient) {
        const response = await this.apiClient.get(`/sessions/${sessionId}/status`);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`❌ [TIMER] Erreur récupération statut session ${sessionId}:`, error);
      return null;
    }
  }

  // ✅ AMÉLIORATION: Préférences utilisateur étendues
  loadUserPreferences() {
    try {
      const saved = localStorage.getItem('sessionNotificationPreferences');
      const defaults = {
        warningMinutes: 1,
        graceMinutes: 5, // ✅ NOUVEAU: Temps de grâce avant auto-terminaison
        autoSuspendOnExpire: true,
        autoTerminateAfterGrace: true, // ✅ NOUVEAU: Auto-terminer après le temps de grâce
        allowExtension: true,
        notificationSound: true,
        autoTerminate: false,
        showNotifications: true,
        defaultPaymentMethod: 'ESPECES', // ✅ NOUVEAU: Mode de paiement par défaut
        autoMarkAsPaid: false // ✅ NOUVEAU: Marquer automatiquement comme payé
      };
      
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
      
      return defaults;
    } catch (error) {
      console.error('❌ [TIMER] Erreur chargement préférences:', error);
      return {
        warningMinutes: 1,
        graceMinutes: 5,
        autoSuspendOnExpire: true,
        autoTerminateAfterGrace: true,
        allowExtension: true,
        notificationSound: true,
        autoTerminate: false,
        showNotifications: true,
        defaultPaymentMethod: 'ESPECES',
        autoMarkAsPaid: false
      };
    }
  }

  // ✅ NOUVEAU: Configurer l'API client pour les vérifications de statut
  setApiClient(apiClient) {
    this.apiClient = apiClient;
  }

  // ✅ NOUVEAU: Nettoyer une session expirée (si reprise manuellement)
  clearExpiredSession(sessionId) {
    this.expiredSessions.delete(sessionId);
  }

  // ✅ AMÉLIORATION: Nettoyage complet
  clearAllTimers() {
    for (const [sessionId] of this.activeTimers) {
      this.clearSessionTimer(sessionId);
    }
    this.expiredSessions.clear();
  }

  // ✅ NOUVEAU: Obtenir les sessions expirées en attente
  getExpiredSessions() {
    return Array.from(this.expiredSessions.keys());
  }

  // ✅ NOUVEAU: Vérifier si une session est en attente d'auto-terminaison
  isSessionPendingAutoTermination(sessionId) {
    return this.expiredSessions.has(sessionId);
  }
}

const sessionTimerService = new SessionTimerService();
export default sessionTimerService;