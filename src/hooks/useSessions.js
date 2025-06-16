import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sessionService from '../services/sessionService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

// Helper function to invalidate relevant session and poste caches
const invalidateSessionCaches = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['sessions'] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'active'] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'paused'] });
  queryClient.invalidateQueries({ queryKey: ['postes'] });
};

/**
 * ✅ CORRECTION: Hook pour récupérer les sessions actives
 */
export function useActiveSessions() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      try {
        console.log('🔄 [USE_ACTIVE_SESSIONS] Récupération sessions actives');
        const response = await sessionService.getActiveSessions();
        
        let sessions = [];
        if (response?.data?.sessions && Array.isArray(response.data.sessions)) {
          sessions = response.data.sessions;
        } else if (response?.data && Array.isArray(response.data)) {
          sessions = response.data;
        } else if (Array.isArray(response)) {
          sessions = response;
        }
        
        console.log('✅ [USE_ACTIVE_SESSIONS] Sessions extraites:', sessions.length);
        return sessions;
      } catch (error) {
        console.error('❌ [USE_ACTIVE_SESSIONS] Erreur:', error);
        if (error.errorCode !== 'SESSION_EXPIRED') {
          showError(`Erreur lors du chargement des sessions: ${error.message}`);
        }
        throw error;
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
}

/**
 * ✅ AJOUT: Hook pour récupérer les sessions en pause
 */
export function usePausedSessions() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['sessions', 'paused'],
    queryFn: async () => {
      try {
        console.log('🔄 [USE_PAUSED_SESSIONS] Récupération sessions en pause');
        const response = await sessionService.getPausedSessions();
        
        let sessions = [];
        if (response?.data?.sessions && Array.isArray(response.data.sessions)) {
          sessions = response.data.sessions;
        } else if (response?.data && Array.isArray(response.data)) {
          sessions = response.data;
        } else if (Array.isArray(response)) {
          sessions = response;
        }
        
        console.log('✅ [USE_PAUSED_SESSIONS] Sessions en pause extraites:', sessions.length);
        return sessions;
      } catch (error) {
        console.error('❌ [USE_PAUSED_SESSIONS] Erreur:', error);
        if (error.errorCode !== 'SESSION_EXPIRED') {
          showError(`Erreur lors du chargement des sessions en pause: ${error.message}`);
        }
        throw error;
      }
    },
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
}

/**
 * ✅ CORRECTION: Hook pour terminer une session
 */
export function useEndSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, sessionEndData }) => {
      console.log('🏁 [USE_END_SESSION] Terminaison session:', sessionId, sessionEndData);
      return await sessionService.endSession(sessionId, sessionEndData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [USE_END_SESSION] Session terminée avec succès:', data);
      showSuccess(data?.message || translations?.sessionEndedSuccess || 'Session terminée avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error, variables) => {
      console.error('❌ [USE_END_SESSION] Erreur terminaison session:', error);
      showError(error?.message || translations?.errorEndingSession || 'Erreur lors de la terminaison de la session');
    },
  });
}

/**
 * ✅ CORRECTION: Hook pour mettre en pause une session
 */
export function usePauseSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, raison }) => {
      console.log('⏸️ [USE_PAUSE_SESSION] Pause session:', sessionId, raison);
      return await sessionService.pauseSession(sessionId, raison);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [USE_PAUSE_SESSION] Session mise en pause:', data);
      showSuccess(data?.message || translations?.sessionPausedSuccess || 'Session mise en pause avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error, variables) => {
      console.error('❌ [USE_PAUSE_SESSION] Erreur pause session:', error);
      showError(error?.message || translations?.errorPausingSession || 'Erreur lors de la mise en pause de la session');
    },
  });
}

/**
 * ✅ CORRECTION: Hook pour reprendre une session
 */
export function useResumeSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId }) => {
      console.log('🎯 [USE_RESUME_SESSION] Reprise session:', sessionId);
      
      if (!sessionId || isNaN(sessionId)) {
        throw new Error('ID de session invalide');
      }

      return await sessionService.resumeSession(sessionId);
    },
    onSuccess: (data) => {
      console.log('✅ [USE_RESUME_SESSION] Session reprise avec succès:', data);
      showSuccess(data?.message || translations?.sessionResumedSuccess || 'Session reprise avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error) => {
      console.error('❌ [USE_RESUME_SESSION] Erreur reprise session:', error);
      showError(error?.message || translations?.errorResumingSession || 'Erreur lors de la reprise de session');
    }
  });
}

