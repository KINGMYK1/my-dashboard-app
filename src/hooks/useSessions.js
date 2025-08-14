import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  sessionService  from '../services/sessionService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
// import { useCalculerPrixSession } from '../hooks/useCalculerPrixSession'; // ✅ AJOUT
import api from '../api/apiService';
import { 
  getSessionPaymentStatus, 
  sessionNeedsPaymentOnEnd, 
  isSessionPaidAtStart 
} from '../utils/sessionPaymentUtils';

// Helper function to invalidate relevant session caches
const invalidateSessionCaches = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['sessions'] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'active'] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'paused'] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'history'] });
  queryClient.invalidateQueries({ queryKey: ['postes'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['statistics'] });
};

/**
 * ✅ CORRIGÉ: Hook pour récupérer les sessions actives (ancien nom maintenu)
 */
// useSessions.js
export function useSessionsActives() {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['sessions', 'actives'],
    queryFn: async () => {
      console.log('🔄 [HOOK] Récupération sessions actives...');
      
      const response = await sessionService.getSessionsActives();
      
      // ✅ ENRICHIR les sessions avec calculs de paiement côté frontend
      const sessionsEnrichies = (response.data || response || []).map(session => {
        const paiementStatus = getSessionPaymentStatus(session);
        
        return {
          ...session,
          // Ajouter les informations de paiement calculées
          paiementCalcule: paiementStatus,
          needsPaymentOnEnd: sessionNeedsPaymentOnEnd(session),
          isPaidAtStart: isSessionPaidAtStart(session)
        };
      });
      
      console.log('✅ [HOOK] Sessions actives enrichies:', sessionsEnrichies);
      return sessionsEnrichies;
    },
    staleTime: 10000,
    refetchInterval: 30000, // Actualiser toutes les 30s
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur sessions actives:', error);
      showError('Erreur lors de la récupération des sessions actives');
    }
  });
}



/**
 * ✅ CORRIGÉ: Hook pour récupérer les sessions en pause (ancien nom maintenu)
 */
export function useSessionsEnPause() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['sessions', 'paused'],
    queryFn: async () => {
      try {
        console.log('🎣 [HOOK] useSessionsEnPause appelé');
        const response = await sessionService.getSessionsEnPause();
        console.log('✅ [HOOK] Sessions en pause récupérées:', response);
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('❌ [HOOK] Erreur sessions en pause:', error);
        throw error;
      }
    },
    staleTime: 15 * 1000, // 15 secondes
    refetchInterval: 45 * 1000, // 45 secondes
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingPausedSessions || 'Erreur lors du chargement des sessions en pause');
    }
  });
}

/**
 * ✅ CORRIGÉ: Hook pour récupérer l'historique des sessions
 */
export function useHistoriqueSessions(filters = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['sessions', 'historique', filters],
    queryFn: async () => {
      try {
        console.log('🎣 [HOOK] useHistoriqueSessions appelé avec filtres:', filters);
        const response = await sessionService.getHistoriqueSessions(filters);
        console.log('✅ [HOOK] Historique sessions récupéré:', response);
        
        // ✅ Normaliser les données
        const sessions = response.data?.data || response.data || [];
        const normalizedSessions = Array.isArray(sessions) 
          ? sessions.map(session => sessionService.normalizeSessionData(session))
          : [];

        return {
          sessions: normalizedSessions,
          pagination: response.data?.pagination || { 
            page: 1, 
            limit: 50, 
            total: normalizedSessions.length 
          }
        };
      } catch (error) {
        console.error('❌ [HOOK] Erreur historique sessions:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 secondes
    keepPreviousData: true,
    retry: 2,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur historique:', error);
      showError(error.message || translations?.errorLoadingHistory || 'Erreur lors du chargement de l\'historique');
    }
  });
}

// ✅ ALIAS pour compatibilité descendante
export { useSessionsActives as useActiveSessions };
export { useSessionsEnPause as usePausedSessions };
export { useHistoriqueSessions as useSessionsHistory };

/**
 * ✅ NOUVEAU: Hook pour récupérer les statistiques de sessions
 */
