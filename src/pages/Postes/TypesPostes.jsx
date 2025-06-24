import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Settings, 
  DollarSign, Users, AlertCircle, Tag, Clock, Monitor,
  Gamepad2, Star, TrendingUp, BarChart3, Sparkles,
  Play, PauseCircle, Eye, EyeOff, Power, PowerOff
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useTypesPostes, 
  useDeleteTypePoste,
  useUpdateTypePoste,
  useToggleTypePosteStatus // ✅ NOUVEAU: Import du hook toggle
} from '../../hooks/useTypePostes';
import { useNotification } from '../../contexts/NotificationContext';
import TypePosteForm from './TypePosteForm';
import TypePosteStatistics from './TypePosteStatistics';

import CalculateurTarifs from './CalculateurTarifs';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import GamingIcon from '../../components/GamingIcon/GamingIcon';
import GamingIconService from '../../services/gamingIconService';

const TypesPostes = () => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const { showError, showSuccess } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypePoste, setSelectedTypePoste] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [typePosteToDelete, setTypePosteToDelete] = useState(null);
  const [showStatistics, setShowStatistics] = useState(null);
  const [showCalculateur, setShowCalculateur] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('nom');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTypePosteForStats, setSelectedTypePosteForStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // ✅ MISE À JOUR: Utilisation des hooks corrigés
  const { data: typesPostes = [], isLoading, isError, error } = useTypesPostes(showInactive);
  const deleteTypePosteMutation = useDeleteTypePoste();
  const updateTypePosteMutation = useUpdateTypePoste();
  const toggleStatusMutation = useToggleTypePosteStatus(); // ✅ NOUVEAU

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Filtrage et tri améliorés
  const filteredAndSortedTypesPostes = useMemo(() => {
    if (!typesPostes) return [];

    let filtered = typesPostes.filter(type => {
      const matchesSearch = type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && type.estActif) ||
                          (filterStatus === 'inactive' && !type.estActif);

      return matchesSearch && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'tarif':
          return (b.tarifHoraireBase || 0) - (a.tarifHoraireBase || 0);
        case 'plans':
          return (b.plansTarifaires?.length || 0) - (a.plansTarifaires?.length || 0);
        case 'recent':
          return new Date(b.dateCreation || 0) - new Date(a.dateCreation || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [typesPostes, searchTerm, filterStatus, sortBy]);

  const handleOpenForm = (typePoste = null) => {
    setSelectedTypePoste(typePoste);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedTypePoste(null);
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (typePosteToDelete) {
      try {
        await deleteTypePosteMutation.mutateAsync(typePosteToDelete.id);
        setTypePosteToDelete(null);
        showSuccess('Type de poste supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showError('Erreur lors de la suppression du type de poste');
      }
    }
  };

  // ✅ NOUVEAU: Gérer le toggle de statut
  const handleToggleStatus = async (typePosteId) => {
    try {
      console.log('🔄 [TYPES_POSTES] Toggle status ID:', typePosteId);
      await toggleStatusMutation.mutateAsync(typePosteId);
    } catch (error) {
      console.error('❌ [TYPES_POSTES] Erreur toggle status:', error);
    }
  };

  const handleShowStatistics = (typePoste) => {
    setSelectedTypePosteForStats(typePoste);
    setShowStatsModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // ✅ NOUVEAU: Fonction pour vérifier si un type est inactif
  const isTypePosteInactif = (typePoste) => {
    return !typePoste.estActif;
  };

  // ✅ NOUVEAU: Fonction pour afficher les plans avec gestion des inactifs
  const renderPlansCompacts = (typePoste) => {
    const plans = typePoste.plansTarifaires || [];
    const plansActifs = plans.filter(p => p.estActif);
    const plansInactifs = plans.filter(p => !p.estActif);

    if (plans.length === 0) {
      return (
        <div className="text-xs text-gray-500 italic">
          Aucun plan tarifaire
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {/* Plans actifs */}
        {plansActifs.slice(0, 2).map((plan, index) => (
          <div key={`actif-${index}`} className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {plan.nom || `${plan.dureeMinutesMin || plan.dureeMinutes}min`}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {plan.prix} {typePoste.devise || 'DH'}
            </span>
          </div>
        ))}
        
        {/* Plans inactifs si on affiche les inactifs */}
        {showInactive && plansInactifs.slice(0, 1).map((plan, index) => (
          <div key={`inactif-${index}`} className="flex justify-between items-center text-xs opacity-50">
            <span className="text-gray-500 line-through">
              {plan.nom || `${plan.dureeMinutesMin || plan.dureeMinutes}min`}
            </span>
            <span className="text-gray-500 line-through">
              {plan.prix} {typePoste.devise || 'DH'}
            </span>
          </div>
        ))}
        
        {/* Indicateur s'il y a plus de plans */}
        {(plansActifs.length + (showInactive ? plansInactifs.length : 0)) > 2 && (
          <div className="text-xs text-center text-gray-500">
            +{(plansActifs.length + (showInactive ? plansInactifs.length : 0)) - 2} autres
          </div>
        )}
      </div>
    );
  };

  // Styles gaming modérés (conservés)
  const styles = {
    container: `space-y-4`,
    header: `p-3 rounded-lg ${isDarkMode 
      ? 'bg-gradient-to-r from-gray-800/40 via-purple-900/15 to-blue-900/15 border border-purple-500/20' 
      : 'bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200'
    }`,
    searchBar: `p-3 rounded-lg ${isDarkMode 
      ? 'bg-gray-800/20 border-gray-700/40' 
      : 'bg-white/70 border-gray-200'
    } border`,
    input: `w-full p-2 rounded-lg transition-all text-sm ${isDarkMode 
      ? 'bg-gray-800/50 border-gray-600 text-white focus:border-purple-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-400'
    } border focus:ring-2 focus:ring-purple-400/20 outline-none`,
    button: `px-3 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm ${isDarkMode 
      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
    }`,
    buttonSecondary: `px-3 py-2 rounded-lg font-medium transition-all text-sm ${isDarkMode 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-green-500 hover:bg-green-600 text-white'
    }`,
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 border max-w-md w-full text-center`}>
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className={`text-lg font-semibold mb-2 ${styles.textPrimary}`}>
            {translations.errorLoadingTypesPostes || 'Erreur lors du chargement des types de postes'}
          </h3>
          <p className={`${styles.textSecondary} mb-4`}>
            {error?.message || 'Une erreur inattendue s\'est produite'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={styles.button}
          >
            {translations.retry || 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header (conservé avec mise à jour) */}
      <div className={styles.header}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Gamepad2 size={20} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${styles.textPrimary}`}>
                🎮 Types de Postes
              </h1>
              <p className={`text-sm ${styles.textSecondary}`}>
                {filteredAndSortedTypesPostes.length} types • {typesPostes.filter(t => !t.estActif).length} inactifs
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {/* ✅ NOUVEAU: Bouton pour afficher/masquer les inactifs */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                showInactive
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-2">
                {showInactive ? 'Masquer inactifs' : 'Voir inactifs'}
              </span>
            </button>

            <button
              onClick={() => setShowCalculateur(true)}
              className={styles.buttonSecondary}
            >
              💰 Calculateur
            </button>
            
            <button
              onClick={() => handleOpenForm()}
              className={styles.button}
            >
              <Plus size={16} className="mr-1" />
              <span>Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres (conservés) */}
      <div className={styles.searchBar}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Recherche */}
          <div className="md:col-span-5">
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.textMuted}`} />
              <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${styles.input} pl-9`}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.input}
            >
              <option value="all">🎯 Tous</option>
              <option value="active">✅ Actifs</option>
              <option value="inactive">❌ Inactifs</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.input}
            >
              <option value="nom">📝 Nom</option>
              <option value="tarif">💰 Tarif</option>
              <option value="plans">📋 Plans</option>
              <option value="recent">🕒 Récents</option>
            </select>
          </div>

          {/* ✅ MISE À JOUR: Toggle amélioré */}
          <div className="md:col-span-3">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`w-full p-2 rounded-lg text-sm font-medium transition-all ${
                showInactive 
                  ? 'bg-purple-500 text-white' 
                  : `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
              }`}
            >
              {showInactive ? '👁️ Affichage complet' : '👁️‍🗨️ Actifs seulement'}
            </button>
          </div>
        </div>

        {/* Stats rapides (conservées avec mise à jour) */}
        {typesPostes.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-500/20">
            <div className="text-center">
              <div className="text-base font-bold text-green-400">
                {typesPostes.filter(t => t.estActif).length}
              </div>
              <div className={`text-xs ${styles.textMuted}`}>Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-blue-400">
                {Math.round(typesPostes.reduce((sum, t) => sum + (t.tarifHoraireBase || 0), 0) / typesPostes.length)}
              </div>
              <div className={`text-xs ${styles.textMuted}`}>Moy.</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-purple-400">
                {typesPostes.reduce((sum, t) => sum + (t.plansTarifaires?.length || 0), 0)}
              </div>
              <div className={`text-xs ${styles.textMuted}`}>Plans</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-gray-400">
                {typesPostes.filter(t => !t.estActif).length}
              </div>
              <div className={`text-xs ${styles.textMuted}`}>Inactifs</div>
            </div>
          </div>
        )}
      </div>

      {/* Grille de cartes (conservée avec mise à jour du composant) */}
      {filteredAndSortedTypesPostes.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-gray-800/20' : 'bg-white/50'} rounded-lg p-6 border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} text-center`}>
          <Gamepad2 className={`mx-auto mb-3 ${styles.textMuted}`} size={40} />
          <h3 className={`text-base font-semibold mb-2 ${styles.textPrimary}`}>
            {searchTerm 
              ? 'Aucun type trouvé'
              : '🎮 Aucun type de poste'
            }
          </h3>
          <p className={`${styles.textSecondary} mb-3 text-sm`}>
            {searchTerm
              ? 'Modifiez votre recherche'
              : 'Créez votre premier type'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenForm()}
              className={styles.button}
            >
              Créer le premier
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedTypesPostes.map(typePoste => (
            <TypePosteCard
              key={typePoste.id}
              typePoste={typePoste}
              onEdit={() => handleOpenForm(typePoste)}
              onDelete={() => setTypePosteToDelete(typePoste)}
              onToggleStatus={handleToggleStatus}
              onShowStatistics={() => handleShowStatistics(typePoste)}
              formatCurrency={formatCurrency}
              translations={translations}
              isDarkMode={isDarkMode}
              styles={styles}
              isTypePosteInactif={isTypePosteInactif}
              renderPlansCompacts={renderPlansCompacts}
              showInactive={showInactive}
              toggleStatusMutation={toggleStatusMutation} // ✅ NOUVEAU
            />
          ))}
        </div>
      )}

      {/* Modales (conservées) */}
      {isFormOpen && (
        <TypePosteForm
          typePoste={selectedTypePoste}
          onClose={handleCloseForm}
        />
      )}

      {showStatistics && (
        <TypePosteStatistics
          typePoste={showStatistics}
          onClose={() => setShowStatistics(null)}
        />
      )}

      {showCalculateur && (
        <CalculateurTarifs
          typesPostes={typesPostes}
          onClose={() => setShowCalculateur(false)}
        />
      )}

      {/* Dialogue de confirmation (conservé) */}
      <ConfirmationDialog
        isOpen={!!typePosteToDelete}
        onClose={() => setTypePosteToDelete(null)}
        onConfirm={handleDelete}
        title={translations.deleteTypePoste || 'Supprimer le type de poste'}
        message={
          typePosteToDelete 
            ? `Êtes-vous sûr de vouloir supprimer "${typePosteToDelete.nom}" ?`
            : ''
        }
        confirmButtonText={translations.delete || 'Supprimer'}
        cancelButtonText={translations.cancel || 'Annuler'}
        loading={deleteTypePosteMutation.isPending}
        isDestructive={true}
      />

      {/* Modal ou section pour les statistiques */}
      {showStatsModal && selectedTypePosteForStats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } flex justify-between items-center`}>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Statistiques détaillées
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <TypePosteStatistics
                typePosteId={selectedTypePosteForStats.id}
                typePosteName={selectedTypePosteForStats.nom}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ MISE À JOUR: Composant de carte avec nouvelles fonctionnalités
const TypePosteCard = ({ 
  typePoste, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onShowStatistics,
  formatCurrency, 
  translations, 
  isDarkMode,
  styles,
  isTypePosteInactif,
  renderPlansCompacts,
  showInactive,
  toggleStatusMutation
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer border ${
        typePoste.estActif
          ? `${isDarkMode 
              ? 'bg-gradient-to-br from-gray-800/70 to-purple-900/15 border-purple-500/30 hover:border-purple-400/50' 
              : 'bg-gradient-to-br from-white to-purple-50/60 border-purple-200/50 hover:border-purple-300/70'
            } shadow-md hover:shadow-purple-500/20`
          : `${isDarkMode 
              ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-600/30' 
              : 'bg-gradient-to-br from-gray-100/70 to-gray-200/30 border-gray-300/50'
            } opacity-75 hover:opacity-90`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered && typePoste.estActif
          ? `0 0 15px ${typePoste.couleur || '#8b5cf6'}30`
          : undefined
      }}
    >
      {/* ✅ MISE À JOUR: Badge de statut amélioré */}
      <div className="absolute top-2 right-2 z-10">
        {isTypePosteInactif(typePoste) && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
            Inactif
          </span>
        )}
      </div>

      {/* ✅ MISE À JOUR: Barre de couleur conditionnelle */}
      <div 
        className="h-2 w-full"
        style={{ backgroundColor: typePoste.estActif ? (typePoste.couleur || '#8b5cf6') : '#6b7280' }}
      />

      <div className="p-3">
        {/* Header (conservé avec amélioration) */}
        <div className="flex items-start space-x-2 mb-3">
          <div 
            className="p-1.5 rounded-lg border"
            style={{
              backgroundColor: `${typePoste.couleur || '#8b5cf6'}20`,
              borderColor: `${typePoste.couleur || '#8b5cf6'}40`
            }}
          >
            {typePoste.icone ? (
              <GamingIcon iconKey={typePoste.icone} size={20} />
            ) : (
              <Gamepad2 size={16} className="text-purple-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold line-clamp-1 ${
              isTypePosteInactif(typePoste) 
                ? 'text-gray-500 line-through' 
                : styles.textPrimary
            }`}>
              {typePoste.nom}
            </h3>
            {typePoste.description && (
              <p className={`text-xs line-clamp-1 mt-0.5 ${
                isTypePosteInactif(typePoste) 
                  ? 'text-gray-400' 
                  : styles.textMuted
              }`}>
                {typePoste.description}
              </p>
            )}
          </div>
        </div>

        {/* Métriques (conservées avec amélioration) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 rounded bg-blue-500/10 border border-blue-500/20">
            <div className={`text-xs font-bold ${
              isTypePosteInactif(typePoste) ? 'text-gray-500' : styles.textPrimary
            }`}>
              {typePoste.tarifHoraireBase} {typePoste.devise || 'DH'}
            </div>
            <div className={`text-xs ${styles.textMuted}`}>Tarif/h</div>
          </div>
          
          <div className="text-center p-2 rounded bg-purple-500/10 border border-purple-500/20">
            <div className={`text-xs font-bold ${
              isTypePosteInactif(typePoste) ? 'text-gray-500' : styles.textPrimary
            }`}>
              {typePoste.plansTarifaires?.length || 0}
            </div>
            <div className={`text-xs ${styles.textMuted}`}>Plans</div>
          </div>
        </div>

        {/* ✅ MISE À JOUR: Plans avec gestion des inactifs */}
        {typePoste.plansTarifaires && typePoste.plansTarifaires.length > 0 && (
          <div className="mb-3">
            {renderPlansCompacts(typePoste)}
          </div>
        )}

        {/* ✅ MISE À JOUR: Actions avec bouton toggle */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-500/20">
          <div className="flex space-x-1">
            {/* Toggle status */}
            <button
              onClick={() => onToggleStatus(typePoste.id)}
              disabled={toggleStatusMutation.isLoading}
              className={`p-1.5 rounded transition-all hover:scale-110 ${
                isTypePosteInactif(typePoste)
                  ? 'bg-green-500/80 hover:bg-green-600/90 text-white'
                  : 'bg-orange-500/80 hover:bg-orange-600/90 text-white'
              }`}
              title={isTypePosteInactif(typePoste) ? 'Activer' : 'Désactiver'}
            >
              {isTypePosteInactif(typePoste) ? <Power size={14} /> : <PowerOff size={14} />}
            </button>

            <button
              onClick={() => onEdit(typePoste)}
              className="p-1.5 bg-blue-500/80 hover:bg-blue-600/90 text-white rounded transition-all hover:scale-110"
              title="Modifier"
            >
              <Edit2 size={14} />
            </button>

            <button
              onClick={() => onShowStatistics(typePoste)}
              className="p-1.5 bg-purple-500/80 hover:bg-purple-600/90 text-white rounded transition-all hover:scale-110"
              title="Stats"
            >
              <BarChart3 size={14} />
            </button>
          </div>
          
          <button
            onClick={() => onDelete(typePoste)}
            className="p-1.5 bg-red-500/80 hover:bg-red-600/90 text-white rounded transition-all hover:scale-110"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Barre de performance (conservée avec amélioration) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              typePoste.estActif 
                ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
            style={{ 
              width: `${Math.min(100, (typePoste.plansTarifaires?.length || 0) * 25 + 25)}%`,
              boxShadow: typePoste.estActif ? `0 0 8px ${typePoste.couleur || '#8b5cf6'}60` : undefined
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypesPostes;