import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import typePosteService from '../services/typePosteService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

// Hook pour récupérer la liste de tous les types de postes
export function useTypesPostes() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typesPostes'],
    queryFn: async () => {
      try {
        const response = await typePosteService.getAllTypesPostes();
        return response.data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des types de postes:", error);
        showError(error.response?.data?.message || translations.errorLoadingTypesPostes || "Erreur lors du chargement des types de postes");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer un type de poste par ID
export function useTypePoste(typePosteId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typePoste', typePosteId],
    queryFn: async () => {
      if (!typePosteId) return null;
      try {
        const response = await typePosteService.getTypePosteById(typePosteId);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération du type de poste:", error);
        showError(error.response?.data?.message || translations.errorLoadingTypePoste || "Erreur lors du chargement du type de poste");
        throw error;
      }
    },
    enabled: !!typePosteId,
  });
}

// Hook pour créer un type de poste
export function useCreateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (typePosteData) => {
      const response = await typePosteService.createTypePoste(typePosteData.data, typePosteData.plansTarifaires);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(data.message || translations.typePosteCreatedSuccess || "Type de poste créé avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la création du type de poste:", error);
      showError(error.response?.data?.message || translations.errorCreatingTypePoste || "Erreur lors de la création du type de poste");
    }
  });
}

// Hook pour mettre à jour un type de poste
export function useUpdateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, data, plansTarifaires }) => {
      const response = await typePosteService.updateTypePoste(id, data, plansTarifaires);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.invalidateQueries({ queryKey: ['typePoste', variables.id] });
      showSuccess(data.message || translations.typePosteUpdatedSuccess || "Type de poste mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du type de poste:", error);
      showError(error.response?.data?.message || translations.errorUpdatingTypePoste || "Erreur lors de la mise à jour du type de poste");
    }
  });
}

// Hook pour supprimer un type de poste
export function useDeleteTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (typePosteId) => {
      const response = await typePosteService.deleteTypePoste(typePosteId);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(data.message || translations.typePosteDeletedSuccess || "Type de poste supprimé avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression du type de poste:", error);
      showError(error.response?.data?.message || translations.errorDeletingTypePoste || "Erreur lors de la suppression du type de poste");
    }
  });
}

// Hook pour calculer le prix d'une session
export function useCalculerPrixSession(typePosteId, dureeMinutes) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['prixSession', typePosteId, dureeMinutes],
    queryFn: async () => {
      if (!typePosteId || !dureeMinutes) return null;
      try {
        const response = await typePosteService.calculerPrixSession(typePosteId, dureeMinutes);
        return response.data;
      } catch (error) {
        console.error("Erreur lors du calcul du prix de session:", error);
        showError(error.response?.data?.message || translations.errorCalculatingPrice || "Erreur lors du calcul du prix de session");
        throw error;
      }
    },
    enabled: !!typePosteId && !!dureeMinutes,
    staleTime: 0, // Always refetch for price calculation
  });
}
