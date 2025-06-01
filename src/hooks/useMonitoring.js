import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import monitoringService from '../services/monitoringService';
import { useMonitoring } from '../contexts/MonitoringContext';
import { useNotification } from '../contexts/NotificationContext';

// ✅ AMÉLIORATION: Hook pour récupérer les sessions actives
export function useActiveSessions() {
  const { filters } = useMonitoring();
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['activeSessions', filters.inactivityPeriod],
    queryFn: () => monitoringService.getActiveSessions({ inactivityPeriod: filters.inactivityPeriod }),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 10000, // Considérer comme périmé après 10 secondes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des sessions:', error);
      
      // Gestion spécifique des erreurs d'autorisation
      if (error.errorCode === 'INSUFFICIENT_PERMISSIONS') {
        showError('Vous n\'avez pas les droits pour consulter les sessions actives');
      } else if (error.errorCode === 'SESSION_EXPIRED') {
        console.log('Session expirée détectée dans useActiveSessions');
      } else {
        showError(`Erreur lors du chargement des sessions: ${error.message}`);
      }
    }
  });
}

// ✅ AMÉLIORATION: Hook pour récupérer les logs d'activité
export function useActivityLogs() {
  const { filters } = useMonitoring();
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['activityLogs', filters],
    queryFn: () => monitoringService.getActivityLogs(filters),
    keepPreviousData: true, // Garder les données précédentes pendant le chargement
    staleTime: 60000, // 1 minute
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des logs:', error);
      showError(`Erreur lors du chargement des logs: ${error.message}`);
    }
  });
}

// ✅ AMÉLIORATION: Hook pour récupérer les statistiques d'activité
export function useActivityStats(days = 30) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['activityStats', days],
    queryFn: () => monitoringService.getActivityStats(days),
    staleTime: 300000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques:', error);
      showError(`Erreur lors du chargement des statistiques: ${error.message}`);
    }
  });
}

// ✅ AMÉLIORATION: Hook pour récupérer l'historique de connexion d'un utilisateur
export function useUserConnectionHistory(userId, options = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['userConnectionHistory', userId, options],
    queryFn: () => monitoringService.getUserConnectionHistory(userId, options),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      showError(`Erreur lors du chargement de l'historique: ${error.message}`);
    }
  });
}

// ✅ Hook pour terminer une session
export function useTerminateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId) => monitoringService.terminateSession(sessionId),
    onSuccess: () => {
      // Invalider les queries de sessions pour refresh automatique
      queryClient.invalidateQueries({ queryKey: ['monitoring', 'sessions'] });
    },
  });
}

// ✅ Hook pour les actions disponibles
export function useAvailableActions() {
  return useQuery({
    queryKey: ['monitoring', 'actions'],
    queryFn: () => monitoringService.getAvailableActions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}