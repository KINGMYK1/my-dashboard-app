import React, { useState, useEffect } from 'react';
import { X, Save, Package, Euro, Calendar, Clock, Users, Palette, Star, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateTypeAbonnement, useUpdateTypeAbonnement } from '../../hooks/useTypesAbonnements';
import Portal from '../../components/Portal/Portal';

const TypeAbonnementForm = ({ type, onClose, typesPostes = [] }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const createTypeAbonnement = useCreateTypeAbonnement();
  const updateTypeAbonnement = useUpdateTypeAbonnement();

  const isEdit = !!type;

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    nombreHeures: '',
    prixPackage: '',
    tarifHoraireNormal: '',
    dureeValiditeMois: 12,
    typePostesAutorises: [],
    heuresMinParSession: 0.25,
    heuresMaxParSession: '',
    estPromo: false,
    dateDebutPromo: '',
    dateFinPromo: '',
    couleur: '#3B82F6',
    ordreAffichage: 999,
    estActif: true
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Styles dynamiques
  const getTextColorClass = (isPrimary) => 
    isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-white';
  
  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const getInputBgClass = () =>
    isDarkMode ? 'bg-gray-700' : 'bg-white';

  // Initialisation du formulaire
  useEffect(() => {
    if (isEdit && type) {
      setFormData({
        nom: type.nom || '',
        description: type.description || '',
        nombreHeures: type.nombreHeures || '',
        prixPackage: type.prixPackage || '',
        tarifHoraireNormal: type.tarifHoraireNormal || '',
        dureeValiditeMois: type.dureeValiditeMois || 12,
        typePostesAutorises: type.typePostesAutorises || [],
        heuresMinParSession: type.heuresMinParSession || 0.25,
        heuresMaxParSession: type.heuresMaxParSession || '',
        estPromo: type.estPromo || false,
        dateDebutPromo: type.dateDebutPromo ? type.dateDebutPromo.split('T')[0] : '',
        dateFinPromo: type.dateFinPromo ? type.dateFinPromo.split('T')[0] : '',
        couleur: type.couleur || '#3B82F6',
        ordreAffichage: type.ordreAffichage || 999,
        estActif: type.estActif !== undefined ? type.estActif : true
      });
    }
  }, [isEdit, type]);

  // Calculs dérivés
  const prixHoraireEquivalent = formData.nombreHeures && formData.prixPackage 
    ? (parseFloat(formData.prixPackage) / parseFloat(formData.nombreHeures))
    : 0;

  const economieParHeure = formData.tarifHoraireNormal && prixHoraireEquivalent
    ? Math.max(0, parseFloat(formData.tarifHoraireNormal) - prixHoraireEquivalent)
    : 0;

  const economieTotale = economieParHeure * (parseFloat(formData.nombreHeures) || 0);

  const pourcentageReduction = formData.tarifHoraireNormal && economieParHeure > 0
    ? ((economieParHeure / parseFloat(formData.tarifHoraireNormal)) * 100)
    : 0;

  // ✅ NOUVEAU: Vérification si c'est vraiment économique
  const estEconomique = prixHoraireEquivalent > 0 && parseFloat(formData.tarifHoraireNormal) > prixHoraireEquivalent;

  // Gestionnaire de changement
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));

    // Nettoyer les erreurs de validation
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Gestionnaire pour la sélection multiple des types de postes
  const handleTypePosteChange = (typePosteId) => {
    setFormData(prev => ({
      ...prev,
      typePostesAutorises: prev.typePostesAutorises.includes(typePosteId)
        ? prev.typePostesAutorises.filter(id => id !== typePosteId)
        : [...prev.typePostesAutorises, typePosteId]
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    } else if (formData.nom.trim().length < 2 || formData.nom.trim().length > 100) {
      errors.nom = 'Le nom doit faire entre 2 et 100 caractères';
    }

    // Validation du nombre d'heures
    if (!formData.nombreHeures || parseFloat(formData.nombreHeures) < 0.5) {
      errors.nombreHeures = 'Le nombre d\'heures doit être au minimum 0.5';
    }

    // Validation du prix du package
    if (!formData.prixPackage || parseFloat(formData.prixPackage) <= 0) {
      errors.prixPackage = 'Le prix du package doit être positif';
    }

    // Validation du tarif horaire normal
    if (!formData.tarifHoraireNormal || parseFloat(formData.tarifHoraireNormal) <= 0) {
      errors.tarifHoraireNormal = 'Le tarif horaire normal doit être positif';
    }

    // Validation de la durée de validité
    if (formData.dureeValiditeMois < 1 || formData.dureeValiditeMois > 60) {
      errors.dureeValiditeMois = 'La durée de validité doit être entre 1 et 60 mois';
    }

    // Validation des contraintes de session
    if (formData.heuresMaxParSession && parseFloat(formData.heuresMaxParSession) <= parseFloat(formData.heuresMinParSession)) {
      errors.heuresMaxParSession = 'La durée maximale doit être supérieure à la durée minimale';
    }

    // Validation des dates de promotion
    if (formData.estPromo) {
      if (!formData.dateDebutPromo || !formData.dateFinPromo) {
        errors.dateDebutPromo = 'Les dates de début et fin de promotion sont requises';
      } else if (new Date(formData.dateDebutPromo) >= new Date(formData.dateFinPromo)) {
        errors.dateFinPromo = 'La date de fin doit être postérieure à la date de début';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        nombreHeures: parseFloat(formData.nombreHeures),
        prixPackage: parseFloat(formData.prixPackage),
        tarifHoraireNormal: parseFloat(formData.tarifHoraireNormal),
        dureeValiditeMois: parseInt(formData.dureeValiditeMois),
        heuresMinParSession: parseFloat(formData.heuresMinParSession),
        heuresMaxParSession: formData.heuresMaxParSession ? parseFloat(formData.heuresMaxParSession) : null,
        ordreAffichage: parseInt(formData.ordreAffichage),
        typePostesAutorises: formData.typePostesAutorises.length > 0 ? formData.typePostesAutorises : null,
        dateDebutPromo: formData.estPromo && formData.dateDebutPromo ? formData.dateDebutPromo : null,
        dateFinPromo: formData.estPromo && formData.dateFinPromo ? formData.dateFinPromo : null
      };

      if (isEdit) {
        await updateTypeAbonnement.mutateAsync({ id: type.id, data: submitData });
      } else {
        await createTypeAbonnement.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${getBgColorClass()} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
          {/* En-tête */}
          <div className={`flex items-center justify-between p-6 border-b ${getBorderColorClass()}`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${getTextColorClass(true)}`}>
                  {isEdit ? 'Modifier le type d\'abonnement' : 'Nouveau type d\'abonnement'}
                </h2>
                <p className={`text-sm ${getTextColorClass(false)}`}>
                  {isEdit ? `Modification de "${type?.nom}"` : 'Créer un nouveau type d\'abonnement'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${getTextColorClass(false)}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps du formulaire */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              
              {/* Informations de base */}
              <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-medium mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <Package className="w-5 h-5 mr-2" />
                  Informations de base
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Nom du type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="Ex: Package Premium"
                      disabled={isSubmitting}
                    />
                    {validationErrors.nom && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.nom}</p>
                    )}
                  </div>

                  {/* Couleur */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Couleur thématique
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="couleur"
                        value={formData.couleur}
                        onChange={handleChange}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <input
                        type="text"
                        value={formData.couleur}
                        onChange={(e) => setFormData(prev => ({ ...prev, couleur: e.target.value }))}
                        className={`flex-1 px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                        placeholder="#3B82F6"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="Description détaillée du type d'abonnement..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Tarification */}
              <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-medium mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <Euro className="w-5 h-5 mr-2" />
                  Tarification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Nombre d'heures */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Nombre d'heures <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      name="nombreHeures"
                      value={formData.nombreHeures}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      placeholder="10"
                      disabled={isSubmitting}
                    />
                    {validationErrors.nombreHeures && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.nombreHeures}</p>
                    )}
                  </div>

                  {/* Prix du package */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Prix du package (MAD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="prixPackage"
                      value={formData.prixPackage}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      placeholder="200.00"
                      disabled={isSubmitting}
                    />
                    {validationErrors.prixPackage && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.prixPackage}</p>
                    )}
                  </div>

                  {/* Tarif horaire normal */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Tarif horaire normal (MAD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="tarifHoraireNormal"
                      value={formData.tarifHoraireNormal}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      placeholder="25.00"
                      disabled={isSubmitting}
                    />
                    {validationErrors.tarifHoraireNormal && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.tarifHoraireNormal}</p>
                    )}
                  </div>
                </div>

                {/* Calculs automatiques */}
                {formData.nombreHeures && formData.prixPackage && formData.tarifHoraireNormal && (
                  <div className={`mt-4 p-4 rounded-lg ${estEconomique ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${estEconomique ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                          Prix/heure équivalent:
                        </span>
                        <div className={`text-lg font-bold ${estEconomique ? 'text-green-600' : 'text-orange-600'}`}>
                          {prixHoraireEquivalent.toFixed(2)} MAD
                        </div>
                      </div>
                      
                      <div>
                        <span className={`font-medium ${estEconomique ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                          {estEconomique ? 'Économie par heure:' : 'Surcoût par heure:'}
                        </span>
                        <div className={`text-lg font-bold ${estEconomique ? 'text-green-600' : 'text-red-600'}`}>
                          {estEconomique ? `${economieParHeure.toFixed(2)} MAD` : `+${Math.abs(economieParHeure).toFixed(2)} MAD`}
                        </div>
                      </div>
                      
                      <div>
                        <span className={`font-medium ${estEconomique ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                          {estEconomique ? 'Économie totale:' : 'Surcoût total:'}
                        </span>
                        <div className={`text-lg font-bold ${estEconomique ? 'text-green-600' : 'text-red-600'}`}>
                          {estEconomique ? `${economieTotale.toFixed(2)} MAD` : `+${Math.abs(economieTotale).toFixed(2)} MAD`}
                        </div>
                      </div>
                      
                      <div>
                        <span className={`font-medium ${estEconomique ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                          {estEconomique ? 'Réduction:' : 'Majoration:'}
                        </span>
                        <div className={`text-lg font-bold ${estEconomique ? 'text-green-600' : 'text-red-600'}`}>
                          {estEconomique ? `-${pourcentageReduction.toFixed(1)}%` : `+${pourcentageReduction.toFixed(1)}%`}
                        </div>
                      </div>
                    </div>
                    
                    {/* ✅ NOUVEAU: Message d'information */}
                    <div className={`mt-3 p-2 rounded text-sm ${estEconomique ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200'}`}>
                      {estEconomique ? (
                        <>
                          <strong>✅ Abonnement économique:</strong> Le client économise {economieTotale.toFixed(2)} MAD par rapport au tarif horaire normal.
                        </>
                      ) : (
                        <>
                          <strong>⚠️ Abonnement non économique:</strong> Le prix équivalent est supérieur au tarif horaire normal. Vérifiez vos tarifs.
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Paramètres avancés */}
              <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-medium mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <Clock className="w-5 h-5 mr-2" />
                  Paramètres avancés
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Durée de validité */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Durée de validité (mois)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      name="dureeValiditeMois"
                      value={formData.dureeValiditeMois}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      disabled={isSubmitting}
                    />
                    {validationErrors.dureeValiditeMois && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.dureeValiditeMois}</p>
                    )}
                  </div>

                  {/* Heures min par session */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Heures min par session
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      name="heuresMinParSession"
                      value={formData.heuresMinParSession}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Heures max par session */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Heures max par session
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      name="heuresMaxParSession"
                      value={formData.heuresMaxParSession}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      placeholder="Illimité"
                      disabled={isSubmitting}
                    />
                    {validationErrors.heuresMaxParSession && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.heuresMaxParSession}</p>
                    )}
                  </div>

                  {/* Ordre d'affichage */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="ordreAffichage"
                      value={formData.ordreAffichage}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Types de postes autorisés */}
              {typesPostes.length > 0 && (
                <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                  <h3 className={`text-lg font-medium mb-4 ${getTextColorClass(true)} flex items-center`}>
                    <Users className="w-5 h-5 mr-2" />
                    Types de postes autorisés
                  </h3>
                  <p className={`text-sm ${getTextColorClass(false)} mb-3`}>
                    Laissez vide pour autoriser tous les types de postes
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {typesPostes.map(typePoste => (
                      <label key={typePoste.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.typePostesAutorises.includes(typePoste.id)}
                          onChange={() => handleTypePosteChange(typePoste.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          disabled={isSubmitting}
                        />
                        <span className={`text-sm ${getTextColorClass(true)}`}>
                          {typePoste.nom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration promotion */}
              <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                <h3 className={`text-lg font-medium mb-4 ${getTextColorClass(true)} flex items-center`}>
                  <Star className="w-5 h-5 mr-2" />
                  Configuration promotion
                </h3>
                
                <div className="space-y-4">
                  {/* Activation promotion */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="estPromo"
                      name="estPromo"
                      checked={formData.estPromo}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="estPromo" className={`text-sm font-medium ${getTextColorClass(true)}`}>
                      Marquer comme promotion
                    </label>
                  </div>

                  {/* Dates de promotion */}
                  {formData.estPromo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                          Date de début <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateDebutPromo"
                          value={formData.dateDebutPromo}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                          disabled={isSubmitting}
                        />
                        {validationErrors.dateDebutPromo && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.dateDebutPromo}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${getTextColorClass(true)}`}>
                          Date de fin <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateFinPromo"
                          value={formData.dateFinPromo}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getInputBgClass()} ${getTextColorClass(true)} focus:ring-2 focus:ring-purple-500`}
                          disabled={isSubmitting}
                        />
                        {validationErrors.dateFinPromo && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.dateFinPromo}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* État */}
              <div className={`border ${getBorderColorClass()} rounded-lg p-4`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="estActif"
                    name="estActif"
                    checked={formData.estActif}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="estActif" className={`text-sm font-medium ${getTextColorClass(true)}`}>
                    Type d'abonnement actif
                  </label>
                </div>
              </div>
            </div>

            {/* Pied de page */}
            <div className={`flex items-center justify-between p-6 border-t ${getBorderColorClass()} bg-gray-50 dark:bg-gray-800/50`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEdit ? 'Mettre à jour' : 'Créer'}</span>
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

export default TypeAbonnementForm;