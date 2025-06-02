import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Settings, Monitor, AlertTriangle,
  MoreVertical, Power, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  usePostes, 
  useDeletePoste, 
  useChangerEtatPoste 
} from '../../hooks/usePostes';
import { useNotification } from '../../contexts/NotificationContext';
import PosteForm from './PosteForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const Postes = () => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const { showError } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [posteToDelete, setPosteToDelete] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  
  // ✅ CORRECTION: Améliorer la gestion du changement d'état
  const [etatChangeData, setEtatChangeData] = useState(null);
  const [etatChangeNotes, setEtatChangeNotes] = useState('');

  const { data: postes = [], isLoading, isError, error } = usePostes(showInactive);
  const deletePosteMutation = useDeletePoste();
  const changerEtatMutation = useChangerEtatPoste();

  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => 
    isDarkMode 
      ? (isPrimary ? 'text-white' : 'text-gray-300') 
      : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-[var(--background-card)]';
  
  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-[var(--border-color)]';
  
  const getInputBgClass = () => 
    isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]';
  
  const getInputTextColorClass = () => 
    isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  
  const getButtonBgClass = () => 
    isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  
  const getButtonHoverBgClass = () => 
    isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';

  // Filtrage des postes
  const filteredPostes = useMemo(() => {
    if (!searchTerm) return postes;
    return postes.filter(poste =>
      poste.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (poste.position && poste.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (poste.typePoste && poste.typePoste.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [postes, searchTerm]);

  // Statistiques des postes
  const posteStats = useMemo(() => {
    return postes.reduce((stats, poste) => {
      if (!poste.estActif) {
        stats.inactifs++;
      } else {
        stats.actifs++;
        switch (poste.etat) {
          case 'Disponible':
            stats.disponibles++;
            break;
          case 'Occupé':
            stats.occupes++;
            break;
          case 'Maintenance':
            stats.maintenance++;
            break;
          default:
            break;
        }
      }
      return stats;
    }, { actifs: 0, inactifs: 0, disponibles: 0, occupes: 0, maintenance: 0 });
  }, [postes]);

  const handleOpenForm = (poste = null) => {
    setSelectedPoste(poste);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedPoste(null);
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (posteToDelete) {
      try {
        await deletePosteMutation.mutateAsync(posteToDelete.id);
        setPosteToDelete(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // ✅ CORRECTION: Améliorer la gestion du changement d'état
  const handleInitierChangementEtat = (poste, nouvelEtat) => {
    console.log('🔄 [POSTES] Initier changement état:', { posteId: poste.id, nouvelEtat });
    
    setEtatChangeData({
      posteId: poste.id,
      posteNom: poste.nom,
      etatActuel: poste.etat,
      nouvelEtat: nouvelEtat
    });
    setEtatChangeNotes('');
  };

  const handleConfirmerChangementEtat = async () => {
    if (!etatChangeData) {
      console.error('❌ [POSTES] Aucune donnée de changement d\'état');
      return;
    }

    try {
      console.log('🔄 [POSTES] Confirmation changement état:', etatChangeData);
      
      const payload = {
        id: etatChangeData.posteId,
        etat: etatChangeData.nouvelEtat
      };

      // Ajouter les notes si c'est une mise en maintenance
      if (etatChangeData.nouvelEtat === 'Maintenance' && etatChangeNotes.trim()) {
        payload.notesMaintenance = etatChangeNotes.trim();
      }

      console.log('📝 [POSTES] Payload envoyé:', payload);

      await changerEtatMutation.mutateAsync(payload);
      
      // ✅ Réinitialiser l'état après succès
      handleAnnulerChangementEtat();
      
    } catch (error) {
      console.error('❌ [POSTES] Erreur changement état:', error);
      // Ne pas fermer le dialogue en cas d'erreur pour permettre de réessayer
    }
  };

  // ✅ CORRECTION: Fonction pour annuler le changement d'état
  const handleAnnulerChangementEtat = () => {
    console.log('❌ [POSTES] Annulation changement état');
    setEtatChangeData(null);
    setEtatChangeNotes('');
  };

  // Au lieu d'un spinner plein écran, on pourrait utiliser des skeletons
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4`}>
        <div className={`${getBgColorClass()} rounded-lg p-6 ${getBorderColorClass()} border max-w-md w-full text-center`}>
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className={`text-lg font-semibold mb-2 ${getTextColorClass(true)}`}>
            {translations.errorLoadingPostes || 'Erreur lors du chargement des postes'}
          </h3>
          <p className={`${getTextColorClass(false)} mb-4`}>
            {error?.message || 'Une erreur inattendue s\'est produite'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
          >
            {translations.retry || 'Réessayer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${getTextColorClass(true)}`}>
            {translations.posteManagement || 'Gestion des Postes'}
          </h1>
          <p className={`${getTextColorClass(false)} mt-1`}>
            {postes.length > 0 
              ? `${postes.length} poste${postes.length > 1 ? 's' : ''} au total`
              : (translations.noPostesFound || 'Aucun poste trouvé')
            }
          </p>
        </div>
        
        <button
          onClick={() => handleOpenForm()}
          className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
        >
          <Plus size={20} />
          <span>{translations.addPoste || 'Nouveau Poste'}</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title={translations.disponible || 'Disponibles'}
          value={posteStats.disponibles}
          color="bg-green-500"
          textColor="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
          themeClasses={{ getBgColorClass, getBorderColorClass, getTextColorClass }}
        />
        <StatCard
          title={translations.occupe || 'Occupés'}
          value={posteStats.occupes}
          color="bg-red-500"
          textColor="text-red-600"
          bgColor="bg-red-50 dark:bg-red-900/20"
          themeClasses={{ getBgColorClass, getBorderColorClass, getTextColorClass }}
        />
        <StatCard
          title={translations.maintenance || 'Maintenance'}
          value={posteStats.maintenance}
          color="bg-orange-500"
          textColor="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          themeClasses={{ getBgColorClass, getBorderColorClass, getTextColorClass }}
        />
        <StatCard
          title={translations.active || 'Actifs'}
          value={posteStats.actifs}
          color="bg-blue-500"
          textColor="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          themeClasses={{ getBgColorClass, getBorderColorClass, getTextColorClass }}
        />
        <StatCard
          title={translations.inactive || 'Inactifs'}
          value={posteStats.inactifs}
          color="bg-gray-500"
          textColor="text-gray-600"
          bgColor="bg-gray-50 dark:bg-gray-900/20"
          themeClasses={{ getBgColorClass, getBorderColorClass, getTextColorClass }}
        />
      </div>

      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} />
          <input
            type="text"
            placeholder={translations.searchPostes || 'Rechercher un poste...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
          />
        </div>

        {/* Toggle pour postes inactifs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              showInactive 
                ? `${getButtonBgClass()} text-white` 
                : `${getInputBgClass()} ${getTextColorClass(false)} ${getBorderColorClass()} border`
            }`}
          >
            {showInactive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{translations.showInactivePostes || 'Afficher les postes inactifs'}</span>
          </button>
        </div>
      </div>

      {/* Liste des postes */}
      {filteredPostes.length === 0 ? (
        <div className={`${getBgColorClass()} rounded-lg p-8 ${getBorderColorClass()} border text-center`}>
          <Monitor className={`mx-auto mb-4 ${getTextColorClass(false)}`} size={48} />
          <h3 className={`text-lg font-semibold mb-2 ${getTextColorClass(true)}`}>
            {searchTerm 
              ? (translations.noMatchingPostes || 'Aucun poste correspondant à votre recherche')
              : (translations.noPostesFound || 'Aucun poste trouvé')
            }
          </h3>
          <p className={`${getTextColorClass(false)} mb-4`}>
            {searchTerm
              ? 'Essayez de modifier votre recherche ou ajoutez un nouveau poste.'
              : 'Commencez par créer votre premier poste de gaming.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenForm()}
              className={`px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
            >
              {translations.addPoste || 'Nouveau Poste'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPostes.map(poste => (
            <PosteCard
              key={poste.id}
              poste={poste}
              onEdit={() => handleOpenForm(poste)}
              onDelete={() => setPosteToDelete(poste)}
              onChangeEtat={handleInitierChangementEtat}
              translations={translations}
              themeClasses={{
                getBgColorClass,
                getBorderColorClass,
                getTextColorClass,
                getButtonBgClass,
                getButtonHoverBgClass
              }}
            />
          ))}
        </div>
      )}

      {/* Formulaire modal */}
      {isFormOpen && (
        <PosteForm
          poste={selectedPoste}
          onClose={handleCloseForm}
        />
      )}

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={!!posteToDelete}
        onClose={() => setPosteToDelete(null)}
        onConfirm={handleDelete}
        title={translations.deletePoste || 'Supprimer le poste'}
        message={
          posteToDelete 
            ? `${translations.deletePosteConfirmation || 'Êtes-vous sûr de vouloir supprimer le poste'} "${posteToDelete.nom}" ?`
            : ''
        }
        confirmButtonText={translations.delete || 'Supprimer'}
        cancelButtonText={translations.cancel || 'Annuler'}
        loading={deletePosteMutation.isPending}
        isDestructive={true}
      />

      {/* ✅ CORRECTION: Dialogue de changement d'état amélioré */}
      <EtatChangeDialog
        isOpen={!!etatChangeData}
        onClose={handleAnnulerChangementEtat}
        onConfirm={handleConfirmerChangementEtat}
        etatChangeData={etatChangeData}
        notes={etatChangeNotes}
        onNotesChange={setEtatChangeNotes}
        loading={changerEtatMutation.isPending}
        translations={translations}
        themeClasses={{
          getBgColorClass,
          getBorderColorClass,
          getTextColorClass,
          getInputBgClass,
          getInputTextColorClass,
          getButtonBgClass,
          getButtonHoverBgClass
        }}
      />
    </div>
  );
};

// ✅ NOUVEAU: Composant dialogue de changement d'état
const EtatChangeDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  etatChangeData, 
  notes, 
  onNotesChange, 
  loading, 
  translations, 
  themeClasses 
}) => {
  const { 
    getBgColorClass, 
    getBorderColorClass, 
    getTextColorClass, 
    getInputBgClass, 
    getInputTextColorClass,
    getButtonBgClass,
    getButtonHoverBgClass
  } = themeClasses;

  if (!isOpen || !etatChangeData) return null;

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'Disponible': return 'text-green-600';
      case 'Occupé': return 'text-red-600';
      case 'Maintenance': return 'text-orange-600';
      case 'Hors_Service': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const needsNotes = etatChangeData.nouvelEtat === 'Maintenance';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${getBgColorClass()} rounded-lg shadow-xl max-w-md w-full ${getBorderColorClass()} border`}>
        {/* Header */}
        <div className={`p-6 ${getBorderColorClass()} border-b`}>
          <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>
            {translations.changeEtat || 'Changer l\'état du poste'}
          </h3>
          <p className={`mt-2 text-sm ${getTextColorClass(false)}`}>
            Poste: <span className="font-medium">{etatChangeData.posteNom}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-sm ${getTextColorClass(false)}`}>État actuel:</span>
              <div className={`font-medium ${getEtatColor(etatChangeData.etatActuel)}`}>
                {etatChangeData.etatActuel}
              </div>
            </div>
            <div className="mx-4">→</div>
            <div>
              <span className={`text-sm ${getTextColorClass(false)}`}>Nouvel état:</span>
              <div className={`font-medium ${getEtatColor(etatChangeData.nouvelEtat)}`}>
                {etatChangeData.nouvelEtat}
              </div>
            </div>
          </div>

          {/* Notes pour maintenance */}
          {needsNotes && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${getTextColorClass(false)}`}>
                Notes de maintenance (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Décrivez la raison de la maintenance..."
                rows={3}
                className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 focus:ring-orange-500 outline-none transition-colors resize-vertical`}
                disabled={loading}
              />
            </div>
          )}

          {/* Message d'avertissement */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Cette action changera immédiatement l'état du poste.
              {etatChangeData.etatActuel === 'Occupé' && etatChangeData.nouvelEtat !== 'Occupé' && 
                ' La session en cours sera interrompue.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${getBorderColorClass()} border-t flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getInputBgClass()} ${getTextColorClass(false)} hover:opacity-80`}
          >
            {translations.cancel || 'Annuler'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Changement...</span>
              </>
            ) : (
              <>
                <span>{translations.confirm || 'Confirmer'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de carte de statistiques
const StatCard = ({ title, value, color, textColor, bgColor, themeClasses }) => {
  const { getBgColorClass, getBorderColorClass, getTextColorClass } = themeClasses;

  return (
    <div className={`${getBgColorClass()} rounded-lg ${getBorderColorClass()} border p-4`}>
      <div className={`${bgColor} rounded-lg p-3`}>
        <div className={`text-2xl font-bold ${textColor}`}>
          {value}
        </div>
        <div className={`text-sm ${getTextColorClass(false)} mt-1`}>
          {title}
        </div>
      </div>
    </div>
  );
};

// Composant de carte pour les postes
const PosteCard = ({ poste, onEdit, onDelete, onChangeEtat, translations, themeClasses }) => {
  const [showActions, setShowActions] = useState(false);
  const { getBgColorClass, getBorderColorClass, getTextColorClass } = themeClasses;

  const getEtatStyle = (etat) => {
    switch (etat) {
      case 'Disponible':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Occupé':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getTypePosteColor = () => {
    return poste.typePoste?.couleur || '#8b5cf6';
  };

  // ✅ CORRECTION: Fonction pour gérer le changement d'état avec fermeture du menu
  const handleChangeEtat = (nouvelEtat) => {
    console.log('🔄 [POSTE_CARD] Changement état:', { posteId: poste.id, nouvelEtat });
    setShowActions(false); // Fermer le menu d'actions
    onChangeEtat(poste, nouvelEtat); // Appeler la fonction parent
  };

  return (
    <div className={`${getBgColorClass()} rounded-lg ${getBorderColorClass()} border overflow-hidden hover:shadow-lg transition-shadow relative`}>
      {/* Header avec couleur du type */}
      <div 
        className="h-2" 
        style={{ backgroundColor: getTypePosteColor() }}
      />
      
      <div className="p-4">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${getTextColorClass(true)} mb-1`}>
              {poste.nom}
            </h3>
            <p className={`text-sm ${getTextColorClass(false)}`}>
              {poste.typePoste?.nom || 'Type non défini'}
            </p>
            {poste.position && (
              <p className={`text-xs ${getTextColorClass(false)} mt-1`}>
                📍 {poste.position}
              </p>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${getTextColorClass(false)}`}
            >
              <MoreVertical size={16} />
            </button>
            
            {showActions && (
              <div className={`absolute right-0 top-full mt-2 w-48 ${getBgColorClass()} rounded-lg shadow-lg ${getBorderColorClass()} border z-10`}>
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getTextColorClass(false)} flex items-center space-x-2`}
                >
                  <Edit2 size={16} />
                  <span>{translations.edit || 'Modifier'}</span>
                </button>
                
                {poste.etat !== 'Maintenance' && (
                  <button
                    onClick={() => handleChangeEtat('Maintenance')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getTextColorClass(false)} flex items-center space-x-2`}
                  >
                    <Settings size={16} />
                    <span>Mettre en maintenance</span>
                  </button>
                )}
                
                {poste.etat === 'Maintenance' && (
                  <button
                    onClick={() => handleChangeEtat('Disponible')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getTextColorClass(false)} flex items-center space-x-2`}
                  >
                    <Power size={16} />
                    <span>Remettre en service</span>
                  </button>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>{translations.delete || 'Supprimer'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* État */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEtatStyle(poste.etat)}`}>
            {poste.etat}
          </span>
        </div>

        {/* Tarif */}
        {poste.typePoste && (
          <div className={`text-sm ${getTextColorClass(false)} mb-3`}>
            <span className="font-medium">
              {new Intl.NumberFormat('fr-MA', {
                style: 'currency',
                currency: 'MAD'
              }).format(poste.typePoste.tarifHoraireBase)}/h
            </span>
          </div>
        )}

        {/* Notes de maintenance */}
        {poste.notesMaintenance && (
          <div className={`text-xs ${getTextColorClass(false)} bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-4 border-yellow-400`}>
            <strong>Notes:</strong> {poste.notesMaintenance}
          </div>
        )}

        {/* Status actif/inactif */}
        <div className="mt-3 pt-3 border-t border-opacity-20">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            poste.estActif 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}>
            {poste.estActif 
              ? (translations.active || 'Actif') 
              : (translations.inactive || 'Inactif')
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default Postes;