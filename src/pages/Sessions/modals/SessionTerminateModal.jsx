import React, { useState, useEffect } from 'react';
import { X, StopCircle, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Portal from '../../../components/Portal/Portal';

const SessionTerminateModal = ({ session, isOpen, onClose, onAction, montantEstime }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [terminaisonData, setTerminaisonData] = useState({
    modePaiement: 'ESPECES',
    montantPaye: 0,
    marquerCommePayee: false,
    notes: '',
    appliquerReduction: false,
    pourcentageReduction: 0,
    raisonReduction: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Options de modes de paiement
  const modesPaiement = [
    { value: 'ESPECES', label: '💵 Espèces', icon: '💵' },
    { value: 'CARTE', label: '💳 Carte bancaire', icon: '💳' },
    { value: 'VIREMENT', label: '🏦 Virement', icon: '🏦' },
    { value: 'CHEQUE', label: '📝 Chèque', icon: '📝' },
    { value: 'AUTRE', label: '❓ Autre', icon: '❓' }
  ];

  // ✅ Calcul du montant final après réductions
  const montantFinal = React.useMemo(() => {
    let montant = montantEstime;
    
    if (terminaisonData.appliquerReduction && terminaisonData.pourcentageReduction > 0) {
      const reduction = (montant * terminaisonData.pourcentageReduction) / 100;
      montant = Math.max(0, montant - reduction);
    }
    
    return montant;
  }, [montantEstime, terminaisonData.appliquerReduction, terminaisonData.pourcentageReduction]);

  // ✅ Calcul du reste à payer
  const resteAPayer = React.useMemo(() => {
    return Math.max(0, montantFinal - parseFloat(terminaisonData.montantPaye || 0));
  }, [montantFinal, terminaisonData.montantPaye]);

  // ✅ Initialisation avec montant estimé
  useEffect(() => {
    if (isOpen && montantEstime) {
      setTerminaisonData(prev => ({
        ...prev,
        montantPaye: montantEstime
      }));
    }
  }, [isOpen, montantEstime]);

  const validateForm = () => {
    const newErrors = {};

    if (!terminaisonData.modePaiement) {
      newErrors.modePaiement = 'Mode de paiement requis';
    }

    const montantPaye = parseFloat(terminaisonData.montantPaye);
    if (isNaN(montantPaye) || montantPaye < 0) {
      newErrors.montantPaye = 'Montant invalide';
    }

    if (terminaisonData.marquerCommePayee && resteAPayer > 0.01) {
      newErrors.montantPaye = 'Le montant doit couvrir le coût total pour marquer comme payée';
    }

    if (terminaisonData.appliquerReduction) {
      if (!terminaisonData.pourcentageReduction || terminaisonData.pourcentageReduction <= 0) {
        newErrors.pourcentageReduction = 'Pourcentage de réduction requis';
      }
      if (terminaisonData.pourcentageReduction > 100) {
        newErrors.pourcentageReduction = 'Pourcentage maximum: 100%';
      }
      if (!terminaisonData.raisonReduction.trim()) {
        newErrors.raisonReduction = 'Raison de la réduction requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSend = {
        modePaiement: terminaisonData.modePaiement.toUpperCase(),
        montantPaye: parseFloat(terminaisonData.montantPaye) || 0,
        marquerCommePayee: Boolean(terminaisonData.marquerCommePayee),
        notes: terminaisonData.notes.trim() || null,
        appliquerReduction: terminaisonData.appliquerReduction,
        pourcentageReduction: terminaisonData.appliquerReduction ? parseFloat(terminaisonData.pourcentageReduction) : 0,
        raisonReduction: terminaisonData.appliquerReduction ? terminaisonData.raisonReduction.trim() : null,
        montantOriginal: montantEstime,
        montantFinal: montantFinal
      };

      console.log('📤 [TERMINATE_MODAL] Données de terminaison:', dataToSend);
      await onAction('terminer', session.id, dataToSend);
    } catch (error) {
      console.error('❌ [TERMINATE_MODAL] Erreur:', error);
      setErrors({ submit: error.message || 'Erreur lors de la terminaison' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Fonction de paiement complet
  const handlePaiementComplet = () => {
    console.log('💰 [TERMINATE_MODAL] Paiement complet demandé - Montant:', montantFinal);
    
    setTerminaisonData(prev => ({
      ...prev,
      montantPaye: montantFinal,
      marquerCommePayee: true
    }));
  };

  const getInputClass = () => `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <StopCircle className="w-5 h-5 text-red-600" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🏁 Terminer la session
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Résumé de la session */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Résumé de la session
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Poste:</span>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{session.poste?.nom}</p>
                </div>
                <div>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Client:</span>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {session.client ? `${session.client.prenom} ${session.client.nom}` : 'Session anonyme'}
                  </p>
                </div>
              </div>
            </div>

            {/* Réduction optionnelle */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="appliquerReduction"
                  checked={terminaisonData.appliquerReduction}
                  onChange={(e) => setTerminaisonData(prev => ({ 
                    ...prev, 
                    appliquerReduction: e.target.checked,
                    pourcentageReduction: e.target.checked ? prev.pourcentageReduction : 0,
                    raisonReduction: e.target.checked ? prev.raisonReduction : ''
                  }))}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="appliquerReduction" className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎫 Appliquer une réduction
                </label>
              </div>

              {terminaisonData.appliquerReduction && (
                <div className="space-y-3 pl-7">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Pourcentage (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={terminaisonData.pourcentageReduction}
                        onChange={(e) => setTerminaisonData(prev => ({ 
                          ...prev, 
                          pourcentageReduction: parseFloat(e.target.value) || 0
                        }))}
                        className={getInputClass()}
                        placeholder="Ex: 10"
                      />
                      {errors.pourcentageReduction && (
                        <p className="mt-1 text-xs text-red-600">{errors.pourcentageReduction}</p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Réduction (MAD)
                      </label>
                      <input
                        type="text"
                        value={`-${((montantEstime * terminaisonData.pourcentageReduction) / 100).toFixed(2)} MAD`}
                        readOnly
                        className={`${getInputClass()} bg-gray-100 dark:bg-gray-600 cursor-not-allowed`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Raison de la réduction <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={terminaisonData.raisonReduction}
                      onChange={(e) => setTerminaisonData(prev => ({ 
                        ...prev, 
                        raisonReduction: e.target.value 
                      }))}
                      placeholder="Ex: Client fidèle, problème technique..."
                      className={getInputClass()}
                    />
                    {errors.raisonReduction && (
                      <p className="mt-1 text-xs text-red-600">{errors.raisonReduction}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mode de paiement */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Mode de paiement <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {modesPaiement.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setTerminaisonData(prev => ({ ...prev, modePaiement: mode.value }))}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                      terminaisonData.modePaiement === mode.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                    }`}
                  >
                    <span className="block">{mode.icon}</span>
                    <span className="font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
              {errors.modePaiement && (
                <p className="mt-1 text-sm text-red-600">{errors.modePaiement}</p>
              )}
            </div>

            {/* Montant payé */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Montant payé (MAD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={terminaisonData.montantPaye}
                onChange={(e) => setTerminaisonData(prev => ({ 
                  ...prev, 
                  montantPaye: parseFloat(e.target.value) || 0
                }))}
                className={getInputClass()}
                placeholder={montantFinal.toFixed(2)}
              />
              {errors.montantPaye && (
                <p className="mt-1 text-sm text-red-600">{errors.montantPaye}</p>
              )}
            </div>

            {/* Options de paiement */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="marquerCommePayee"
                  checked={terminaisonData.marquerCommePayee}
                  onChange={(e) => setTerminaisonData(prev => ({ 
                    ...prev, 
                    marquerCommePayee: e.target.checked 
                  }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="marquerCommePayee" className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ✅ Marquer comme entièrement payée
                </label>
              </div>

              {/* Bouton paiement complet */}
              <button
                type="button"
                onClick={handlePaiementComplet}
                className="w-full text-sm bg-green-100 text-green-800 p-3 rounded-lg border border-green-300 hover:bg-green-200 transition-colors"
              >
                💰 Paiement complet ({montantFinal.toFixed(2)} MAD)
              </button>
            </div>

            {/* Résumé financier */}
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  💰 Résumé du paiement
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Montant original:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{montantEstime.toFixed(2)} MAD</span>
                </div>
                {terminaisonData.appliquerReduction && terminaisonData.pourcentageReduction > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Réduction ({terminaisonData.pourcentageReduction}%):</span>
                    <span>-{((montantEstime * terminaisonData.pourcentageReduction) / 100).toFixed(2)} MAD</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Montant final:</span>
                  <span className="text-blue-600">{montantFinal.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Montant payé:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{Number(terminaisonData.montantPaye).toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Reste à payer:</span>
                  <span className={resteAPayer > 0.01 ? 'text-red-600' : 'text-green-600'}>
                    {resteAPayer.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notes (optionnel)
              </label>
              <textarea
                rows={3}
                value={terminaisonData.notes}
                onChange={(e) => setTerminaisonData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Notes sur la session ou le paiement..."
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Terminaison...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Terminer</span>
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

export default SessionTerminateModal;