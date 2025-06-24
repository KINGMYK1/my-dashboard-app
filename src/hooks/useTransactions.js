import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import transactionService from '../services/transactionService';

/**
 * ✅ Hook pour récupérer toutes les transactions avec filtres
 */
export function useTransactions(filters = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAllTransactions(filters),
    keepPreviousData: true,
    staleTime: 30000, // 30 secondes
    onError: (error) => {
      console.error('❌ [USE_TRANSACTIONS] Erreur:', error);
      showError(error.message || 'Erreur lors du chargement des transactions');
    }
  });
}

/**
 * ✅ Hook pour récupérer les transactions en attente
 */
export function useTransactionsEnAttente(filters = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['transactions', 'en-attente', filters],
    queryFn: () => transactionService.getTransactionsEnAttente(filters),
    staleTime: 15000, // 15 secondes (données plus dynamiques)
    refetchInterval: 60000, // Refresh automatique toutes les minutes
    onError: (error) => {
      console.error('❌ [USE_TRANSACTIONS_EN_ATTENTE] Erreur:', error);
      showError(error.message || 'Erreur lors du chargement des transactions en attente');
    }
  });
}

/**
 * ✅ Hook pour récupérer une transaction par ID
 */
export function useTransaction(transactionId) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionService.getTransactionById(transactionId),
    enabled: !!transactionId,
    staleTime: 60000, // 1 minute
    onError: (error) => {
      console.error('❌ [USE_TRANSACTION] Erreur:', error);
      showError(error.message || 'Erreur lors du chargement de la transaction');
    }
  });
}

/**
 * ✅ Hook pour mettre à jour le paiement d'une transaction
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, paiementData }) => 
      transactionService.updatePayment(transactionId, paiementData),
    
    onSuccess: (data, variables) => {
      // Invalider les caches pertinents
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] }); // Si lié à une session
      
      showSuccess(
        data.message || 
        translations?.paymentUpdatedSuccess || 
        'Paiement mis à jour avec succès'
      );
    },
    
    onError: (error) => {
      console.error('❌ [USE_UPDATE_PAYMENT] Erreur:', error);
      showError(
        error.message || 
        translations?.paymentUpdateError || 
        'Erreur lors de la mise à jour du paiement'
      );
    }
  });
}

/**
 * ✅ Hook pour traiter un paiement
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, modePaiement, detailsPaiement }) => 
      transactionService.processPayment(transactionId, modePaiement, detailsPaiement),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      
      showSuccess(
        data.message || 
        translations?.paymentProcessedSuccess || 
        'Paiement traité avec succès'
      );
    },
    
    onError: (error) => {
      console.error('❌ [USE_PROCESS_PAYMENT] Erreur:', error);
      showError(
        error.message || 
        translations?.paymentProcessError || 
        'Erreur lors du traitement du paiement'
      );
    }
  });
}

/**
 * ✅ Hook pour créer une transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (transactionData) => transactionService.createTransaction(transactionData),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      showSuccess(
        data.message || 
        translations?.transactionCreatedSuccess || 
        'Transaction créée avec succès'
      );
    },
    
    onError: (error) => {
      console.error('❌ [USE_CREATE_TRANSACTION] Erreur:', error);
      showError(
        error.message || 
        translations?.transactionCreateError || 
        'Erreur lors de la création de la transaction'
      );
    }
  });
}

/**
 * ✅ Hook pour rembourser une transaction
 */
export function useRefundTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ transactionId, raisonRemboursement }) => 
      transactionService.refundTransaction(transactionId, raisonRemboursement),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      
      showSuccess(
        data.message || 
        translations?.refundProcessedSuccess || 
        'Remboursement traité avec succès'
      );
    },
    
    onError: (error) => {
      console.error('❌ [USE_REFUND_TRANSACTION] Erreur:', error);
      showError(
        error.message || 
        translations?.refundProcessError || 
        'Erreur lors du remboursement'
      );
    }
  });
}

/**
 * ✅ Hook pour supprimer une transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: (transactionId) => transactionService.deleteTransaction(transactionId),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      showSuccess(
        translations?.transactionDeletedSuccess || 
        'Transaction supprimée avec succès'
      );
    },
    
    onError: (error) => {
      console.error('❌ [USE_DELETE_TRANSACTION] Erreur:', error);
      showError(
        error.message || 
        translations?.transactionDeleteError || 
        'Erreur lors de la suppression de la transaction'
      );
    }
  });
}

/**
 * ✅ Hook pour les statistiques de vente
 */
export function useSalesStatistics(filters = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['transactions', 'statistics', filters],
    queryFn: () => transactionService.getSalesStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
    onError: (error) => {
      console.error('❌ [USE_SALES_STATISTICS] Erreur:', error);
      showError(error.message || 'Erreur lors du chargement des statistiques');
    }
  });
}