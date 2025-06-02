import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Settings, 
  DollarSign, Users, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useTypesPostes, 
  useDeleteTypePoste
} from '../../hooks/useTypePostes';
import { useNotification } from '../../contexts/NotificationContext';
import TypePosteForm from './TypePosteForm';
import TypePosteStatistics from './TypePosteStatistics';
import CalculateurTarifs from './CalculateurTarifs';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

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

  const { data: typesPostes = [], isLoading, isError, error } = useTypesPostes();
  const deleteTypePosteMutation = useDeleteTypePoste();

  const isDarkMode = effectiveTheme === 'dark';

  // Filtrage des types de postes
  const filteredTypesPostes = useMemo(() => {
    if (!searchTerm) return typesPostes;
    return typesPostes.filter(type =>
      type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [typesPostes, searchTerm]);

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
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleShowStatistics = (typePoste) => {
    setShowStatistics(typePoste);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4`}>
        <div className={`${getBgColorClass()} rounded-lg p-6 ${getBorderColorClass()} border max-w-md w-full text-center`}>
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className={`text-lg font-semibold mb-2 ${getTextColorClass(true)}`}>
            {translations.errorLoadingTypesPostes || 'Erreur lors du chargement des types de postes'}
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
            {translations.typePosteManagement || 'Gestion des Types de Postes'}
          </h1>
          <p className={`${getTextColorClass(false)} mt-1`}>
            {typesPostes.length > 0 
              ? `${typesPostes.length} type${typesPostes.length > 1 ? 's' : ''} de poste${typesPostes.length > 1 ? 's' : ''}`
              : (translations.noTypesPostesFound || 'Aucun type de poste trouvé')
            }
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCalculateur(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <span>Calculateur Tarifs</span>
          </button>
          
          <button
            onClick={() => handleOpenForm()}
            className={`flex items-center space-x-2 px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
          >
            <Plus size={20} />
            <span>{translations.addTypePoste || 'Nouveau Type de Poste'}</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${getTextColorClass(false)}`} />
        <input
          type="text"
          placeholder={translations.searchTypesPostes || 'Rechercher un type de poste...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-lg ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none transition-colors`}
        />
      </div>

      {/* Liste des types de postes */}
      {filteredTypesPostes.length === 0 ? (
        <div className={`${getBgColorClass()} rounded-lg p-8 ${getBorderColorClass()} border text-center`}>
          <Settings className={`mx-auto mb-4 ${getTextColorClass(false)}`} size={48} />
          <h3 className={`text-lg font-semibold mb-2 ${getTextColorClass(true)}`}>
            {searchTerm 
              ? (translations.noMatchingTypesPostes || 'Aucun type de poste correspondant à votre recherche')
              : (translations.noTypesPostesFound || 'Aucun type de poste trouvé')
            }
          </h3>
          <p className={`${getTextColorClass(false)} mb-4`}>
            {searchTerm
              ? 'Essayez de modifier votre recherche ou ajoutez un nouveau type de poste.'
              : 'Commencez par créer votre premier type de poste.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => handleOpenForm()}
              className={`px-4 py-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
            >
              {translations.addTypePoste || 'Nouveau Type de Poste'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTypesPostes.map(typePoste => (
            <TypePosteCard
              key={typePoste.id}
              typePoste={typePoste}
              onEdit={() => handleOpenForm(typePoste)}
              onDelete={() => setTypePosteToDelete(typePoste)}
              onShowStatistics={() => handleShowStatistics(typePoste)}
              formatCurrency={formatCurrency}
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
        <TypePosteForm
          typePoste={selectedTypePoste}
          onClose={handleCloseForm}
        />
      )}

      {/* Statistiques détaillées */}
      {showStatistics && (
        <TypePosteStatistics
          typePoste={showStatistics}
          onClose={() => setShowStatistics(null)}
        />
      )}

      {/* Calculateur de tarifs */}
      {showCalculateur && (
        <CalculateurTarifs
          typesPostes={typesPostes}
          onClose={() => setShowCalculateur(false)}
        />
      )}

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={!!typePosteToDelete}
        onClose={() => setTypePosteToDelete(null)}
        onConfirm={handleDelete}
        title={translations.deleteTypePoste || 'Supprimer le type de poste'}
        message={
          typePosteToDelete 
            ? `${translations.deleteTypePosteConfirmation || 'Êtes-vous sûr de vouloir supprimer le type de poste'} "${typePosteToDelete.nom}" ?`
            : ''
        }
        confirmButtonText={translations.delete || 'Supprimer'}
        cancelButtonText={translations.cancel || 'Annuler'}
        loading={deleteTypePosteMutation.isPending}
        isDestructive={true}
        additionalMessage={translations.deleteTypePosteConfirmationMessage || 'Cette action supprimera également tous les plans tarifaires associés'}
      />
    </div>
  );
};

// Composant de carte pour les types de postes
const TypePosteCard = ({ 
  typePoste, 
  onEdit, 
  onDelete, 
  onShowStatistics,
  formatCurrency, 
  translations, 
  themeClasses 
}) => {
  const { getBgColorClass, getBorderColorClass, getTextColorClass, getButtonBgClass, getButtonHoverBgClass } = themeClasses;

  return (
    <div className={`${getBgColorClass()} rounded-lg ${getBorderColorClass()} border overflow-hidden hover:shadow-lg transition-shadow`}>
      {/* Header avec couleur */}
      <div 
        className="h-2" 
        style={{ backgroundColor: typePoste.couleur || '#8b5cf6' }}
      />
      
      <div className="p-6">
        {/* En-tête */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {typePoste.icone && (
                <span className="text-xl">{typePoste.icone}</span>
              )}
              <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>
                {typePoste.nom}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className={getTextColorClass(false)} />
              <span className={`font-medium ${getTextColorClass(true)}`}>
                {formatCurrency(typePoste.tarifHoraireBase)}/h
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onShowStatistics(typePoste)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Voir statistiques"
            >
              <span className="text-xs">📊</span>
            </button>
            <button
              onClick={onEdit}
              className={`p-2 ${getButtonBgClass()} ${getButtonHoverBgClass()} text-white rounded-lg transition-colors`}
              title={translations.edit || 'Modifier'}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title={translations.delete || 'Supprimer'}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Description */}
        {typePoste.description && (
          <p className={`text-sm ${getTextColorClass(false)} mb-4 line-clamp-2`}>
            {typePoste.description}
          </p>
        )}

        {/* Plans tarifaires */}
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${getTextColorClass(true)} flex items-center`}>
            <Users size={14} className="mr-1" />
            {translations.pricingPlans || 'Plans tarifaires'}
          </h4>
          
          {typePoste.plansTarifaires && typePoste.plansTarifaires.length > 0 ? (
            <div className="space-y-1">
              {typePoste.plansTarifaires.slice(0, 3).map((plan, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className={getTextColorClass(false)}>
                    {plan.nom || `${plan.dureeMinutes} ${translations.minutes || 'min'}`}
                  </span>
                  <span className={`font-medium ${getTextColorClass(true)}`}>
                    {formatCurrency(plan.prix)}
                  </span>
                </div>
              ))}
              {typePoste.plansTarifaires.length > 3 && (
                <div className={`text-xs ${getTextColorClass(false)}`}>
                  +{typePoste.plansTarifaires.length - 3} autre{typePoste.plansTarifaires.length > 4 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <p className={`text-xs ${getTextColorClass(false)}`}>
              {translations.noPricingPlans || 'Aucun plan tarifaire'}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-opacity-20">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            typePoste.estActif 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}>
            {typePoste.estActif 
              ? (translations.active || 'Actif') 
              : (translations.inactive || 'Inactif')
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypesPostes;