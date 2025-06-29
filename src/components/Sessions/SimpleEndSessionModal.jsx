import React, { useState, useEffect } from 'react';
import { X, Clock, Calculator, CreditCard, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTerminerSession } from '../../hooks/useSessions';

const SimpleEndSessionModal = ({ isOpen, onClose, session, onSessionEnded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    modePaiement: 'ESPECES',
    montantPaye: 0,
    marquerCommePayee: true,
    notes: ''
  });

  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const terminerSessionMutation = useTerminerSession();
  const isDarkMode = effectiveTheme === 'dark';

  // Utiliser directement le montant estimé stocké dans la session
  useEffect(() => {
    if (isOpen && session) {
      console.log('🔄 [MODAL] Session data:', session);
      
      // Utiliser le montant calculé lors du démarrage de la session
      const montantEstime = session.montantTotal || session.coutCalculeFinal || 0;
      console.log('💰 [MODAL] Montant estimé utilisé:', montantEstime);
      
      setFormData(prev => ({
        ...prev,
        montantPaye: montantEstime
      }));
    }
  }, [isOpen, session]);

  const handleTerminate = async () => {
    try {
      setLoading(true);
      
      const terminationData = {
        modePaiement: formData.modePaiement,
        montantPaye: parseFloat(formData.montantPaye),
        marquerCommePayee: formData.marquerCommePayee,
        notes: formData.notes
      };

      console.log('🛑 [MODAL] Terminaison session:', session.id, terminationData);

      await terminerSessionMutation.mutateAsync({
        sessionId: session.id,
        ...terminationData
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

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} MAD`;
  };

  // Calculer la durée de la session en cours
  const calculateCurrentDuration = () => {
    if (!session?.heureDebut) return 0;
    const debut = new Date(session.heureDebut);
    const maintenant = new Date();
    return Math.floor((maintenant - debut) / (1000 * 60)); // en minutes
  };

  // Récupérer le montant estimé de la session
  const getMontantEstime = () => {
    return session?.montantTotal || session?.coutCalculeFinal || 0;
  };

  if (!isOpen || !session) return null;

  const montantEstime = getMontantEstime();
  const dureeActuelle = calculateCurrentDuration();

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
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Type session:</span>
                <p className="font-medium">{session.typeSession || 'Standard'}</p>
              </div>
            </div>
          </div>

          {/* Options de paiement */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium mb-2 block">Mode de paiement *</span>
              <div className="grid grid-cols-2 gap-2">
                {['ESPECES', 'CARTE', 'VIREMENT', 'CHEQUE'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFormData(prev => ({ ...prev, modePaiement: mode }))}
                    className={`
                      p-3 rounded-lg border text-sm font-medium transition-all
                      ${formData.modePaiement === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : `border-gray-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`
                      }
                    `}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    {mode.charAt(0) + mode.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium mb-2 block">Montant à payer (MAD) *</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.montantPaye}
                onChange={(e) => setFormData(prev => ({ ...prev, montantPaye: e.target.value }))}
                className={`
                  w-full px-3 py-2 border rounded-lg text-lg font-medium
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  }
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                `}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Montant estimé selon le plan tarifaire: {formatCurrency(montantEstime)}
              </p>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.marquerCommePayee}
                onChange={(e) => setFormData(prev => ({ ...prev, marquerCommePayee: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Marquer comme entièrement payée</span>
            </label>
          </div>

          {/* Résumé du paiement */}
          <div className={`
            ${isDarkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-200'}
            border rounded-lg p-4
          `}>
            <div className="flex items-center space-x-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600 dark:text-green-400">Résumé du paiement</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Montant estimé:</span>
                <span className="font-medium">{formatCurrency(montantEstime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant payé:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(formData.montantPaye)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Reste à payer:</span>
                <span className={
                  (montantEstime - formData.montantPaye) <= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }>
                  {formatCurrency(Math.max(0, montantEstime - formData.montantPaye))}
                </span>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium mb-2 block">Notes (optionnel)</span>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes sur la session ou le paiement..."
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              `}
            />
          </label>
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
          <button
            onClick={handleTerminate}
            disabled={loading}
            className="
              flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium 
              hover:bg-red-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center space-x-2
            "
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Terminaison...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Terminer la session</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleEndSessionModal;
