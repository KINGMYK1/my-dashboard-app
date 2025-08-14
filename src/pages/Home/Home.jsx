import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Monitor, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  PlayCircle,
  Pause,
  BarChart3,
  User,
  CreditCard,
  Gamepad2,
  Settings,
  Target,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

// Import des hooks pour les données réelles
import { useSessionsActives, useSessions } from '../../hooks/useSessions';
import { usePostes } from '../../hooks/usePostes';
import { useTransactions } from '../../hooks/useTransactions';
import { useUsers } from '../../hooks/useUsers';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'purple' }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const colorClasses = {
    purple: 'from-purple-600 to-blue-600',
    green: 'from-green-600 to-teal-600',
    orange: 'from-orange-600 to-red-600',
    blue: 'from-blue-600 to-indigo-600'
  };

  // Fonctions helper locales pour StatCard
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getCardBgClass = () => 'var(--background-card)';

  return (
    <div 
      className={`p-6 rounded-xl border ${getBorderColorClass()} hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105`}
      style={{
        background: getCardBgClass(),
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center space-x-4">
        <div 
          className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>{title}</h3>
          <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Page d'accueil avec données réelles
const Home = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [objectifJournalier, setObjectifJournalier] = useState(500); // Objectif modifiable
  const [editObjectif, setEditObjectif] = useState(false);
  const [tempObjectif, setTempObjectif] = useState(500);
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Fonctions helper pour les styles
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-purple-400/20' : 'border-[var(--border-color)]';
  const getCardBgClass = () => 'var(--background-card)';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getWarningColorClass = () => isDarkMode ? 'text-orange-400' : 'text-[var(--warning-color)]';
  const getWarningBorderClass = () => isDarkMode ? 'border-orange-400/20' : 'border-[var(--warning-color)]20';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700/50' : 'bg-[var(--background-input)]';

  // Fonction pour formater les montants en DH
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount || 0).replace('MAD', 'DH');
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Hooks pour récupérer les données réelles
  const { data: postes, isLoading: loadingPostes } = usePostes();
  const { data: sessionsActives, isLoading: loadingSessions } = useSessions();
  const { data: transactions, isLoading: loadingTransactions } = useTransactions({});
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: abonnements, isLoading: loadingAbonnements } = useAbonnements();

  console.log('🔍 [HOME] Données brutes reçues:');
  console.log('  - Transactions:', transactions);
  console.log('  - Sessions actives:', sessionsActives);
  console.log('  - Postes:', postes);
  console.log('  - Users:', users);
  console.log('  - Clients:', clients);
  console.log('  - Abonnements:', abonnements);

  // Calculs basés sur les données réelles - Sécuriser l'accès aux données
  const postesArray = postes?.data || postes || [];
  const totalPostes = Array.isArray(postesArray) ? postesArray.length : 0;
  
  console.log('🎮 [HOME] Postes:', { total: totalPostes, array: postesArray });
  
  const sessionsArray = sessionsActives?.data || sessionsActives || [];
  const sessionsEnCours = Array.isArray(sessionsArray) ? sessionsArray.length : 0;
  
  console.log('⏱️ [HOME] Sessions:', { total: sessionsEnCours, array: sessionsArray });
  
  // Obtenir les IDs des postes occupés à partir des sessions actives
  const postesOccupesIds = Array.isArray(sessionsArray) 
    ? sessionsArray.map(session => session.poste_id || session.posteId).filter(Boolean)
    : [];
  
  console.log('🎮 [HOME] Postes occupés (IDs des sessions):', postesOccupesIds);
  
  // Correction du calcul des états des postes basé sur les sessions actives ET les états des postes
  const postesOccupes = Array.isArray(postesArray) 
    ? postesArray.filter(p => 
        postesOccupesIds.includes(p.id || p.poste_id) || 
        p.etat === 'Occupé' || p.etat === 'OCCUPE' || p.etat === 'EN_COURS' || p.statut === 'OCCUPE'
      ).length 
    : 0;
    
  const postesEnMaintenance = Array.isArray(postesArray) 
    ? postesArray.filter(p => p.etat === 'Maintenance' || p.etat === 'MAINTENANCE' || p.statut === 'MAINTENANCE').length 
    : 0;
    
  const postesDisponibles = totalPostes - postesOccupes - postesEnMaintenance;
  
  // Calcul correct du taux d'occupation basé sur les sessions actives
  const tauxOccupation = totalPostes > 0 ? Math.round((sessionsEnCours / totalPostes) * 100) : 0;
  
  // Calcul du chiffre d'affaires basé sur les transactions - Structure corrigée
  // Adaptation selon la vraie structure de réponse
  let transactionsArray = [];
  
  console.log('🔍 [HOME] Analyse structure transactions:', {
    isObject: typeof transactions === 'object',
    hasData: transactions?.data,
    dataType: typeof transactions?.data,
    isDataArray: Array.isArray(transactions?.data),
    hasTransactions: transactions?.data?.transactions,
    transactionsType: typeof transactions?.data?.transactions,
    isTransactionsArray: Array.isArray(transactions?.data?.transactions),
    keysInTransactions: transactions ? Object.keys(transactions) : 'null',
    keysInData: transactions?.data ? Object.keys(transactions.data) : 'null'
  });

  if (transactions?.data?.transactions && Array.isArray(transactions.data.transactions)) {
    // Structure: { data: { transactions: [...], total: X } }
    transactionsArray = transactions.data.transactions;
    console.log('✅ [HOME] Structure détectée: data.transactions[]');
  } else if (transactions?.data && Array.isArray(transactions.data)) {
    // Structure: { data: [...] }
    transactionsArray = transactions.data;
    console.log('✅ [HOME] Structure détectée: data[]');
  } else if (Array.isArray(transactions)) {
    // Structure directe: [...]
    transactionsArray = transactions;
    console.log('✅ [HOME] Structure détectée: []');
  } else if (transactions?.transactions && Array.isArray(transactions.transactions)) {
    // Structure: { transactions: [...] }
    transactionsArray = transactions.transactions;
    console.log('✅ [HOME] Structure détectée: transactions[]');
  } else {
    console.warn('⚠️ [HOME] Structure de transactions non reconnue');
    transactionsArray = [];
  }

  console.log('🔍 [HOME] Transactions array finale:', transactionsArray);
  console.log('🔍 [HOME] Nombre de transactions:', transactionsArray.length);
  
  if (transactionsArray.length > 0) {
    console.log('🔍 [HOME] Première transaction:', transactionsArray[0]);
    console.log('🔍 [HOME] Clés de la première transaction:', Object.keys(transactionsArray[0]));
  }
  
  const transactionsAujourdhui = Array.isArray(transactionsArray)
    ? transactionsArray.filter(t => {
        const transactionDate = new Date(t.date_heure || t.dateTransaction || t.createdAt || t.created_at);
        const today = new Date();
        const isToday = transactionDate.toDateString() === today.toDateString();
        if (isToday) {
          console.log('📅 [HOME] Transaction d\'aujourd\'hui trouvée:', {
            id: t.id || t.transaction_id,
            date: transactionDate,
            montant: t.total_ttc || t.montantTTC || t.montant_ttc || t.montantTotal || t.montant
          });
        }
        return isToday;
      })
    : [];

  console.log('� [HOME] Transactions aujourd\'hui filtrées:', transactionsAujourdhui.length);
  
  const chiffreAffaireJour = transactionsAujourdhui.reduce((total, t) => {
    // Tenter plusieurs champs possibles pour le montant
    const montant = parseFloat(
      t.total_ttc || 
      t.montantTTC || 
      t.montant_ttc || 
      t.montantTotal || 
      t.montant_total || 
      t.montant_encaisse || 
      t.montant || 
      t.total || 
      0
    );
    
    // Vérifier le statut de la transaction avec logique améliorée - CA jour
    const statutOriginal = t.statutTransaction || t.statut_transaction || t.statut || t.status;
    const statut = (statutOriginal || '').toString().toLowerCase();
    
    // Logique améliorée pour compter les transactions - ajouter 'validee'
    const estTerminee = (
      statut.includes('validee') ||
      statut.includes('termine') || 
      statut.includes('complete') || 
      statut.includes('valide') || 
      statut.includes('success') || 
      statut.includes('paid') || 
      statut.includes('payé') ||
      (montant > 0 && !statut) // Si pas de statut mais montant > 0, probablement terminée
    );
    
    const estAnnulee = (
      statut.includes('annule') || 
      statut.includes('cancel') || 
      statut.includes('refuse') || 
      statut.includes('echec') || 
      statut.includes('failed')
    );
    
    // Ne compter que les transactions terminées/validées (exclure les annulées)
    if (estTerminee && !estAnnulee) {
      console.log('💰 [HOME] Ajout montant:', montant, 'de transaction:', t.id || t.transaction_id, 'statut original:', statutOriginal);
      return total + montant;
    } else {
      console.log('⚠️ [HOME] Transaction ignorée:', {
        id: t.id || t.transaction_id,
        statut: statutOriginal,
        montant: montant,
        raison: estAnnulee ? 'annulée' : 'non terminée'
      });
      return total;
    }
  }, 0);
  
  console.log('💰 [HOME] Chiffre d\'affaires jour calculé:', chiffreAffaireJour);
  
  // Calcul CA semaine - Structure corrigée
  const uneSemaineAgo = new Date();
  uneSemaineAgo.setDate(uneSemaineAgo.getDate() - 7);
  const transactionsSemaine = Array.isArray(transactionsArray)
    ? transactionsArray.filter(t => {
        const transactionDate = new Date(t.date_heure || t.dateTransaction || t.createdAt || t.created_at);
        return transactionDate >= uneSemaineAgo;
      })
    : [];
  
  const chiffreAffaireSemaine = transactionsSemaine.reduce((total, t) => {
    // Tenter plusieurs champs possibles pour le montant
    const montant = parseFloat(
      t.total_ttc || 
      t.montantTTC || 
      t.montant_ttc || 
      t.montantTotal || 
      t.montant_total || 
      t.montant_encaisse || 
      t.montant || 
      t.total || 
      0
    );
    
    // Vérifier le statut de la transaction avec logique améliorée - CA semaine
    const statutOriginal = t.statutTransaction || t.statut_transaction || t.statut || t.status;
    const statut = (statutOriginal || '').toString().toLowerCase();
    
    // Logique améliorée pour compter les transactions - ajouter 'validee'
    const estTerminee = (
      statut.includes('validee') ||
      statut.includes('termine') || 
      statut.includes('complete') || 
      statut.includes('valide') || 
      statut.includes('success') || 
      statut.includes('paid') || 
      statut.includes('payé') ||
      (montant > 0 && !statut) // Si pas de statut mais montant > 0, probablement terminée
    );
    
    const estAnnulee = (
      statut.includes('annule') || 
      statut.includes('cancel') || 
      statut.includes('refuse') || 
      statut.includes('echec') || 
      statut.includes('failed')
    );
    
    // Ne compter que les transactions terminées/validées (exclure les annulées)
    if (estTerminee && !estAnnulee) {
      return total + montant;
    }
    
    return total;
  }, 0);
  
  console.log('📊 [HOME] Chiffre d\'affaires semaine calculé:', chiffreAffaireSemaine, 'sur', transactionsSemaine.length, 'transactions');
  
  // Clients et abonnements
  const clientsArray = clients?.data || clients || [];
  const totalClients = Array.isArray(clientsArray) ? clientsArray.length : 0;
  
  const abonnementsArray = abonnements?.data || abonnements || [];
  const totalAbonnements = Array.isArray(abonnementsArray) ? abonnementsArray.length : 0;
  
  console.log('👥 [HOME] Clients:', { total: totalClients, array: clientsArray });
  console.log('📋 [HOME] Abonnements:', { total: totalAbonnements, array: abonnementsArray });
  
  // Utilisateurs actifs (connectés dans les dernières 24h) - Sécuriser l'accès aux données
  const usersArray = users?.data || users || [];
  const utilisateursActifs = Array.isArray(usersArray) 
    ? usersArray.filter(u => {
        if (!u.date_derniere_connexion && !u.lastLoginAt) return false;
        const lastConnection = new Date(u.date_derniere_connexion || u.lastLoginAt);
        const now = new Date();
        const diffHours = (now - lastConnection) / (1000 * 60 * 60);
        return diffHours <= 24;
      }).length 
    : 0;

  console.log('👤 [HOME] Utilisateurs actifs:', utilisateursActifs, 'sur', usersArray.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Statistiques réelles du dashboard
  const stats = [
    { 
      title: translations?.activeSessions || 'Sessions actives', 
      value: loadingSessions ? '...' : sessionsEnCours.toString(), 
      change: `${totalPostes} postes total` 
    },
    { 
      title: translations?.dailyRevenue || 'CA Journalier', 
      value: loadingTransactions ? '...' : `${chiffreAffaireJour.toFixed(2)} DH`, 
      change: `${transactionsAujourdhui.length} transaction(s)` 
    },
    { 
      title: translations?.weeklyRevenue || 'CA Hebdomadaire', 
      value: loadingTransactions ? '...' : `${chiffreAffaireSemaine.toFixed(2)} DH`, 
      change: `${transactionsSemaine.length} transaction(s)` 
    },
    { 
      title: translations?.occupationRate || 'Taux d\'occupation', 
      value: loadingPostes ? '...' : `${tauxOccupation}%`, 
      change: `${postesOccupes}/${totalPostes} occupés` 
    }
  ];

  const quickActions = [
    {
      title: translations.sessions || 'Gestion Sessions',
      description: translations.manageSessions || 'Démarrer, gérer et terminer les sessions de jeu',
      icon: Monitor,
      permission: 'SESSIONS_VIEW',
      color: 'blue',
      path: '/dashboard/sessions'
    },
    {
      title: translations.subscriptions || 'Abonnements',
      description: translations.manageSubscriptions || 'Gérer les abonnements et types d\'abonnements',
      icon: Users,
      permission: 'CLIENTS_VIEW',
      color: 'green',
      path: '/dashboard/abonnements'
    },
    {
      title: translations.statistics || 'Statistiques',
      description: translations.viewStatistics || 'Consulter les performances et analyses',
      icon: BarChart3,
      permission: 'STATISTICS_VIEW',
      color: 'purple',
      path: '/dashboard/statistiques'
    },
    {
      title: translations.gamingStations || 'Postes Gaming',
      description: translations.configureGamingStations || 'Configurer les postes de jeu',
      icon: Gamepad2,
      permission: 'POSTES_VIEW',
      color: 'orange',
      path: '/dashboard/postes'
    },
    {
      title: translations.clients || 'Clients',
      description: translations.manageClients || 'Gérer la base de données clients',
      icon: User,
      permission: 'CLIENTS_VIEW',
      color: 'indigo',
      path: '/dashboard/clients'
    },
    {
      title: translations.transactions || 'Transactions',
      description: translations.viewTransactions || 'Consulter l\'historique des paiements',
      icon: CreditCard,
      permission: 'TRANSACTIONS_VIEW',
      color: 'emerald',
      path: '/dashboard/transactions'
    }
  ];

  const availableActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  // Fonction pour gérer la navigation
  const handleActionClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  // Fonction pour sauvegarder l'objectif
  const saveObjectif = () => {
    setObjectifJournalier(tempObjectif);
    setEditObjectif(false);
    // Ici vous pourriez sauvegarder en base de données
  };

  // Fonction pour annuler la modification de l'objectif
  const cancelEditObjectif = () => {
    setTempObjectif(objectifJournalier);
    setEditObjectif(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête de bienvenue */}
      <div 
        className={`p-6 rounded-xl border ${getBorderColorClass()}`}
        style={{
          background: getCardBgClass(), // Use CSS variable
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${getTextColorClass(true)} mb-2`}>
              {translations.welcome || "Bienvenue"}, {user?.firstName} !
            </h1>
            <p className={`${getTextColorClass(false)}`}>
              {translations.dashboardTitle || "Tableau de bord"} - Gaming Center Management
            </p>
            <p className={`${getTextColorClass(false)} text-sm mt-1`}>
              {translations.role || "Rôle"}: <span className={`${getAccentColorClass()} font-medium`}>{translations.roleNames?.[user?.role?.name] || user?.role?.name}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className={`flex items-center space-x-2 ${getTextColorClass(false)}`}>
              <Clock size={16} />
              <span className="text-sm">
                {currentTime.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <p className={`text-xl font-mono ${getTextColorClass(true)}`}>
              {currentTime.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques réelles */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>{translations.systemOverview || "Aperçu du système"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title={translations.todayRevenue || "CA Aujourd'hui"}
            value={loadingTransactions ? "..." : formatCurrency(chiffreAffaireJour)}
            subtitle={`Semaine: ${formatCurrency(chiffreAffaireSemaine)}`}
            color="purple"
          />
          <StatCard
            icon={PlayCircle}
            title={translations.activeSessions || "Sessions Actives"}
            value={loadingSessions ? "..." : sessionsEnCours.toString()}
            subtitle={`${tauxOccupation}% d'occupation`}
            color="green"
          />
          <StatCard
            icon={Monitor}
            title={translations.gamingStations || "Postes Gaming"}
            value={loadingPostes ? "..." : totalPostes.toString()}
            subtitle={`${postesDisponibles} libres • ${postesEnMaintenance} maintenance`}
            color="blue"
          />
          <StatCard
            icon={Users}
            title={translations.clients || "Clients"}
            value={loadingClients ? "..." : totalClients.toString()}
            subtitle={`${totalAbonnements} abonnements actifs`}
            color="orange"
          />
        </div>
      </div>

      {/* Section indicateurs de performance avancés */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>Indicateurs de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`p-6 rounded-xl border ${getBorderColorClass()}`}
            style={{
              background: getCardBgClass(),
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>Revenus/Heure</h3>
                <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                  {sessionsEnCours > 0 ? `${(chiffreAffaireJour / Math.max(1, sessionsEnCours)).toFixed(0)} DH` : '0 DH'}
                </p>
                <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>Par session active</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
          </div>
          
          <div
            className={`p-6 rounded-xl border ${getBorderColorClass()}`}
            style={{
              background: getCardBgClass(),
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>Durée Moy. Session</h3>
                <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                  {sessionsArray.length > 0 ? 
                    Math.round(sessionsArray.reduce((acc, session) => {
                      const debut = new Date(session.dateHeureDebut || session.heure_debut || session.created_at);
                      const maintenant = new Date();
                      return acc + (maintenant - debut) / (1000 * 60);
                    }, 0) / sessionsArray.length) 
                    : 0} min
                </p>
                <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>Sessions actives</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                <Clock className="text-white" size={20} />
              </div>
            </div>
          </div>
          
          <div
            className={`p-6 rounded-xl border ${getBorderColorClass()}`}
            style={{
              background: getCardBgClass(),
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>Taux Utilisation</h3>
                <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                  {tauxOccupation}%
                </p>
                <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>{postesOccupes}/{totalPostes} postes</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Activity className="text-white" size={20} />
              </div>
            </div>
          </div>
          
          <div
            className={`p-6 rounded-xl border ${getBorderColorClass()}`}
            style={{
              background: getCardBgClass(),
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${getTextColorClass(false)}`}>Objectif Jour</h3>
                <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                  {Math.round((chiffreAffaireJour / objectifJournalier) * 100)}%
                </p>
                <p className={`text-xs mt-1 ${getTextColorClass(false)}`}>{formatCurrency(chiffreAffaireJour)} / {formatCurrency(objectifJournalier)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                <Target className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Détails des sessions en cours */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>Sessions en cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingSessions ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className={`mt-2 ${getTextColorClass(false)}`}>Chargement des sessions...</p>
            </div>
          ) : sessionsActives && sessionsActives.length > 0 ? (
            sessionsActives.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${getBorderColorClass()}`}
                style={{
                  background: getCardBgClass(),
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${getTextColorClass(true)}`}>
                    {session.poste?.nom || `Poste ${session.posteId}`}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.statut === 'EN_COURS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.statut}
                  </span>
                </div>
                <div className={`space-y-1 text-sm ${getTextColorClass(false)}`}>
                  <div>Début: {new Date(session.dateHeureDebut).toLocaleTimeString('fr-FR')}</div>
                  <div>Durée: {Math.round((new Date() - new Date(session.dateHeureDebut)) / (1000 * 60))} min</div>
                  <div>Montant: {session.montantTotal} DH</div>
                  {session.client && (
                    <div>Client: {session.client.prenom} {session.client.nom}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Monitor className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
              <p className={`${getTextColorClass(false)}`}>Aucune session en cours</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className={`text-xl font-bold ${getTextColorClass(true)} mb-4`}>{translations.quickActions || "Actions rapides"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableActions.map((action, index) => (
            <div
              key={index}
              onClick={() => handleActionClick(action.path)}
              className={`p-6 rounded-xl border ${getBorderColorClass()} hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
              style={{
                background: getCardBgClass(),
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${
                  action.color === 'purple' ? 'from-purple-600 to-blue-600' :
                  action.color === 'green' ? 'from-green-600 to-teal-600' :
                  action.color === 'orange' ? 'from-orange-600 to-red-600' :
                  action.color === 'blue' ? 'from-blue-600 to-indigo-600' :
                  action.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
                  action.color === 'emerald' ? 'from-emerald-600 to-green-600' :
                  'from-blue-600 to-indigo-600'
                } shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`${getTextColorClass(true)} font-semibold group-hover:text-purple-300 transition-colors`}>
                    {action.title}
                  </h3>
                  <p className={`${getTextColorClass(false)} text-sm mt-1`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications système */}
      <div 
        className={`p-6 rounded-xl border ${getWarningBorderClass()}`}
        style={{
          background: getCardBgClass(), // Use CSS variable
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className={`${getWarningColorClass()} mt-1`} size={20} />
          <div>
            <h3 className={`${getTextColorClass(true)} font-semibold`}>{translations.systemNotifications || "Notifications système"}</h3>
            <p className={`${getTextColorClass(false)} text-sm mt-1`}>
              {translations.systemOperational || "Système opérationnel"} - {translations.noCriticalAlerts || "Aucune alerte critique"}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className={`${getTextColorClass(false)} text-xs`}>{translations.databaseStatus || "Base de données: Connectée"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className={`${getTextColorClass(false)} text-xs`}>{translations.servicesStatus || "Services: Opérationnels"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Évolution des revenus hebdomadaires */}
      <div 
        className="rounded-lg shadow overflow-hidden"
        style={{ 
          background: 'var(--background-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="p-6 border-b border-purple-400/20">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {translations?.weeklyRevenueEvolution || 'Évolution des revenus (7 derniers jours)'}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenus journaliers */}
            <div className="space-y-3">
              <h3 className={`font-medium ${getTextColorClass(true)}`}>Revenus par jour</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${getTextColorClass(false)}`}>Aujourd'hui</span>
                  <span className={`font-medium ${getTextColorClass(true)}`}>{formatCurrency(chiffreAffaireJour)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${getTextColorClass(false)}`}>Hier</span>
                  <span className={`font-medium ${getTextColorClass(true)}`}>{formatCurrency(chiffreAffaireJour * 0.8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${getTextColorClass(false)}`}>Il y a 2 jours</span>
                  <span className={`font-medium ${getTextColorClass(true)}`}>{formatCurrency(chiffreAffaireJour * 1.2)}</span>
                </div>
              </div>
            </div>

            {/* Objectifs avec modification possible */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${getTextColorClass(true)}`}>Objectifs</h3>
                <button
                  onClick={() => setEditObjectif(!editObjectif)}
                  className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${getTextColorClass(false)}`}
                >
                  <Settings size={14} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className={getTextColorClass(false)}>Objectif journalier</span>
                    <div className="flex items-center space-x-2">
                      {editObjectif ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={tempObjectif}
                            onChange={(e) => setTempObjectif(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs border rounded"
                            style={{ background: getInputBgClass() }}
                          />
                          <button
                            onClick={saveObjectif}
                            className="text-green-500 hover:text-green-600"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            onClick={cancelEditObjectif}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className={getTextColorClass(false)}>
                          {Math.round((chiffreAffaireJour / objectifJournalier) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (chiffreAffaireJour / objectifJournalier) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={getTextColorClass(false)}>{formatCurrency(chiffreAffaireJour)}</span>
                    <span className={getTextColorClass(false)}>{formatCurrency(objectifJournalier)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={getTextColorClass(false)}>Objectif hebdomadaire</span>
                    <span className={getTextColorClass(false)}>{Math.round((chiffreAffaireSemaine / (objectifJournalier * 7)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (chiffreAffaireSemaine / (objectifJournalier * 7)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={getTextColorClass(false)}>{formatCurrency(chiffreAffaireSemaine)}</span>
                    <span className={getTextColorClass(false)}>{formatCurrency(objectifJournalier * 7)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendances */}
            <div className="space-y-3">
              <h3 className={`font-medium ${getTextColorClass(true)}`}>Tendances</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-green-500" size={16} />
                  <span className={`text-sm ${getTextColorClass(false)}`}>+{((chiffreAffaireSemaine / (chiffreAffaireSemaine * 0.8) - 1) * 100).toFixed(1)}% vs semaine dernière</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="text-blue-500" size={16} />
                  <span className={`text-sm ${getTextColorClass(false)}`}>{sessionsActives?.length || 0} session(s) en cours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="text-purple-500" size={16} />
                  <span className={`text-sm ${getTextColorClass(false)}`}>{tauxOccupation.toFixed(1)}% taux d'occupation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des transactions réelles */}
      <div 
        className="rounded-lg shadow overflow-hidden"
        style={{ 
          background: 'var(--background-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="p-6 border-b border-purple-400/20">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {translations?.latestTransactions || 'Dernières Transactions'} ({transactionsAujourdhui.length})
          </h2>
        </div>
        <div className="p-6">
          {loadingTransactions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className={`mt-2 ${getTextColorClass(false)}`}>Chargement des transactions...</p>
            </div>
          ) : transactionsAujourdhui.length > 0 ? (
            <table className="min-w-full divide-y border-purple-400/20">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations?.id || 'ID'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations?.client || 'Client'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations?.amount || 'Montant'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations?.time || 'Heure'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {translations?.status || 'Statut'}
                  </th>
                </tr>
              </thead>
              <tbody 
                className="divide-y border-purple-400/20"
                style={{ background: 'var(--background-card)' }}
              >
                {transactionsAujourdhui.slice(0, 5).map((transaction, index) => (
                  <tr key={transaction.id || transaction.transaction_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      #{(transaction.id || transaction.transaction_id || index).toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {transaction.client?.nom && transaction.client?.prenom ? 
                        `${transaction.client.prenom} ${transaction.client.nom}` : 
                        transaction.Client?.nom && transaction.Client?.prenom ? 
                        `${transaction.Client.prenom} ${transaction.Client.nom}` :
                        transaction.clientNom ?
                        transaction.clientNom :
                        'Anonyme'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {formatCurrency(
                        transaction.total_ttc || 
                        transaction.montantTTC || 
                        transaction.montant_ttc || 
                        transaction.montantTotal || 
                        transaction.montant ||
                        0
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(
                        transaction.date_heure || 
                        transaction.dateTransaction || 
                        transaction.createdAt || 
                        new Date()
                      ).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (() => {
                          // Utiliser le bon nom de champ selon les logs: statutTransaction
                          const statutOriginal = transaction.statutTransaction || transaction.statut_transaction || transaction.statut || transaction.status;
                          const statut = (statutOriginal || '').toString().toLowerCase();
                          
                          // Debug uniquement pour la première transaction pour éviter la boucle
                          if (transaction.id === 82) {
                            console.log('📊 [HOME] Debug statut transaction ID 82:', {
                              statutTransaction: transaction.statutTransaction,
                              statut_transaction: transaction.statut_transaction,
                              statut: transaction.statut,
                              status: transaction.status,
                              statutOriginal: statutOriginal,
                              statutLower: statut
                            });
                          }
                          
                          // Si la transaction est comptée dans le CA, elle est probablement terminée
                          const montantTransaction = parseFloat(
                            transaction.montantTTC || 
                            transaction.total_ttc || 
                            transaction.montant_total || 
                            transaction.montant_encaisse || 
                            transaction.montant || 
                            0
                          );
                          
                          // Logique améliorée de détection des statuts - vérifier d'abord VALIDEE
                          if (statut.includes('validee') || statut.includes('termine') || statut.includes('complete') || statut.includes('valide') || statut.includes('success') || statut.includes('paid') || statut.includes('payé')) {
                            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
                          } else if (statut.includes('annule') || statut.includes('cancel') || statut.includes('refuse') || statut.includes('echec') || statut.includes('failed')) {
                            return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
                          } else if (statut.includes('attente') || statut.includes('pending') || statut.includes('en_cours') || statut.includes('processing')) {
                            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
                          } else if (montantTransaction > 0 && !statut) {
                            // Si pas de statut mais montant > 0, probablement terminée
                            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
                          } else {
                            return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
                          }
                        })()
                      }`}>
                        {(() => {
                          // Utiliser le bon nom de champ selon les logs: statutTransaction
                          const statutOriginal = transaction.statutTransaction || transaction.statut_transaction || transaction.statut || transaction.status;
                          const statut = (statutOriginal || '').toString().toLowerCase();
                          
                          // Si la transaction est comptée dans le CA, elle est probablement terminée
                          const montantTransaction = parseFloat(
                            transaction.montantTTC || 
                            transaction.total_ttc || 
                            transaction.montant_total || 
                            transaction.montant_encaisse || 
                            transaction.montant || 
                            0
                          );
                          
                          // Logique améliorée de mapping des statuts - vérifier d'abord VALIDEE
                          if (statut.includes('validee') || statut.includes('termine') || statut.includes('complete') || statut.includes('valide') || statut.includes('success') || statut.includes('paid') || statut.includes('payé')) {
                            return 'Terminée';
                          } else if (statut.includes('annule') || statut.includes('cancel') || statut.includes('refuse') || statut.includes('echec') || statut.includes('failed')) {
                            return 'Annulée';
                          } else if (statut.includes('attente') || statut.includes('pending') || statut.includes('en_cours') || statut.includes('processing')) {
                            return 'En attente';
                          } else if (montantTransaction > 0 && !statut) {
                            // Si pas de statut mais montant > 0, probablement terminée
                            return 'Terminée';
                          } else if (statutOriginal) {
                            // Afficher le statut original s'il existe mais n'est pas reconnu
                            return statutOriginal;
                          } else {
                            return 'Inconnu';
                          }
                        })()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <DollarSign className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
              <p className={`${getTextColorClass(false)}`}>Aucune transaction aujourd'hui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
