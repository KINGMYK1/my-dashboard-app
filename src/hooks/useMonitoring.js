import { useQuery } from '@tanstack/react-query';
import monitoringService from '../services/monitoringService';
import { useMonitoring } from '../contexts/MonitoringContext';

// Hook pour récupérer les sessions actives avec rafraîchissement automatique
export function useActiveSessions() {
  const { filters } = useMonitoring();
  
  return useQuery({
    queryKey: ['sessions', filters.inactivityPeriod],
    queryFn: () => monitoringService.getActiveSessions(filters.inactivityPeriod),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    staleTime: 10000, // Considérer comme périmé après 10 secondes
    onError: (error) => {
      console.error('Erreur lors de la récupération des sessions:', error);
      // Si l'erreur est une session terminée, on peut gérer ça ici
      if (error.response?.status === 401) {
        console.log('Session expirée détectée dans useActiveSessions');
      }
    }
  });
}

// Hook pour récupérer les logs d'activité
export function useActivityLogs() {
  const { filters } = useMonitoring();
  
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => monitoringService.getActivityLogs(filters),
    keepPreviousData: true, // Garder les données précédentes pendant le chargement
    onError: (error) => {
      console.error('Erreur lors de la récupération des logs:', error);
    }
  });
}

// Hook pour récupérer les statistiques d'activité
export function useActivityStats(days = 30) {
  return useQuery({
    queryKey: ['activityStats', days],
    queryFn: () => monitoringService.getActivityStats(days),
    staleTime: 300000, // 5 minutes
  });
}

// Hook pour récupérer l'historique de connexion d'un utilisateur
export function useUserConnectionHistory(userId) {
  return useQuery({
    queryKey: ['userConnections', userId],
    queryFn: () => monitoringService.getUserConnectionHistory(userId),
    enabled: !!userId,
  });
}