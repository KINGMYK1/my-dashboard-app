import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import statistiquesService from '../services/statistiquesService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

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
 * ✅ CORRECTION: Hook pour le dashboard des postes
 */
export function useDashboardPostes(options = {}) {
  const { 
    periode = 'jour',
    dateDebut,
    dateFin,
    enabled = true 
  } = options;

  return useQuery({
    queryKey: ['dashboard-postes', { periode, dateDebut, dateFin }],
    queryFn: () => statistiquesService.getDashboardPostes({ 
      periode, 
      dateDebut, 
      dateFin 
    }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 secondes
    retry: 2,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur dashboard postes:', error);
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour les statistiques complètes des transactions
 */
export function useStatistiquesCompletes(filtres = {}, options = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ['statistiques-completes', filtres],
    queryFn: () => statistiquesService.obtenirStatistiquesCompletes(filtres),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('❌ [HOOK] Erreur statistiques complètes:', error);
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

/**
 * 📊 Hook principal pour les statistiques
 */
export const useStatistiques = (options = {}) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const {
    autoLoad = true,
    refreshInterval = null,
    dateDebut = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateFin = new Date(),
    groupBy = 'day'
  } = options;

  const chargerStatistiques = useCallback(async (filtres = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        dateDebut: dateDebut.toISOString(),
        dateFin: dateFin.toISOString(),
        groupBy,
        ...filtres
      };

      const response = await statistiquesService.obtenirStatistiquesCompletes(params);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      showError('Erreur lors du chargement des statistiques');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dateDebut, dateFin, groupBy, showError]);

  // Chargement automatique
  useEffect(() => {
    if (autoLoad) {
      chargerStatistiques();
    }
  }, [autoLoad, chargerStatistiques]);

  // Actualisation périodique
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        chargerStatistiques();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, chargerStatistiques]);

  return {
    statistiques: data,
    loading,
    error,
    refresh: chargerStatistiques,
    setStatistiques: setData
  };
};

/**
 * 📈 Hook pour l'évolution du chiffre d'affaires
 */
export const useEvolutionCA = (periode = 'mois', groupBy = 'day') => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [evolution, setEvolution] = useState(null);

  const chargerEvolution = useCallback(async () => {
    setLoading(true);
    try {
      const response = await statistiquesService.obtenirEvolutionChiffreAffaires({
        periode,
        groupBy
      });
      setEvolution(response.data);
    } catch (error) {
      showError('Erreur lors du chargement de l\'évolution du CA');
    } finally {
      setLoading(false);
    }
  }, [periode, groupBy, showError]);

  useEffect(() => {
    chargerEvolution();
  }, [chargerEvolution]);

  return { evolution, loading, refresh: chargerEvolution };
};

/**
 * 📊 Hook pour les statistiques par poste
 */
export const useStatistiquesPostes = (filtres = {}) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [statsPostes, setStatsPostes] = useState(null);

  const chargerStatsPostes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await statistiquesService.obtenirStatistiquesParPoste(filtres);
      setStatsPostes(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des statistiques par poste');
    } finally {
      setLoading(false);
    }
  }, [filtres, showError]);

  useEffect(() => {
    chargerStatsPostes();
  }, [chargerStatsPostes]);

  return { statsPostes, loading, refresh: chargerStatsPostes };
};

/**
 * 📊 Hook pour le tableau de bord
 */
export const useTableauDeBord = (options = {}) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [tableauDeBord, setTableauDeBord] = useState(null);

  const chargerTableauDeBord = useCallback(async () => {
    setLoading(true);
    try {
      const response = await statistiquesService.obtenirTableauDeBordFinancier(options);
      setTableauDeBord(response.data);
    } catch (error) {
      showError('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  }, [options, showError]);

  useEffect(() => {
    chargerTableauDeBord();
  }, [chargerTableauDeBord]);

  return { tableauDeBord, loading, refresh: chargerTableauDeBord };
};

/**
 * 🔄 Hook pour la comparaison de périodes
 */
export const useComparaisonPeriodes = () => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [comparaison, setComparaison] = useState(null);

  const comparer = useCallback(async (periodeActuelle, periodeComparaison) => {
    setLoading(true);
    try {
      const response = await statistiquesService.comparerPeriodes({
        dateDebutActuelle: periodeActuelle.dateDebut.toISOString(),
        dateFinActuelle: periodeActuelle.dateFin.toISOString(),
        dateDebutComparaison: periodeComparaison.dateDebut.toISOString(),
        dateFinComparaison: periodeComparaison.dateFin.toISOString(),
        groupBy: periodeActuelle.groupBy || 'day'
      });
      setComparaison(response.data);
    } catch (error) {
      showError('Erreur lors de la comparaison des périodes');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { comparaison, loading, comparer, setComparaison };
};

/**
 * 💰 Hook pour les transactions en attente
 */
export const useTransactionsEnAttente = (filtres = {}) => {
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [statistiques, setStatistiques] = useState(null);

  const chargerTransactionsEnAttente = useCallback(async () => {
    setLoading(true);
    try {
      const response = await statistiquesService.getTransactionsEnAttente(filtres);
      setTransactions(response.data.transactions);
      setStatistiques(response.data.statistiques);
    } catch (error) {
      showError('Erreur lors du chargement des transactions en attente');
    } finally {
      setLoading(false);
    }
  }, [filtres, showError]);

  useEffect(() => {
    chargerTransactionsEnAttente();
  }, [chargerTransactionsEnAttente]);

  return { 
    transactions, 
    statistiques, 
    loading, 
    refresh: chargerTransactionsEnAttente 
  };
};

/**
 * ✅ Hook pour invalider les caches de statistiques
 */
export function useInvalidateStatistiques() {
  const queryClient = useQueryClient();
  
  return {
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-postes'] });
    },
    invalidateStatistiquesCompletes: () => {
      queryClient.invalidateQueries({ queryKey: ['statistiques-completes'] });
    },
    invalidateStatistiquesPoste: (posteId) => {
      queryClient.invalidateQueries({ queryKey: ['statistiques-poste', posteId] });
    },
    invalidateTableauDeBord: () => {
      queryClient.invalidateQueries({ queryKey: ['tableau-de-bord-financier'] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0]?.toString().includes('statistiques') 
      });
    }
  };
}