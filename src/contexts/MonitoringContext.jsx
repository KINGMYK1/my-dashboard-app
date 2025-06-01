import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import monitoringService from '../services/monitoringService';
import { useNotification } from './NotificationContext';

const MonitoringContext = createContext();

export const MonitoringProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    // Pagination
    page: 1,
    limit: 50,
    
    // Filtres pour les logs d'activité
    userId: null,
    action: null,
    status: null,
    resourceType: null,
    startDate: null,
    endDate: null,
    
    // Filtres pour les sessions
    inactivityPeriod: 30, // minutes
  });
  
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();
  
  // ✅ AMÉLIORATION: Mettre à jour les filtres avec validation
  const updateFilters = useCallback((newFilters) => {
    console.log('🔄 [MONITORING] Mise à jour des filtres:', newFilters);
    
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Validation des dates
      if (updated.startDate && updated.endDate && new Date(updated.startDate) > new Date(updated.endDate)) {
        console.warn('⚠️ [MONITORING] Date de début postérieure à la date de fin');
        showError('La date de début doit être antérieure à la date de fin');
        return prev;
      }
      
      // Validation de la période d'inactivité
      if (updated.inactivityPeriod && (updated.inactivityPeriod < 1 || updated.inactivityPeriod > 1440)) {
        console.warn('⚠️ [MONITORING] Période d\'inactivité invalide');
        showError('La période d\'inactivité doit être entre 1 et 1440 minutes');
        return prev;
      }
      
      console.log('✅ [MONITORING] Filtres mis à jour:', updated);
      return updated;
    });
  }, [showError]);
  
  // ✅ AMÉLIORATION: Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    console.log('🔄 [MONITORING] Réinitialisation des filtres');
    setFilters({
      page: 1,
      limit: 50,
      userId: null,
      action: null,
      status: null,
      resourceType: null,
      startDate: null,
      endDate: null,
      inactivityPeriod: 30,
    });
  }, []);
  
  // ✅ AMÉLIORATION: Terminer une session utilisateur avec gestion d'erreurs
  const terminateSession = useMutation({
    mutationFn: (sessionId) => {
      console.log(`🔚 [MONITORING] Terminaison de la session ${sessionId}`);
      return monitoringService.terminateSession(sessionId);
    },
    onSuccess: (data) => {
      console.log('✅ [MONITORING] Session terminée avec succès:', data);
      
      // Invalider les requêtes de sessions pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
      queryClient.invalidateQueries({ queryKey: ['userConnectionHistory'] });
      
      // Message de succès personnalisé
      const username = data?.data?.username || 'l\'utilisateur';
      showSuccess(`Session de ${username} terminée avec succès`);
    },
    onError: (error) => {
      console.error('❌ [MONITORING] Erreur lors de la terminaison de session:', error);
      
      // Gestion spécifique des erreurs
      if (error.errorCode === 'SESSION_NOT_FOUND') {
        showError('Session non trouvée ou déjà terminée');
      } else if (error.errorCode === 'SESSION_ALREADY_TERMINATED') {
        showError('Cette session est déjà terminée');
      } else if (error.errorCode === 'INSUFFICIENT_PERMISSIONS') {
        showError('Vous n\'avez pas les droits pour terminer cette session');
      } else {
        showError(error.message || 'Erreur lors de la terminaison de la session');
      }
    }
  });
  
  // ✅ AMÉLIORATION: Actions de nettoyage
  const refreshData = useCallback(() => {
    console.log('🔄 [MONITORING] Rafraîchissement des données');
    queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    queryClient.invalidateQueries({ queryKey: ['activityStats'] });
  }, [queryClient]);
  
  const contextValue = {
    filters,
    updateFilters,
    resetFilters,
    terminateSession,
    refreshData,
    
    // États de chargement
    isTerminatingSession: terminateSession.isPending,
  };
  
  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring doit être utilisé dans un MonitoringProvider');
  }
  return context;
};