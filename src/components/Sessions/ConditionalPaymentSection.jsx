import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionPaymentStatus, formatCurrency } from '../../utils/sessionPaymentUtils';
import TransactionManager from './TransactionManager';

/**
 * Composant de gestion intelligente du paiement de session
 * Affiche le bon contenu selon le statut de paiement de la session
 */
const ConditionalPaymentSection = ({ 
  session, 
  transactionsRaw = [],
  onTransactionAdded,
  onTransactionUpdated,
  onTransactionDeleted 
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  
  // ✅ LOGIQUE CENTRALISÉE: Utiliser les utilitaires de paiement
  const paymentStatus = getSessionPaymentStatus(session);
  
  console.log('💳 [PAYMENT_SECTION] Rendu conditionnel:', {
    sessionId: session?.id,
    status: paymentStatus.status,
    needsPayment: paymentStatus.needsPayment,
    actionRequired: paymentStatus.actionRequired,
    isPaid: paymentStatus.isPaid
  });

  // ✅ AFFICHAGE CONDITIONNEL basé sur actionRequired
  switch (paymentStatus.actionRequired) {
    case 'TERMINER_DIRECTEMENT':
      // Session gratuite ou entièrement payée
      return (
        <div className={`
          ${isDarkMode ? 'bg-green-900 border-green-700 text-green-100' : 'bg-green-50 border-green-200 text-green-800'}
          border rounded-lg p-4
        `}>
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <h3 className="font-semibold">
                {paymentStatus.isFree ? 'Session gratuite' : 'Session entièrement payée'}
              </h3>
              <p className="text-sm opacity-80">
                {paymentStatus.isFree 
                  ? 'Cette session n\'a pas de frais associés'
                  : paymentStatus.paidAtStart 
                    ? 'Le paiement a été effectué au début de la session'
                    : 'La session a été entièrement payée'
                }
              </p>
              
              {!paymentStatus.isFree && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-70">Montant payé:</span>
                    <span className="font-medium ml-1">{formatCurrency(paymentStatus.montantPaye)}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Statut:</span>
                    <span className="font-medium ml-1">✓ {paymentStatus.statusMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'COMPLETER_PAIEMENT':
    case 'DEMANDER_PAIEMENT':
      // Session partiellement payée ou non payée
      return (
        <>
          {/* Alerte de paiement requis */}
          <div className={`
            ${isDarkMode ? 'bg-orange-900 border-orange-700 text-orange-100' : 'bg-orange-50 border-orange-200 text-orange-800'}
            border rounded-lg p-4
          `}>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {paymentStatus.actionRequired === 'COMPLETER_PAIEMENT' 
                    ? 'Paiement à compléter' 
                    : 'Paiement requis'
                  }
                </h3>
                <p className="text-sm opacity-80">
                  {paymentStatus.actionRequired === 'COMPLETER_PAIEMENT'
                    ? 'Cette session a été partiellement payée'
                    : 'Cette session doit être payée avant d\'être terminée'
                  }
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="opacity-70">Montant dû:</span>
                    <span className="font-medium ml-1">{formatCurrency(paymentStatus.resteAPayer)}</span>
                  </div>
                  <div>
                    <span className="opacity-70">Déjà payé:</span>
                    <span className="font-medium ml-1">{formatCurrency(paymentStatus.montantPaye)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gestionnaire de transactions */}
          <TransactionManager
            session={{
              ...session,
              transactions: transactionsRaw
            }}
            onTransactionAdded={onTransactionAdded}
            onTransactionUpdated={onTransactionUpdated}
            onTransactionDeleted={onTransactionDeleted}
          />
        </>
      );

    default:
      // Fallback pour les cas non prévus
      console.warn('⚠️ [PAYMENT_SECTION] Action non reconnue:', paymentStatus.actionRequired);
      return (
        <div className={`
          ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}
          border rounded-lg p-4 text-center
        `}>
          <p className="text-sm">Statut de paiement en cours d'analyse...</p>
          <p className="text-xs opacity-70 mt-1">
            Action: {paymentStatus.actionRequired} | Statut: {paymentStatus.status}
          </p>
        </div>
      );
  }
};

export default ConditionalPaymentSection;
