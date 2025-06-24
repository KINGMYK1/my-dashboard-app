import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Portal from '../../../components/Portal/Portal';

const SessionExtendModal = ({ session, isOpen, onClose, onAction, montantEstime }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [extensionData, setExtensionData] = useState({
    dureeSupplementaire: 15,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Options de durée prédéfinies
  const dureesPredefinies = [
    { value: 15, label: '+15 minutes' },
    { value: 30, label: '+30 minutes' },
    { value: 45, label: '+45 minutes' },
    { value: 60, label: '+1 heure' },
    { value: 90, label: '+1h30' },
    { value: 120, label: '+2 heures' }
  ];

  // ✅ Calcul du coût supplémentaire simplifié
  const coutSupplementaire = React.useMemo(() => {
    const tarifHoraire = session?.poste?.typePoste?.tarifHoraireBase || 25;
    return (extensionData.dureeSupplementaire / 60) * tarifHoraire;
  }, [extensionData.dureeSupplementaire, session]);

  const validateForm = () => {
    const newErrors = {};

    // ✅ VALIDATION STRICTE DE LA DURÉE
    const duree = parseInt(extensionData.dureeSupplementaire);
    
    if (!duree || isNaN(duree) || duree < 5) {
      newErrors.dureeSupplementaire = 'Durée minimum: 5 minutes';
    }
    if (duree > 240) {
      newErrors.dureeSupplementaire = 'Durée maximum: 4 heures';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ CORRECTION: Gestionnaire de changement de durée avec validation
  const handleDureeChange = (value) => {
    console.log('🔄 [EXTEND_MODAL] Changement durée input:', { value, type: typeof value });
    
    const duree = parseInt(value);
    const dureeFinale = isNaN(duree) ? 15 : Math.max(5, Math.min(240, duree));
    
    console.log('🔄 [EXTEND_MODAL] Durée finale:', dureeFinale);
    
    setExtensionData(prev => ({ 
      ...prev, 
      dureeSupplementaire: dureeFinale
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ DEBUG COMPLET DES DONNÉES
    console.log('🔍 [EXTEND_MODAL] Début handleSubmit:', {
      extensionData: extensionData,
      dureeSupplementaire: extensionData.dureeSupplementaire,
      dureeType: typeof extensionData.dureeSupplementaire,
      session: session,
      sessionId: session?.id
    });

    if (!validateForm()) {
      console.error('❌ [EXTEND_MODAL] Validation échouée');
      return;
    }

    // ✅ VALIDATION ID DE SESSION
    const sessionId = session?.id;
    if (!sessionId || isNaN(parseInt(sessionId))) {
      console.error('❌ [EXTEND_MODAL] ID de session invalide:', sessionId);
      setErrors({ submit: 'ID de session invalide' });
      return;
    }

    // ✅ VALIDATION STRICTE DE LA DURÉE AVANT ENVOI
    const dureeFinale = parseInt(extensionData.dureeSupplementaire);
    if (!dureeFinale || isNaN(dureeFinale) || dureeFinale < 5) {
      console.error('❌ [EXTEND_MODAL] Durée invalide avant envoi:', {
        original: extensionData.dureeSupplementaire,
        parsed: dureeFinale,
        isNaN: isNaN(dureeFinale)
      });
      setErrors({ submit: `Durée invalide: ${extensionData.dureeSupplementaire}` });
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ DONNÉES VALIDÉES
      const dataToSend = {
        dureeSupplementaireMinutes: dureeFinale,
        notes: extensionData.notes?.trim() || null
      };

      console.log('📤 [EXTEND_MODAL] Données de prolongation VALIDÉES:', {
        sessionId: parseInt(sessionId),
        dataToSend: dataToSend,
        dureeOriginal: extensionData.dureeSupplementaire,
        dureeFinale: dureeFinale
      });
      
      await onAction('prolonger', parseInt(sessionId), dataToSend);
    } catch (error) {
      console.error('❌ [EXTEND_MODAL] Erreur:', error);
      setErrors({ submit: error.message || 'Erreur lors de la prolongation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = () => `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <Plus className="w-5 h-5 text-blue-600" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⏰ Prolonger la session
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Debug en développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 bg-yellow-50 border-b text-xs">
              <p>🔍 Debug: Durée = {extensionData.dureeSupplementaire} ({typeof extensionData.dureeSupplementaire})</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Durée supplémentaire */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Durée supplémentaire (minutes) <span className="text-red-500">*</span>
              </label>
              
              {/* Boutons rapides */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {dureesPredefinies.map((duree) => (
                  <button
                    key={duree.value}
                    type="button"
                    onClick={() => {
                      console.log('🔘 [EXTEND_MODAL] Clic bouton durée:', duree.value);
                      setExtensionData(prev => ({ ...prev, dureeSupplementaire: duree.value }));
                    }}
                    className={`p-2 text-xs rounded border transition-colors ${
                      extensionData.dureeSupplementaire === duree.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {duree.label}
                  </button>
                ))}
              </div>

              {/* Input personnalisé */}
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={extensionData.dureeSupplementaire}
                onChange={(e) => handleDureeChange(e.target.value)}
                className={getInputClass()}
                placeholder="Durée personnalisée"
              />
              {errors.dureeSupplementaire && (
                <p className="mt-1 text-sm text-red-600">{errors.dureeSupplementaire}</p>
              )}
            </div>

            {/* Coût supplémentaire */}
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  💰 Coût supplémentaire:
                </span>
                <span className={`font-bold text-green-600`}>
                  +{coutSupplementaire.toFixed(2)} MAD
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Nouveau total estimé:
                </span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {(montantEstime + coutSupplementaire).toFixed(2)} MAD
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notes (optionnel)
              </label>
              <textarea
                rows={2}
                value={extensionData.notes}
                onChange={(e) => setExtensionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Raison de la prolongation..."
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
                disabled={isSubmitting || !extensionData.dureeSupplementaire}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Extension...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Prolonger (+{extensionData.dureeSupplementaire}min)</span>
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

export default SessionExtendModal;