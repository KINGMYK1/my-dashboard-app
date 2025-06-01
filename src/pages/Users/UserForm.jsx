import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  Shield, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import Portal from '../../components/Portal/Portal';

const UserForm = ({ user, onClose, roles = [] }) => {
  const { translations } = useLanguage();
  const { user: currentUser, hasPermission } = useAuth();
  const { effectiveTheme } = useTheme(); // Use effectiveTheme
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  
  const isEdit = !!user;
  const title = isEdit ? 
    (translations.editUser || "Modifier l'utilisateur") : 
    (translations.addUser || "Ajouter un utilisateur");
  
  // État local du formulaire avec les nouveaux champs
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    roleId: '',
    isActive: true,
    twoFactorEnabled: false,
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getInputPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-[var(--text-secondary)]';
  const getInputFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getErrorColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getErrorBgClass = () => isDarkMode ? 'bg-red-600/20' : 'bg-[var(--error-color)]20';
  const getErrorBorderClass = () => isDarkMode ? 'border-red-500/50' : 'border-[var(--error-color)]';
  const getWarningColorClass = () => isDarkMode ? 'text-yellow-400' : 'text-[var(--warning-color)]';
  const getWarningBgClass = () => isDarkMode ? 'bg-yellow-600/20' : 'bg-[var(--warning-color)]20';
  const getWarningBorderClass = () => isDarkMode ? 'border-yellow-500/50' : 'border-[var(--warning-color)]';


  // Initialiser le formulaire avec les données utilisateur
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        username: user.username || '',
        password: '',
        confirmPassword: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        roleId: user.role?.id || user.roleId || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        twoFactorEnabled: user.twoFactorEnabled || false,
      });
    } else {
      // Réinitialiser pour un nouvel utilisateur
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        roleId: '',
        isActive: true,
        twoFactorEnabled: false,
      });
    }
    setErrors({});
  }, [user, isEdit]);
  
  // Fonction pour vérifier la hiérarchie des rôles côté frontend (RÉTABLIE À L'ORIGINAL)
  const getRoleHierarchy = () => ({
    'Administrateur': 3,
    'Manager': 2,
    'Employé': 1
  });
  
  // Déterminer quels rôles l'utilisateur courant peut attribuer (RÉTABLIE À L'ORIGINAL)
  const canAssignRole = (roleName) => {
    const hierarchy = getRoleHierarchy();
    const userRoleName = currentUser?.role?.name || '';
    
    if (userRoleName === 'Administrateur') {
      return true; // Admin peut tout
    }
    
    if (userRoleName === 'Manager') {
      return roleName !== 'Administrateur'; // Manager ne peut pas créer d'admin
    }
    
    return false; // Employé ne peut rien attribuer
  };
  
  // Filtrer les rôles disponibles selon la hiérarchie
  const filteredRoles = useMemo(() => {
    if (!hasPermission('USERS_ADMIN')) {
      return []; // Pas de permissions de gestion
    }
    
    return roles.filter(role => canAssignRole(role.name));
  }, [roles, currentUser, hasPermission]);

  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Effacer les erreurs
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Validation du nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = translations.usernameRequired || "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username = translations.usernameTooShort || "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    
    // Validation du mot de passe
    if (!isEdit || formData.password) {
      if (!isEdit && !formData.password) {
        newErrors.password = translations.passwordRequired || "Le mot de passe est requis";
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = translations.passwordTooShort || "Le mot de passe doit contenir au moins 6 caractères";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = translations.passwordsDoNotMatch || "Les mots de passe ne correspondent pas";
      }
    }
    
    // Validation des champs obligatoires
    if (!formData.firstName.trim()) {
      newErrors.firstName = translations.firstNameRequired || "Le prénom est requis";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = translations.lastNameRequired || "Le nom est requis";
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = translations.emailRequired || "L'email est requis";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = translations.invalidEmail || "Format d'email invalide";
      }
    }
    
    // Validation du téléphone (optionnel mais format valide si fourni)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = translations.invalidPhone || "Format de téléphone invalide";
      }
    }
    
    // Validation du rôle
    if (!formData.roleId) {
      newErrors.roleId = translations.roleRequired || "Le rôle est requis";
    } else {
      // Vérifier que le rôle sélectionné est autorisé
      const selectedRole = roles.find(r => r.id === parseInt(formData.roleId));
      if (selectedRole && !canAssignRole(selectedRole.name)) {
        newErrors.roleId = translations.roleNotAllowed || "Vous ne pouvez pas attribuer ce rôle";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        // Préparer les données à envoyer
        const { confirmPassword, ...dataToSubmit } = formData;
        
        // Nettoyer les données
        const cleanData = {
          ...dataToSubmit,
          username: dataToSubmit.username.trim(),
          firstName: dataToSubmit.firstName.trim(),
          lastName: dataToSubmit.lastName.trim(),
          email: dataToSubmit.email.trim().toLowerCase(),
          phone: dataToSubmit.phone?.trim() || null,
          address: dataToSubmit.address?.trim() || null,
          roleId: parseInt(dataToSubmit.roleId)
        };
        
        // Supprimer le mot de passe s'il est vide en mode édition
        if (isEdit && !cleanData.password) {
          delete cleanData.password;
        }
        
        console.log('📝 Données à soumettre:', cleanData);
        
        if (isEdit) {
          await updateUser.mutateAsync({
            id: user.id,
            userData: cleanData
          });
        } else {
          await createUser.mutateAsync(cleanData);
        }
        
        // Fermer le formulaire en cas de succès
        onClose();
        
      } catch (error) {
        console.error('❌ Erreur lors de la soumission:', error);
        
        // Gestion des erreurs de validation côté serveur
        if (error.validationErrors) {
          setErrors(error.validationErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };
  
  // Affichage des erreurs de validation
  const renderFieldError = (fieldName) => {
    const error = errors[fieldName];
    if (!error) return null;
    
    return (
      <p className={`mt-1 text-sm ${getErrorColorClass()}`}>{error}</p>
    );
  };
  
  // Gestion de la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border ${getBorderColorClass()}`}
          style={{
            background: 'var(--background-modal-card)', // Use new CSS variable
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className={`p-6 border-b ${getBorderColorClass()}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>{title}</h2>
              <button
                onClick={onClose}
                className={`transition-colors ${getTextColorClass(false)} hover:text-white`}
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Erreur générale */}
            {errors.general && (
              <div className={`p-3 rounded-md border ${getErrorBgClass()} ${getErrorBorderClass()} ${getErrorColorClass()}`}>
                {errors.general}
              </div>
            )}
            
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom d'utilisateur */}
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.username || "Nom d'utilisateur"} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.username ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={translations.usernameLabel || "Nom d'utilisateur"}
                    disabled={isEdit || isSubmitting}
                  />
                </div>
                {renderFieldError('username')}
              </div>
              
              {/* Email */}
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.email || "Email"} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.email ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={translations.emailLabel || "Email"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('email')}
              </div>
            </div>
            
            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.firstName || "Prénom"} *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.firstName ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                  placeholder={translations.firstNameLabel || "Prénom"}
                  disabled={isSubmitting}
                />
                {renderFieldError('firstName')}
              </div>
              
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.lastName || "Nom"} *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.lastName ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                  placeholder={translations.lastNameLabel || "Nom"}
                  disabled={isSubmitting}
                />
                {renderFieldError('lastName')}
              </div>
            </div>
            
            {/* Téléphone et Adresse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.phone || "Téléphone"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.phone ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={translations.phoneLabel || "Téléphone"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('phone')}
              </div>
              
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.address || "Adresse"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.address ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={translations.addressLabel || "Adresse"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('address')}
              </div>
            </div>
            
            {/* Mots de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.password || "Mot de passe"} {!isEdit && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-12 w-full rounded-md border ${errors.password ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={isEdit ? translations.passwordEdit || "Laisser vide pour ne pas changer" : translations.passwordCreate || "Mot de passe"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleShowPassword}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={18} className={`${getTextColorClass(false)}`} /> : <Eye size={18} className={`${getTextColorClass(false)}`} />}
                  </button>
                </div>
                {renderFieldError('password')}
              </div>
              
              <div>
                <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                  {translations.confirmPassword || "Confirmer le mot de passe"} {(!isEdit || formData.password) && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className={`${getTextColorClass(false)}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.confirmPassword ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} ${getInputPlaceholderClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                    placeholder={translations.confirmPasswordLabel || "Confirmer le mot de passe"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('confirmPassword')}
              </div>
            </div>
            
            {/* Sélection du rôle avec avertissement hiérarchique */}
            <div>
              <label className={`block mb-2 text-sm font-medium ${getTextColorClass(false)}`}>
                {translations.role || "Rôle"} *
              </label>
              {filteredRoles.length === 0 && (
                <div className={`mb-2 p-2 rounded ${getWarningBgClass()} ${getWarningBorderClass()} ${getWarningColorClass()} text-sm`}>
                  Aucun rôle disponible pour votre niveau d'autorisation
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={18} className={`${getTextColorClass(false)}`} />
                </div>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-md border ${errors.roleId ? getErrorBorderClass() : getBorderColorClass()} ${getInputBgClass()} py-2 px-3 ${getInputTextClass()} focus:outline-none focus:ring-2 ${getInputFocusRingClass()}`}
                  disabled={filteredRoles.length === 0 || isSubmitting}
                >
                  <option value="" className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-[var(--background-primary)] text-[var(--text-primary)]'}>{translations.selectRole || "Sélectionner un rôle"}</option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.id} className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-[var(--background-primary)] text-[var(--text-primary)]'}>
                      {translations.roleNames?.[role.name] || role.name}
                      {role.description && ` - ${role.description}`}
                    </option>
                  ))}
                </select>
              </div>
              {renderFieldError('roleId')}
              
              {/* Information hiérarchique */}
              {filteredRoles.length > 0 && (
                <div className={`mt-1 text-xs ${getTextColorClass(false)}`}>
                  Votre rôle "{currentUser?.role?.name}" vous permet de gérer : {filteredRoles.map(r => translations.roleNames?.[r.name] || r.name).join(', ')}
                </div>
              )}
            </div>
            
            {/* Options supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className={`h-4 w-4 ${getAccentColorClass()} focus:ring-${isDarkMode ? 'purple' : 'var(--accent-color-primary)'} border-${isDarkMode ? 'gray-600' : 'var(--border-color)'} rounded ${getInputBgClass()}`}
                  disabled={isSubmitting}
                  style={{ color: isDarkMode ? 'purple' : 'var(--accent-color-primary)' }}
                />
                <label htmlFor="isActive" className={`ml-2 block text-sm ${getTextColorClass(false)}`}>
                  {translations.isActive || "Compte actif"}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  id="twoFactorEnabled"
                  checked={formData.twoFactorEnabled}
                  onChange={handleChange}
                  className={`h-4 w-4 ${getAccentColorClass()} focus:ring-${isDarkMode ? 'purple' : 'var(--accent-color-primary)'} border-${isDarkMode ? 'gray-600' : 'var(--border-color)'} rounded ${getInputBgClass()}`}
                  disabled={isSubmitting}
                  style={{ color: isDarkMode ? 'purple' : 'var(--accent-color-primary)' }}
                />
                <label htmlFor="twoFactorEnabled" className={`ml-2 block text-sm ${getTextColorClass(false)}`}>
                  {translations.twoFactorEnabled || "Authentification à deux facteurs"}
                </label>
              </div>
            </div>
            
            {/* Boutons */}
            <div className={`flex justify-end space-x-3 pt-4 border-t ${getBorderColorClass()}`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-[var(--background-input)] text-[var(--text-secondary)] hover:opacity-80'}`}
                disabled={isSubmitting}
              >
                {translations.cancel || "Annuler"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || filteredRoles.length === 0}
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 flex items-center transition-colors ${getButtonBgClass()} ${getButtonHoverBgClass()} ${(isSubmitting || filteredRoles.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ '--tw-ring-color': isDarkMode ? 'purple' : 'var(--accent-color-primary)' }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations.processing || "Traitement en cours..."}
                  </>
                ) : (
                  isEdit ? (translations.update || "Mettre à jour") : (translations.create || "Créer")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default UserForm;
