import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import sessionService from '../services/sessionService';

export const useOptimizedSessions = () => {
  const queryClient = useQueryClient();
  const lastUpdateRef = useRef(null);
  const intervalRef = useRef(null);

  // Query pour les sessions actives avec optimisation
  const {
    data: activeSessions = [],
    isLoading: activeLoading,
    error: activeError
  } = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: async () => {
      const response = await sessionService.getActiveSessions();
      return response;
    },
    staleTime: 10000, // 10 secondes
    refetchInterval: false, // Désactiver le refetch automatique
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Query pour les sessions en pause
  const {
    data: pausedSessions = [],
    isLoading: pausedLoading,
    error: pausedError
  } = useQuery({
    queryKey: ['sessions', 'paused'],
    queryFn: async () => {
      const response = await sessionService.getPausedSessions();
      return response;
    },
    staleTime: 15000, // 15 secondes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // ✅ Invalidation intelligente basée sur les changements
  const invalidateSessionsIfNeeded = useCallback(async () => {
    try {
      // Vérifier s'il y a eu des changements côté serveur
      const currentActiveSessions = await sessionService.getActiveSessions();
      const currentTime = Date.now();
      
      // Comparer avec les données en cache
      const cachedData = queryClient.getQueryData(['sessions', 'active']);
      
      if (!cachedData || 
          currentActiveSessions.length !== cachedData.length ||
          currentActiveSessions.some((session, index) => 
            !cachedData[index] || 
            session.updatedAt !== cachedData[index].updatedAt ||
            session.statut !== cachedData[index].statut
          )) {
        
        // Invalider seulement si changement détecté
        queryClient.setQueryData(['sessions', 'active'], currentActiveSessions);
        lastUpdateRef.current = currentTime;
      }
    } catch (error) {
      console.error('❌ Erreur vérification sessions:', error.message);
    }
  }, [queryClient]);

  // ✅ Timer intelligent qui s'adapte au contexte
  useEffect(() => {
    // Démarrer le timer seulement s'il y a des sessions actives
    if (activeSessions.length > 0) {
      // Intervalle plus court s'il y a des sessions qui expirent bientôt
      const hasExpiringSessions = activeSessions.some(session => {
        const startTime = new Date(session.dateHeureDebut);
        const now = Date.now();
        const elapsed = now - startTime;
        const estimatedDuration = session.dureeEstimeeMinutes * 60 * 1000;
        const remaining = estimatedDuration - elapsed;
        return remaining < 5 * 60 * 1000; // Moins de 5 minutes restantes
      });

      const interval = hasExpiringSessions ? 5000 : 15000; // 5s ou 15s

      intervalRef.current = setInterval(invalidateSessionsIfNeeded, interval);
    } else {
      // Pas de sessions actives, vérification moins fréquente
      intervalRef.current = setInterval(invalidateSessionsIfNeeded, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeSessions.length, invalidateSessionsIfNeeded]);

  // ✅ Méthodes pour forcer le refresh après actions
  const refreshAfterAction = useCallback(() => {
    queryClient.invalidateQueries(['sessions']);
  }, [queryClient]);

  const refreshActiveSessions = useCallback(() => {
    queryClient.invalidateQueries(['sessions', 'active']);
  }, [queryClient]);

  const refreshPausedSessions = useCallback(() => {
    queryClient.invalidateQueries(['sessions', 'paused']);
  }, [queryClient]);

  return {
    activeSessions,
    pausedSessions,
    isLoading: activeLoading || pausedLoading,
    error: activeError || pausedError,
    refreshAfterAction,
    refreshActiveSessions,
    refreshPausedSessions
  };
};