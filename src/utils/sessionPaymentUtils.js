/**
 * 💰 UTILITAIRES DE DÉTECTION DE PAIEMENT DES SESSIONS
 * 
 * Ces utilitaires aident à déterminer l'état de paiement d'une session
 * en analysant différentes sources de données.
 */

/**
 * Détermine si une session a été payée au démarrage
 * @param {Object} session - L'objet session
 * @returns {boolean} - true si la session a été payée au démarrage
 */
export const isSessionPaidAtStart = (session) => {
  if (!session) return false;

  // 1. Vérifier si le montant total > 0 (indication de paiement anticipé)
  const montantTotal = parseFloat(session.montantTotal || 0);
  
  // 2. Vérifier les transactions associées
  const transactions = session.transactions || [];
  const hasTransactions = transactions.length > 0;
  
  // 3. Vérifier le timestamp de première transaction vs début session
  let paymentAtStart = false;
  if (hasTransactions && session.dateHeureDebut) {
    const sessionStart = new Date(session.dateHeureDebut);
    const firstTransaction = transactions.sort((a, b) => 
      new Date(a.createdAt || a.dateHeure) - new Date(b.createdAt || b.dateHeure)
    )[0];
    
    if (firstTransaction) {
      const transactionTime = new Date(firstTransaction.createdAt || firstTransaction.dateHeure);
      const timeDiffMinutes = Math.abs(transactionTime - sessionStart) / (1000 * 60);
      paymentAtStart = timeDiffMinutes <= 5; // Considérer comme "au début" si < 5min
    }
  }

  // 4. Vérifier le montant payé vs montant total
  const montantPaye = parseFloat(session.montantPaye || 0);
  const isFullyPaid = montantPaye >= montantTotal && montantTotal > 0;

  // ✅ CORRECTION: Logs conditionnels pour éviter le spam
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('🔍 [PAYMENT_UTILS] Analyse paiement session:', {
      sessionId: session.id,
      montantTotal,
      montantPaye,
      hasTransactions,
      paymentAtStart,
      isFullyPaid,
      result: montantTotal > 0 || isFullyPaid || paymentAtStart
    });
  }

  // Une session est considérée comme payée au début si :
  // - Elle a un montant total > 0 ET pas d'info de paiement détaillée (= paiement anticipé probable) OU
  // - Elle est entièrement payée selon les données disponibles OU  
  // - Le paiement a été fait dans les 5 premières minutes
  
  // ✅ CORRECTION PRINCIPALE: Si montantTotal > 0 et pas de données de paiement détaillées,
  // c'est probablement un paiement anticipé (cas typique des sessions actives)
  const hasPaymentDetails = session.montantPaye !== undefined || session.resteAPayer !== undefined || session.estPayee !== undefined;
  
  if (montantTotal > 0 && !hasPaymentDetails) {
    console.log('✅ [PAYMENT_UTILS] Paiement anticipé détecté (montantTotal > 0, pas de détails paiement)');
    return true;
  }
  
  return isFullyPaid || paymentAtStart;
};

/**
 * Calcule l'état de paiement d'une session
 * @param {Object} session - L'objet session
 * @returns {Object} - État détaillé du paiement
 */
