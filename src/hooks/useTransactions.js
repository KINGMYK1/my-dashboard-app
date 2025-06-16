import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionService from '../services/transactionService';
import { useNotification } from '../contexts/NotificationContext';

/**
 * ✅ NOUVEAU: Hook pour les transactions en attente
 */
export function useTransactionsEnAttente(filters = {}) {
  const { showError } = useNotification();
  
  return useQuery({
    queryKey: ['transactions', 'pending', filters],
    queryFn: async () => {
      try {
        const response = await transactionService.getTransactionsEnAttente(filters);
        return response;
      } catch (error) {
        console.error('❌ [USE_TRANSACTIONS] Erreur transactions en attente:', error);
        throw error;
      }
    },
    staleTime: 60000,
    onError: (error) => {
      showError(error.message || 'Erreur lors de la récupération des transactions en attente');
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour mettre à jour un paiement
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  return useMutation({
    mutationFn: async ({ transactionId, paiementData }) => {
      return await transactionService.updatePayment(transactionId, paiementData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Paiement mis à jour avec succès');
    },
    onError: (error) => {
      showError(error.message || 'Erreur lors de la mise à jour du paiement');
    }
  });
}

/**
 * ✅ NOUVEAU: Hook pour annuler une transaction
 */
export function useCancelTransaction() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  return useMutation({
    mutationFn: async ({ transactionId, raison }) => {
      return await transactionService.cancelTransaction(transactionId, raison);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showSuccess('Transaction annulée avec succès');
    },
    onError: (error) => {
      showError(error.message || 'Erreur lors de l\'annulation de la transaction');
    }
  });
}