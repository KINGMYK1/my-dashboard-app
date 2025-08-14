import React, { useState, useEffect } from 'react';
import { X, PlayCircle, PauseCircle, Plus, StopCircle, AlertTriangle, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Portal from '../../components/Portal/Portal';
import SessionPauseModal from './modals/SessionPauseModal';
import SessionExtendModal from './modals/SessionExtendModal';
import SessionTerminateModal from './modals/SessionTerminateModal';
import SessionCancelModal from './modals/SessionCancelModal';
import { getSessionPaymentStatus, sessionNeedsPaymentOnEnd, formatCurrency } from '../../utils/sessionPaymentUtils';

const SessionActionsModal = ({ 
  session, 
  isOpen, 
  onClose, 
  onAction 
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [activeSubModal, setActiveSubModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Utiliser le calcul robuste du statut de paiement
  const paymentStatus = getSessionPaymentStatus(session);
  const needsPaymentOnEnd = sessionNeedsPaymentOnEnd(session);
  
  console.log('💰 [SESSION_ACTIONS] Détection finale:', {
    sessionId: session?.id,
    paymentStatus,
    needsPaymentOnEnd,
    actionRequired: paymentStatus.actionRequired,
    originalData: {
      montantTotal: session?.montantTotal,
      montantPaye: session?.montantPaye,
      estPayee: session?.estPayee
    }
  });

  // ✅ Gestionnaire d'action "terminate" intelligent
  const handleTerminateAction = async () => {
    if (!session) return;

    const sessionId = session.id;
    if (!sessionId || isNaN(parseInt(sessionId))) {
      console.error('❌ [SESSION_ACTIONS] ID de session invalide pour terminaison:', sessionId);
      setErrors({ submit: 'ID de session invalide' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // ✅ CORRECTION CRITIQUE: Utiliser actionRequired pour déterminer le comportement
      if (paymentStatus.actionRequired === 'TERMINER_DIRECTEMENT') {
        // Session déjà payée → Terminer directement
        console.log('✅ [SESSION_ACTIONS] Terminaison directe (session payée)');
        
        await onAction('terminer', parseInt(sessionId), {
          modePaiement: session.modePaiement || 'ESPECES',
          montantPaye: paymentStatus.montantTotal,
          marquerCommePayee: true,
          notes: 'Session terminée (déjà payée)'
        });
        
        onClose(); // Fermer le modal après succès
      } else {
        // Session nécessite un paiement → Ouvrir sous-modal de terminaison
        console.log('💳 [SESSION_ACTIONS] Ouverture modal paiement');
        setActiveSubModal('terminate');
      }
    } catch (error) {
      console.error('❌ [SESSION_ACTIONS] Erreur terminaison:', error);
      setErrors({ submit: error.message || 'Erreur lors de la terminaison' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Actions conditionnelles basées sur le statut de paiement - Fonction retirée car non utilisée dans cette version
  // La logique est maintenant directement dans le rendu du bouton "Terminer"

  // ✅ Utiliser directement le montant estimé stocké dans la session
  const montantEstime = React.useMemo(() => {
    if (!session) return 0;

    // Priorité 1: Utiliser le montant calculé et stocké dans la session lors du démarrage
    const montantStocke = session.montantTotal || session.coutCalculeFinal;
    if (montantStocke && montantStocke > 0) {
      console.log('💰 [SESSION_ACTIONS] Utilisation montant stocké:', montantStocke);
      return parseFloat(montantStocke);
    }

    // Priorité 2: Utiliser le plan tarifaire si disponible
    if (session.planTarifaire && session.planTarifaire.prix) {
      console.log('📋 [SESSION_ACTIONS] Utilisation plan tarifaire:', session.planTarifaire.prix);
      return parseFloat(session.planTarifaire.prix);
    }

    // Fallback: Calcul horaire (ne devrait pas arriver si le backend fonctionne bien)
    console.warn('⚠️ [SESSION_ACTIONS] Fallback sur calcul horaire');
    const now = new Date();
    const startTime = new Date(session.dateHeureDebut);
    const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    
    const elapsedMs = Math.max(0, now.getTime() - startTime.getTime() - pauseTimeMs);
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    
    const tarifHoraire = session.poste?.typePoste?.tarifHoraireBase || 25;
    return (elapsedMinutes / 60) * tarifHoraire;
  }, [session]);

  useEffect(() => {
    if (isOpen && session) {
      console.log('🔧 [SESSION_ACTIONS] Session reçue:', {
        id: session.id,
        numeroSession: session.numeroSession,
        poste: session.poste?.nom,
        statut: session.statut
      });
      setActiveSubModal(null);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, session]);

  // ✅ CORRECTION: Actions directes avec debug de l'ID
  const handleDirectAction = async (action) => {
    const sessionId = session?.id;
    
    console.log('🔍 [SESSION_ACTIONS] Debug ID session:', {
      sessionObject: session,
      sessionId: sessionId,
      sessionIdType: typeof sessionId,
      sessionIdParsed: parseInt(sessionId),
      isValid: !isNaN(parseInt(sessionId)) && parseInt(sessionId) > 0
    });
    
    if (!sessionId || isNaN(parseInt(sessionId)) || parseInt(sessionId) <= 0) {
      console.error('❌ [SESSION_ACTIONS] ID de session invalide:', sessionId);
      setErrors({ submit: 'ID de session invalide ou manquant' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      console.log(`🚀 [SESSION_ACTIONS] Action directe ${action} pour session ID: ${sessionId}`);
      await onAction(action, parseInt(sessionId));
      onClose();
    } catch (error) {
      console.error(`❌ [SESSION_ACTIONS] Erreur ${action}:`, error);
      setErrors({ submit: error.message || `Erreur lors de l'action ${action}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSubModal = (modalType) => {
    const sessionId = session?.id;
    
    if (!sessionId || isNaN(parseInt(sessionId))) {
      console.error('❌ [SESSION_ACTIONS] ID de session invalide pour sous-modal:', sessionId);
      setErrors({ submit: 'ID de session invalide' });
      return;
    }

    console.log(`🔄 [SESSION_ACTIONS] Ouverture sous-modal: ${modalType} pour session ID: ${sessionId}`);
    setActiveSubModal(modalType);
    setErrors({});
  };

  const handleCloseSubModal = () => {
    console.log('🔄 [SESSION_ACTIONS] Fermeture sous-modal');
    setActiveSubModal(null);
    setErrors({});
  };

  // ✅ CORRECTION: Dans le gestionnaire de sous-modal
  const handleSubModalAction = async (action, sessionId, data = {}) => {
    if (!sessionId || isNaN(parseInt(sessionId))) {
      setErrors({ submit: 'ID de session invalide' });
      return;
    }

    try {
      // ✅ CORRECTION: Logs détaillés pour debug
      console.log('🚀 [SESSION_ACTIONS] Action sous-modal AVANT traitement:', {
        action: action,
        sessionId: sessionId,
        dataReceived: data,
        dataType: typeof data,
        dataKeys: Object.keys(data || {}),
        dataEntries: Object.entries(data || {})
      });

      // ✅ Traitement spécial pour terminaison
      if (action === 'terminer') {
        console.log('🛑 [SESSION_ACTIONS] Données de terminaison détaillées:', {
          montantPaye: data.montantPaye,
          montantPayeType: typeof data.montantPaye,
          modePaiement: data.modePaiement,
          marquerCommePayee: data.marquerCommePayee,
          notes: data.notes
        });
      }

      await onAction(action, parseInt(sessionId), data);
      setActiveSubModal(null);
      onClose();
    } catch (error) {
      console.error(`❌ [SESSION_ACTIONS] Erreur sous-modal ${action}:`, error);
      setErrors({ submit: error.message || `Erreur lors de l'action ${action}` });
    }
  };

  if (!isOpen || !session) return null;

  const sessionId = session?.id;
  if (!sessionId || isNaN(parseInt(sessionId))) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center">
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ❌ Erreur
              </h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ID de session invalide: {sessionId} (Type: {typeof sessionId})
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // ✅ Rendu des sous-modaux
  if (activeSubModal) {
    const commonProps = {
      session,
      isOpen: true,
      onClose: handleCloseSubModal,
      onAction: handleSubModalAction,
      montantEstime
    };

    switch (activeSubModal) {
      case 'pause':
        return <SessionPauseModal {...commonProps} />;
      case 'extend':
        return <SessionExtendModal {...commonProps} />;
      case 'terminate':
        // ✅ CORRECTION: Ne montrer le sous-modal que si un paiement est nécessaire
        if (paymentStatus.actionRequired !== 'TERMINER_DIRECTEMENT') {
          return <SessionTerminateModal {...commonProps} />;
        } else {
          // Session déjà payée, on ne devrait pas arriver ici car le bouton fait une action directe
          console.warn('⚠️ [SESSION_ACTIONS] Tentative d\'ouverture sous-modal pour session payée');
          setActiveSubModal(null);
          return null;
        }
      case 'cancel':
        return <SessionCancelModal {...commonProps} />;
      default:
        setActiveSubModal(null);
        break;
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🎮 Gérer la Session
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Session #{session.numeroSession} - {session.poste?.nom} (ID: {sessionId})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* ✅ Affichage du statut de paiement */}
            <div className={`p-4 rounded-lg border mb-4 ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  💰 Statut de paiement:
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  paymentStatus.status === 'PAYE_COMPLET' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : paymentStatus.status === 'PAYE_PARTIEL'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {paymentStatus.statusMessage}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Montant total:</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(paymentStatus.montantTotal)}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Montant payé:</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(paymentStatus.montantPaye)}
                  </p>
                </div>
              </div>
              
              {paymentStatus.actionRequired === 'TERMINER_DIRECTEMENT' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✅ La session peut être terminée directement
                </p>
              )}
              
              {paymentStatus.resteAPayer > 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  ⚠️ Reste à payer: {formatCurrency(paymentStatus.resteAPayer)}
                </p>
              )}
            </div>
            {/* Informations de la session */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Informations de la session
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Client:</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {session.client ? `${session.client.prenom} ${session.client.nom}` : 'Session anonyme'}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Statut:</p>
                  <p className={`font-medium ${
                    session.statut === 'EN_COURS' ? 'text-green-600' :
                    session.statut === 'EN_PAUSE' ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    {session.statut === 'EN_COURS' ? '🟢 En cours' :
                     session.statut === 'EN_PAUSE' ? '🟡 En pause' :
                     session.statut}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Montant estimé:</p>
                  <p className={`font-bold text-green-600`}>
                    💰 {montantEstime.toFixed(2)} MAD
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Jeu:</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    🎮 {session.jeuPrincipal || 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div>
              <h3 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⚡ Actions rapides
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Actions selon le statut */}
                {session.statut === 'EN_COURS' && (
                    <button
                    onClick={() => handleOpenSubModal('pause')}
                      disabled={isSubmitting}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <PauseCircle className="w-5 h-5" />
                    <span>⏸️ Mettre en pause</span>
                    </button>
                )}

                {session.statut === 'EN_PAUSE' && (
                  <button
                    onClick={() => handleDirectAction('reprendre')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>▶️ Reprendre</span>
                  </button>
                )}

                {/* Prolonger */}
                <button
                  onClick={() => handleOpenSubModal('extend')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>⏰ Prolonger</span>
                </button>

                {/* ✅ REMIS: Annuler */}
                <button
                  onClick={() => handleOpenSubModal('cancel')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span>❌ Annuler</span>
                </button>
              </div>
            </div>

            {/* Action principale: Terminer */}
            <div className="border-t pt-6">
              {paymentStatus.actionRequired === 'TERMINER_DIRECTEMENT' ? (
                <button
                  onClick={handleTerminateAction}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>✅ Terminer la session (déjà payée)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenSubModal('terminate')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>💳 Terminer ({formatCurrency(paymentStatus.resteAPayer)} à payer)</span>
                </button>
              )}
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">❌ {errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};
export default SessionActionsModal;