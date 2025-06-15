import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import abonnementService from '../services/abonnementService'; // Assurez-vous que ce chemin est correct

// Hook principal pour récupérer tous les abonnements avec filtrage avancé
export function useAbonnements(filters = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['abonnements', filters],
    queryFn: () => abonnementService.getAllAbonnements(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => ({
      ...data,
      data: data.data || [], // S'assurer que 'data' est un tableau, même si la réponse est vide
      pagination: data.pagination || {},
    }),
    onError: (error) => {
      console.error('Erreur lors de la récupération des abonnements:', error);
      showError(error?.message || translations?.errorLoadingSubscriptions || 'Erreur lors du chargement des abonnements');
    }
  });
}

// Hook pour récupérer un abonnement par ID
export function useAbonnement(abonnementId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['abonnement', abonnementId],
    queryFn: () => abonnementService.getAbonnementById(abonnementId),
    enabled: !!abonnementId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération de l\'abonnement par ID:', error);
      showError(error?.message || translations?.errorLoadingSubscription || 'Erreur lors du chargement de l\'abonnement');
    }
  });
}

// Hook pour vendre un abonnement
// export function useVendreAbonnement() {
//   const queryClient = useQueryClient();
//   const { showSuccess, showError } = useNotification();
//   const { translations } = useLanguage();

//   return useMutation({
//     mutationFn: (abonnementData) => abonnementService.vendreAbonnement(abonnementData),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['abonnements'] }); // Rafraîchir la liste des abonnements
//       queryClient.invalidateQueries({ queryKey: ['clientAbonnements'] }); // Rafraîchir les abonnements du client si pertinent
//       queryClient.invalidateQueries({ queryKey: ['statistiquesAbonnements'] }); // Rafraîchir les statistiques
//       showSuccess(data?.message || translations?.subscriptionSoldSuccess || 'Abonnement vendu avec succès');
//     },
//     onError: (error) => {
//       console.error('❌ [VENDRE_ABONNEMENT] Erreur:', error);
//       showError(error?.response?.data?.message || error?.message || translations?.errorSellingSubscription || 'Erreur lors de la vente de l\'abonnement');
//     }
//   });
// }

// Hook pour calculer le prix d'un abonnement
// export function useCalculerPrixAbonnement() {
//   const { showError } = useNotification();
//   const { translations } = useLanguage();

//   return useMutation({
//     mutationFn: ({ typeAbonnementId, reductionPromo }) => abonnementService.calculerPrixAbonnement(typeAbonnementId, reductionPromo),
//     onError: (error) => {
//       console.error('❌ [CALCUL_PRIX_ABONNEMENT] Erreur:', error);
//       showError(error?.response?.data?.message || error?.message || translations?.errorCalculatingPrice || 'Erreur lors du calcul du prix de l\'abonnement');
//     }
//   });
// }

// Hook pour changer le statut d'un abonnement (Suspendre/Réactiver)
export function useChangerStatutAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ id, statut, raison }) => abonnementService.changerStatutAbonnement(id, statut, raison),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['abonnement', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['abonnementsActifsClient'] });
      const action = variables.statut === 'SUSPENDU' ? (translations?.suspended || 'suspendu') : (translations?.reactivated || 'réactivé');
      showSuccess(data?.message || `${translations?.subscription || 'Abonnement'} ${action} ${translations?.withSuccess || 'avec succès'}`);
    },
    onError: (error) => {
      console.error('❌ [CHANGER_STATUT_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorChangingSubscriptionStatus || 'Erreur lors du changement de statut de l\'abonnement');
    }
  });
}

// Hook pour annuler un abonnement
export function useAnnulerAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ id, raisonAnnulation }) => abonnementService.annulerAbonnement(id, raisonAnnulation),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['abonnement', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['abonnementsActifsClient'] });
      showSuccess(data?.message || translations?.subscriptionCancelledSuccess || 'Abonnement annulé avec succès');
    },
    onError: (error) => {
      console.error('❌ [ANNULER_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorCancellingSubscription || 'Erreur lors de l\'annulation de l\'abonnement');
    }
  });
}