export function useSessionStatistics(filters = {}) {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['sessions', 'statistics', filters],
    queryFn: async () => {
      try {
        console.log('🎣 [HOOK] useSessionStatistics appelé avec filtres:', filters);
        const response = await sessionService.getSessionStatistics(filters);
        console.log('✅ [HOOK] Statistiques sessions récupérées:', response);
        return response;
      } catch (error) {
        console.error('❌ [HOOK] Erreur statistiques sessions:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    onError: (error) => {
      showError(error.message || 'Erreur lors du chargement des statistiques');
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour récupérer les plans tarifaires
 */
export function usePlansTarifaires() {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['plans-tarifaires'],
    queryFn: async () => {
      try {
        console.log('🎣 [HOOK] usePlansTarifaires appelé');
        const response = await sessionService.getPlansTarifaires();
        console.log('✅ [HOOK] Plans tarifaires récupérés:', response);
        return response;
      } catch (error) {
        console.error('❌ [HOOK] Erreur plans tarifaires:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      showError(error.message || 'Erreur lors du chargement des plans tarifaires');
    }
  });
}

/**
 * ✅ MAINTENU: Hook pour démarrer une session
 */
export function useDemarrerSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (sessionData) => {
      console.log('🚀 [HOOK] Démarrage session:', sessionData);
      return await sessionService.demarrerSession(sessionData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [HOOK] Session démarrée avec succès:', data);
      invalidateSessionCaches(queryClient);
      showSuccess(
        data.message || translations?.sessionStartedSuccess || 'Session démarrée avec succès'
      );
    },
    onError: (error, variables) => {
      console.error('❌ [HOOK] Erreur démarrage session:', error);
      showError(
        error.message || translations?.errorStartingSession || 'Erreur lors du démarrage de la session'
      );
    }
  });
}

/**
 * ✅ MAINTENU: Hook pour mettre en pause une session
 */
export function usePauseSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, raison }) => {
      return await sessionService.pauseSession(sessionId, raison);
    },
    onSuccess: (data) => {
      invalidateSessionCaches(queryClient);
      showSuccess(translations?.sessionPausedSuccess || 'Session mise en pause');
    },
    onError: (error) => {
      showError(error.message || translations?.errorPausingSession || 'Erreur lors de la pause');
    }
  });
}

/**
 * ✅ MAINTENU: Hook pour reprendre une session
 */
export function useResumeSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (sessionId) => {
      return await sessionService.resumeSession(sessionId);
    },
    onSuccess: (data) => {
      invalidateSessionCaches(queryClient);
      showSuccess(translations?.sessionResumedSuccess || 'Session reprise');
    },
    onError: (error) => {
      showError(error.message || translations?.errorResumingSession || 'Erreur lors de la reprise');
    }
  });
}

/**
 * ✅ MAINTENU: Hook pour prolonger une session
 */

// ✅ CORRECTION: Mutation pour prolonger une session
export const useProlongerSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, dureeSupplementaireMinutes }) => {
      console.log('🔧 [USE_SESSIONS] Mutation prolonger - Paramètres reçus:', {
        sessionId: sessionId,
        dureeSupplementaireMinutes: dureeSupplementaireMinutes,
        sessionIdType: typeof sessionId,
        dureeType: typeof dureeSupplementaireMinutes
      });
      
      // ✅ VALIDATION DANS LA MUTATION
      if (!sessionId || isNaN(parseInt(sessionId))) {
        throw new Error(`ID de session invalide: ${sessionId}`);
      }
      
      if (!dureeSupplementaireMinutes || isNaN(parseInt(dureeSupplementaireMinutes))) {
        throw new Error(`Durée supplémentaire invalide dans mutation: ${dureeSupplementaireMinutes} (type: ${typeof dureeSupplementaireMinutes})`);
      }
      
      const sessionIdValidated = parseInt(sessionId);
      const dureeValidated = parseInt(dureeSupplementaireMinutes);
      
      console.log('📤 [USE_SESSIONS] Appel sessionService.extendSession avec:', {
        sessionId: sessionIdValidated,
        dureeSupplementaireMinutes: dureeValidated
      });
      
      const result = await sessionService.extendSession(sessionIdValidated, dureeValidated);
      
      console.log('✅ [USE_SESSIONS] Mutation prolonger réussie:', result);
      return result;
    },
    onSuccess: () => {
      // Invalider les queries pour refresh les données
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['postes'] });
    },
    onError: (error) => {
      console.error('❌ [USE_SESSIONS] Erreur mutation prolonger:', error);
    }
  });
};
/**
 * ✅ MAINTENU: Hook pour terminer une session
 */
