import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit3, 
  Trash2, 
  Star,
  Calendar,
  Clock,
  Euro,
  BarChart3,
  Copy,
  Power,
  PowerOff,
  Eye,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  useTypesAbonnements, 
  useDeleteTypeAbonnement, 
  useToggleTypeAbonnementStatus,
  useDuplicateTypeAbonnement 
} from '../../hooks/useTypesAbonnements';
import { useTypesPostes } from '../../hooks/useTypePostes';
import TypeAbonnementForm from './TypeAbonnementForm';
import TypeAbonnementStatistics from './TypeAbonnementStatistics';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const TypesAbonnements = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [showStatistics, setShowStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    includeInactive: false,
    estPromo: null,
    orderBy: 'ordreAffichage'
  });

  const { hasPermission } = useAuth();
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Récupération des données avec filtres conformes à l'API
  const { data: typesData, isLoading, isError, error } = useTypesAbonnements({
    includeInactive: filters.includeInactive,
    estPromo: filters.estPromo,
    orderBy: filters.orderBy
  });
  
  const { data: typesPostesData } = useTypesPostes();
  const { mutate: deleteType } = useDeleteTypeAbonnement();
  const { mutate: toggleStatus } = useToggleTypeAbonnementStatus();
  const { mutate: duplicateType } = useDuplicateTypeAbonnement();

  const types = typesData?.data || [];
  const typesPostes = typesPostesData?.data || [];

  // Permissions
  const canViewTypes = hasPermission('ABONNEMENTS_VIEW');
  const canManageTypes = hasPermission('ABONNEMENTS_MANAGE');
  const canViewStats = hasPermission('ABONNEMENTS_STATISTICS');

  // Styles dynamiques
  const getTextColorClass = (isPrimary) => 
    isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-white';
  
  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // ✅ Filtrage côté client pour la recherche
  const filteredTypes = useMemo(() => {
    if (!searchTerm) return types;
    
    return types.filter(type => 
      type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [types, searchTerm]);

  // Gestionnaires d'événements
  const handleEdit = (type) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleDelete = (type) => {
    setTypeToDelete(type);
  };

  const confirmDelete = () => {
    if (typeToDelete) {
      deleteType(typeToDelete.id);
      setTypeToDelete(null);
    }
  };

  const handleToggleStatus = (type) => {
    toggleStatus(type.id);
  };

  const handleDuplicate = (type) => {
    duplicateType(type.id);
  };

  const handleShowStatistics = (type) => {
    setShowStatistics(type);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingType(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };

  if (!canViewTypes) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Accès refusé
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Vous n'avez pas les permissions pour consulter les types d'abonnements.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${getTextColorClass(true)} flex items-center`}>
            <Package className="mr-3 text-purple-600" />
            {translations?.subscriptionTypes || 'Types d\'abonnements'}
          </h1>
          <p className={`${getTextColorClass(false)} mt-1`}>
            {translations?.subscriptionTypesDescription || 'Gérez les différents types d\'abonnements disponibles'}
          </p>
        </div>
        
        {canManageTypes && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {translations?.newType || 'Nouveau type'}
          </button>
        )}
      </div>

      {/* ✅ Filtres et recherche conformes à l'API */}
      <div className={`${getBgColorClass()} rounded-lg shadow p-4 mb-6 border ${getBorderColorClass()}`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Recherche */}
          <div>
            <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-1`}>
              {translations?.search || 'Rechercher'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translations?.searchPlaceholder || 'Nom ou description...'}
                className={`w-full pl-10 pr-4 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
              />
            </div>
          </div>

          {/* Inclure inactifs */}
          <div>
            <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-1`}>
              {translations?.includeInactive || 'Inclure inactifs'}
            </label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                id="includeInactive"
                checked={filters.includeInactive}
                onChange={(e) => setFilters(prev => ({ ...prev, includeInactive: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="includeInactive" className={`text-sm ${getTextColorClass(false)}`}>
                {translations?.showInactive || 'Afficher inactifs'}
              </label>
            </div>
          </div>

          {/* Type promotion */}
          <div>
            <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-1`}>
              {translations?.promoType || 'Type'}
            </label>
            <select
              value={filters.estPromo || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, estPromo: e.target.value ? e.target.value === 'true' : null }))}
              className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
            >
              <option value="">{translations?.all || 'Tous'}</option>
              <option value="false">{translations?.normal || 'Normal'}</option>
              <option value="true">{translations?.promotion || 'Promotion'}</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-1`}>
              {translations?.sortBy || 'Trier par'}
            </label>
            <select
              value={filters.orderBy}
              onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
              className={`w-full px-3 py-2 border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(true)}`}
            >
              <option value="ordreAffichage">{translations?.displayOrder || 'Ordre d\'affichage'}</option>
              <option value="prix">{translations?.price || 'Prix'}</option>
              <option value="heures">{translations?.hours || 'Heures'}</option>
              <option value="nom">{translations?.name || 'Nom'}</option>
            </select>
          </div>

          {/* Actions */}
          <div>
            <label className={`block text-sm font-medium ${getTextColorClass(true)} mb-1`}>
              {translations?.actions || 'Actions'}
            </label>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-2 border ${getBorderColorClass()} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center`}
                title={translations?.export || 'Exporter'}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {isError && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          <p>{translations?.errorLoadingSubscriptionTypes || 'Erreur lors du chargement des types d\'abonnements'}: {error?.message}</p>
        </div>
      )}

      {/* Liste des types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map(type => (
          <TypeCard
            key={type.id}
            type={type}
            onEdit={canManageTypes ? handleEdit : null}
            onDelete={canManageTypes ? handleDelete : null}
            onToggleStatus={canManageTypes ? handleToggleStatus : null}
            onDuplicate={canManageTypes ? handleDuplicate : null}
            onShowStatistics={canViewStats ? handleShowStatistics : null}
            formatPrice={formatPrice}
            getTextColorClass={getTextColorClass}
            getBgColorClass={getBgColorClass}
            getBorderColorClass={getBorderColorClass}
            translations={translations}
            typesPostes={typesPostes}
          />
        ))}
      </div>

      {filteredTypes.length === 0 && !isLoading && (
        <div className={`text-center py-12 ${getTextColorClass(false)}`}>
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>{translations?.noSubscriptionTypesFound || 'Aucun type d\'abonnement trouvé'}</p>
          {canManageTypes && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-purple-600 hover:text-purple-700"
            >
              {translations?.createFirstType || 'Créer le premier type d\'abonnement'}
            </button>
          )}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <TypeAbonnementForm
          type={editingType}
          onClose={handleCloseForm}
          typesPostes={typesPostes}
        />
      )}

      {showStatistics && (
        <TypeAbonnementStatistics
          type={showStatistics}
          onClose={() => setShowStatistics(null)}
        />
      )}

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={confirmDelete}
        title={translations?.deleteSubscriptionType || 'Supprimer le type d\'abonnement'}
        message={`${translations?.confirmDeleteSubscriptionType || 'Êtes-vous sûr de vouloir supprimer le type'} "${typeToDelete?.nom}" ?`}
        confirmButtonText={translations?.delete || 'Supprimer'}
        cancelButtonText={translations?.cancel || 'Annuler'}
        type="danger"
      />
    </div>
  );
};

// ✅ Composant carte type d'abonnement avec calculs corrigés
const TypeCard = ({ 
  type, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onDuplicate, 
  onShowStatistics, 
  formatPrice, 
  getTextColorClass, 
  getBgColorClass, 
  getBorderColorClass, 
  translations,
  typesPostes 
}) => {
  // ✅ CORRIGÉ: Calculs d'économie plus précis
  const prixHoraireEquivalent = type.prixPackage / type.nombreHeures;
  const economieParHeure = Math.max(0, type.tarifHoraireNormal - prixHoraireEquivalent);
  const economieTotale = economieParHeure * type.nombreHeures;
  const pourcentageReduction = type.tarifHoraireNormal > 0 
    ? ((economieParHeure / type.tarifHoraireNormal) * 100) 
    : 0;
  
  // ✅ NOUVEAU: Vérification si l'abonnement est vraiment économique
  const estEconomique = prixHoraireEquivalent < type.tarifHoraireNormal;
  const estTresEconomique = pourcentageReduction >= 15; // Plus de 15% d'économie

  // Types de postes autorisés
  const postesAutorises = type.typePostesAutorises && type.typePostesAutorises.length > 0
    ? typesPostes.filter(poste => type.typePostesAutorises.includes(poste.id))
    : [];

  return (
    <div className={`${getBgColorClass()} rounded-lg shadow border ${getBorderColorClass()} overflow-hidden hover:shadow-lg transition-all duration-200`}>
      {/* ✅ Badge de promotion et en-tête colorée avec indicateur économique */}
      <div className="relative">
        <div 
          className="h-2"
          style={{ backgroundColor: type.couleur || '#3B82F6' }}
        />
        {type.estPromo && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
            <Star className="w-3 h-3 inline mr-1" />
            PROMO
          </div>
        )}
        {/* ✅ NOUVEAU: Badge économique */}
        {estTresEconomique && !type.estPromo && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-green-400 to-green-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
            <Star className="w-3 h-3 inline mr-1" />
            TOP DEAL
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Titre et statut */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${getTextColorClass(true)} flex items-center`}>
              {type.nom}
              {type.estPromo && <Star className="w-4 h-4 ml-2 text-yellow-500" />}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                type.estActif 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {type.estActif ? (translations?.active || 'Actif') : (translations?.inactive || 'Inactif')}
              </span>
              {type.ordreAffichage && (
                <span className={`text-xs ${getTextColorClass(false)}`}>
                  #{type.ordreAffichage}
                </span>
              )}
            </div>
          </div>
          
          {/* ✅ Actions dans le header */}
          <div className="flex space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(type)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={translations?.edit || 'Modifier'}
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
              </button>
            )}
            
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(type)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={type.estActif ? (translations?.deactivate || 'Désactiver') : (translations?.activate || 'Activer')}
              >
                {type.estActif ? (
                  <PowerOff className="w-4 h-4 text-orange-600" />
                ) : (
                  <Power className="w-4 h-4 text-green-600" />
                )}
              </button>
            )}
            
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(type)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={translations?.duplicate || 'Dupliquer'}
              >
                <Copy className="w-4 h-4 text-purple-600" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(type)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={translations?.delete || 'Supprimer'}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {type.description && (
          <p className={`text-sm ${getTextColorClass(false)} mb-3 line-clamp-2`}>
            {type.description}
          </p>
        )}

        {/* ✅ CORRIGÉ: Prix principal avec économie précise */}
        <div className="text-center mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className={`text-2xl font-bold ${getTextColorClass(true)}`}>
            {formatPrice(type.prixPackage)}
          </div>
          <div className={`text-sm ${getTextColorClass(false)}`}>
            pour {type.nombreHeures}h
          </div>
          {estEconomique && (
            <div className={`text-sm font-medium mt-1 ${estTresEconomique ? 'text-green-600' : 'text-blue-600'}`}>
              -{pourcentageReduction.toFixed(1)}% • Économie: {formatPrice(economieTotale)}
            </div>
          )}
          {!estEconomique && (
            <div className="text-orange-600 text-sm font-medium mt-1">
              ⚠️ Prix équivalent supérieur
            </div>
          )}
        </div>

        {/* ✅ CORRIGÉ: Détails tarifaires avec comparaison claire */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className={`text-sm ${getTextColorClass(false)} flex items-center`}>
              <Euro className="w-4 h-4 mr-2" />
              Prix/heure équivalent:
            </span>
            <span className={`text-sm font-medium ${estEconomique ? 'text-green-600' : 'text-orange-600'}`}>
              {formatPrice(prixHoraireEquivalent)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className={`text-sm ${getTextColorClass(false)} flex items-center`}>
              <Euro className="w-4 h-4 mr-2" />
              Tarif normal:
            </span>
            <span className={`text-sm ${getTextColorClass(false)}`}>
              {formatPrice(type.tarifHoraireNormal)}
            </span>
          </div>
          
          {/* ✅ NOUVEAU: Ligne d'économie/surcoût */}
          <div className="flex justify-between">
            <span className={`text-sm ${getTextColorClass(false)} flex items-center`}>
              <Euro className="w-4 h-4 mr-2" />
              {estEconomique ? 'Économie par heure:' : 'Surcoût par heure:'}
            </span>
            <span className={`text-sm font-medium ${estEconomique ? 'text-green-600' : 'text-red-600'}`}>
              {estEconomique ? 
                `-${formatPrice(economieParHeure)}` : 
                `+${formatPrice(Math.abs(economieParHeure))}`
              }
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className={`text-sm ${getTextColorClass(false)} flex items-center`}>
              <Calendar className="w-4 h-4 mr-2" />
              Validité:
            </span>
            <span className={`text-sm font-medium ${getTextColorClass(true)}`}>
              {type.dureeValiditeMois} mois
            </span>
          </div>
        </div>

        {/* ✅ NOUVEAU: Indicateur de rentabilité */}
        {estEconomique && (
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <div className="flex items-center text-xs text-green-800 dark:text-green-200">
              <Star className="w-3 h-3 mr-1" />
              <strong>Économie totale:</strong> {formatPrice(economieTotale)} sur tout l'abonnement
            </div>
          </div>
        )}

        {/* ✅ Contraintes de session */}
        <div className={`text-xs ${getTextColorClass(false)} space-y-1 mb-4`}>
          {type.heuresMinParSession && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Min: {type.heuresMinParSession}h par session
            </div>
          )}
          
          {type.heuresMaxParSession && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Max: {type.heuresMaxParSession}h par session
            </div>
          )}
        </div>

        {/* ✅ Types de postes autorisés */}
        {postesAutorises.length > 0 && (
          <div className="mb-4">
            <div className={`text-xs font-medium ${getTextColorClass(true)} mb-2`}>
              Postes autorisés:
            </div>
            <div className="flex flex-wrap gap-1">
              {postesAutorises.slice(0, 3).map(poste => (
                <span 
                  key={poste.id}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                >
                  {poste.nom}
                </span>
              ))}
              {postesAutorises.length > 3 && (
                <span className={`text-xs ${getTextColorClass(false)}`}>
                  +{postesAutorises.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* ✅ Promotion details */}
        {type.estPromo && type.dateDebutPromo && type.dateFinPromo && (
          <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <div className={`text-xs ${getTextColorClass(false)}`}>
              <strong>Promotion:</strong> du {new Date(type.dateDebutPromo).toLocaleDateString('fr-FR')} au {new Date(type.dateFinPromo).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}

        {/* ✅ Statistiques si disponibles */}
        {(type.nombreVentes > 0 || type.chiffreAffaireGenere > 0) && (
          <div className="mb-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {type.nombreVentes > 0 && (
                <div className="text-center">
                  <div className={`font-semibold ${getTextColorClass(true)}`}>
                    {type.nombreVentes}
                  </div>
                  <div className={getTextColorClass(false)}>
                    Ventes
                  </div>
                </div>
              )}
              {type.chiffreAffaireGenere > 0 && (
                <div className="text-center">
                  <div className={`font-semibold ${getTextColorClass(true)}`}>
                    {formatPrice(type.chiffreAffaireGenere)}
                  </div>
                  <div className={getTextColorClass(false)}>
                    CA généré
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ Actions footer */}
        <div className="flex space-x-2">
          {onShowStatistics && (
            <button 
              onClick={() => onShowStatistics(type)}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm border ${getBorderColorClass()} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {translations?.stats || 'Stats'}
            </button>
          )}
          
          <button className={`flex-1 flex items-center justify-center px-3 py-2 text-sm border ${getBorderColorClass()} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
            <Eye className="w-4 h-4 mr-1" />
            {translations?.view || 'Voir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypesAbonnements;