import React, { createContext, useContext, useState, useEffect } from 'react';

// Créer le Contexte
const LanguageContext = createContext();

// Langues disponibles
const availableLanguages = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    flag: '🇸🇦'
  }
];

// Traductions par défaut
const defaultTranslations = {
  // Navigation
  dashboard: "Tableau de bord",
  users: "Utilisateurs",
  roles: "Rôles",
  permissions: "Permissions",
  settings: "Paramètres",
  
  // Actions générales
  save: "Sauvegarder",
  cancel: "Annuler",
  create: "Créer",
  update: "Mettre à jour",
  delete: "Supprimer",
  edit: "Modifier",
  confirm: "Confirmer",
  close: "Fermer",
  
  // Messages
  loading: "Chargement...",
  processing: "Traitement en cours...",
  unknownError: "Une erreur est survenue",
  
  // Rôles
  roleManagement: "Gestion des Rôles",
  addRole: "Nouveau Rôle",
  editRole: "Modifier le rôle",
  deleteRole: "Supprimer le rôle",
  deleteRoleConfirmation: "Êtes-vous sûr de vouloir supprimer le rôle",
  thisActionCannot: "Cette action est irréversible.",
  noRolesFound: "Aucun rôle trouvé",
  startByCreatingRole: "Commencez par créer un rôle",
  errorLoadingRoles: "Erreur lors du chargement des rôles",
  roleName: "Nom du rôle",
  roleNamePlaceholder: "Nom du rôle",
  description: "Description",
  descriptionPlaceholder: "Description du rôle",
  permissionsSelected: "permission(s) sélectionnée(s)",
  noPermissionsAvailable: "Aucune permission disponible",
  mainPermissions: "Principales permissions:",
  others: "autres",
  
  // Validation
  nameRequired: "Le nom est requis",
  nameTooShort: "Le nom doit contenir au moins 3 caractères",
  descriptionRequired: "La description est requise",
  
  // Utilisateurs
  userManagement: "Gestion des Utilisateurs",
  addUser: "Ajouter un utilisateur",
  editUser: "Modifier l'utilisateur",
  deleteUser: "Supprimer l'utilisateur",
  activateUser: "Activer l'utilisateur",
  deactivateUser: "Désactiver l'utilisateur",
  confirmDeleteUser: "Confirmer la suppression",
  deleteUserConfirmation: "Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur",
  confirmToggleStatus: "Êtes-vous sûr de vouloir",
  activate: "activer",
  deactivate: "désactiver",
  theUser: "l'utilisateur",
  errorLoadingUsers: "Erreur lors du chargement des utilisateurs",
  searchUsers: "Rechercher un utilisateur...",
  allRoles: "Tous les rôles",
  showInactive: "Utilisateurs inactifs",
  total: "Total",
  active: "Actifs",
  noUsersFound: "Aucun utilisateur trouvé",
  tryModifyFilters: "Essayez de modifier vos filtres",
  startByCreatingUser: "Commencez par créer un utilisateur",
  user: "Utilisateur",
  role: "Rôle",
  status: "Statut",
  lastLogin: "Dernière connexion",
  actions: "Actions",
  neverConnected: "Jamais connecté",
  inactive: "Inactif"
};

// Provider du contexte
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isLoading, setIsLoading] = useState(false);

  // Charger la langue depuis le localStorage au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && availableLanguages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      loadTranslations(savedLanguage);
    }
  }, []);

  // Fonction pour charger les traductions
  const loadTranslations = async (languageCode) => {
    setIsLoading(true);
    try {
      console.log(`🌐 Chargement des traductions pour: ${languageCode}`);
      
      // Charger le fichier de traduction
      const translationModule = await import(`../locales/${languageCode}.json`);
      const loadedTranslations = translationModule.default || translationModule;
      
      // Fusionner avec les traductions par défaut
      const mergedTranslations = {
        ...defaultTranslations,
        ...loadedTranslations
      };
      
      setTranslations(mergedTranslations);
      
      // Mettre à jour l'attribut lang du document
      document.documentElement.lang = languageCode;
      
      // Déclencher un événement personnalisé pour notifier les composants
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode, translations: mergedTranslations } 
      }));
      
      console.log(`✅ Traductions chargées pour ${languageCode}:`, Object.keys(mergedTranslations).length, 'clés');
      
    } catch (error) {
      console.warn(`⚠️ Impossible de charger les traductions pour ${languageCode}:`, error);
      // Utiliser les traductions par défaut en cas d'erreur
      setTranslations(defaultTranslations);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour changer de langue
  const setLanguage = async (languageCode) => {
    console.log(`🔄 Changement de langue vers: ${languageCode}`);
    
    if (availableLanguages.find(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
      await loadTranslations(languageCode);
    } else {
      console.error(`❌ Langue non supportée: ${languageCode}`);
    }
  };

  // Fonction pour obtenir une traduction avec fallback
  const getTranslation = (key, fallback = key) => {
    return translations[key] || fallback;
  };

  // Fonction pour obtenir une traduction avec interpolation
  const getTranslationWithVars = (key, variables = {}, fallback = key) => {
    let translation = translations[key] || fallback;
    
    // Remplacer les variables dans la traduction
    Object.keys(variables).forEach(varKey => {
      const placeholder = `{{${varKey}}}`;
      translation = translation.replace(new RegExp(placeholder, 'g'), variables[varKey]);
    });
    
    return translation;
  };

  const contextValue = {
    currentLanguage,
    setLanguage,
    availableLanguages,
    translations,
    getTranslation,
    getTranslationWithVars,
    isLoading
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