export function useTerminerSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useNotification();
  const { translations } = useLanguage();
  
  return useMutation({
    mutationFn: async ({ sessionId, data }) => {
      console.log('🏁 [HOOK] Terminaison session - Données reçues:', { sessionId, data });
      
      // ✅ CORRECTION: Validation des données avant envoi
      const validatedData = {
        modePaiement: data.modePaiement || 'ESPECES',
        montantPaye: parseFloat(data.montantPaye) || 0,
        marquerCommePayee: Boolean(data.marquerCommePayee),
        notes: data.notes || ''
      };
      
      console.log('🏁 [HOOK] Données validées pour sessionService:', validatedData);
      
      return await sessionService.terminerSession(sessionId, validatedData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [HOOK] Session terminée avec succès:', data);
      invalidateSessionCaches(queryClient);
      
      if (data.transaction) {
        showInfo(
          `Session terminée. Transaction créée: ${data.transaction.numeroTransaction}`,
          {
            title: 'Session terminée',
            duration: 5000
          }
        );
      } else {
        showSuccess(
          data.message || translations?.sessionEndedSuccess || 'Session terminée avec succès'
        );
      }
    },
    onError: (error, variables) => {
      console.error('❌ [HOOK] Erreur terminaison session:', error);
      showError(
        error.message || translations?.errorEndingSession || 'Erreur lors de la terminaison'
      );
    }
  });
}
/**
 * ✅ NOUVEAU: Hook pour calculer le prix d'une session en temps réel
 */
/**
 * ✅ Hook pour calculer le prix d'une session en temps réel
 *//**
 * ✅ Hook pour calculer le prix d'une session - CORRIGÉ
 */
export function useCalculerPrixSession() {
  const { showError } = useNotification();

  return useMutation({
    mutationFn: async ({ posteId, dureeMinutes, abonnementId = null }) => {
      console.log('💰 [HOOK] Calcul prix session:', { 
        posteId, 
        dureeMinutes, 
        abonnementId,
        posteIdType: typeof posteId,
        dureeMinutesType: typeof dureeMinutes
      });
      
      // ✅ Validation côté client
      const posteIdNum = parseInt(posteId);
      const dureeMinutesNum = parseInt(dureeMinutes);
      
      if (!posteIdNum || isNaN(posteIdNum) || posteIdNum <= 0) {
        throw new Error('ID de poste invalide');
      }
      
      if (!dureeMinutesNum || isNaN(dureeMinutesNum) || dureeMinutesNum <= 0) {
        throw new Error('Durée invalide');
      }

      // ✅ CORRECTION: Ne pas envoyer abonnementId si null
      const payload = {
        posteId: posteIdNum,
        dureeMinutes: dureeMinutesNum
      };

      // ✅ Ajouter abonnementId seulement s'il est valide
      if (abonnementId && !isNaN(parseInt(abonnementId))) {
        payload.abonnementId = parseInt(abonnementId);
      }

      console.log('💰 [HOOK] Payload envoyé:', payload);
      
      try {
        const response = await api.post('/sessions/calculer-prix', payload);
        console.log('💰 [HOOK] Réponse reçue:', response);
        return response.data;
      } catch (error) {
        console.error('❌ [HOOK] Erreur calcul prix:', error.response?.data || error);
        throw new Error(error.response?.data?.message || error.message || 'Erreur lors du calcul du prix');
      }
    },
    // ✅ CORRECTION: Éviter les retry automatiques
    retry: false,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur calcul prix:', error);
      showError(`Erreur lors du calcul du prix: ${error.message}`);
    }
  });
}
/**
 * ✅ MAINTENU: Hook pour annuler une session
 */
