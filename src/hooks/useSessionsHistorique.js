import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionHistoriqueService } from '../services/sessionHistoriqueService';
import { useNotification } from '../contexts/NotificationContext';

// Hook pour récupérer l'historique des sessions
export const useSessionsHistorique = (filtres) => {
  return useQuery({
    queryKey: ['sessions-historique', filtres],
    queryFn: () => {
      console.log('🎣 [HOOK] useSessionsHistorique appelé avec filtres:', filtres);
      return sessionHistoriqueService.getSessionsHistorique(filtres);
    },
    staleTime: 30 * 1000, // 30 secondes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    enabled: true,
    onSuccess: (data) => {
      console.log('✅ [HOOK] useSessionsHistorique - Données reçues:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK] useSessionsHistorique - Erreur:', error);
    }
  });
};

// Hook pour les statistiques d'historique
export const useStatistiquesHistorique = (periode) => {
  return useQuery({
    queryKey: ['statistiques-historique', periode],
    queryFn: () => {
      console.log('🎣 [HOOK] useStatistiquesHistorique appelé avec période:', periode);
      return sessionHistoriqueService.getStatistiquesHistorique(periode);
    },
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!periode,
    onSuccess: (data) => {
      console.log('✅ [HOOK] useStatistiquesHistorique - Statistiques reçues:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK] useStatistiquesHistorique - Erreur:', error);
    }
  });
};

// Hook pour les détails d'une session
export const useSessionDetails = (sessionId) => {
  return useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: () => {
      console.log('🎣 [HOOK] useSessionDetails appelé avec ID:', sessionId);
      return sessionHistoriqueService.getSessionDetails(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: (data) => {
      console.log('✅ [HOOK] useSessionDetails - Détails reçus:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK] useSessionDetails - Erreur:', error);
    }
  });
};

// Hook pour exporter l'historique
export const useExporterHistorique = () => {
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ({ filters, format }) => {
      console.log('🎣 [HOOK] useExporterHistorique appelé:', { filters, format });
      return sessionHistoriqueService.exporterHistorique(filters, format);
    },
    onSuccess: (data) => {
      console.log('✅ [HOOK] useExporterHistorique - Export réussi:', data);
      showSuccess('Export généré avec succès');
    },
    onError: (error) => {
      console.error('❌ [HOOK] useExporterHistorique - Erreur:', error);
      showError(error?.message || 'Erreur lors de l\'export');
    }
  });
};

// Hook pour les filtres d'historique (options de filtrage)
export const useHistoriqueFilters = () => {
  return useQuery({
    queryKey: ['historique-filter-options'],
    queryFn: async () => {
      // Simulation des options de filtres - à adapter selon votre API
      return {
        data: {
          statuts: [
            { value: 'TERMINEE', label: 'Terminée' },
            { value: 'ANNULEE', label: 'Annulée' },
            { value: 'CLOTUREE', label: 'Clôturée' }
          ],
          postes: [], // À récupérer depuis l'API
          clients: [], // À récupérer depuis l'API
          periodes: [
            { value: 'today', label: 'Aujourd\'hui' },
            { value: 'week', label: 'Cette semaine' },
            { value: 'month', label: 'Ce mois' },
            { value: 'quarter', label: 'Ce trimestre' },
            { value: 'year', label: 'Cette année' }
          ]
        }
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 heure
  });
};