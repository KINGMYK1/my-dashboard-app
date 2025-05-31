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
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import Portal from '../../components/Portal/Portal';

const UserForm = ({ user, onClose, roles = [] }) => {
  const { translations } = useLanguage();
  const { user: currentUser, hasPermission } = useAuth();
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
  
  // Fonction pour vérifier la hiérarchie des rôles côté frontend
  const getRoleHierarchy = () => ({
    'Administrateur': 3,
    'Manager': 2,
    'Employé': 1
  });
  
  // Déterminer quels rôles l'utilisateur courant peut attribuer
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
      <p className="text-red-400 text-sm mt-1">{error}</p>
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
          className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-400/20"
          style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
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
              <div className="p-3 bg-red-600/20 border border-red-500/50 rounded-md text-red-300">
                {errors.general}
              </div>
            )}
            
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom d'utilisateur */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.username || "Nom d'utilisateur"} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder={translations.usernameLabel || "Nom d'utilisateur"}
                    disabled={isEdit || isSubmitting}
                  />
                </div>
                {renderFieldError('username')}
              </div>
              
              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.email || "Email"} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.firstName || "Prénom"} *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.firstName ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder={translations.firstNameLabel || "Prénom"}
                  disabled={isSubmitting}
                />
                {renderFieldError('firstName')}
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.lastName || "Nom"} *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.lastName ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder={translations.lastNameLabel || "Nom"}
                  disabled={isSubmitting}
                />
                {renderFieldError('lastName')}
              </div>
            </div>
            
            {/* Téléphone et Adresse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.phone || "Téléphone"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder={translations.phoneLabel || "Téléphone"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('phone')}
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.address || "Adresse"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.address ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.password || "Mot de passe"} {!isEdit && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder={isEdit ? translations.passwordEdit || "Laisser vide pour ne pas changer" : translations.passwordCreate || "Mot de passe"}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleShowPassword}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                  </button>
                </div>
                {renderFieldError('password')}
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  {translations.confirmPassword || "Confirmer le mot de passe"} {(!isEdit || formData.password) && '*'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder={translations.confirmPasswordLabel || "Confirmer le mot de passe"}
                    disabled={isSubmitting}
                  />
                </div>
                {renderFieldError('confirmPassword')}
              </div>
            </div>
            
            {/* Sélection du rôle avec avertissement hiérarchique */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {translations.role || "Rôle"} *
              </label>
              {filteredRoles.length === 0 && (
                <div className="mb-2 p-2 bg-yellow-600/20 border border-yellow-500/50 rounded text-yellow-300 text-sm">
                  Aucun rôle disponible pour votre niveau d'autorisation
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={18} className="text-gray-400" />
                </div>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-md border ${errors.roleId ? 'border-red-500' : 'border-gray-600'} bg-gray-700/50 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  disabled={filteredRoles.length === 0 || isSubmitting}
                >
                  <option value="">{translations.selectRole || "Sélectionner un rôle"}</option>
                  {filteredRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {translations.roleNames?.[role.name] || role.name}
                      {role.description && ` - ${role.description}`}
                    </option>
                  ))}
                </select>
              </div>
              {renderFieldError('roleId')}
              
              {/* Information hiérarchique */}
              {filteredRoles.length > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  Votre rôle "{currentUser?.role?.name}" vous permet de gérer : {filteredRoles.map(r => r.name).join(', ')}
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
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
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
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  disabled={isSubmitting}
                />
                <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-300">
                  {translations.twoFactorEnabled || "Authentification à deux facteurs"}
                </label>
              </div>
            </div>
            
            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                {translations.cancel || "Annuler"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || filteredRoles.length === 0}
                className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center transition-colors ${(isSubmitting || filteredRoles.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
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