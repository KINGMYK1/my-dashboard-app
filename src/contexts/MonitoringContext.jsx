import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import monitoringService from '../services/monitoringService';
import { useNotification } from './NotificationContext';

const MonitoringContext = createContext();

export const MonitoringProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userId: null,
    action: null,
    status: null,
    resourceType: null,
    startDate: null,
    endDate: null,
    inactivityPeriod: 30, // minutes
  });
  
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();
  
  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Terminer une session utilisateur
  const terminateSession = useMutation({
    mutationFn: (sessionId) => monitoringService.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      showSuccess('Session utilisateur terminée avec succès');
    },
    onError: (error) => {
      showError(error.message || 'Erreur lors de la terminaison de la session');
    }
  });
  
  const contextValue = {
    filters,
    updateFilters,
    terminateSession,
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