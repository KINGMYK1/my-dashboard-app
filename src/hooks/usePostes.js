import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import posteService from '../services/posteService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

// Hook pour récupérer la liste des postes
export function usePostes(includeInactive = false) {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['postes', includeInactive],
    queryFn: async () => {
      try {
        const response = await posteService.getAllPostes(includeInactive);
        return response.data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des postes:", error);
        
        if (error.response?.status === 403) {
          showError("Vous n'avez pas les permissions pour voir les postes");
        } else {
          showError(error.response?.data?.message || "Erreur lors de la récupération des postes");
        }
        throw error;
      }
    },
    staleTime: 60000, // 1 minute car les postes peuvent changer d'état fréquemment
  });
}

// Hook pour récupérer un poste par ID
export function usePoste(posteId) {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['poste', posteId],
    queryFn: async () => {
      if (!posteId) return null;
      try {
        const response = await posteService.getPosteById(posteId);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération du poste:", error);
        showError(error.response?.data?.message || "Erreur lors de la récupération du poste");
        throw error;
      }
    },
    enabled: !!posteId,
  });
}

// Hook pour créer un poste
export function useCreatePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (posteData) => {
      const response = await posteService.createPoste(posteData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      showSuccess(data.message || translations?.posteCreatedSuccess || "Poste créé avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la création du poste:", error);
      
      const errorMessage = error.response?.data?.message;
      if (error.response?.status === 403) {
        showError("Vous n'avez pas les permissions pour créer des postes");
      } else {
        showError(errorMessage || "Erreur lors de la création du poste");
      }
    }
  });
}

// Hook pour mettre à jour un poste
export function useUpdatePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, posteData }) => {
      const response = await posteService.updatePoste(id, posteData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      queryClient.invalidateQueries({ queryKey: ['poste', variables.id] });
      showSuccess(data.message || translations?.posteUpdatedSuccess || "Poste mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du poste:", error);
      
      const errorMessage = error.response?.data?.message;
      showError(errorMessage || "Erreur lors de la mise à jour du poste");
    }
  });
}

// Hook pour changer l'état d'un poste
export function useChangerEtatPoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, etat, notesMaintenance }) => {
      const response = await posteService.changerEtatPoste(id, etat, notesMaintenance);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      queryClient.invalidateQueries({ queryKey: ['poste', variables.id] });
      showSuccess(data.message || translations?.posteStateChangedSuccess || "État du poste modifié avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors du changement d'état du poste:", error);
      
      const errorMessage = error.response?.data?.message;
      showError(errorMessage || "Erreur lors du changement d'état du poste");
    }
  });
}

// Hook pour supprimer un poste
export function useDeletePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (posteId) => {
      const response = await posteService.deletePoste(posteId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      showSuccess(data.message || translations?.posteDeletedSuccess || "Poste supprimé avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression du poste:", error);
      
      const errorMessage = error.response?.data?.message;
      if (error.response?.status === 403) {
        showError("Vous n'avez pas les permissions pour supprimer des postes");
      } else {
        showError(errorMessage || "Erreur lors de la suppression du poste");
      }
    }
  });
}