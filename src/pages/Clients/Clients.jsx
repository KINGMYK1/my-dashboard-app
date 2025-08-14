import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  User,
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  Download,
  UserX,
  AlertCircle,
  UserPlus,
  UserCheck,
  RefreshCw,
  Calendar,
  FileText,
  Star,
  ShieldCheck,
  Gamepad2
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  useClients,
  useToggleClientStatus,
  useExporterClients,
  // ❌ SUPPRIMÉ: useFusionnerClients (fonctionnalité supprimée)
} from '../../hooks/useClients';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import Portal from '../../components/Portal/Portal';

const Clients = () => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeSystem, setIncludeSystem] = useState(false); // ✅ NOUVEAU: pour inclure/exclure le client système
  const [page, setPage] = useState(1);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    client: null,
    type: '',
    title: '',
    message: ''
  });
  // ❌ SUPPRIMÉ: États pour la fusion de clients
  // const [showMergeModal, setShowMergeModal] = useState(false);
  // const [mergeSourceClient, setMergeSourceClient] = useState(null);
  // const [mergeTargetClient, setMergeTargetClient] = useState(null);

  // Hooks
  const { data: clientsData, isLoading, error, refetch } = useClients({
    search: searchTerm || undefined,
    typeClient: selectedType === 'all' ? undefined : selectedType,
    estActif: includeInactive ? undefined : true, // ✅ MODIFIÉ: logique inversée
    includeSystem: includeSystem, // ✅ NOUVEAU: contrôle inclusion client système
    page,
    limit: 20
  });

  const clients = clientsData?.clients || [];
  const pagination = clientsData?.pagination || {};

  const toggleClientStatus = useToggleClientStatus();
  // ❌ SUPPRIMÉ: const fusionnerClients = useFusionnerClients();
  const exporterClients = useExporterClients();

  const canManageClients = true; // À remplacer par la vérification des permissions

  // Theme-based styles
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBackgroundColorClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getHoverBgClass = () => isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const getTableHeadBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const inputBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const placeholderColorClass = isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const focusRingColorClass = isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-blue-500';

  // Handlers
  const openAddClientForm = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const openEditClientForm = (client) => {
    // ✅ NOUVEAU: Protection contre l'édition du client système
    if (client.isSystemClient) {
      alert(translations?.cannotEditSystemClient || 'Le client système ne peut pas être modifié');
      return;
    }
    setEditingClient(client);
    setShowClientForm(true);
  };

  const closeClientForm = () => {
    setShowClientForm(false);
    setEditingClient(null);
    refetch();
  };

  const openClientDetails = (client) => {
    setViewingClient(client);
    setShowClientDetails(true);
  };

  const closeClientDetails = () => {
    setShowClientDetails(false);
    setViewingClient(null);
    refetch();
  };

  const openConfirmDialog = (client, type) => {
    // ✅ NOUVEAU: Protection contre les actions sur le client système
    if (client.isSystemClient && type === 'toggleStatus') {
      alert(translations?.cannotModifySystemClient || 'Le client système ne peut pas être modifié');
      return;
    }

    setConfirmDialog({
      show: true,
      client: client,
      type: type,
      title: type === 'toggleStatus'
        ? `${client.estActif ? translations?.deactivateUser : translations?.activateUser} : ${client.prenom} ${client.nom}`
        : translations?.confirmAction || 'Confirmer l\'action',
      message: type === 'toggleStatus'
        ? `${translations?.confirmToggleStatus || 'Êtes-vous sûr de vouloir'} ${client.estActif ? 'désactiver' : 'activer'} ce client ?`
        : translations?.thisActionCannot || 'Cette action ne peut pas être annulée.'
    });
  };

  const cancelConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, show: false, client: null });
  };

  const confirmAction = async () => {
    if (!confirmDialog.client) return;

    if (confirmDialog.type === 'toggleStatus') {
      await toggleClientStatus.mutateAsync(confirmDialog.client.id);
    }
    cancelConfirmDialog();
  };

  // ❌ SUPPRIMÉ: Fonctions de fusion de clients
  // const handleMergeClients = (sourceClient) => { ... };
  // const handleMergeConfirm = async () => { ... };

  const handleExport = async (format) => {
    const dataToExport = clients
      .filter(client => !client.isSystemClient) // ✅ NOUVEAU: Exclure le client système de l'export
      .map(client => ({
        numeroClient: client.numeroClient,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email || '',
        telephone: client.telephone || '',
        typeClient: client.typeClient, // ✅ MODIFIÉ: Plus de mapping, affichage direct
        estActif: client.estActif ? 'Actif' : 'Inactif',
        dateCreation: new Date(client.createdAt).toLocaleDateString('fr-FR'),
        nombreSessionsTotales: client.nombreSessionsTotales || 0,
        tempsJeuTotal: client.tempsJeuTotal || 0, // ✅ NOUVEAU: champ ajouté
        montantDepenseTotal: client.montantDepenseTotal || 0, // ✅ MODIFIÉ: nom du champ
        derniereVisite: client.derniereVisite ? new Date(client.derniereVisite).toLocaleDateString('fr-FR') : 'N/A' // ✅ MODIFIÉ: nom du champ
      }));

    await exporterClients.mutateAsync({ format, data: dataToExport });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  // ✅ MODIFIÉ: Fonction simplifiée pour les types (NORMAL/SYSTEM seulement)
  const getTypeClientIcon = (type, isSystem) => {
    if (isSystem) return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    switch (type) {
      case 'STANDARD': return <Users className="w-4 h-4 text-blue-500" />;
      case 'SYSTEM': return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  // ✅ MODIFIÉ: Fonction simplifiée pour les badges (NORMAL/SYSTEM seulement)
  const getTypeClientBadge = (type, isSystem) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (isSystem) {
      return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
    }
    switch (type) {
      case 'STANDARD':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'SYSTEM':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    }
  };

  // ✅ MODIFIÉ: Label pour type de client
  const getTypeClientLabel = (type, isSystem) => {
    if (isSystem) return translations?.systemClient || 'Système';
    switch (type) {
      case 'STANDARD': return translations?.normalClient || 'STANDARD';
      case 'SYSTEM': return translations?.systemClient || 'Système';
      default: return type;
    }
  };

  // ❌ SUPPRIMÉ: Composant MergeModal

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">
              {translations?.errorLoadingClients || 'Erreur lors du chargement des clients'}: {error.message}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${getTextColorClass(true)} flex items-center`}>
              <Users className="mr-3 text-purple-600" />
              {translations?.clients || 'Clients'}
            </h1>
            <p className={`mt-2 ${getTextColorClass(false)}`}>
              {translations?.clientsDescription || 'Gestion de la base clients du centre de gaming'}
            </p>
          </div>
          
          {canManageClients && (
            <div className="flex space-x-3">
              <button
                onClick={() => refetch()}
                className={`flex items-center px-4 py-2 border ${getBorderColorClass()} rounded-lg ${getHoverBgClass()} transition-colors`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {translations?.refresh || 'Actualiser'}
              </button>
              
              <button
                onClick={openAddClientForm}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {translations?.addClient || 'Ajouter un client'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className={`${getBackgroundColorClass()} ${getBorderColorClass()} border rounded-lg p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={translations?.searchClients || 'Rechercher un client...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full border ${inputBorderClass} rounded-lg ${inputBgClass} ${getTextColorClass(true)} ${placeholderColorClass} focus:outline-none focus:ring-2 ${focusRingColorClass}`}
            />
          </div>

          {/* Type de client - ✅ MODIFIÉ: Options simplifiées */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2 border ${inputBorderClass} rounded-lg ${inputBgClass} ${getTextColorClass(true)} focus:outline-none focus:ring-2 ${focusRingColorClass}`}
          >
            <option value="all">{translations?.allTypes || 'Tous les types'}</option>
            <option value="STANDARD">{translations?.normalClient || 'STANDARD'}</option>
            <option value="SYSTEM">{translations?.systemClient || 'Système'}</option>
          </select>

          {/* Inclure inactifs */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeInactive"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className={`mr-2 h-4 w-4 ${isDarkMode ? 'text-purple-500' : 'text-blue-500'} focus:ring-0 rounded`}
            />
            <label htmlFor="includeInactive" className={`text-sm ${getTextColorClass(false)}`}>
              {translations?.includeInactive || 'Inclure inactifs'}
            </label>
          </div>

          {/* ✅ NOUVEAU: Inclure client système */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeSystem"
              checked={includeSystem}
              onChange={(e) => setIncludeSystem(e.target.checked)}
              className={`mr-2 h-4 w-4 ${isDarkMode ? 'text-purple-500' : 'text-blue-500'} focus:ring-0 rounded`}
            />
            <label htmlFor="includeSystem" className={`text-sm ${getTextColorClass(false)}`}>
              {translations?.includeSystemClient || 'Inclure système'}
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className={`flex items-center px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getHoverBgClass()} transition-colors`}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className={`flex items-center px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getHoverBgClass()} transition-colors`}
            >
              <Download className="w-4 h-4 mr-1" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides - ✅ MODIFIÉ: Stats adaptées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`${getBackgroundColorClass()} ${getBorderColorClass()} border rounded-lg p-4`}>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations?.totalClients || 'Total clients'}</p>
              <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>{pagination.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className={`${getBackgroundColorClass()} ${getBorderColorClass()} border rounded-lg p-4`}>
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations?.activeClients || 'Clients actifs'}</p>
              <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                {clients.filter(c => c.estActif && !c.isSystemClient).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`${getBackgroundColorClass()} ${getBorderColorClass()} border rounded-lg p-4`}>
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations?.systemClient || 'Client système'}</p>
              <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                {clients.filter(c => c.isSystemClient).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`${getBackgroundColorClass()} ${getBorderColorClass()} border rounded-lg p-4`}>
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations?.newThisMonth || 'Nouveaux ce mois'}</p>
              <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                {clients.filter(c => {
                  const createdDate = new Date(c.createdAt);
                  const now = new Date();
                  return !c.isSystemClient && createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      {clients.length === 0 ? (
        <div className={`${getBackgroundColorClass()} rounded-lg p-8 text-center`}>
          <Users className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
          <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-2`}>
            {translations?.noClientsFound || 'Aucun client trouvé'}
          </h3>
          <p className={getTextColorClass(false)}>
            {searchTerm 
              ? (translations?.noClientsMatchFilter || 'Aucun client ne correspond aux filtres appliqués.')
              : (translations?.addFirstClient || 'Ajoutez votre premier client pour commencer.')
            }
          </p>
        </div>
      ) : (
        <div className={`${getBackgroundColorClass()} rounded-lg border ${getBorderColorClass()} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={getTableHeadBgClass()}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.client || 'Client'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.contact || 'Contact'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.type || 'Type'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.stats || 'Statistiques'}
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.status || 'Statut'}
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                    {translations?.actions || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className={`${getBackgroundColorClass()} divide-y divide-gray-200 dark:divide-gray-700`}>
                {clients.map((client) => (
                  <tr key={client.id} className={getHoverBgClass()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${client.estActif ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'} flex items-center justify-center`}>
                          {client.isSystemClient ? (
                            <ShieldCheck className={`h-6 w-6 text-purple-600 dark:text-purple-400`} />
                          ) : (
                            <User className={`h-6 w-6 ${client.estActif ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${getTextColorClass(true)} flex items-center`}>
                            {client.prenom} {client.nom}
                            {client.isSystemClient && (
                              <ShieldCheck className="w-4 h-4 text-purple-500 ml-2" title={translations?.systemClient || 'Client système'} />
                            )}
                          </div>
                          <div className={`text-sm ${getTextColorClass(false)}`}>
                            {client.numeroClient}
                          </div>
                          {client.pseudoPrefere && (
                            <div className="flex items-center mt-1">
                              <Gamepad2 className="w-3 h-3 text-purple-400 mr-1" />
                              <span className={`text-xs ${getTextColorClass(false)}`}>
                                {client.pseudoPrefere}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className={`text-sm ${getTextColorClass(false)}`}>{client.email}</span>
                          </div>
                        )}
                        {client.telephone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className={`text-sm ${getTextColorClass(false)}`}>{client.telephone}</span>
                          </div>
                        )}
                        {!client.email && !client.telephone && client.isSystemClient && (
                          <span className={`text-sm ${getTextColorClass(false)} italic`}>
                            {translations?.systemClientContact || 'Contact système'}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTypeClientBadge(client.typeClient, client.isSystemClient)}>
                        {getTypeClientIcon(client.typeClient, client.isSystemClient)}
                        <span className="ml-1">
                          {getTypeClientLabel(client.typeClient, client.isSystemClient)}
                        </span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`text-sm ${getTextColorClass(true)}`}>
                          {client.nombreSessionsTotales || 0} {translations?.sessions || 'sessions'}
                        </div>
                        {/* ✅ MODIFIÉ: Nouveau champ tempsJeuTotal */}
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          {parseFloat(client.tempsJeuTotal || 0).toFixed(1)}h {translations?.totalTime || 'total'}
                        </div>
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          {formatCurrency(client.montantDepenseTotal || 0)}
                        </div>
                        {/* ✅ MODIFIÉ: Nouveau nom de champ */}
                        {client.derniereVisite && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                            <span className={`text-xs ${getTextColorClass(false)}`}>
                              {new Date(client.derniereVisite).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.estActif 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {client.estActif ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                        {client.estActif ? (translations?.active || 'Actif') : (translations?.inactive || 'Inactif')}
                      </span>
                      {/* ✅ NOUVEAU: Indicateur spécial pour client système */}
                      {client.isSystemClient && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {translations?.protected || 'Protégé'}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openClientDetails(client)}
                          className={`p-2 rounded-lg ${getHoverBgClass()} transition-colors`}
                          title={translations?.viewDetails || 'Voir les détails'}
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        
                        {canManageClients && !client.isSystemClient && (
                          <>
                            <button
                              onClick={() => openEditClientForm(client)}
                              className={`p-2 rounded-lg ${getHoverBgClass()} transition-colors`}
                              title={translations?.edit || 'Modifier'}
                            >
                              <Edit className="w-4 h-4 text-green-500" />
                            </button>
                            
                            <button
                              onClick={() => openConfirmDialog(client, 'toggleStatus')}
                              className={`p-2 rounded-lg ${getHoverBgClass()} transition-colors`}
                              title={client.estActif ? (translations?.deactivate || 'Désactiver') : (translations?.activate || 'Activer')}
                            >
                              {client.estActif ? (
                                <UserX className="w-4 h-4 text-orange-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          </>
                        )}
                        
                        {/* ✅ NOUVEAU: Message pour client système */}
                        {client.isSystemClient && (
                          <span className={`text-xs ${getTextColorClass(false)} italic`}>
                            {translations?.systemClientProtected || 'Client protégé'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className={`text-sm ${getTextColorClass(false)}`}>
            {translations?.showing || 'Affichage de'} {((pagination.currentPage - 1) * pagination.limit) + 1} à {Math.min(pagination.currentPage * pagination.limit, pagination.total)} sur {pagination.total} {translations?.clients || 'clients'}
          </div>
          
          <div className="flex space-x-2">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 text-sm border ${getBorderColorClass()} rounded-lg ${getHoverBgClass()} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {translations?.previous || 'Précédent'}
            </button>
            
            <span className={`px-4 py-2 text-sm ${getTextColorClass(false)}`}>
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 text-sm border ${getBorderColorClass()} rounded-lg ${getHoverBgClass()} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {translations?.next || 'Suivant'}
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showClientForm && (
        <ClientForm
          client={editingClient}
          onClose={closeClientForm}
        />
      )}

      {showClientDetails && viewingClient && (
        <ClientDetails
          client={viewingClient}
          onClose={closeClientDetails}
          onEdit={openEditClientForm}
        />
      )}

      {/* ❌ SUPPRIMÉ: Modal de fusion */}

      <ConfirmationDialog
        isOpen={confirmDialog.show}
        onClose={cancelConfirmDialog}
        onConfirm={confirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmButtonText={confirmDialog.type === 'toggleStatus' 
          ? (confirmDialog.client?.estActif ? (translations?.deactivate || 'Désactiver') : (translations?.activate || 'Activer'))
          : (translations?.confirm || 'Confirmer')
        }
        cancelButtonText={translations?.cancel || 'Annuler'}
        variant={confirmDialog.type === 'toggleStatus' ? 'warning' : 'danger'}
      />
    </div>
  ); 
};

export default Clients;