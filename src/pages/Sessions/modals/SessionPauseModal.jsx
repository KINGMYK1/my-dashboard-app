import React, { useState } from 'react';
import { X, PauseCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Portal from '../../../components/Portal/Portal';

const SessionPauseModal = ({ session, isOpen, onClose, onAction }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [pauseData, setPauseData] = useState({
    raison: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Options de raisons prédéfinies
  const raisonsPause = [
    { value: 'PAUSE_PERSONNELLE', label: '🚶 Pause personnelle' },
    { value: 'PROBLEME_TECHNIQUE', label: '🔧 Problème technique' },
    { value: 'PAUSE_REPAS', label: '🍕 Pause repas' },
    { value: 'INTERRUPTION_CLIENT', label: '💬 Interruption client' },
    { value: 'MAINTENANCE', label: '⚙️ Maintenance' },
    { value: 'AUTRE', label: '📝 Autre (préciser)' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!pauseData.raison || !pauseData.raison.trim()) {
      newErrors.raison = 'La raison de la pause est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // ✅ DEBUGGING: Afficher la session reçue
    console.log('🔍 [PAUSE_MODAL] Session reçue:', session);
    console.log('🔍 [PAUSE_MODAL] Session ID:', session?.id, 'Type:', typeof session?.id);

    const sessionId = session?.id;
    if (!sessionId || isNaN(parseInt(sessionId))) {
      console.error('❌ [PAUSE_MODAL] ID de session invalide:', sessionId);
      setErrors({ submit: 'ID de session invalide' });
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ CORRECTION: Structure des données pour pause avec raison
      const dataToSend = {
        raison: pauseData.raison.trim(),
        notes: pauseData.notes.trim() || null
      };

      console.log('📤 [PAUSE_MODAL] Données de pause pour session', sessionId, ':', dataToSend);
      await onAction('pause', parseInt(sessionId), dataToSend);
    } catch (error) {
      console.error('❌ [PAUSE_MODAL] Erreur:', error);
      setErrors({ submit: error.message || 'Erreur lors de la pause' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = () => `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-md w-full rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <PauseCircle className="w-5 h-5 text-orange-600" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⏸️ Mettre en pause
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Raison de la pause */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Raison de la pause <span className="text-red-500">*</span>
              </label>
              
              {/* Boutons de raisons prédéfinies */}
              <div className="grid grid-cols-1 gap-2 mb-3">
                {raisonsPause.map((raison) => (
                  <button
                    key={raison.value}
                    type="button"
                    onClick={() => setPauseData(prev => ({ ...prev, raison: raison.value }))}
                    className={`p-3 text-left rounded border transition-colors ${
                      pauseData.raison === raison.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {raison.label}
                  </button>
                ))}
              </div>

              {/* Input personnalisé si "AUTRE" sélectionné */}
              {pauseData.raison === 'AUTRE' && (
                <input
                  type="text"
                  value={pauseData.raisonPersonnalisee || ''}
                  onChange={(e) => setPauseData(prev => ({ 
                    ...prev, 
                    raisonPersonnalisee: e.target.value 
                  }))}
                  className={getInputClass()}
                  placeholder="Précisez la raison..."
                />
              )}

              {errors.raison && (
                <p className="mt-1 text-sm text-red-600">{errors.raison}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notes (optionnel)
              </label>
              <textarea
                rows={3}
                value={pauseData.notes}
                onChange={(e) => setPauseData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Commentaires additionnels..."
                className={getInputClass()}
              />
            </div>

            {/* Erreur générale */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Pause...</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    <span>Mettre en pause</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default SessionPauseModal;