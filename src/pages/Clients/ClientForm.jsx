import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, Gamepad2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useCreateClient, 
  useUpdateClient, 
  useVerifierUniciteClient 
} from '../../hooks/useClients';
import Portal from '../../components/Portal/Portal';

const ClientForm = ({ client, onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const isEdit = !!client;

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
    email: '',
    adresse: '',
    notes: '',
    // ✅ SUPPRIMÉ: isSystemClient (protégé côté backend)
    // ✅ SUPPRIMÉ: typeClient (toujours NORMAL pour les créations)
    pseudoPrefere: '',
    jeuxPreferes: [],
    estActif: true,
    sourceAcquisition: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour la vérification d'unicité
  const [emailCheck, setEmailCheck] = useState({ value: '', isChecking: false, isUnique: true });
  const [phoneCheck, setPhoneCheck] = useState({ value: '', isChecking: false, isUnique: true });

  // Hooks de vérification d'unicité
  const { data: isEmailUnique, isLoading: isEmailChecking } = useVerifierUniciteClient(
    'email',
    emailCheck.value,
    isEdit ? client.id : null
  );
  const { data: isPhoneUnique, isLoading: isPhoneChecking } = useVerifierUniciteClient(
    'telephone',
    phoneCheck.value,
    isEdit ? client.id : null
  );

  // ✅ MODIFIÉ: Initialisation adaptée aux nouveaux champs
  useEffect(() => {
    if (isEdit && client) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        dateNaissance: client.dateNaissance || '',
        telephone: client.telephone || '',
        email: client.email || '',
        adresse: client.adresse || '',
        notes: client.notes || '',
        pseudoPrefere: client.pseudoPrefere || '',
        jeuxPreferes: Array.isArray(client.jeuxPreferes) ? client.jeuxPreferes : [],
        estActif: client.estActif !== undefined ? client.estActif : true,
        sourceAcquisition: client.sourceAcquisition || ''
      });
      
      // Initialiser les états de vérification
      if (client.email) {
        setEmailCheck({ value: client.email, isChecking: false, isUnique: true });
      }
      if (client.telephone) {
        setPhoneCheck({ value: client.telephone, isChecking: false, isUnique: true });
      }
    }
  }, [isEdit, client]);

  // Update isUnique state from query results
  useEffect(() => {
    if (emailCheck.value && emailCheck.value === formData.email) {
      setEmailCheck(prev => ({ ...prev, isUnique: isEmailUnique !== false }));
    }
  }, [isEmailUnique, emailCheck.value, formData.email]);

  useEffect(() => {
    if (phoneCheck.value && phoneCheck.value === formData.telephone) {
      setPhoneCheck(prev => ({ ...prev, isUnique: isPhoneUnique !== false }));
    }
  }, [isPhoneUnique, phoneCheck.value, formData.telephone]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // ✅ MODIFIÉ: Vérification d'unicité améliorée
    if (name === 'email' && value.trim() && value.includes('@')) {
      setEmailCheck({ value: value.trim(), isChecking: true, isUnique: true });
    } else if (name === 'telephone' && value.trim() && value.length >= 8) {
      setPhoneCheck({ value: value.trim(), isChecking: true, isUnique: true });
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleJeuxPreferesChange = (e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      jeuxPreferes: selectedValues
    }));
  };

  // ✅ MODIFIÉ: Validation adaptée aux nouveaux champs
  const validateForm = () => {
    const errors = {};

    // Validation des champs obligatoires
    if (!formData.prenom.trim()) {
      errors.prenom = translations?.prenomRequired || 'Le prénom est requis';
    } else if (formData.prenom.trim().length < 2) {
      errors.prenom = translations?.prenomTooShort || 'Le prénom doit contenir au moins 2 caractères';
    } else if (formData.prenom.trim().length > 50) {
      errors.prenom = translations?.prenomTooLong || 'Le prénom ne peut pas dépasser 50 caractères';
    }

    if (!formData.nom.trim()) {
      errors.nom = translations?.nomRequired || 'Le nom est requis';
    } else if (formData.nom.trim().length < 2) {
      errors.nom = translations?.nomTooShort || 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.nom.trim().length > 50) {
      errors.nom = translations?.nomTooLong || 'Le nom ne peut pas dépasser 50 caractères';
    }

    // Validation email (optionnel mais format requis si fourni)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = translations?.invalidEmailFormat || 'Format d\'email invalide';
      } else if (formData.email.trim().length > 100) {
        errors.email = translations?.emailTooLong || 'L\'email ne peut pas dépasser 100 caractères';
      } else if (!emailCheck.isUnique) {
        errors.email = translations?.emailAlreadyExists || 'Cet email est déjà utilisé par un autre client';
      }
    }

    // Validation téléphone (optionnel mais format requis si fourni)
    if (formData.telephone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.telephone.trim())) {
        errors.telephone = translations?.invalidPhoneFormat || 'Format de téléphone invalide';
      } else if (formData.telephone.trim().length < 8) {
        errors.telephone = translations?.phoneTooShort || 'Le téléphone doit contenir au moins 8 caractères';
      } else if (formData.telephone.trim().length > 20) {
        errors.telephone = translations?.phoneTooLong || 'Le téléphone ne peut pas dépasser 20 caractères';
      } else if (!phoneCheck.isUnique) {
        errors.telephone = translations?.phoneAlreadyExists || 'Ce numéro est déjà utilisé par un autre client';
      }
    }

    // Validation date de naissance (optionnelle mais logique si fournie)
    if (formData.dateNaissance) {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
      
      if (birthDate > today) {
        errors.dateNaissance = translations?.birthDateFuture || 'La date de naissance ne peut pas être dans le futur';
      } else if (age < 0 || age > 120) {
        errors.dateNaissance = translations?.invalidAge || 'Âge invalide (doit être entre 0 et 120 ans)';
      }
    }

    // Validation pseudo préféré (optionnel mais longueur si fourni)
    if (formData.pseudoPrefere && formData.pseudoPrefere.trim().length > 50) {
      errors.pseudoPrefere = translations?.pseudoTooLong || 'Le pseudo ne peut pas dépasser 50 caractères';
    }

    // Validation source d'acquisition (optionnelle mais longueur si fournie)
    if (formData.sourceAcquisition && formData.sourceAcquisition.trim().length > 50) {
      errors.sourceAcquisition = translations?.sourceAcquisitionTooLong || 'La source d\'acquisition ne peut pas dépasser 50 caractères';
    }

    // Validation notes (optionnelles mais longueur si fournies)
    if (formData.notes && formData.notes.trim().length > 1000) {
      errors.notes = translations?.notesTooLong || 'Les notes ne peuvent pas dépasser 1000 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // ✅ NOUVEAU: Vérification que les contrôles d'unicité sont terminés
    if (isEmailChecking || isPhoneChecking) {
      return; // Attendre la fin des vérifications
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ MODIFIÉ: Préparation des données avec validation
      const clientData = {
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        email: formData.email.trim() || null,
        telephone: formData.telephone.trim() || null,
        dateNaissance: formData.dateNaissance || null,
        adresse: formData.adresse.trim() || null,
        pseudoPrefere: formData.pseudoPrefere.trim() || null,
        jeuxPreferes: formData.jeuxPreferes,
        notes: formData.notes.trim() || null,
        sourceAcquisition: formData.sourceAcquisition.trim() || null,
        estActif: formData.estActif
        // ✅ typeClient et isSystemClient sont gérés automatiquement côté backend
      };

      if (isEdit) {
        await updateClient.mutateAsync({ id: client.id, clientData });
      } else {
        await createClient.mutateAsync(clientData);
      }

      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      // L'erreur est affichée par les hooks
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define the title based on whether it's edit or create mode
  const title = isEdit 
    ? (translations?.editClient || 'Modifier le client')
    : (translations?.addClient || 'Ajouter un client');

  // Dynamic styles based on theme
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBgClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getBorderClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-gray-800';
  const getPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const getFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-blue-500';
  const getCheckboxColorClass = () => isDarkMode ? 'text-purple-500' : 'text-blue-500';

  const commonInputClasses = `w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextClass()} ${getBorderClass()} border ${getPlaceholderClass()} focus:outline-none focus:ring-2 ${getFocusRingClass()}`;

  // ✅ MODIFIÉ: Options de jeux mises à jour
  const gameOptions = [
    'Action', 'Aventure', 'RPG', 'Stratégie', 'Simulation', 'Sport', 
    'Course', 'Combat', 'Horreur', 'Puzzle', 'Plateforme', 'Battle Royale',
    'MMORPG', 'FPS', 'MOBA', 'Indie', 'Arcade'
  ];

  // ✅ NOUVEAU: Options de source d'acquisition
  const sourceOptions = [
    'Bouche-à-oreille', 'Réseaux sociaux', 'Site web', 'Publicité',
    'Ami/famille', 'Événement', 'Recherche Google', 'Autre'
  ];

  // ✅ NOUVEAU: Indicateur de vérification d'unicité
  const renderUnicityIndicator = (field, isChecking, isUnique, value) => {
    if (!value) return null;
    
    if (isChecking) {
      return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        </div>
      );
    }
    
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isUnique ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    );
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${getBgClass()} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 ${getBorderClass()} border-b`}>
            <h2 className={`text-xl font-semibold ${getTextColorClass(true)} flex items-center`}>
              <User className="mr-2" size={24} />
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ✅ NOUVEAU: Message d'information pour les clients système */}
              {isEdit && client?.isSystemClient && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>Client Système:</strong> Ce client est utilisé pour les sessions anonymes et ne peut pas être modifié.
                    </p>
                  </div>
                </div>
              )}

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${getTextColorClass(true)} flex items-center`}>
                    <User className="mr-2" size={20} />
                    {translations?.personalInfo || 'Informations Personnelles'}
                  </h3>

                  {/* Prénom */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.prenom || 'Prénom'} *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className={`${commonInputClasses} ${validationErrors.prenom ? 'border-red-500' : ''}`}
                      placeholder={translations?.prenomPlaceholder || 'Entrez le prénom'}
                      disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      required
                    />
                    {validationErrors.prenom && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.prenom}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.nom || 'Nom'} *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className={`${commonInputClasses} ${validationErrors.nom ? 'border-red-500' : ''}`}
                      placeholder={translations?.nomPlaceholder || 'Entrez le nom'}
                      disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      required
                    />
                    {validationErrors.nom && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.nom}</p>
                    )}
                  </div>

                  {/* Date de naissance */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.dateNaissance || 'Date de Naissance'}
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} size={20} />
                      <input
                        type="date"
                        name="dateNaissance"
                        value={formData.dateNaissance}
                        onChange={handleChange}
                        className={`${commonInputClasses} pl-11 ${validationErrors.dateNaissance ? 'border-red-500' : ''}`}
                        disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      />
                    </div>
                    {validationErrors.dateNaissance && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.dateNaissance}</p>
                    )}
                  </div>

                  {/* ✅ NOUVEAU: Source d'acquisition */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.sourceAcquisition || 'Comment nous avez-vous trouvé ?'}
                    </label>
                    <select
                      name="sourceAcquisition"
                      value={formData.sourceAcquisition}
                      onChange={handleChange}
                      className={`${commonInputClasses} ${validationErrors.sourceAcquisition ? 'border-red-500' : ''}`}
                      disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                    >
                      <option value="">{translations?.selectSource || 'Sélectionnez une source'}</option>
                      {sourceOptions.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                    {validationErrors.sourceAcquisition && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.sourceAcquisition}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${getTextColorClass(true)} flex items-center`}>
                    <Mail className="mr-2" size={20} />
                    {translations?.contactInfo || 'Informations de Contact'}
                  </h3>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.email || 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${commonInputClasses} pl-11 pr-11 ${validationErrors.email ? 'border-red-500' : ''}`}
                        placeholder={translations?.emailPlaceholder || 'exemple@email.com'}
                        disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      />
                      {renderUnicityIndicator('email', isEmailChecking, emailCheck.isUnique, formData.email)}
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.telephone || 'Téléphone'}
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} size={20} />
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className={`${commonInputClasses} pl-11 pr-11 ${validationErrors.telephone ? 'border-red-500' : ''}`}
                        placeholder={translations?.telephonePlaceholder || '+212 6XX XXX XXX'}
                        disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      />
                      {renderUnicityIndicator('telephone', isPhoneChecking, phoneCheck.isUnique, formData.telephone)}
                    </div>
                    {validationErrors.telephone && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.telephone}</p>
                    )}
                  </div>

                  {/* Adresse */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.adresse || 'Adresse'}
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-3 ${getTextColorClass(false)}`} size={20} />
                      <textarea
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        rows="3"
                        className={`${commonInputClasses} pl-11 resize-vertical`}
                        placeholder={translations?.adressePlaceholder || 'Adresse complète'}
                        disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations gaming */}
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${getTextColorClass(true)} flex items-center`}>
                  <Gamepad2 className="mr-2" size={20} />
                  {translations?.gamingInfo || 'Informations Gaming'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pseudo préféré */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.pseudoPrefere || 'Pseudo Préféré'}
                    </label>
                    <input
                      type="text"
                      name="pseudoPrefere"
                      value={formData.pseudoPrefere}
                      onChange={handleChange}
                      className={`${commonInputClasses} ${validationErrors.pseudoPrefere ? 'border-red-500' : ''}`}
                      placeholder={translations?.pseudoPlaceholder || 'Pseudo de jeu'}
                      disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                    />
                    {validationErrors.pseudoPrefere && (
                      <p className="mt-1 text-sm text-red-500">{validationErrors.pseudoPrefere}</p>
                    )}
                  </div>

                  {/* Jeux préférés */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                      {translations?.jeuxPreferes || 'Jeux Préférés'}
                    </label>
                    <select
                      multiple
                      name="jeuxPreferes"
                      value={formData.jeuxPreferes}
                      onChange={handleJeuxPreferesChange}
                      className={`${commonInputClasses} h-24`}
                      disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                    >
                      {gameOptions.map(game => (
                        <option key={game} value={game}>{game}</option>
                      ))}
                    </select>
                    <p className={`mt-1 text-xs ${getTextColorClass(false)}`}>
                      {translations?.multipleSelectionHint || 'Maintenez Ctrl/Cmd pour sélectionner plusieurs options'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h3 className={`text-lg font-medium ${getTextColorClass(true)} flex items-center`}>
                  <FileText className="mr-2" size={20} />
                  {translations?.additionalInfo || 'Informations Supplémentaires'}
                </h3>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
                    {translations?.notes || 'Notes'}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    className={`${commonInputClasses} resize-vertical ${validationErrors.notes ? 'border-red-500' : ''}`}
                    placeholder={translations?.notesPlaceholder || 'Notes supplémentaires sur le client...'}
                    disabled={isSubmitting || (isEdit && client?.isSystemClient)}
                    maxLength={1000}
                  />
                  <div className="flex justify-between mt-1">
                    {validationErrors.notes && (
                      <p className="text-sm text-red-500">{validationErrors.notes}</p>
                    )}
                    <p className={`text-xs ${getTextColorClass(false)} ml-auto`}>
                      {formData.notes.length}/1000
                    </p>
                  </div>
                </div>

                {/* Statut actif */}
                {!isEdit && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="estActif"
                      name="estActif"
                      checked={formData.estActif}
                      onChange={handleChange}
                      className={`h-4 w-4 ${getCheckboxColorClass()} focus:ring-2 ${getFocusRingClass()} rounded`}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="estActif" className={`text-sm font-medium ${getTextColorClass(false)}`}>
                      {translations?.clientActive || 'Client actif'}
                    </label>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-6 ${getBorderClass()} border-t`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${getBorderClass()} border ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              {translations?.cancel || 'Annuler'}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || isEmailChecking || isPhoneChecking || !emailCheck.isUnique || !phoneCheck.isUnique || (isEdit && client?.isSystemClient)}
              className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEdit ? (translations?.updating || 'Mise à jour...') : (translations?.creating || 'Création...')}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? (translations?.updateClient || 'Mettre à jour') : (translations?.createClient || 'Créer le client')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ClientForm;