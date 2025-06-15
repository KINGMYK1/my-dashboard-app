import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import typeAbonnementService from '../services/typeAbonnementService';

// Hook principal pour récupérer tous les types d'abonnements
export function useTypesAbonnements(params = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typesAbonnements', params],
    queryFn: () => typeAbonnementService.getAllTypesAbonnements(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Erreur lors de la récupération des types d\'abonnements:', error);
      showError(error?.message || translations?.errorLoadingSubscriptionTypes || 'Erreur lors du chargement des types d\'abonnements');
    }
  });
}

// Hook pour récupérer un type d'abonnement par ID
export function useTypeAbonnement(id) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typeAbonnement', id],
    queryFn: () => typeAbonnementService.getTypeAbonnementById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération du type d\'abonnement:', error);
      showError(error?.message || translations?.errorLoadingSubscriptionType || 'Erreur lors du chargement du type d\'abonnement');
    }
  });
}

// ✅ NOUVEAU: Hook pour calculer le prix d'un abonnement
export function useCalculerPrixAbonnement(typeAbonnementId, reductionPromo = 0) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['calculPrixAbonnement', typeAbonnementId, reductionPromo],
    queryFn: () => typeAbonnementService.calculerPrixAbonnement(typeAbonnementId, reductionPromo),
    enabled: !!typeAbonnementId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors du calcul du prix:', error);
      showError(error?.message || translations?.errorCalculatingPrice || 'Erreur lors du calcul du prix');
    }
  });
}

// Hook pour créer un type d'abonnement
export function useCreateTypeAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (data) => typeAbonnementService.createTypeAbonnement(data),
    onSuccess: (response) => {
      console.log('✅ [CREATE_TYPE_ABONNEMENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['typesAbonnements'] });
      showSuccess(response?.data?.message || response?.message || translations?.subscriptionTypeCreatedSuccess || 'Type d\'abonnement créé avec succès');
    },
    onError: (error) => {
      console.error('❌ [CREATE_TYPE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorCreatingSubscriptionType || 'Erreur lors de la création du type d\'abonnement');
    }
  });
}

// Hook pour mettre à jour un type d'abonnement
export function useUpdateTypeAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ id, data }) => typeAbonnementService.updateTypeAbonnement(id, data),
    onSuccess: (response, { id }) => {
      console.log('✅ [UPDATE_TYPE_ABONNEMENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['typesAbonnements'] });
      queryClient.invalidateQueries({ queryKey: ['typeAbonnement', id] });
      showSuccess(response?.data?.message || response?.message || translations?.subscriptionTypeUpdatedSuccess || 'Type d\'abonnement modifié avec succès');
    },
    onError: (error) => {
      console.error('❌ [UPDATE_TYPE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorUpdatingSubscriptionType || 'Erreur lors de la modification du type d\'abonnement');
    }
  });
}

// Hook pour supprimer un type d'abonnement
export function useDeleteTypeAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (id) => typeAbonnementService.deleteTypeAbonnement(id),
    onSuccess: (response) => {
      console.log('✅ [DELETE_TYPE_ABONNEMENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['typesAbonnements'] });
      showSuccess(response?.data?.message || response?.message || translations?.subscriptionTypeDeletedSuccess || 'Type d\'abonnement supprimé avec succès');
    },
    onError: (error) => {
      console.error('❌ [DELETE_TYPE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorDeletingSubscriptionType || 'Erreur lors de la suppression du type d\'abonnement');
    }
  });
}

// ✅ NOUVEAU: Hook pour basculer le statut d'un type d'abonnement
export function useToggleTypeAbonnementStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (id) => typeAbonnementService.toggleTypeAbonnementStatus(id),
    onSuccess: (response) => {
      console.log('✅ [TOGGLE_STATUS_TYPE_ABONNEMENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['typesAbonnements'] });
      const newStatus = response?.data?.estActif ? 'activé' : 'désactivé';
      showSuccess(response?.data?.message || response?.message || `Type d'abonnement ${newStatus} avec succès`);
    },
    onError: (error) => {
      console.error('❌ [TOGGLE_STATUS_TYPE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorTogglingStatus || 'Erreur lors du changement de statut');
    }
  });
}

// ✅ NOUVEAU: Hook pour dupliquer un type d'abonnement
export function useDuplicateTypeAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (id) => typeAbonnementService.duplicateTypeAbonnement(id),
    onSuccess: (response) => {
      console.log('✅ [DUPLICATE_TYPE_ABONNEMENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['typesAbonnements'] });
      showSuccess(response?.data?.message || response?.message || translations?.subscriptionTypeDuplicatedSuccess || 'Type d\'abonnement dupliqué avec succès');
    },
    onError: (error) => {
      console.error('❌ [DUPLICATE_TYPE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorDuplicatingSubscriptionType || 'Erreur lors de la duplication du type d\'abonnement');
    }
  });
}

// Hook pour les statistiques d'un type
export function useTypeAbonnementStatistiques(id) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typeAbonnementStats', id],
    queryFn: () => typeAbonnementService.getTypeAbonnementStatistiques(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques:', error);
      showError(error?.message || translations?.errorLoadingStats || 'Erreur lors du chargement des statistiques');
    }
  });
}