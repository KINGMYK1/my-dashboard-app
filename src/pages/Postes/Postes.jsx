import React, { useState } from 'react';
import { Monitor, Plus, Settings, Power, Wrench, Trash2, Edit, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme
import { usePostes, useCreatePoste, useUpdatePoste, useDeletePoste, useChangerEtatPoste } from '../../hooks/usePostes';
import { Button, Card, Badge, Spinner } from '../../components/ui'; // Assuming these are theme-aware or will be.
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Postes = () => {
  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  const { effectiveTheme } = useTheme(); // Use effectiveTheme
  
  // États locaux
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // Hooks de données
  const { data: postes = [], isLoading, isError, error } = usePostes(includeInactive);
  const { mutate: deletePoste } = useDeletePoste();
  const { mutate: changerEtat } = useChangerEtatPoste();
    
  // Permissions
  const canViewPostes = hasPermission('POSTES_VIEW');
  const canManagePostes = hasPermission('POSTES_MANAGE');

  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBorderColorClass = () => isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]';
  const getAccentColorClass = () => isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]';
  const getErrorColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getErrorBgClass = () => isDarkMode ? 'bg-red-900/30' : 'bg-[var(--error-color)]10';
  const getErrorBorderClass = () => isDarkMode ? 'border-red-700' : 'border-[var(--error-color)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getCardBgClass = () => 'var(--background-card)'; // Use CSS variable for card background


  // Gestionnaires d'événements
  const handleDeleteConfirm = () => {
    if (selectedPoste) {
      deletePoste(selectedPoste.id);
      setIsDeleteDialogOpen(false);
      setSelectedPoste(null);
    }
  };

  const handleChangerEtat = (poste, nouvelEtat) => {
    changerEtat({
      id: poste.id,
      etat: nouvelEtat,
      notesMaintenance: nouvelEtat === 'Maintenance' ? 'Mis en maintenance' : ''
    });
  };

  const openDeleteDialog = (poste) => {
    setSelectedPoste(poste);
    setIsDeleteDialogOpen(true);
  };

  // Fonction pour obtenir la couleur du badge d'état
  const getEtatBadgeColor = (etat) => {
    if (isDarkMode) {
        switch (etat) {
            case 'Disponible': return 'green';
            case 'Occupé': return 'blue';
            case 'Maintenance': return 'red';
            default: return 'gray';
        }
    } else {
        switch (etat) {
            case 'Disponible': return 'green'; // Tailwind green for light mode
            case 'Occupé': return 'blue';     // Tailwind blue for light mode
            case 'Maintenance': return 'red';    // Tailwind red for light mode
            default: return 'gray';
        }
    }
  };

  // Vérification des permissions
  if (!canViewPostes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${getErrorBgClass()} border ${getErrorBorderClass()} rounded-lg p-4`}>
          <p className={`${getErrorColorClass()}`}>
            {translations.noPermissionViewPostes || "Vous n'avez pas les permissions pour voir les postes."}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <Spinner size="lg" />
          <span className={`ml-2 ${getTextColorClass(false)}`}>{translations.loadingPostes || "Chargement des postes..."}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${getErrorBgClass()} border ${getErrorBorderClass()} rounded-lg p-4`}>
          <p className={`${getErrorColorClass()}`}>
            {translations.errorLoadingPostes || "Erreur lors du chargement des postes"}: {error?.response?.data?.message || error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold flex items-center ${getTextColorClass(true)}`}>
          <Monitor className={`mr-2 ${getAccentColorClass()}`} />
          {translations.postes || 'Postes Gaming'}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Toggle pour inclure les postes inactifs */}
          <label className={`flex items-center ${getTextColorClass(false)}`}>
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className={`mr-2 h-4 w-4 rounded border ${isDarkMode ? 'border-gray-600' : 'border-[var(--border-color)]'} ${isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]'} focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'}`}
              style={{ color: isDarkMode ? 'purple' : 'var(--accent-color-primary)' }}
            />
            <span className="text-sm">{translations.includeInactive || "Inclure inactifs"}</span>
          </label>
          
          {canManagePostes && (
            <Button variant="primary" className={`${getButtonBgClass()} ${getButtonHoverBgClass()}`}>
              <Plus className="mr-2" size={16} />
              {translations.addPoste || 'Ajouter un poste'}
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={`p-4 ${getCardBgClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations.total || "Total"}</p>
              <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>{postes.length}</p>
            </div>
            <Monitor className={`h-8 w-8 ${getTextColorClass(false)}`} />
          </div>
        </Card>
        
        <Card className={`p-4 ${getCardBgClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations.available || "Disponibles"}</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-600' : 'text-[var(--success-color)]'}`}>
                {postes.filter(p => p.etat === 'Disponible').length}
              </p>
            </div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-green-100 dark:bg-green-900/30' : 'bg-[var(--success-color)]10'} rounded-full flex items-center justify-center`}>
              <div className={`h-3 w-3 ${isDarkMode ? 'bg-green-500' : 'bg-[var(--success-color)]'} rounded-full`}></div>
            </div>
          </div>
        </Card>
        
        <Card className={`p-4 ${getCardBgClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations.occupied || "Occupés"}</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-600' : 'text-[var(--accent-color-secondary)]'}`}>
                {postes.filter(p => p.etat === 'Occupé').length}
              </p>
            </div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-[var(--accent-color-secondary)]10'} rounded-full flex items-center justify-center`}>
              <div className={`h-3 w-3 ${isDarkMode ? 'bg-blue-500' : 'bg-[var(--accent-color-secondary)]'} rounded-full`}></div>
            </div>
          </div>
        </Card>
        
        <Card className={`p-4 ${getCardBgClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${getTextColorClass(false)}`}>{translations.maintenance || "Maintenance"}</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-600' : 'text-[var(--error-color)]'}`}>
                {postes.filter(p => p.etat === 'Maintenance').length}
              </p>
            </div>
            <div className={`h-8 w-8 ${isDarkMode ? 'bg-red-100 dark:bg-red-900/30' : 'bg-[var(--error-color)]10'} rounded-full flex items-center justify-center`}>
              <Wrench className={`h-4 w-4 ${isDarkMode ? 'text-red-500' : 'text-[var(--error-color)]'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des postes */}
      {postes.length === 0 ? (
        <Card className={`p-8 text-center ${getCardBgClass()}`}>
          <Monitor className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
          <p className={`${getTextColorClass(false)}`}>
            {translations.noPostesFound || "Aucun poste trouvé."}
            {canManagePostes && ` ${translations.startByCreatingOne || "Commencez par en créer un !"}`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {postes.map((poste) => (
            <Card key={poste.id} className={`p-4 hover:shadow-lg transition-shadow ${getCardBgClass()}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-semibold text-lg ${getTextColorClass(true)}`}>{poste.nom}</h3>
                  <p className={`text-sm ${getTextColorClass(false)}`}>
                    {poste.typePoste?.nom || translations.undefinedType || 'Type non défini'}
                  </p>
                </div>
                <Badge color={getEtatBadgeColor(poste.etat)} size="sm">
                  {poste.etat}
                </Badge>
              </div>

              {/* Informations du poste */}
              <div className="space-y-2 mb-4">
                {poste.position && (
                  <p className={`text-sm ${getTextColorClass(false)}`}>
                    <span className={`font-medium ${getTextColorClass(true)}`}>{translations.position || "Position"}:</span> {poste.position}
                  </p>
                )}
                
                {poste.typePoste?.tarifHoraireBase && (
                  <p className={`text-sm ${getTextColorClass(false)}`}>
                    <span className={`font-medium ${getTextColorClass(true)}`}>{translations.hourlyRate || "Tarif"}:</span> {poste.typePoste.tarifHoraireBase}€/h
                  </p>
                )}

                {poste.notesMaintenance && (
                  <p className={`text-sm ${getErrorColorClass()}`}>
                    <span className={`font-medium ${getTextColorClass(true)}`}>{translations.notes || "Notes"}:</span> {poste.notesMaintenance}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className={`flex justify-between items-center pt-3 border-t ${getBorderColorClass()}`}>
                <div className="flex space-x-1">
                  {/* Changement d'état */}
                  {canManagePostes && poste.etat === 'Disponible' && (
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={() => handleChangerEtat(poste, 'Maintenance')}
                      title={translations.moveToMaintenance || "Mettre en maintenance"}
                    >
                      <Wrench size={12} />
                    </Button>
                  )}
                  
                  {canManagePostes && poste.etat === 'Maintenance' && (
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleChangerEtat(poste, 'Disponible')}
                      title={translations.putBackInService || "Remettre en service"}
                    >
                      <Power size={12} />
                    </Button>
                  )}
                </div>

                <div className="flex space-x-1">
                  {/* Voir/Éditer */}
                  <Button
                    size="xs"
                    variant="ghost"
                    title={canManagePostes ? translations.edit || "Éditer" : translations.view || "Voir"}
                  >
                    {canManagePostes ? <Edit size={12} /> : <Eye size={12} />}
                  </Button>
                  
                  {/* Supprimer */}
                  {canManagePostes && (
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => openDeleteDialog(poste)}
                      title={translations.delete || "Supprimer"}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={translations?.confirmDeletePoste || 'Confirmer la suppression'}
        message={`Êtes-vous sûr de vouloir supprimer le poste "${selectedPoste?.nom}" ? Cette action ne peut pas être annulée.`}
        confirmText={translations?.delete || 'Supprimer'}
        cancelText={translations?.cancel || 'Annuler'}
        type="danger"
      />
    </div>
  );
};

export default Postes;