export function useAnnulerSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, raison }) => {
      return await sessionService.cancelSession(sessionId, raison);
    },
    onSuccess: (data) => {
      invalidateSessionCaches(queryClient);
      showSuccess(translations?.sessionCancelledSuccess || 'Session annulée');
    },
    onError: (error) => {
      showError(error.message || translations?.errorCancellingSession || 'Erreur lors de l\'annulation');
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour payer une session
 */
export function usePaySession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, paiementData }) => {
      console.log('💰 [HOOK] Paiement session:', sessionId, paiementData);
      return await sessionService.payerSession(sessionId, paiementData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [HOOK] Session payée avec succès:', data);
      invalidateSessionCaches(queryClient);
      showSuccess('Paiement enregistré avec succès');
    },
    onError: (error, variables) => {
      console.error('❌ [HOOK] Erreur paiement session:', error);
      showError(
        error.message || translations?.errorPayingSession || 'Erreur lors du paiement'
      );
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour calculer le prix d'une session
 */
export function useCalculateSessionPrice() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (data) => {
      console.log('💰 [HOOK] Calcul prix session:', data);
      return await sessionService.calculerPrixSession(data);
    },
    onError: (error) => {
      console.error('❌ [HOOK] Erreur calcul prix:', error);
      showError(
        error.message || translations?.errorCalculatingPrice || 'Erreur lors du calcul du prix'
      );
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour corriger une session
 */
export function useCorrectSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: async ({ sessionId, correctionData }) => {
      console.log('🔧 [HOOK] Correction session:', sessionId, correctionData);
      return await sessionService.correctionSession(sessionId, correctionData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [HOOK] Session corrigée avec succès:', data);
      invalidateSessionCaches(queryClient);
      showSuccess('Session corrigée avec succès');
    },
    onError: (error, variables) => {
      console.error('❌ [HOOK] Erreur correction session:', error);
      showError(
        error.message || 'Erreur lors de la correction de la session'
      );
    }
  });
}

/**
 * ✅ CORRIGÉ: Hook pour calculer le prix d'une session en temps réel
 */
/**
 * ✅ MAINTENU: Hook pour récupérer une session par ID
 */
export function useSession(sessionId) {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID requis');
      return await sessionService.getSessionById(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000,
    retry: 2,
    onError: (error) => {
      showError(error.message || 'Erreur lors du chargement de la session');
    }
  });
}

// ✅ MAINTENU: Exports nommés pour compatibilité
export { useSessionsActives as useSessions };

/**
 * ✅ HOOK POUR LES ACTIONS SUR LES SESSIONS
 */
export function useSessionActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // ✅ DÉMARRER UNE SESSION
  const startSession = useMutation({
    mutationFn: (sessionData) => sessionService.demarrerSession(sessionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      showSuccess('Session démarrée avec succès');
    },
    onError: (error) => {
      console.error('❌ [USE_SESSION_ACTIONS] Erreur démarrage:', error);
      showError(error.message || 'Erreur lors du démarrage de la session');
    }
  });

  // ✅ TERMINER UNE SESSION
  const endSession = useMutation({
    mutationFn: ({ sessionId, options }) => sessionService.terminerSession(sessionId, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Session terminée avec succès');
    },
    onError: (error) => {
      console.error('❌ [USE_SESSION_ACTIONS] Erreur terminaison:', error);
      showError(error.message || 'Erreur lors de la terminaison de la session');
    }
  });

  // ✅ TRAITER UN PAIEMENT DE SESSION
  const processSessionPayment = useMutation({
    mutationFn: ({ sessionId, paymentData }) => 
      sessionService.processSessionPayment(sessionId, paymentData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Paiement enregistré avec succès');
    },
    onError: (error) => {
      console.error('❌ [USE_SESSION_ACTIONS] Erreur paiement:', error);
      showError(error.message || 'Erreur lors du traitement du paiement');
    }
  });

  // ✅ PAUSE/REPRISE SESSION
  const pauseSession = useMutation({
    mutationFn: (sessionId) => sessionService.pauseSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      showSuccess('Session mise en pause');
    },
    onError: (error) => {
      console.error('❌ [USE_SESSION_ACTIONS] Erreur pause:', error);
      showError(error.message || 'Erreur lors de la mise en pause');
    }
  });

  const resumeSession = useMutation({
    mutationFn: (sessionId) => sessionService.resumeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      showSuccess('Session reprise');
    },
    onError: (error) => {
      console.error('❌ [USE_SESSION_ACTIONS] Erreur reprise:', error);
      showError(error.message || 'Erreur lors de la reprise');
    }
  });

  return {
    startSession: (sessionData) => startSession.mutateAsync(sessionData),
    endSession: (sessionId, options = {}) => endSession.mutateAsync({ sessionId, options }),
    processSessionPayment: (sessionId, paymentData) => 
      processSessionPayment.mutateAsync({ sessionId, paymentData }),
    pauseSession: (sessionId) => pauseSession.mutateAsync(sessionId),
    resumeSession: (sessionId) => resumeSession.mutateAsync(sessionId),
    
    // États de chargement
    isStarting: startSession.isLoading,
    isEnding: endSession.isLoading,
    isProcessingPayment: processSessionPayment.isLoading,
    isPausing: pauseSession.isLoading,
    isResuming: resumeSession.isLoading
  };
}

