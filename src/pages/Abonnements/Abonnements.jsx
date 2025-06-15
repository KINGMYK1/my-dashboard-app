import React, { useState } from 'react';
import { 
  useAbonnements, 
  useChangerStatutAbonnement,
  useAnnulerAbonnement
} from '../../hooks/useAbonnements';
import { useClients } from '../../hooks/useClients';
import { useTypesAbonnements } from '../../hooks/useTypesAbonnements';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Package,
  Pause,
  Play,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import VenteAbonnementForm from './VenteAbonnementForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Abonnements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    clientId: '',
    typeAbonnementId: '',
    includeExpired: false,
    page: 1,
    limit: 20
  });
  const [showVenteForm, setShowVenteForm] = useState(false);
  const [actionData, setActionData] = useState(null);
  const [raison, setRaison] = useState('');

  const { hasPermission } = useAuth();
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();

  const isDarkMode = effectiveTheme === 'dark';

  // Construire les filtres complets
  const completeFilters = {
    ...filters,
    search: searchTerm
  };

  const { data: abonnementsData, isLoading, isError, error } = useAbonnements(completeFilters);
  const { data: clientsData } = useClients({ includeInactive: false, limit: 100 });
  const { data: typesData } = useTypesAbonnements({ includeInactive: false });
  const { mutate: changerStatut } = useChangerStatutAbonnement();
  const { mutate: annulerAbonnement } = useAnnulerAbonnement();

  // Permissions
  const canViewAbonnements = hasPermission('ABONNEMENTS_VIEW');
  const canManageAbonnements = hasPermission('ABONNEMENTS_MANAGE');

  const abonnements = (() => {
    console.log('🔍 [DEBUG_ABONNEMENTS] Structure complète des données:', abonnementsData);
    console.log('🔍 [DEBUG_ABONNEMENTS] abonnementsData?.data:', abonnementsData?.data);
    console.log('🔍 [DEBUG_ABONNEMENTS] Type de abonnementsData?.data:', typeof abonnementsData?.data);
    
    // Essayer différentes structures possibles
    if (abonnementsData?.data?.abonnements && Array.isArray(abonnementsData.data.abonnements)) {
      console.log('✅ Trouvé dans data.abonnements:', abonnementsData.data.abonnements.length);
      return abonnementsData.data.abonnements;
    }
    
    if (abonnementsData?.data && Array.isArray(abonnementsData.data)) {
      console.log('✅ Trouvé dans data directement:', abonnementsData.data.length);
      return abonnementsData.data;
    }
    
    if (abonnementsData?.abonnements && Array.isArray(abonnementsData.abonnements)) {
      console.log('✅ Trouvé dans abonnements:', abonnementsData.abonnements.length);
      return abonnementsData.abonnements;
    }
    
    console.log('❌ Aucune structure d\'abonnements trouvée');
    return [];
  })();

  console.log('🔍 [DEBUG_ABONNEMENTS] Abonnements extraits:', abonnements);
  console.log('🔍 [DEBUG_ABONNEMENTS] Nombre d\'abonnements:', abonnements.length);

  const pagination = abonnementsData?.data?.pagination || {};
  const clients = clientsData?.data?.clients || clientsData?.data || [];
  const typesAbonnements = typesData?.data || [];

  // Styles dynamiques
  const getTextColorClass = (isPrimary) => 
    isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-white';
  
  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Gestionnaires d'événements
  const handleChangerStatut = (abonnement, action) => {
    setActionData({ abonnement, action });
    setRaison('');
  };

  const confirmerChangementStatut = () => {
    if (actionData) {
      changerStatut({
        id: actionData.abonnement.id,
        action: actionData.action,
        raison
      });
      setActionData(null);
      setRaison('');
    }
  };

  const handleAnnulerAbonnement = (abonnement) => {
    const raison = prompt('Raison de l\'annulation (minimum 5 caractères):');
    if (raison && raison.trim().length >= 5) {
      annulerAbonnement({
        id: abonnement.id,
        raison: raison.trim()
      });
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'ACTIF': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EXPIRE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'EPUISE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'SUSPENDU': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ANNULE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'ACTIF': return <CheckCircle className="w-4 h-4" />;
      case 'EXPIRE': return <AlertTriangle className="w-4 h-4" />;
      case 'EPUISE': return <BarChart3 className="w-4 h-4" />;
      case 'SUSPENDU': return <Pause className="w-4 h-4" />;
      case 'ANNULE': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!canViewAbonnements) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Accès refusé
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Vous n'avez pas les permissions pour consulter les abonnements.
          </p>
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
              <CreditCard className="mr-3 text-purple-600" />
              {translations?.subscriptions || 'Abonnements'}
            </h1>
            <p className={`mt-2 ${getTextColorClass(false)}`}>
              {translations?.subscriptionsDescription || 'Gestion des abonnements clients actifs et historique'}
            </p>
          </div>
          
          {canManageAbonnements && (
            <button
              onClick={() => setShowVenteForm(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations?.sellSubscription || 'Vendre un abonnement'}
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className={`${getBgColorClass()} ${getBorderColorClass()} border rounded-lg p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={translations?.searchSubscriptions || 'Rechercher...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
            />
          </div>

          {/* Statut */}
          <select
            value={filters.statut}
            onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
            className={`px-4 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
          >
            <option value="">{translations?.allStatuses || 'Tous les statuts'}</option>
            <option value="ACTIF">{translations?.active || 'Actif'}</option>
            <option value="EXPIRE">{translations?.expired || 'Expiré'}</option>
            <option value="EPUISE">{translations?.depleted || 'Épuisé'}</option>
            <option value="SUSPENDU">{translations?.suspended || 'Suspendu'}</option>
            <option value="ANNULE">{translations?.cancelled || 'Annulé'}</option>
          </select>

          {/* Client */}
          <select
            value={filters.clientId}
            onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
            className={`px-4 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
          >
            <option value="">{translations?.allClients || 'Tous les clients'}</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.prenom} {client.nom}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={filters.typeAbonnementId}
            onChange={(e) => setFilters(prev => ({ ...prev, typeAbonnementId: e.target.value }))}
            className={`px-4 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
          >
            <option value="">{translations?.allTypes || 'Tous les types'}</option>
            {typesAbonnements.map(type => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex space-x-2">
            <button className={`flex items-center px-3 py-2 border ${getBorderColorClass()} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
              <Download className="w-4 h-4 mr-1" />
              {translations?.export || 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des abonnements */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          <p>{translations?.errorLoadingSubscriptions || 'Erreur lors du chargement des abonnements'}: {error.message}</p>
        </div>
      ) : abonnements.length === 0 ? (
        <div className={`${getBgColorClass()} rounded-lg p-8 text-center`}>
          <CreditCard className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
          <p className={getTextColorClass(false)}>
            {translations?.noSubscriptionsFound || 'Aucun abonnement trouvé.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {abonnements.map((abonnement) => (
            <AbonnementCard 
              key={abonnement.id} 
              abonnement={abonnement}
              onSuspendre={canManageAbonnements ? () => handleChangerStatut(abonnement, 'SUSPENDRE') : null}
              onReactiver={canManageAbonnements ? () => handleChangerStatut(abonnement, 'REACTIVER') : null}
              onAnnuler={canManageAbonnements ? () => handleAnnulerAbonnement(abonnement) : null}
              canManageAbonnements={canManageAbonnements} // ✅ Passer la permission
              getTextColorClass={getTextColorClass}
              getBgColorClass={getBgColorClass}
              getBorderColorClass={getBorderColorClass}
              getStatutColor={getStatutColor}
              getStatutIcon={getStatutIcon}
              translations={translations}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              {translations?.previous || 'Précédent'}
            </button>
            
            <span className={`px-4 py-2 text-sm ${getTextColorClass(false)}`}>
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            <button
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              {translations?.next || 'Suivant'}
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de vente */}
      {showVenteForm && (
        <VenteAbonnementForm
          onClose={() => setShowVenteForm(false)}
        />
      )}

      {/* Dialogue de changement de statut */}
      <ConfirmationDialog
        isOpen={!!actionData}
        onClose={() => setActionData(null)}
        onConfirm={confirmerChangementStatut}
        title={actionData?.action === 'SUSPENDRE' 
          ? (translations?.suspendSubscription || 'Suspendre l\'abonnement')
          : (translations?.reactivateSubscription || 'Réactiver l\'abonnement')
        }
        confirmButtonText={actionData?.action === 'SUSPENDRE' 
          ? (translations?.suspend || 'Suspendre')
          : (translations?.reactivate || 'Réactiver')
        }
        cancelButtonText={translations?.cancel || 'Annuler'}
        customContent={actionData?.action === 'SUSPENDRE' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translations?.reason || 'Raison'} *
            </label>
            <textarea
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder={translations?.enterReason || 'Entrez la raison de la suspension...'}
              required
            />
          </div>
        )}
      />
    </div>
  );
};
// ✅ Composant AbonnementCard corrigé avec toutes les props nécessaires
const AbonnementCard = ({ 
  abonnement, 
  onSuspendre, 
  onReactiver, 
  onAnnuler,
  canManageAbonnements,
  getTextColorClass, 
  getBgColorClass, 
  getBorderColorClass, 
  getStatutColor, 
  getStatutIcon, 
  translations 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const calculerProgression = () => {
    const heuresAchetees = abonnement.nombreHeuresAchetees || abonnement.nombreHeures || 0;
    const heuresUtilisees = abonnement.heuresUtilisees || 0;
    if (heuresAchetees === 0) return 0;
    return (heuresUtilisees / heuresAchetees) * 100;
  };

  const progression = calculerProgression();

  return (
    <div className={`${getBgColorClass()} ${getBorderColorClass()} border rounded-lg p-6 hover:shadow-lg transition-shadow`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>
                #{abonnement.numeroAbonnement || abonnement.id}
              </h3>
              <p className={`text-sm ${getTextColorClass(false)}`}>
                {abonnement.typeAbonnement?.nom || 'Type non défini'}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(abonnement.statut)}`}>
              {getStatutIcon(abonnement.statut)}
              <span className="ml-1">{abonnement.statut}</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className={`text-sm ${getTextColorClass(false)}`}>
                {abonnement.client?.prenom} {abonnement.client?.nom}
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className={`text-sm ${getTextColorClass(false)}`}>
                Acheté le {formatDate(abonnement.dateAchat || abonnement.createdAt)}
              </span>
            </div>
            
            {abonnement.dateExpiration && (
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`text-sm ${getTextColorClass(false)}`}>
                  Expire le {formatDate(abonnement.dateExpiration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progression */}
        <div>
          <h4 className={`text-sm font-medium ${getTextColorClass(true)} mb-3`}>
            {translations?.usage || 'Utilisation'}
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={getTextColorClass(false)}>
                {translations?.hoursUsed || 'Heures utilisées'}
              </span>
              <span className={getTextColorClass(true)}>
                {abonnement.heuresUtilisees || 0}h / {abonnement.nombreHeuresAchetees || abonnement.nombreHeures || 0}h
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progression, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className={getTextColorClass(false)}>
                {translations?.sessionsCount || 'Sessions'}
              </span>
              <span className={getTextColorClass(true)}>
                {abonnement.nombreSessionsEffectuees || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Prix et actions */}
        <div className="text-center lg:text-right">
          <div className="mb-4">
            <div className={`text-2xl font-bold ${getTextColorClass(true)}`}>
              {formatPrice(abonnement.prixAchat || abonnement.prixFinal || 0)}
            </div>
            <div className={`text-sm ${getTextColorClass(false)}`}>
              {formatPrice(abonnement.prixHoraireEquivalent || 0)}/h
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {abonnement.statut === 'ACTIF' && onSuspendre && canManageAbonnements && (
              <button
                onClick={onSuspendre}
                className="flex items-center justify-center px-3 py-2 text-sm text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                <Pause className="w-4 h-4 mr-1" />
                {translations?.suspend || 'Suspendre'}
              </button>
            )}
            
            {abonnement.statut === 'SUSPENDU' && onReactiver && canManageAbonnements && (
              <button
                onClick={onReactiver}
                className="flex items-center justify-center px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Play className="w-4 h-4 mr-1" />
                {translations?.reactivate || 'Réactiver'}
              </button>
            )}
            
            {abonnement.statut !== 'ANNULE' && onAnnuler && canManageAbonnements && (
              <button
                onClick={onAnnuler}
                className="flex items-center justify-center px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-1" />
                {translations?.cancel || 'Annuler'}
              </button>
            )}

            <button className={`flex items-center justify-center px-3 py-2 text-sm border ${getBorderColorClass()} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
              <BarChart3 className="w-4 h-4 mr-1" />
              {translations?.stats || 'Stats'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Abonnements;