/**
 * ✅ CORRECTION: Hook pour prolonger une session
 */
export function useExtendSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, additionalMinutes }) => {
      console.log('⏱️ [USE_EXTEND_SESSION] Prolongation session:', sessionId, additionalMinutes);
      return await sessionService.extendSession(sessionId, additionalMinutes);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [USE_EXTEND_SESSION] Session prolongée:', data);
      showSuccess(data?.message || translations?.sessionExtendedSuccess || 'Session prolongée avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error, variables) => {
      console.error('❌ [USE_EXTEND_SESSION] Erreur prolongation session:', error);
      showError(error?.message || translations?.errorExtendingSession || 'Erreur lors de la prolongation de la session');
    },
  });
}

/**
 * ✅ CORRECTION: Hook pour annuler une session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ sessionId, raison }) => {
      console.log('❌ [USE_CANCEL_SESSION] Annulation session:', sessionId, raison);
      return await sessionService.cancelSession(sessionId, raison);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [USE_CANCEL_SESSION] Session annulée:', data);
      showSuccess(data?.message || translations?.sessionCancelledSuccess || 'Session annulée avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error, variables) => {
      console.error('❌ [USE_CANCEL_SESSION] Erreur annulation session:', error);
      showError(error?.message || translations?.errorCancellingSession || 'Erreur lors de l\'annulation de la session');
    },
  });
}

/**
 * ✅ Hook pour démarrer une session
 */
export function useStartSession() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (sessionData) => {
      console.log('🚀 [USE_START_SESSION] Démarrage session:', sessionData);
      return await sessionService.demarrerSession(sessionData);
    },
    onSuccess: (data, variables) => {
      console.log('✅ [USE_START_SESSION] Session démarrée:', data);
      showSuccess(data?.message || translations?.sessionStartedSuccess || 'Session démarrée avec succès');
      invalidateSessionCaches(queryClient);
    },
    onError: (error, variables) => {
      console.error('❌ [USE_START_SESSION] Erreur démarrage session:', error);
      showError(error?.message || translations?.errorStartingSession || 'Erreur lors du démarrage de la session');
    },
  });
}
/**
 * ✅ NOUVEAU: Hook pour l'historique des sessions
 */
export function useSessionsHistory(filters = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['sessions', 'history', filters],
    queryFn: async () => {
      try {
        const response = await sessionService.getSessionsHistory(filters);
        return response;
      } catch (error) {
        console.error('❌ [USE_SESSIONS] Erreur historique:', error);
        throw error;
      }
    },
    keepPreviousData: true,
    staleTime: 60000,
    onError: (error) => {
      showError(error.message || 'Erreur lors de la récupération de l\'historique');
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour les statistiques d'un poste
 */
export function usePosteStatistics(posteId, dateDebut, dateFin) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['poste', 'statistics', posteId, dateDebut, dateFin],
    queryFn: async () => {
      try {
        const response = await sessionService.getPosteStatistics(posteId, { dateDebut, dateFin });
        return response;
      } catch (error) {
        console.error('❌ [USE_SESSIONS] Erreur statistiques poste:', error);
        throw error;
      }
    },
    enabled: !!posteId,
    staleTime: 300000, // 5 minutes
    onError: (error) => {
      showError(error.message || 'Erreur lors de la récupération des statistiques');
    }
  });
}
/**
 * ✅ Hook pour calculer le prix d'une session
 */
export function useCalculateSessionPrice() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (data) => {
      console.log('💰 [USE_CALCULATE_PRICE] Calcul prix:', data);
      return await sessionService.calculateSessionPrice(data);
    },
    retry: false,
    onError: (error) => {
      console.error('❌ [USE_CALCULATE_PRICE] Erreur calcul prix:', error);
      showError(error?.message || translations?.errorCalculatingPrice || 'Erreur lors du calcul du prix');
    }
  });
}