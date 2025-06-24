import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, AlertCircle, Calculator, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import Portal from '../../components/Portal/Portal';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const PaymentUpdateModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onUpdate, 
  loading = false, 
  formatCurrency 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showError, showWarning } = useNotification();
  
  const isDarkMode = effectiveTheme === 'dark';

  const [formData, setFormData] = useState({
    montantSupplementaire: '',
    modePaiement: 'ESPECES',
    marquerCommePayee: false,
    notes: '',
    derniersChiffresCarte: '',
    typeCarte: ''
  });

  const [errors, setErrors] = useState({});
  const [calculatedValues, setCalculatedValues] = useState({
    nouveauMontantPaye: 0,
    nouveauResteAPayer: 0,
    pourcentagePaye: 0
  });

  // Réinitialiser le formulaire quand la transaction change
  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        montantSupplementaire: '',
        modePaiement: transaction.modePaiement || 'ESPECES',
        marquerCommePayee: false,
        notes: '',
        derniersChiffresCarte: '',
        typeCarte: ''
      });
      setErrors({});
      calculateValues('', false);
    }
  }, [transaction, isOpen]);

  // Calculer les valeurs en temps réel
  const calculateValues = (montantSupplementaire, marquerCommePayee) => {
    if (!transaction) return;

    const montantActuel = parseFloat(transaction.montantPaye) || 0;
    const montantTotal = parseFloat(transaction.montantTTC) || 0;
    const supplement = parseFloat(montantSupplementaire) || 0;

    let nouveauMontantPaye;
    if (marquerCommePayee) {
      nouveauMontantPaye = montantTotal;
    } else {
      nouveauMontantPaye = montantActuel + supplement;
    }

    const nouveauResteAPayer = Math.max(0, montantTotal - nouveauMontantPaye);
    const pourcentagePaye = montantTotal > 0 ? (nouveauMontantPaye / montantTotal) * 100 : 0;

    setCalculatedValues({
      nouveauMontantPaye,
      nouveauResteAPayer,
      pourcentagePaye
    });
  };

  // Gestionnaire de changement des champs
  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Nettoyer les erreurs
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Recalculer les valeurs
    if (field === 'montantSupplementaire' || field === 'marquerCommePayee') {
      calculateValues(
        field === 'montantSupplementaire' ? value : newFormData.montantSupplementaire,
        field === 'marquerCommePayee' ? value : newFormData.marquerCommePayee
      );
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.marquerCommePayee) {
      const montant = parseFloat(formData.montantSupplementaire);
      if (!montant || montant <= 0) {
        newErrors.montantSupplementaire = 'Montant supplémentaire requis';
      } else if (montant > (transaction?.resteAPayer || 0)) {
        newErrors.montantSupplementaire = 'Montant supérieur au reste à payer';
      }
    }

    if (formData.modePaiement === 'CARTE') {
      if (!formData.derniersChiffresCarte || formData.derniersChiffresCarte.length !== 4) {
        newErrors.derniersChiffresCarte = '4 derniers chiffres requis';
      }
      if (!formData.typeCarte) {
        newErrors.typeCarte = 'Type de carte requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const paiementData = {
        montantSupplementaire: formData.marquerCommePayee ? 0 : parseFloat(formData.montantSupplementaire),
        modePaiement: formData.modePaiement,
        marquerCommePayee: formData.marquerCommePayee,
        notes: formData.notes.trim(),
        derniersChiffresCarte: formData.modePaiement === 'CARTE' ? formData.derniersChiffresCarte : null,
        typeCarte: formData.modePaiement === 'CARTE' ? formData.typeCarte : null
      };

      await onUpdate(paiementData);
    } catch (error) {
      // Erreur gérée par le parent
    }
  };

  if (!isOpen || !transaction) return null;

  // Styles
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-white';

  const resteAPayer = parseFloat(transaction.resteAPayer) || 0;
  const estDejaComplete = resteAPayer <= 0;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className={`w-full max-w-2xl ${bgColor}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`${textPrimary} flex items-center gap-2`}>
              <CreditCard size={20} />
              Mise à jour du paiement
            </CardTitle>
            <button
              onClick={onClose}
              disabled={loading}
              className={`${textSecondary} hover:${textPrimary} disabled:opacity-50`}
            >
              <X size={20} />
            </button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations transaction */}
            <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-700`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={textSecondary}>Transaction:</span>
                  <div className={`font-medium ${textPrimary}`}>
                    {transaction.numeroTransaction}
                  </div>
                </div>
                <div>
                  <span className={textSecondary}>Montant total:</span>
                  <div className={`font-medium ${textPrimary}`}>
                    {formatCurrency(transaction.montantTTC)}
                  </div>
                </div>
                <div>
                  <span className={textSecondary}>Déjà payé:</span>
                  <div className={`font-medium ${textPrimary}`}>
                    {formatCurrency(transaction.montantPaye)}
                  </div>
                </div>
                <div>
                  <span className={textSecondary}>Reste à payer:</span>
                  <div className={`font-medium ${resteAPayer > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                    {formatCurrency(resteAPayer)}
                  </div>
                </div>
              </div>
            </div>

            {estDejaComplete ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="text-green-500" size={20} />
                <span className={textPrimary}>
                  Cette transaction est déjà entièrement payée.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Option marquer comme payée */}
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id="marquerCommePayee"
                    checked={formData.marquerCommePayee}
                    onChange={(e) => handleChange('marquerCommePayee', e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="marquerCommePayee" className={`${textPrimary} font-medium flex-1`}>
                    Marquer comme entièrement payée ({formatCurrency(resteAPayer)} restant)
                  </label>
                </div>

                {/* Montant supplémentaire */}
                {!formData.marquerCommePayee && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Montant supplémentaire à encaisser
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={resteAPayer}
                        value={formData.montantSupplementaire}
                        onChange={(e) => handleChange('montantSupplementaire', e.target.value)}
                        disabled={loading}
                        placeholder={`Max: ${formatCurrency(resteAPayer)}`}
                        className={`
                          w-full pl-10 pr-4 py-2 border rounded-lg ${inputBg}
                          ${borderColor} ${textPrimary}
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${errors.montantSupplementaire ? 'border-red-500' : ''}
                        `}
                      />
                    </div>
                    {errors.montantSupplementaire && (
                      <p className="text-red-500 text-xs mt-1">{errors.montantSupplementaire}</p>
                    )}
                  </div>
                )}

                {/* Mode de paiement */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Mode de paiement
                  </label>
                  <select
                    value={formData.modePaiement}
                    onChange={(e) => handleChange('modePaiement', e.target.value)}
                    disabled={loading}
                    className={`
                      w-full px-3 py-2 border rounded-lg ${inputBg}
                      ${borderColor} ${textPrimary}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="CARTE">Carte bancaire</option>
                    <option value="VIREMENT">Virement</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                {/* Détails carte si mode carte */}
                {formData.modePaiement === 'CARTE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        4 derniers chiffres
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        pattern="[0-9]{4}"
                        value={formData.derniersChiffresCarte}
                        onChange={(e) => handleChange('derniersChiffresCarte', e.target.value.replace(/\D/g, ''))}
                        disabled={loading}
                        placeholder="1234"
                        className={`
                          w-full px-3 py-2 border rounded-lg ${inputBg}
                          ${borderColor} ${textPrimary}
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${errors.derniersChiffresCarte ? 'border-red-500' : ''}
                        `}
                      />
                      {errors.derniersChiffresCarte && (
                        <p className="text-red-500 text-xs mt-1">{errors.derniersChiffresCarte}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                        Type de carte
                      </label>
                      <select
                        value={formData.typeCarte}
                        onChange={(e) => handleChange('typeCarte', e.target.value)}
                        disabled={loading}
                        className={`
                          w-full px-3 py-2 border rounded-lg ${inputBg}
                          ${borderColor} ${textPrimary}
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${errors.typeCarte ? 'border-red-500' : ''}
                        `}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="VISA">Visa</option>
                        <option value="MASTERCARD">MasterCard</option>
                        <option value="AMERICAN_EXPRESS">American Express</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                      {errors.typeCarte && (
                        <p className="text-red-500 text-xs mt-1">{errors.typeCarte}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={loading}
                    rows={3}
                    placeholder="Commentaires sur ce paiement..."
                    className={`
                      w-full px-3 py-2 border rounded-lg ${inputBg}
                      ${borderColor} ${textPrimary}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed resize-none
                    `}
                  />
                </div>

                {/* Aperçu calculs */}
                <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator size={16} className="text-blue-600" />
                    <span className={`font-medium ${textPrimary}`}>Aperçu du paiement</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={textSecondary}>Nouveau montant payé:</span>
                      <div className={`font-medium ${textPrimary}`}>
                        {formatCurrency(calculatedValues.nouveauMontantPaye)}
                      </div>
                    </div>
                    
                    <div>
                      <span className={textSecondary}>Nouveau reste à payer:</span>
                      <div className={`font-medium ${calculatedValues.nouveauResteAPayer > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                        {formatCurrency(calculatedValues.nouveauResteAPayer)}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className={textSecondary}>Progression:</span>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(calculatedValues.pourcentagePaye, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs ${textSecondary} mt-1 block`}>
                          {calculatedValues.pourcentagePaye.toFixed(1)}% payé
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={loading || (!formData.marquerCommePayee && !formData.montantSupplementaire)}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement...
                      </div>
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        {formData.marquerCommePayee ? 'Marquer payée' : 'Encaisser'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Portal>
  );
};

export default PaymentUpdateModal;