export const getSessionPaymentStatus = (session) => {
  if (!session) {
    return { 
      status: 'UNKNOWN', 
      needsPayment: false,
      montantTotal: 0,
      montantPaye: 0,
      resteAPayer: 0,
      canTerminate: false,
      paymentRequired: false,
      percentagePaid: 0,
      isPaid: false,
      paidAtStart: false
    };
  }

  const montantTotal = parseFloat(session.montantTotal || 0);
  const montantPaye = parseFloat(session.montantPaye || 0);
  const resteAPayerBackend = parseFloat(session.resteAPayer || 0);
  
  // ✅ Calculs robustes - Prioriser les données du backend si disponibles
  const calculatedReste = resteAPayerBackend >= 0 ? resteAPayerBackend : Math.max(0, montantTotal - montantPaye);
  
  const isFullyPaid = montantPaye >= montantTotal && montantTotal > 0;
  const isPartiallyPaid = montantPaye > 0 && montantPaye < montantTotal;
  const isNotPaid = montantPaye === 0 && montantTotal > 0;
  const isFree = montantTotal === 0;
  
  // ✅ Déterminer si la session a été payée au démarrage
  const paidAtStart = isSessionPaidAtStart(session);

  const result = {
    montantTotal,
    montantPaye, 
    resteAPayer: calculatedReste,
    status: isFree ? 'GRATUIT' : 
            isFullyPaid ? 'PAYE_COMPLET' : 
            isPartiallyPaid ? 'PAYE_PARTIEL' : 'NON_PAYE',
    needsPayment: !isFree && !isFullyPaid,
    canTerminate: true, // Toujours permettre la terminaison
    paymentRequired: calculatedReste > 0,
    percentagePaid: montantTotal > 0 ? Math.round((montantPaye / montantTotal) * 100) : 0,
    isPaid: isFullyPaid || isFree,
    paidAtStart,
    // ✅ NOUVEAUX CHAMPS pour une meilleure gestion
    isPartiallyPaid,
    isNotPaid,
    isFree,
    // ✅ Messages d'état pour l'interface
    statusMessage: getPaymentStatusMessage(isFree, isFullyPaid, isPartiallyPaid, isNotPaid, calculatedReste),
    actionRequired: getActionRequired(isFree, isFullyPaid, isPartiallyPaid, calculatedReste)
  };

  // ✅ CORRECTION: Logs conditionnels pour éviter le spam
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
    console.log('📊 [PAYMENT_UTILS] Statut paiement calculé pour session', session.id, ':', result);
  }
  return result;
};

/**
 * ✅ NOUVEAU: Génère un message d'état lisible
 */
function getPaymentStatusMessage(isFree, isFullyPaid, isPartiallyPaid, isNotPaid, resteAPayer) {
  if (isFree) return 'Session gratuite';
  if (isFullyPaid) return 'Entièrement payée';
  if (isPartiallyPaid) return `Partiellement payée (reste ${formatCurrency(resteAPayer)})`;
  if (isNotPaid) return 'Paiement en attente';
  return 'Statut inconnu';
}

/**
 * ✅ NOUVEAU: Détermine l'action requise pour la terminaison
 */
function getActionRequired(isFree, isFullyPaid, isPartiallyPaid, resteAPayer) {
  if (isFree || isFullyPaid) return 'TERMINER_DIRECTEMENT';
  if (isPartiallyPaid) return 'COMPLETER_PAIEMENT';
  return 'DEMANDER_PAIEMENT';
}

/**
 * Détermine si une session nécessite un paiement lors de la terminaison
 * @param {Object} session - L'objet session
 * @returns {boolean} - true si un paiement est requis
 */
export const sessionNeedsPaymentOnEnd = (session) => {
  const paymentStatus = getSessionPaymentStatus(session);
  
  // ✅ CORRECTION: Logs conditionnels pour éviter le spam
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.02) {
    console.log('🔍 [PAYMENT_UTILS] Vérification besoin de paiement pour session', session?.id, ':', {
      status: paymentStatus.status,
      paidAtStart: paymentStatus.paidAtStart,
      isPaid: paymentStatus.isPaid,
      needsPayment: paymentStatus.needsPayment,
      actionRequired: paymentStatus.actionRequired
    });
  }
  
  // ✅ LOGIQUE AMÉLIORÉE: Tous les cas de paiement
  switch (paymentStatus.actionRequired) {
    case 'TERMINER_DIRECTEMENT':
      return false; // Session gratuite ou entièrement payée
    case 'COMPLETER_PAIEMENT':
    case 'DEMANDER_PAIEMENT':
      return true; // Paiement partiel ou aucun paiement
    default:
      return paymentStatus.needsPayment; // Fallback
  }
};

/**
 * Formatte le montant pour l'affichage
 * @param {number} montant - Le montant à formater
 * @returns {string} - Montant formaté
 */
export const formatCurrency = (montant) => {
  return `${parseFloat(montant || 0).toFixed(2)} MAD`;
};

export default {
  isSessionPaidAtStart,
  getSessionPaymentStatus,
  sessionNeedsPaymentOnEnd,
  formatCurrency
};
