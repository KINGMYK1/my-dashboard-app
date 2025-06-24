import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Input, Textarea, Select } from '../../components/ui';

const SessionCorrectionModal = ({ session, onClose, onCorrect }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [corrections, setCorrections] = useState({
    dureeEffectiveMinutes: session.dureeEffectiveMinutes || 0,
    coutCalculeFinal: session.coutCalculeFinal || 0,
    notes: session.notes || '',
    raisonCorrection: ''
  });

  const [errors, setErrors] = useState({});

  // Styles
  const getTextColorClass = (isPrimary) => 
    isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-white';

  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Gestionnaires d'événements
  const handleInputChange = (field, value) => {
    setCorrections(prev => ({
      ...prev,
      [field]: value
    }));

    // Validation en temps réel
    validateField(field, value);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'dureeEffectiveMinutes':
        if (!value || value <= 0) {
          newErrors[field] = 'La durée doit être supérieure à 0';
        } else {
          delete newErrors[field];
        }
        break;
      case 'coutCalculeFinal':
        if (!value || value < 0) {
          newErrors[field] = 'Le coût ne peut pas être négatif';
        } else {
          delete newErrors[field];
        }
        break;
      case 'raisonCorrection':
        if (!value || value.trim().length < 10) {
          newErrors[field] = 'La raison doit contenir au moins 10 caractères';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation finale
    const finalErrors = {};
    Object.keys(corrections).forEach(field => {
      validateField(field, corrections[field]);
    });

    if (Object.keys(errors).length === 0 && corrections.raisonCorrection.trim()) {
      onCorrect(corrections);
      onClose();
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { 
      style: 'currency', 
      currency: 'MAD' 
    }).format(price || 0);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${getBgColorClass()} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${getBorderColorClass()}`}>
          <div>
            <h2 className={`text-xl font-bold ${getTextColorClass(true)}`}>
              Corriger la session #{session.numeroSession || session.id}
            </h2>
            <p className={`text-sm ${getTextColorClass(false)} mt-1`}>
              Modifiez les informations de la session terminée
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${getTextColorClass(false)}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Informations actuelles */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className={`font-medium ${getTextColorClass(true)} mb-2`}>
              Valeurs actuelles
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={getTextColorClass(false)}>Durée:</span>
                <span className={`ml-2 font-medium ${getTextColorClass(true)}`}>
                  {formatDuration(session.dureeEffectiveMinutes)}
                </span>
              </div>
              <div>
                <span className={getTextColorClass(false)}>Coût:</span>
                <span className={`ml-2 font-medium ${getTextColorClass(true)}`}>
                  {formatPrice(session.coutCalculeFinal)}
                </span>
              </div>
            </div>
          </div>

          {/* Formulaire de correction */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Durée effective */}
            <div>
              <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-2`}>
                Durée effective (minutes) *
              </label>
              <Input
                type="number"
                value={corrections.dureeEffectiveMinutes}
                onChange={(e) => handleInputChange('dureeEffectiveMinutes', parseInt(e.target.value) || 0)}
                placeholder="Durée en minutes"
                error={errors.dureeEffectiveMinutes}
                min="1"
                step="1"
              />
              {errors.dureeEffectiveMinutes && (
                <p className="text-red-500 text-sm mt-1">{errors.dureeEffectiveMinutes}</p>
              )}
            </div>

            {/* Coût calculé final */}
            <div>
              <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-2`}>
                Coût final (MAD) *
              </label>
              <Input
                type="number"
                value={corrections.coutCalculeFinal}
                onChange={(e) => handleInputChange('coutCalculeFinal', parseFloat(e.target.value) || 0)}
                placeholder="Coût en MAD"
                error={errors.coutCalculeFinal}
                min="0"
                step="0.01"
              />
              {errors.coutCalculeFinal && (
                <p className="text-red-500 text-sm mt-1">{errors.coutCalculeFinal}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-2`}>
                Notes de session
              </label>
              <Textarea
                value={corrections.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notes ou commentaires sur la session..."
                rows="3"
              />
            </div>

            {/* Raison de la correction */}
            <div>
              <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-2`}>
                Raison de la correction *
              </label>
              <Textarea
                value={corrections.raisonCorrection}
                onChange={(e) => handleInputChange('raisonCorrection', e.target.value)}
                placeholder="Expliquez pourquoi cette correction est nécessaire..."
                rows="3"
                error={errors.raisonCorrection}
                required
              />
              {errors.raisonCorrection && (
                <p className="text-red-500 text-sm mt-1">{errors.raisonCorrection}</p>
              )}
            </div>

            {/* Avertissement */}
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className={`text-sm font-medium text-yellow-800 dark:text-yellow-200`}>
                  Attention
                </p>
                <p className={`text-sm text-yellow-700 dark:text-yellow-300`}>
                  Cette correction modifiera définitivement les données de la session. 
                  L'action sera enregistrée dans l'historique pour audit.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-6 border-t ${getBorderColorClass()}`}>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={Object.keys(errors).length > 0 || !corrections.raisonCorrection.trim()}
            className="flex items-center"
          >
            <Save size={16} className="mr-2" />
            Appliquer les corrections
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionCorrectionModal;