import { useQuery } from '@tanstack/react-query';
import { typePosteService } from '../services/typePosteService';

/**
 * ✅ Hook pour récupérer les statistiques d'un type de poste
 */
export const useTypePosteStatistics = (typePosteId, options = {}) => {
  return useQuery({
    queryKey: ['type-poste-statistics', typePosteId, options],
    queryFn: () => {
      if (!typePosteId) {
        throw new Error('Type poste ID requis pour les statistiques');
      }
      return typePosteService.getTypePosteStatistics(typePosteId, options);
    },
    enabled: !!typePosteId && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('✅ [HOOK_STATISTICS] Données reçues:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK_STATISTICS] Erreur:', error);
    }
  });
};

/**
 * ✅ Hook pour récupérer les statistiques de tous les types de poste
 */
export const useAllTypesPostesStatistics = (options = {}) => {
  return useQuery({
    queryKey: ['all-types-postes-statistics', options],
    queryFn: () => typePosteService.getAllTypesPostesStatistics(options),
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('✅ [HOOK_ALL_STATISTICS] Données reçues:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK_ALL_STATISTICS] Erreur:', error);
    }
  });
};

/**
 * ✅ Hook pour récupérer le rapport d'utilisation
 */
export const useTypePosteUsageReport = (typePosteId, options = {}) => {
  return useQuery({
    queryKey: ['type-poste-usage-report', typePosteId, options],
    queryFn: () => {
      if (!typePosteId) {
        throw new Error('Type poste ID requis pour le rapport');
      }
      return typePosteService.getTypePosteUsageReport(typePosteId, options);
    },
    enabled: !!typePosteId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log('✅ [HOOK_USAGE_REPORT] Données reçues:', data);
    },
    onError: (error) => {
      console.error('❌ [HOOK_USAGE_REPORT] Erreur:', error);
    }
  });
};