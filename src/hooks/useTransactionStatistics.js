import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 📊 HOOK POUR LES STATISTIQUES COMPLÈTES
 */
export function useStatistiquesCompletes(filtres = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['statistiques', 'completes', filtres],
    queryFn: () => transactionService.getStatistiquesCompletes(filtres),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_STATS_COMPLETES] Erreur:', error);
      showError(error?.message || translations?.errorLoadingStats || 'Erreur lors du chargement des statistiques');
    }
  });
}

/**
 * 📊 HOOK POUR LE TABLEAU DE BORD FINANCIER
 */
export function useTableauDeBordFinancier(options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['tableau-de-bord', 'financier', options],
    queryFn: () => transactionService.getTableauDeBordFinancier(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_TABLEAU_BORD] Erreur:', error);
      showError(error?.message || translations?.errorLoadingDashboard || 'Erreur lors du chargement du tableau de bord');
    }
  });
}

/**
 * 📈 HOOK POUR L'ÉVOLUTION DU CHIFFRE D'AFFAIRES
 */
export function useEvolutionChiffreAffaires(options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['evolution', 'chiffre-affaires', options],
    queryFn: () => transactionService.getEvolutionChiffreAffaires(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_EVOLUTION_CA] Erreur:', error);
      showError(error?.message || translations?.errorLoadingEvolution || 'Erreur lors du chargement de l\'évolution');
    }
  });
}

/**
 * 📊 HOOK POUR COMPARER DEUX PÉRIODES
 */
export function useComparaisonPeriodes() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (params) => transactionService.comparerPeriodes(params),
    onError: (error) => {
      console.error('❌ [USE_COMPARAISON] Erreur:', error);
      showError(error?.message || translations?.errorComparison || 'Erreur lors de la comparaison');
    }
  });
}

/**
 * 📊 HOOK POUR LES STATISTIQUES PAR POSTE
 */
export function useStatistiquesParPoste(options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['statistiques', 'par-poste', options],
    queryFn: () => transactionService.getStatistiquesParPoste(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_STATS_POSTE] Erreur:', error);
      showError(error?.message || translations?.errorLoadingPostStats || 'Erreur lors du chargement des stats par poste');
    }
  });
}

/**
 * 💰 HOOK POUR LES TRANSACTIONS EN ATTENTE
 */
export function useTransactionsEnAttente(filtres = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['transactions', 'en-attente', filtres],
    queryFn: () => transactionService.getTransactionsEnAttente(filtres),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('❌ [USE_TRANSACTIONS_ATTENTE] Erreur:', error);
      showError(error?.message || translations?.errorLoadingPendingTransactions || 'Erreur lors du chargement des transactions en attente');
    }
  });
}

/**
 * 🔧 HOOK POUR MODIFIER UNE TRANSACTION
 */
export function useModifierTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, action, donnees }) => 
      transactionService.modifierTransaction(transactionId, action, donnees),
    onSuccess: (data, variables) => {
      showSuccess(translations?.transactionUpdated || 'Transaction modifiée avec succès');
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistiques'] });
      queryClient.invalidateQueries({ queryKey: ['tableau-de-bord'] });
    },
    onError: (error) => {
      console.error('❌ [USE_MODIFIER_TRANSACTION] Erreur:', error);
      showError(error?.message || translations?.errorUpdatingTransaction || 'Erreur lors de la modification de la transaction');
    }
  });
}

/**
 * 💳 HOOK POUR METTRE À JOUR LE PAIEMENT
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, paiementData }) => 
      transactionService.mettreAJourPaiement(transactionId, paiementData),
    onSuccess: (data, variables) => {
      showSuccess(translations?.paymentUpdated || 'Paiement mis à jour avec succès');
      
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistiques'] });
      queryClient.invalidateQueries({ queryKey: ['tableau-de-bord'] });
    },
    onError: (error) => {
      console.error('❌ [USE_UPDATE_PAYMENT] Erreur:', error);
      showError(error?.message || translations?.errorUpdatingPayment || 'Erreur lors de la mise à jour du paiement');
    }
  });
}

/**
 * 📤 HOOK POUR L'EXPORT
 */
export function useExportDonnees() {
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ type, filtres }) => transactionService.exporterDonnees(type, filtres),
    onSuccess: () => {
      showSuccess(translations?.dataExported || 'Données exportées avec succès');
    },
    onError: (error) => {
      console.error('❌ [USE_EXPORT] Erreur:', error);
      showError(error?.message || translations?.errorExporting || 'Erreur lors de l\'export');
    }
  });
}

/**
 * 📋 HOOK POUR TOUTES LES TRANSACTIONS
 */
export function useTransactions(filtres = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['transactions', filtres],
    queryFn: () => transactionService.getTransactions(filtres),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_TRANSACTIONS] Erreur:', error);
      showError(error?.message || translations?.errorLoadingTransactions || 'Erreur lors du chargement des transactions');
    }
  });
}

/**
 * 🗑️ HOOK POUR SUPPRIMER UNE TRANSACTION
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (transactionId) => transactionService.deleteTransaction(transactionId),
    onSuccess: () => {
      showSuccess(translations?.transactionDeleted || 'Transaction supprimée avec succès');
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistiques'] });
    },
    onError: (error) => {
      console.error('❌ [USE_DELETE_TRANSACTION] Erreur:', error);
      showError(error?.message || translations?.errorDeletingTransaction || 'Erreur lors de la suppression');
    }
  });
}

/**
 * 💸 HOOK POUR REMBOURSER UNE TRANSACTION
 */
export function useRefundTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, raison }) => 
      transactionService.refundTransaction(transactionId, raison),
    onSuccess: () => {
      showSuccess(translations?.transactionRefunded || 'Transaction remboursée avec succès');
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['statistiques'] });
    },
    onError: (error) => {
      console.error('❌ [USE_REFUND_TRANSACTION] Erreur:', error);
      showError(error?.message || translations?.errorRefunding || 'Erreur lors du remboursement');
    }
  });
}

/**
 * 📊 HOOK POUR LES STATISTIQUES DE VENTE
 */
export function useSalesStatistics(filtres = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['sales', 'statistics', filtres],
    queryFn: () => transactionService.getSalesStatistics(filtres),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_SALES_STATISTICS] Erreur:', error);
      showError(error?.message || translations?.errorLoadingSalesStats || 'Erreur lors du chargement des statistiques de vente');
    }
  });
}