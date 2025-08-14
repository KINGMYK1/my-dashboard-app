import React, { useState, useEffect } from 'react';
import { X, Clock, Calculator, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTerminerSession } from '../../hooks/useSessions';
import { useAjouterTransactionSession, useModifierTransaction, useSupprimerTransaction, useTransactionsBySession } from '../../hooks/useTransactions';
import ConditionalPaymentSection from './ConditionalPaymentSection';
import { getSessionPaymentStatus, sessionNeedsPaymentOnEnd, formatCurrency } from '../../utils/sessionPaymentUtils';

const SimpleEndSessionModal = ({ isOpen, onClose, session, onSessionEnded }) => {
  const [loading, setLoading] = useState(false);
  
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const terminerSessionMutation = useTerminerSession();
  const ajouterTransactionMutation = useAjouterTransactionSession();
  const modifierTransactionMutation = useModifierTransaction();
  const supprimerTransactionMutation = useSupprimerTransaction();
  const isDarkMode = effectiveTheme === 'dark';

  // Récupérer les transactions réelles de cette session depuis l'API
  const { 
    data: transactionsData, 
    isLoading: loadingTransactions,
    refetch: refetchTransactions 
  } = useTransactionsBySession(session?.id, {
    enabled: !!session?.id && isOpen,
    showError: false // Pas d'erreur affichée automatiquement
  });

  // ✅ SOLUTION INTELLIGENTE: Utiliser les utilitaires de détection de paiement
  const paymentStatus = getSessionPaymentStatus(session);
  const needsPaymentOnEnd = sessionNeedsPaymentOnEnd(session);
  
  // Pour les transactions API (données complémentaires)
  const transactionsRaw = transactionsData?.data?.transactions || [];
  
  console.log('🔍 [MODAL_DEBUG] Détection paiement FINALE dans SimpleEndSessionModal:', {
    sessionId: session?.id,
    paymentStatus: {
      status: paymentStatus.status,
      actionRequired: paymentStatus.actionRequired,
      needsPayment: paymentStatus.needsPayment,
      isPaid: paymentStatus.isPaid,
      montantTotal: paymentStatus.montantTotal,
      montantPaye: paymentStatus.montantPaye,
      resteAPayer: paymentStatus.resteAPayer
    },
    needsPaymentOnEnd,
    transactionsCount: transactionsRaw.length,
    isModalOpen: isOpen,
    loadingTransactions
  });

  // Effet pour rafraîchir les transactions quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && session?.id) {
      console.log('🔄 [MODAL] Rafraîchissement transactions pour session:', session.id);
      refetchTransactions();
    }
  }, [isOpen, session?.id, refetchTransactions]);

  // Gestionnaires pour les transactions
  const handleTransactionAdded = async (transactionData) => {
    const result = await ajouterTransactionMutation.mutateAsync(transactionData);
    refetchTransactions(); // Rafraîchir les transactions après ajout
    return result;
  };

  const handleTransactionUpdated = async (transactionId, transactionData) => {
    const result = await modifierTransactionMutation.mutateAsync({ id: transactionId, data: transactionData });
    refetchTransactions(); // Rafraîchir les transactions après modification
    return result;
  };

  const handleTransactionDeleted = async (transactionId) => {
    const result = await supprimerTransactionMutation.mutateAsync(transactionId);
    refetchTransactions(); // Rafraîchir les transactions après suppression
    return result;
  };

  const handleTerminate = async () => {
    if (needsPaymentOnEnd) {
      showError('La session doit être entièrement payée avant d\'être terminée');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🛑 [MODAL] Terminaison session:', session.id);

      await terminerSessionMutation.mutateAsync({
        sessionId: session.id,
        notes: 'Session terminée avec transactions gérées'
      });

      showSuccess('Session terminée avec succès');
      onSessionEnded?.();
      onClose();
      
    } catch (error) {
      console.error('❌ [MODAL] Erreur terminaison:', error);
      showError(error.message || 'Erreur lors de la terminaison');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Calculer la durée de la session en cours
  const calculateCurrentDuration = () => {
    if (!session?.heureDebut) return 0;
    const debut = new Date(session.heureDebut);
    const maintenant = new Date();
    return Math.floor((maintenant - debut) / (1000 * 60)); // en minutes
  };

  if (!isOpen || !session) return null;

  const dureeActuelle = calculateCurrentDuration();

  // Afficher un spinner si les transactions sont en cours de chargement
  if (loadingTransactions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-xl shadow-2xl w-full max-w-md transform transition-all p-6
        `}>
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Chargement des transactions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        rounded-xl shadow-2xl w-full max-w-md transform transition-all
      `}>
        {/* Header */}
        <div className={`
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          border-b px-6 py-4 flex items-center justify-between
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'}
              p-2 rounded-lg
            `}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Terminer la session</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {session.poste?.nom || 'Poste inconnu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`
              ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}
              p-2 rounded-lg transition-colors
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Résumé de la session */}
          <div className={`
            ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-200'}
            border rounded-lg p-4
          `}>
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-600 dark:text-blue-400">Résumé de la session</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Poste:</span>
                <p className="font-medium">{session.poste?.nom || 'Session anonyme'}</p>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Client:</span>
                <p className="font-medium">{session.client?.nom || 'Session anonyme'}</p>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Durée actuelle:</span>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatDuration(dureeActuelle)}
                </p>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Montant total:</span>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(paymentStatus.montantTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Section de paiement intelligente */}
          <ConditionalPaymentSection
            session={session}
            transactionsRaw={transactionsRaw}
            onTransactionAdded={handleTransactionAdded}
            onTransactionUpdated={handleTransactionUpdated}
            onTransactionDeleted={handleTransactionDeleted}
          />

        </div>

        {/* Actions */}
        <div className={`
          ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}
          border-t px-6 py-4 flex space-x-3
        `}>
          <button
            onClick={onClose}
            disabled={loading}
            className={`
              flex-1 px-4 py-2 border rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            Annuler
          </button>
          
          {/* Bouton de terminaison avec logique intelligente */}
          <button
            onClick={handleTerminate}
            disabled={loading || needsPaymentOnEnd}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              flex items-center justify-center space-x-2
              ${!needsPaymentOnEnd 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={needsPaymentOnEnd ? 'La session doit être entièrement payée pour être terminée' : ''}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Terminaison...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>
                  {needsPaymentOnEnd 
                    ? `Paiement requis (${formatCurrency(paymentStatus.resteAPayer)})`
                    : 'Terminer la session'
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleEndSessionModal;
