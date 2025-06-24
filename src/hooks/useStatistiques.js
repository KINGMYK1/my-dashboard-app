import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import statistiquesService from '../services/statistiquesService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useMemo } from 'react';

/**
 * Hook pour les statistiques détaillées d'un poste
 */
export function useStatistiquesPosteDetaillees(posteId, options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['statistiques', 'poste', posteId, options],
    queryFn: () => statistiquesService.getStatistiquesPosteDetaillees(posteId, options),
    enabled: !!posteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingStats || 'Erreur lors du chargement des statistiques');
    }
  });
}

/**
 * Hook pour le dashboard des postes
 */
export function useDashboardPostes(periode = 'semaine') {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['dashboard', 'postes', periode],
    queryFn: () => statistiquesService.getDashboardPostes(periode),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingDashboard || 'Erreur lors du chargement du dashboard');
    }
  });
}

/**
 * Hook pour la comparaison de postes
 */
export function useComparaisonPostes() {
  const { showError, showSuccess } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ posteIds, dateDebut, dateFin }) => 
      statistiquesService.comparerPostes(posteIds, dateDebut, dateFin),
    onError: (error) => {
      showError(error.message || translations?.errorComparingPostes || 'Erreur lors de la comparaison');
    }
  });
}

/**
 * Hook pour l'historique d'un poste
 */
export function useHistoriquePoste(posteId, params = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['historique', 'poste', posteId, params],
    queryFn: () => statistiquesService.getHistoriquePoste(posteId, params),
    enabled: !!posteId,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingHistory || 'Erreur lors du chargement de l\'historique');
    }
  });
}

/**
 * Hook pour l'analyse des créneaux horaires
 */
export function useAnalyseCreneauxHoraires(posteId, dateDebut = null, dateFin = null) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['creneaux', 'poste', posteId, dateDebut, dateFin],
    queryFn: () => statistiquesService.getAnalyseCreneauxHoraires(posteId, dateDebut, dateFin),
    enabled: !!posteId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingScheduleAnalysis || 'Erreur lors de l\'analyse des créneaux');
    }
  });
}

/**
 * Hook pour l'historique général des sessions
 */
export function useHistoriqueGeneralSessions(params = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['historique', 'sessions', params],
    queryFn: () => statistiquesService.getHistoriqueGeneralSessions(params),
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
    onError: (error) => {
      showError(error.message || translations?.errorLoadingSessionHistory || 'Erreur lors du chargement de l\'historique');
    }
  });
}

/**
 * Hook pour la gestion d'état des filtres de statistiques
 */
export function useStatistiquesFilters() {
  const [filters, setFilters] = useState({
    dateDebut: null,
    dateFin: null,
    periode: 'semaine',
    posteId: null,
    clientId: null,
    statut: null
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateDebut: null,
      dateFin: null,
      periode: 'semaine',
      posteId: null,
      clientId: null,
      statut: null
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters
  };
}