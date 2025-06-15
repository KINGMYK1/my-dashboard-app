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

// Dans votre fichier src/contexts/LanguageContext.jsx ou src/locales/fr.js
 
  // ========== ABONNEMENTS ==========
  subscriptions: "Abonnements",
  subscriptionTypes: "Types d'Abonnements", 
  clientSubscriptions: "Abonnements Clients",
  subscriptionManagement: "Gestion des Abonnements",
  addSubscription: "Nouvel Abonnement",
  editSubscription: "Modifier l'Abonnement",
  deleteSubscription: "Supprimer l'Abonnement",
  subscriptionDetails: "Détails de l'Abonnement",
  activeSubscriptions: "Abonnements Actifs",
  expiredSubscriptions: "Abonnements Expirés",
  subscriptionHistory: "Historique des Abonnements",
  renewSubscription: "Renouveler l'Abonnement",
  cancelSubscription: "Annuler l'Abonnement",
  subscriptionStatus: "Statut de l'Abonnement",
  subscriptionDuration: "Durée de l'Abonnement",
  subscriptionPrice: "Prix de l'Abonnement",
  subscriptionStartDate: "Date de Début",
  subscriptionEndDate: "Date de Fin",
  remainingTime: "Temps Restant",
  autoRenewal: "Renouvellement Automatique",
  
  // ========== TYPES D'ABONNEMENTS ==========
  addSubscriptionType: "Nouveau Type d'Abonnement",
  editSubscriptionType: "Modifier le Type d'Abonnement",
  deleteSubscriptionType: "Supprimer le Type d'Abonnement",
  subscriptionTypeName: "Nom du Type",
  subscriptionTypeDescription: "Description du Type",
  subscriptionTypePrice: "Prix du Type",
  subscriptionTypeDuration: "Durée du Type",
  subscriptionTypeFeatures: "Fonctionnalités Incluses",
  noSubscriptionTypes: "Aucun type d'abonnement trouvé",
  noSubscriptionsFound: "Aucun abonnement trouvé",
  createFirstSubscriptionType: "Créer le premier type d'abonnement",
  
  // ========== CLIENTS (Complémentaires) ==========
  clientDetails: "Détails du Client",
  clientHistory: "Historique du Client", 
 
  clientSessions: "Sessions du Client",
  clientStats: "Statistiques du Client",
  addNote: "Ajouter une Note",
  noteText: "Texte de la note",
  clientNotes: "Notes du Client",
  mergeClients: "Fusionner les Clients",
  selectPrimaryClient: "Sélectionner le client principal",
  mergeClientsDescription: "Fusionner deux comptes clients en un seul",
  exportSelected: "Exporter la sélection",
  bulkActions: "Actions en lot",
  
  // ========== SESSIONS (Si utilisé) ==========
  sessions: "Sessions",
  activeSessions: "Sessions Actives", 
  sessionHistory: "Historique des Sessions",
  startSession: "Démarrer une Session",
  endSession: "Terminer la Session",
  pauseSession: "Mettre en Pause",
  resumeSession: "Reprendre la Session",
  sessionDuration: "Durée de la Session",
  sessionCost: "Coût de la Session",
  anonymousSession: "Session Anonyme",
  
  // ========== VENTES ==========
  pointOfSale: "Point de Vente",
  sales: "Ventes",
  newSale: "Nouvelle Vente",
  saleHistory: "Historique des Ventes",
  dailySales: "Ventes du Jour",
  monthlySales: "Ventes du Mois",
  totalRevenue: "Chiffre d'Affaires Total",
  
  // ========== INVENTAIRE ==========
  inventory: "Inventaire",
  stock: "Stock",
  products: "Produits",
  addProduct: "Ajouter un Produit",
  productName: "Nom du Produit",
  productPrice: "Prix du Produit",
  productStock: "Stock du Produit",
  lowStock: "Stock Faible",
  outOfStock: "Rupture de Stock",
  
  // ========== ÉVÉNEMENTS ==========
  events: "Événements",
  addEvent: "Nouvel Événement",
  editEvent: "Modifier l'Événement",
  deleteEvent: "Supprimer l'Événement",
  eventName: "Nom de l'Événement",
  eventDescription: "Description de l'Événement",
  eventDate: "Date de l'Événement",
  eventTime: "Heure de l'Événement",
  upcomingEvents: "Événements à Venir",
  pastEvents: "Événements Passés",
  
  // ========== DÉPENSES ==========
  expenses: "Dépenses",
  addExpense: "Nouvelle Dépense",
  editExpense: "Modifier la Dépense",
  deleteExpense: "Supprimer la Dépense",
  expenseAmount: "Montant de la Dépense",
  expenseCategory: "Catégorie de Dépense",
  expenseDescription: "Description de la Dépense",
  expenseDate: "Date de la Dépense",
  monthlyExpenses: "Dépenses Mensuelles",
  yearlyExpenses: "Dépenses Annuelles",
  
  // ========== RAPPORTS ==========
  reports: "Rapports",
  generateReport: "Générer un Rapport",
  dailyReport: "Rapport Journalier",
  weeklyReport: "Rapport Hebdomadaire",
  monthlyReport: "Rapport Mensuel",
  yearlyReport: "Rapport Annuel",
  financialReport: "Rapport Financier",
  activityReport: "Rapport d'Activité",
  
  // ========== SUPERVISION ==========
  supervision: "Supervision",
  monitoring: "Monitoring",
  systemStatus: "État du Système",
  userActivity: "Activité des Utilisateurs",
  systemLogs: "Journaux Système",
  
  // ========== MESSAGES D'ERREUR ET SUCCÈS ==========
  subscriptionCreatedSuccess: "Abonnement créé avec succès",
  subscriptionUpdatedSuccess: "Abonnement modifié avec succès", 
  subscriptionDeletedSuccess: "Abonnement supprimé avec succès",
  subscriptionTypeCreatedSuccess: "Type d'abonnement créé avec succès",
  subscriptionTypeUpdatedSuccess: "Type d'abonnement modifié avec succès",
  subscriptionTypeDeletedSuccess: "Type d'abonnement supprimé avec succès",
  errorCreatingSubscription: "Erreur lors de la création de l'abonnement",
  errorUpdatingSubscription: "Erreur lors de la modification de l'abonnement",
  errorDeletingSubscription: "Erreur lors de la suppression de l'abonnement",
  errorLoadingSubscriptions: "Erreur lors du chargement des abonnements",
  errorCreatingSubscriptionType: "Erreur lors de la création du type d'abonnement",
  errorLoadingSubscriptionTypes: "Erreur lors du chargement des types d'abonnements",
  
  // ========== FORMULAIRES ==========
  subscriptionForm: "Formulaire d'Abonnement",
  subscriptionTypeForm: "Formulaire de Type d'Abonnement",
  selectSubscriptionType: "Sélectionner un type d'abonnement",
  selectClient: "Sélectionner un client",
  subscriptionNameRequired: "Le nom de l'abonnement est requis",
  subscriptionPriceRequired: "Le prix de l'abonnement est requis",
  subscriptionDurationRequired: "La durée de l'abonnement est requise",
  
  // ========== NAVIGATION ET FILTRES ==========
  filterByStatus: "Filtrer par statut",
  filterByType: "Filtrer par type",
  filterByClient: "Filtrer par client", 
  filterByDate: "Filtrer par date",
  searchSubscriptions: "Rechercher des abonnements",
  searchSubscriptionTypes: "Rechercher des types d'abonnements",
  sortByName: "Trier par nom",
  sortByDate: "Trier par date",
  sortByPrice: "Trier par prix",
  sortByStatus: "Trier par statut",
  
  // ========== STATISTIQUES ==========
  totalSubscriptions: "Total des Abonnements",
  activeSubscriptionsCount: "Abonnements Actifs",
  expiredSubscriptionsCount: "Abonnements Expirés",
  monthlyRevenue: "Revenus Mensuels",
  averageSubscriptionValue: "Valeur Moyenne des Abonnements",
  
  // ========== ACTIONS ==========
  viewSubscription: "Voir l'Abonnement",
 
  extendSubscription: "Prolonger l'Abonnement",
  
  // ========== CATÉGORIES DE PERMISSIONS (Mise à jour) ==========
 
    system: "Système",
    users: "Utilisateurs", 
    roles: "Rôles",
    permissions: "Permissions",
    postes: "Postes Gaming",
    customers: "Clients",
   
   
    finance: "Finances",
  
    typesPostes: "Types de Postes",
  
    other: "Autres",
  


  // Navigation
  dashboard: "Tableau de bord",
 
  
 
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
  inactive: "Inactif",

  // Permissions
  permissionManagement: "Gestion des Permissions",
  addPermission: "Nouvelle Permission",
  editPermission: "Modifier la permission",
  deletePermission: "Supprimer la permission",
  deletePermissionConfirmation: "Êtes-vous sûr de vouloir supprimer la permission",
  errorLoadingPermissions: "Erreur lors du chargement des permissions",
  searchPermissions: "Rechercher des permissions...",
  noPermissions: "Aucune permission disponible",
  tryModifySearch: "Essayez de modifier votre recherche",
  permissionName: "Nom de la permission",
  permissionNameFormat: "Format recommandé: RESOURCE_ACTION (ex: USERS_VIEW, POSTES_MANAGE)",
  permissionDescriptionPlaceholder: "Description de la permission...",
  permissionSystemProtected: "Permission système protégée",
  permissionSystemNotModifiable: "Cette permission système ne peut pas être modifiée pour des raisons de sécurité.",
  permissionSystemNotDeletable: "Cette permission système ne peut pas être supprimée pour des raisons de sécurité.",
  modifiable: "Modifiable",
  characters: "caractères",
  examplesOfPermissions: "Exemples de permissions",
  modification: "Modification...",
  creation: "Création...",
  

  // Catégories de permissions (pour Roles et Permissions)
  permissionCategories: {
    system: "Système",
    users: "Utilisateurs",
    roles: "Rôles", 
    permissions: "Permissions",
    postes: "Postes Gaming",
    customers: "Clients",
    sales: "Ventes",
    inventory: "Inventaire",
    finance: "Finances",
    events: "Événements",
    monitoring: "Monitoring",
    sessions: "Sessions",
    typesPostes: "Types de Postes",
    other: "Autres"
  },

  // Settings
  settingsTitle: "Paramètres",
  generalTab: "Général",
  appearanceTab: "Apparence",
  languageTab: "Langue",
  notificationsTab: "Notifications",
  accountTab: "Compte",
  systemTab: "Système",
  saveButton: "Sauvegarder",
  generalSettingsTitle: "Paramètres généraux",
  autoSaveLabel: "Sauvegarde automatique",
  autoSaveDescription: "Sauvegarder automatiquement les modifications",
  sessionTimeoutLabel: "Délai d'expiration de session",
  minutes: "minutes",
  hour: "heure",
  hours: "heures",
  appearanceTitle: "Apparence",
  themeLabel: "Thème",
  languageInterfaceLabel: "Langue de l'interface",
  notificationsTitle: "Notifications",
  notificationsEnabledLabel: "Notifications activées",
  notificationsEnabledDescription: "Recevoir des notifications dans l'application",
  accountInfoTitle: "Informations du compte",
  databaseLabel: "Base de données",
  databaseDescription: "SQLite - Stockage local",
  appVersionLabel: "Version de l'application",
  appVersionValue: "v1.0.0 - Gaming Center Management",
  exportDataButton: "Exporter les données"
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
    } else {
      // Définir 'fr' comme langue par défaut si rien n'est trouvé
      setCurrentLanguage('fr');
      localStorage.setItem('preferredLanguage', 'fr');
      loadTranslations('fr');
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
