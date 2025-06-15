import React, { useState, useEffect, useMemo } from 'react';
import Portal from '../../components/Portal/Portal';

import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useVendreAbonnement, 
  useCalculerPrixAbonnement 
} from '../../hooks/useAbonnements';
import { useTypesAbonnements } from '../../hooks/useTypesAbonnements';
import { useClients } from '../../hooks/useClients';
import { 
  X, 
  CreditCard, 
  User, 
  Package, 
  Euro, Calendar,FileText,
  Calculator, 
  Save, 
  AlertCircle,
  Star 
} from 'lucide-react';

const VenteAbonnementForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    typeAbonnementId: '',
    dateDebut: new Date().toISOString().split('T')[0],
    modePaiement: 'ESPECES',
    reductionPromo: '',
    montantPaye: '',
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const vendreAbonnementMutation = useVendreAbonnement();
  const calculerPrixAbonnementMutation = useCalculerPrixAbonnement();

  const { data: clientsData, isLoading: isLoadingClients, error: errorClients } = useClients();
  // ✅ CORRECTION: Extraire correctement les clients
  const clients = clientsData?.data?.clients || clientsData?.clients || [];

  const { data: typesAbonnementsData, isLoading: isLoadingTypesAbonnements, error: errorTypesAbonnements } = useTypesAbonnements();
  // ✅ CORRECTION: Extraire correctement les types d'abonnements
  const typesAbonnements = typesAbonnementsData?.data || [];

  // DEBUG LOGS améliorés
  useEffect(() => {
    console.log("[VenteAbonnementForm] 🔍 DEBUG DÉTAILLÉ:");
    console.log("- clientsData:", clientsData);
    console.log("- clientsData?.data:", clientsData?.data);
    console.log("- clientsData?.clients:", clientsData?.clients);
    console.log("- clients extraits:", clients);
    console.log("- typesAbonnementsData:", typesAbonnementsData);
    console.log("- typesAbonnementsData?.data:", typesAbonnementsData?.data);
    console.log("- typesAbonnements extraits:", typesAbonnements);
    console.log("- isLoadingClients:", isLoadingClients);
    console.log("- isLoadingTypesAbonnements:", isLoadingTypesAbonnements);
    console.log("- errorClients:", errorClients);
    console.log("- errorTypesAbonnements:", errorTypesAbonnements);
  }, [clientsData, clients, typesAbonnementsData, typesAbonnements, isLoadingClients, isLoadingTypesAbonnements, errorClients, errorTypesAbonnements]);


  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBgClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const getInputTextColorClass = () => isDarkMode ? 'text-gray-200' : 'text-gray-800';

  useEffect(() => {
    if (formData.typeAbonnementId) {
      handleCalculatePrice();
    } else {
      setCalculatedPrice(null);
    }
  }, [formData.typeAbonnementId, formData.reductionPromo]);

  const handleCalculatePrice = async () => {
    try {
      const result = await calculerPrixAbonnementMutation.mutateAsync({
        typeAbonnementId: parseInt(formData.typeAbonnementId),
        reductionPromo: parseFloat(formData.reductionPromo) || 0
      });
      setCalculatedPrice(result.prixFinal);
    } catch (err) {
      setCalculatedPrice(null);
      // L'erreur est déjà gérée par useNotification
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientId) {
      errors.clientId = translations?.clientRequired || 'Le client est requis.';
    }
    if (!formData.typeAbonnementId) {
      errors.typeAbonnementId = translations?.subscriptionTypeRequired || 'Le type d\'abonnement est requis.';
    }
    if (!formData.modePaiement) {
      errors.modePaiement = translations?.paymentMethodRequired || 'Le mode de paiement est requis.';
    }
    if (formData.reductionPromo && isNaN(parseFloat(formData.reductionPromo))) {
      errors.reductionPromo = translations?.invalidDiscount || 'La réduction doit être un nombre.';
    }
    if (formData.montantPaye && isNaN(parseFloat(formData.montantPaye))) {
      errors.montantPaye = translations?.invalidAmountPaid || 'Le montant payé doit être un nombre.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showError(translations?.formValidationErrors || 'Veuillez corriger les erreurs dans le formulaire.', { category: 'user', priority: 'high' });
      return;
    }

    setIsSubmitting(true);
    try {
      await vendreAbonnementMutation.mutateAsync({
        clientId: parseInt(formData.clientId),
        typeAbonnementId: parseInt(formData.typeAbonnementId),
        dateAchat: formData.dateDebut,
        modePaiement: formData.modePaiement,
        reductionPromo: parseFloat(formData.reductionPromo) || 0,
        montantPaye: parseFloat(formData.montantPaye) || calculatedPrice || 0,
        notes: formData.notes
      });
      showSuccess(translations?.subscriptionSaleSuccess || 'Vente d\'abonnement enregistrée avec succès!');
      onClose();
    } catch (err) {
      console.error("Erreur lors de la soumission du formulaire:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingClients || isLoadingTypesAbonnements) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p>{translations?.loading || 'Chargement...'}</p>
          </div>
        </div>
      </Portal>
    );
  }

  if (errorClients || errorTypesAbonnements) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="p-8 rounded-lg shadow-xl bg-red-800 border border-red-600 text-white text-center">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{translations?.errorLoadingData || 'Erreur de chargement des données'}</h2>
            <p className="mb-4">
              {errorClients?.message || errorTypesAbonnements?.message || translations?.tryAgain || 'Une erreur est survenue. Veuillez réessayer.'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              {translations?.close || 'Fermer'}
            </button>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div 
          className={`relative ${getBgClass()} rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${getBorderColorClass()} border`}
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {/* Header */}
          <div className={`flex justify-between items-center p-5 border-b ${getBorderColorClass()}`}>
            <h2 className={`text-2xl font-bold ${getTextColorClass(true)}`}>
              {translations?.sellSubscription || "Vendre un Abonnement"}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${getTextColorClass(false)} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Champ Client */}
            <div>
              <label htmlFor="clientId" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <User size={16} className="inline-block mr-1" /> {translations?.client || 'Client'}*
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">{translations?.selectClient || 'Sélectionner un client'}</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} ({client.numeroClient})
                  </option>
                ))}
              </select>
              {validationErrors.clientId && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.clientId}</p>
              )}
            </div>

            {/* Champ Type d'Abonnement */}
            <div>
              <label htmlFor="typeAbonnementId" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <Package size={16} className="inline-block mr-1" /> {translations?.subscriptionType || 'Type d\'Abonnement'}*
              </label>
              <select
                id="typeAbonnementId"
                name="typeAbonnementId"
                value={formData.typeAbonnementId}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="">{translations?.selectSubscriptionType || 'Sélectionner un type'}</option>
                {typesAbonnements.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.nom} ({type.nombreHeures}h - {type.prixPackage} {type.devise})
                  </option>
                ))}
              </select>
              {validationErrors.typeAbonnementId && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.typeAbonnementId}</p>
              )}
            </div>

            {/* Champ Date de Début */}
            <div>
              <label htmlFor="dateDebut" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <Calendar size={16} className="inline-block mr-1" /> {translations?.startDate || 'Date de Début'}
              </label>
              <input
                type="date"
                id="dateDebut"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {/* Champ Réduction Promotionnelle */}
            <div>
              <label htmlFor="reductionPromo" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <Star size={16} className="inline-block mr-1" /> {translations?.promotionalDiscount || 'Réduction Promotionnelle (%)'}
              </label>
              <input
                type="number"
                id="reductionPromo"
                name="reductionPromo"
                value={formData.reductionPromo}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {validationErrors.reductionPromo && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.reductionPromo}</p>
              )}
            </div>

            {/* Affichage du prix calculé */}
            {calculatedPrice !== null && (
              <div className={`p-4 rounded-md ${getBorderColorClass()} border flex items-center justify-between ${getInputBgClass()}`}>
                <span className={`${getTextColorClass(false)} flex items-center`}>
                  <Calculator size={20} className="inline-block mr-2" /> {translations?.calculatedPrice || 'Prix Calculé'} :
                </span>
                <span className={`font-bold text-xl ${getTextColorClass(true)}`}>
                  {calculatedPrice} {typesAbonnements.find(t => t.id === parseInt(formData.typeAbonnementId))?.devise || 'DH'}
                </span>
              </div>
            )}

            {/* Champ Montant Payé (optionnel, pour l'override) */}
            <div>
              <label htmlFor="montantPaye" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <Euro size={16} className="inline-block mr-1" /> {translations?.amountPaid || 'Montant Payé'} (Optionnel)
              </label>
              <input
                type="number"
                id="montantPaye"
                name="montantPaye"
                value={formData.montantPaye}
                onChange={handleChange}
                placeholder={calculatedPrice ? calculatedPrice.toString() : "0.00"}
                min="0"
                step="0.01"
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {validationErrors.montantPaye && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.montantPaye}</p>
              )}
            </div>

            {/* Champ Mode de Paiement */}
            <div>
              <label htmlFor="modePaiement" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <CreditCard size={16} className="inline-block mr-1" /> {translations?.paymentMethod || 'Mode de Paiement'}*
              </label>
              <select
                id="modePaiement"
                name="modePaiement"
                value={formData.modePaiement}
                onChange={handleChange}
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="ESPECES">{translations?.cash || 'Espèces'}</option>
                <option value="CARTE">{translations?.card || 'Carte Bancaire'}</option>
                <option value="VIREMENT">{translations?.transfer || 'Virement Bancaire'}</option>
                <option value="GRATUIT">{translations?.free || 'Gratuit'}</option>
              </select>
              {validationErrors.modePaiement && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.modePaiement}</p>
              )}
            </div>

            {/* Champ Notes */}
            <div>
              <label htmlFor="notes" className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                <FileText size={16} className="inline-block mr-1" /> {translations?.notes || 'Notes'}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className={`w-full p-3 rounded-md border ${getBorderColorClass()} ${getInputBgClass()} ${getInputTextColorClass()} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder={translations?.addAnyNotes || 'Ajouter des notes sur la vente...'}
              ></textarea>
            </div>

            {/* Actions */}
            <div className={`flex justify-end space-x-3 pt-4 border-t ${getBorderColorClass()} bg-gray-50 dark:bg-gray-800/50`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
                disabled={isSubmitting}
              >
                {translations?.cancel || 'Annuler'}
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.clientId || !formData.typeAbonnementId}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{translations?.processing || 'Traitement...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{translations?.sellSubscription || 'Vendre l\'abonnement'}</span>
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

export default VenteAbonnementForm;
