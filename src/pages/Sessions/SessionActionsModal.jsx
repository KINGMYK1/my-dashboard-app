import React, { useState, useEffect } from 'react';
import { X, Square, Clock, XCircle, Pause, Play, Plus, CheckCircle, Euro } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import Portal from '../Portal/Portal';

const SessionActionsModal = ({
  isOpen,
  onClose,
  session,
  onAction,
}) => {
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    raison: '',
    notes: '',
    modePaiement: 'ESPECES',
    montantPaye: '',
    marquerCommePayee: false,
    dureeSupplementaireMinutes: '30',
  });
  const [loading, setLoading] = useState(false);

  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError, showWarning } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // Réinitialiser le formulaire
  useEffect(() => {
    if (isOpen && session) {
      setActionType(null);
      setFormData({
        raison: '',
        notes: '',
        modePaiement: 'ESPECES',
        montantPaye: session?.montantTotal?.toString() || '',
        marquerCommePayee: false,
        dureeSupplementaireMinutes: '30',
      });
    }
  }, [isOpen, session]);

  const handleActionChange = (action) => {
    console.log('🎯 Action sélectionnée:', action);
    setActionType(action);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    handleInputChange(name, type === 'checkbox' ? checked : value);
  };

  // ✅ CORRECTION: Logique de soumission corrigée
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actionType) return;

    console.log('🚀 Soumission action:', actionType, formData);

    try {
      setLoading(true);

      // Validation selon l'action
      switch (actionType) {
        case 'pause':
          if (!formData.raison.trim()) {
            showError('Veuillez saisir une raison pour la pause');
            return;
          }
          break;

        case 'prolonger':
          if (!formData.dureeSupplementaireMinutes || parseInt(formData.dureeSupplementaireMinutes) <= 0) {
            showError('Veuillez saisir une durée de prolongation valide');
            return;
          }
          break;

        case 'terminer':
          if (!formData.modePaiement) {
            showError('Veuillez sélectionner un mode de paiement');
            return;
          }
          if (isNaN(parseFloat(formData.montantPaye)) || parseFloat(formData.montantPaye) < 0) {
            showError('Veuillez saisir un montant payé valide');
            return;
          }
          break;

        case 'annuler':
          if (!formData.raison.trim()) {
            showError('Veuillez saisir une raison pour l\'annulation');
            return;
          }
          break;
      }

      // ✅ CORRECTION: Appel de la fonction onAction avec les bonnes données
      console.log('📤 Envoi des données vers parent:', actionType, formData);
      
      // Appeler la fonction parent
      await onAction(actionType, formData);
      
      // Le succès est géré dans le composant parent
      onClose();

    } catch (error) {
      console.error('❌ Erreur action:', error);
      showError(error.message || `Erreur lors de l'action ${actionType}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

  // Styles
  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputClass = `w-full p-3 border rounded-lg ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const labelClass = `block text-sm font-medium mb-2 ${textPrimary}`;

  // ✅ Actions disponibles selon l'état de la session
  const getAvailableActions = () => {
    const actions = [];

    if (session.statut === 'EN_COURS') {
      actions.push({
        id: 'pause',
        label: 'Mettre en pause',
        icon: Pause,
        color: 'bg-orange-600 hover:bg-orange-700',
        description: 'Suspendre temporairement la session'
      });

      actions.push({
        id: 'prolonger',
        label: 'Prolonger',
        icon: Plus,
        color: 'bg-blue-600 hover:bg-blue-700',
        description: 'Ajouter du temps à la session'
      });

      actions.push({
        id: 'terminer',
        label: 'Terminer',
        icon: Square,
        color: 'bg-green-600 hover:bg-green-700',
        description: 'Terminer la session et procéder au paiement'
      });
    }

    if (session.statut === 'EN_PAUSE') {
      actions.push({
        id: 'reprendre',
        label: 'Reprendre',
        icon: Play,
        color: 'bg-green-600 hover:bg-green-700',
        description: 'Reprendre le chronométrage de la session'
      });

      actions.push({
        id: 'terminer',
        label: 'Terminer',
        icon: Square,
        color: 'bg-red-600 hover:bg-red-700',
        description: 'Terminer définitivement la session'
      });
    }

    // Action d'annulation toujours disponible
    actions.push({
      id: 'annuler',
      label: 'Annuler la session',
      icon: XCircle,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Annuler la session sans facturation'
    });

    return actions;
  };

  const availableActions = getAvailableActions();

  const renderActionForm = () => {
    if (!actionType) return null;

    switch (actionType) {
      case 'pause':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Raison de la pause *</label>
              <input
                type="text"
                name="raison"
                value={formData.raison}
                onChange={handleChange}
                className={inputClass}
                placeholder="Pause client, problème technique..."
                required
              />
            </div>
            <div>
              <label className={labelClass}>Notes (optionnel)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>
        );

      case 'reprendre':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Notes (optionnel)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Notes sur la reprise de session..."
              />
            </div>
          </div>
        );

      case 'prolonger':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Durée supplémentaire (minutes) *</label>
              <select
                name="dureeSupplementaireMinutes"
                value={formData.dureeSupplementaireMinutes}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Notes (optionnel)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Raison de la prolongation..."
              />
            </div>
          </div>
        );

      case 'terminer':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Mode de paiement *</label>
              <select
                name="modePaiement"
                value={formData.modePaiement}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="ESPECES">Espèces</option>
                <option value="CARTE">Carte bancaire</option>
                <option value="VIREMENT">Virement</option>
                <option value="CHEQUE">Chèque</option>
                <option value="GRATUIT">Gratuit</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Montant payé *</label>
              <input
                type="number"
                name="montantPaye"
                step="0.01"
                value={formData.montantPaye}
                onChange={handleChange}
                className={inputClass}
                placeholder="Montant en MAD"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="marquerCommePayee"
                name="marquerCommePayee"
                checked={formData.marquerCommePayee}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="marquerCommePayee" className={`text-sm ${textSecondary}`}>
                Marquer comme payée
              </label>
            </div>

            <div>
              <label className={labelClass}>Notes de fin de session</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Observations, incidents, satisfaction client..."
              />
            </div>
          </div>
        );

      case 'annuler':
        return (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Raison de l'annulation *</label>
              <textarea
                name="raison"
                value={formData.raison}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Problème technique, demande client..."
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className={`${bgClass} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
          {/* En-tête */}
          <div className={`flex items-center justify-between p-6 border-b ${borderClass}`}>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Actions de session
              </h2>
              <p className={`text-sm ${textSecondary} mt-1`}>
                {session.poste?.nom || session.Poste?.nom} - {session.statut}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${textSecondary}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {!actionType ? (
              <div className="space-y-3">
                <p className={`text-sm ${textSecondary} mb-4`}>
                  Choisissez une action à effectuer :
                </p>
                {availableActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionChange(action.id)}
                    className={`w-full p-4 rounded-lg ${action.color} text-white hover:opacity-90 transition-all duration-200 flex items-center space-x-3`}
                  >
                    <action.icon size={20} />
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-white/80">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className={`text-sm ${textSecondary} hover:underline`}
                  >
                    ← Retour aux actions
                  </button>
                </div>
                
                {renderActionForm()}

                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Confirmer'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    disabled={loading}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default SessionActionsModal;