/**
 * ✅ NOUVEAU: Hook spécialisé pour démarrer des sessions avec abonnements
 */
export function useStartSessionWithSubscription() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (sessionData) => {
      // Validation des données
      if (!sessionData.posteId || !sessionData.clientId) {
        throw new Error('Poste et client requis pour une session avec abonnement');
      }

      console.log('🌟 [HOOK] Démarrage session avec abonnement:', sessionData);

      // Préparer le payload pour l'API
      const payload = {
        posteId: parseInt(sessionData.posteId),
        clientId: parseInt(sessionData.clientId),
        dureeEstimeeMinutes: parseInt(sessionData.dureeEstimeeMinutes || 60),
        typeSession: 'AVEC_ABONNEMENT',
        forceUtiliserAbonnement: true,
        planTarifaireUtilise: sessionData.planTarifaireUtilise || 'PLAN_TARIFAIRE'
      };

      // Ajouter l'abonnement spécifique si fourni
      if (sessionData.abonnementId) {
        payload.abonnementId = parseInt(sessionData.abonnementId);
      }

      // Ajouter les informations d'avantage si calculées côté frontend
      if (sessionData.avantageAbonnement) {
        payload.avantageAbonnement = sessionData.avantageAbonnement;
      }

      try {
        const response = await api.post('/sessions', payload);
        console.log('✅ [HOOK] Session avec abonnement créée:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [HOOK] Erreur session abonnement:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création de la session avec abonnement');
      }
    },
    onSuccess: () => {
      // Invalider les caches pour actualiser les données
      invalidateSessionCaches(queryClient);
      
      // Également invalider les données d'abonnements si un abonnement a été consommé
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      
      showSuccess(
        translations?.sessionWithSubscriptionStarted || 
        'Session avec abonnement démarrée avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [HOOK] Erreur démarrage session abonnement:', error);
      showError(
        error.message || 
        translations?.errorStartingSessionWithSubscription || 
        'Erreur lors du démarrage de la session avec abonnement'
      );
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour calculer l'avantage d'un abonnement
 */
export function useCalculateSubscriptionBenefit() {
  const { showError } = useNotification();

  return useMutation({
    mutationFn: async ({ abonnementId, dureeMinutes, posteId }) => {
      console.log('🧮 [HOOK] Calcul avantage abonnement:', { abonnementId, dureeMinutes, posteId });

      try {
        const response = await api.post('/abonnements/calculer-avantage', {
          abonnementId: parseInt(abonnementId),
          dureeMinutes: parseInt(dureeMinutes),
          posteId: parseInt(posteId)
        });

        console.log('✅ [HOOK] Avantage calculé:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ [HOOK] Erreur calcul avantage:', error.response?.data || error);
        throw new Error(error.response?.data?.message || 'Erreur lors du calcul de l\'avantage');
      }
    },
    retry: false,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur calcul avantage abonnement:', error);
      showError(`Erreur calcul avantage: ${error.message}`);
    }
  });
}