// Hook pour récupérer les abonnements actifs d'un client spécifique
export function useClientAbonnementsActifs(clientId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clientAbonnementsActifs', clientId],
    queryFn: () => abonnementService.getAbonnementsActifsClient(clientId),
    enabled: !!clientId,
    staleTime: 1 * 60 * 1000, // Les abonnements actifs peuvent changer
    onError: (error) => {
      console.error('Erreur lors de la récupération des abonnements actifs du client:', error);
      showError(error?.message || translations?.errorLoadingClientActiveSubscriptions || 'Erreur lors du chargement des abonnements actifs du client');
    }
  });
}

// Hook pour récupérer les sessions d'un abonnement
export function useAbonnementSessions(abonnementId, page = 1, limit = 50) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['abonnementSessions', abonnementId, page, limit],
    queryFn: () => abonnementService.getAbonnementSessions(abonnementId, { page, limit }),
    enabled: !!abonnementId,
    staleTime: 1 * 60 * 1000,
    onError: (error) => {
      console.error('Erreur lors de la récupération des sessions de l\'abonnement:', error);
      showError(error?.message || translations?.errorLoadingSessions || 'Erreur lors du chargement des sessions');
    }
  });
}

// Hook pour récupérer les abonnements expirant bientôt
export function useAbonnementsExpirantBientot(jours = 7) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['abonnementsExpirantBientot', jours],
    queryFn: () => abonnementService.getAbonnementsExpirantBientot(jours),
    staleTime: 10 * 60 * 1000,
    retry: 2,
    refetchInterval: 30 * 60 * 1000, // Rafraîchir toutes les 30 minutes
    onError: (error) => {
      console.error('Erreur lors de la récupération des abonnements expirant:', error);
      showError(error?.message || translations?.errorLoadingExpiringSubscriptions || 'Erreur lors du chargement des abonnements expirant');
    }
  });
}

// Hook pour récupérer les statistiques des abonnements
export function useStatistiquesAbonnements(periode = 30) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['statistiquesAbonnements', periode],
    queryFn: () => abonnementService.getStatistiquesAbonnements(periode),
    staleTime: 60 * 60 * 1000, // 1 heure
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques des abonnements:', error);
      showError(error?.message || translations?.errorLoadingSubscriptionStats || 'Erreur lors du chargement des statistiques d\'abonnement');
    }
  });
}


// Hook pour calculer le prix d'un abonnement
export function useCalculerPrixAbonnement() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ typeAbonnementId, reductionPromo }) => {
      // ✅ Validation des paramètres
      if (!typeAbonnementId || isNaN(parseInt(typeAbonnementId))) {
        throw new Error('ID de type d\'abonnement invalide');
      }
      
      return abonnementService.calculerPrixAbonnement({ 
        typeAbonnementId: parseInt(typeAbonnementId), 
        reductionPromo: parseFloat(reductionPromo) || 0 
      });
    },
    onError: (error) => {
      console.error('❌ [CALCUL_PRIX_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorCalculatingPrice || 'Erreur lors du calcul du prix de l\'abonnement');
    }
  });
}

// Hook pour vendre un abonnement
export function useVendreAbonnement() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (abonnementData) => {
      // ✅ Validation des données avant envoi
      if (!abonnementData.clientId || !abonnementData.typeAbonnementId) {
        throw new Error('Données d\'abonnement incomplètes');
      }
      
      return abonnementService.vendreAbonnement(abonnementData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['clientAbonnements'] });
      queryClient.invalidateQueries({ queryKey: ['statistiquesAbonnements'] });
      showSuccess(data?.message || translations?.subscriptionSoldSuccess || 'Abonnement vendu avec succès');
    },
    onError: (error) => {
      console.error('❌ [VENDRE_ABONNEMENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorSellingSubscription || 'Erreur lors de la vente de l\'abonnement');
    }
  });
}
