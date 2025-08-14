import React, { createContext, useContext, useState, useCallback } from 'react';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  // État des sessions avec paiement anticipé
  const [sessionsPayees, setSessionsPayees] = useState(new Map());

  // Marquer une session comme payée
  const marquerSessionPayee = useCallback((sessionId, paiementInfo) => {
    console.log('💳 [PAYMENT_CONTEXT] Marquage session payée:', sessionId, paiementInfo);
    setSessionsPayees(prev => new Map(prev.set(sessionId, {
      montantPaye: paiementInfo.montantPaye,
      modePaiement: paiementInfo.modePaiement,
      marquerCommePayee: paiementInfo.marquerCommePayee,
      datePaiement: new Date(),
      type: 'PAIEMENT_ANTICIPE'
    })));
  }, []);

  // Vérifier si une session est déjà payée
  const estSessionPayee = useCallback((sessionId) => {
    return sessionsPayees.has(sessionId);
  }, [sessionsPayees]);

  // Obtenir les informations de paiement d'une session
  const getInfoPaiement = useCallback((sessionId) => {
    return sessionsPayees.get(sessionId) || null;
  }, [sessionsPayees]);

  // Supprimer une session du contexte (quand elle est terminée)
  const supprimerSession = useCallback((sessionId) => {
    console.log('🗑️ [PAYMENT_CONTEXT] Suppression session:', sessionId);
    setSessionsPayees(prev => {
      const newMap = new Map(prev);
      newMap.delete(sessionId);
      return newMap;
    });
  }, []);

  // Obtenir le montant restant à payer pour une session
  const getMontantRestant = useCallback((sessionId, montantTotal) => {
    const infoPaiement = getInfoPaiement(sessionId);
    if (!infoPaiement) return montantTotal;
    
    const montantPaye = infoPaiement.montantPaye || 0;
    return Math.max(0, montantTotal - montantPaye);
  }, [getInfoPaiement]);

  const value = {
    marquerSessionPayee,
    estSessionPayee,
    getInfoPaiement,
    supprimerSession,
    getMontantRestant,
    sessionsPayees: Array.from(sessionsPayees.entries())
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentContext;
