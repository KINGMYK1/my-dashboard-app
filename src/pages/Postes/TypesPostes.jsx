import React, { useState } from 'react';
import { Monitor, Plus, Edit3, Trash2, Tag, DollarSign, Clock, Search, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTypesPostes, useDeleteTypePoste } from '../../hooks/useTypePostes';
import TypePosteForm from './TypePosteForm';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { Button, Card, Spinner, Badge } from '../../components/ui';

const TypesPostes = () => {
  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  const { effectiveTheme } = useTheme();

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypePosteForm, setShowTypePosteForm] = useState(false);
  const [editingTypePoste, setEditingTypePoste] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    typePoste: null,
    title: '',
    message: ''
  });

  // Hooks de données
  const { data: typesPostes = [], isLoading, isError, error } = useTypesPostes();
  const deleteTypePosteMutation = useDeleteTypePoste();

  // Permissions
  const canViewTypesPostes = hasPermission('POSTES_VIEW'); // Assuming POSTES_VIEW covers types as well
  const canManageTypesPostes = hasPermission('POSTES_MANAGE');

  const isDarkMode = effectiveTheme === 'dark';

  // Styles dynamiques basés sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBgColorClass = () => isDarkMode ? 'bg-gray-800' : 'bg-[var(--background-card)]';
  const getBorderColorClass = () => isDarkMode ? 'border-gray-700' : 'border-[var(--border-color)]';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-[var(--background-input)]';
  const getInputTextColorClass = () => isDarkMode ? 'text-white' : 'text-[var(--text-primary)]';
  const getButtonBgClass = () => isDarkMode ? 'bg-purple-600' : 'bg-[var(--accent-color-primary)]';
  const getButtonHoverBgClass = () => isDarkMode ? 'hover:bg-purple-700' : 'hover:opacity-80';
  const getErrorColorClass = () => isDarkMode ? 'text-red-400' : 'text-[var(--error-color)]';
  const getErrorBgClass = () => isDarkMode ? 'bg-red-900/30' : 'bg-[var(--error-color)]10';
  const getErrorBorderClass = () => isDarkMode ? 'border-red-700' : 'border-[var(--error-color)]';

  // Filtrage des types de postes
  const filteredTypesPostes = typesPostes.filter(typePoste =>
    typePoste.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    typePoste.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestionnaires d'événements
  const openAddTypePosteForm = () => {
    setEditingTypePoste(null);
    setShowTypePosteForm(true);
  };

  const openEditTypePosteForm = (typePoste) => {
    setEditingTypePoste(typePoste);
    setShowTypePosteForm(true);
  };

  const closeTypePosteForm = () => {
    setShowTypePosteForm(false);
    setEditingTypePoste(null);
  };

  const openDeleteDialog = (typePoste) => {
    setConfirmDialog({
      show: true,
      typePoste: typePoste,
      title: translations.deleteTypePosteConfirmation || `Confirmer la suppression du type de poste "${typePoste.nom}"`,
      message: `${translations.deleteTypePosteConfirmationMessage || "Êtes-vous sûr de vouloir supprimer le type de poste"} "${typePoste.nom}"? ${translations.thisActionCannot || "Cette action est irréversible."}`
    });
  };

  const confirmDeleteTypePoste = async () => {
    if (confirmDialog.typePoste) {
      await deleteTypePosteMutation.mutateAsync(confirmDialog.typePoste.id);
      setConfirmDialog({ show: false, typePoste: null, title: '', message: '' });
    }
  };

  const cancelDeleteTypePoste = () => {
    setConfirmDialog({ show: false, typePoste: null, title: '', message: '' });
  };

  // Vérification des permissions
  if (!canViewTypesPostes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${getErrorBgClass()} border ${getErrorBorderClass()} rounded-lg p-4`}>
          <p className={`${getErrorColorClass()}`}>
            {translations.noPermissionViewTypesPostes || "Vous n'avez pas les permissions pour voir les types de postes."}
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
          <span className={`ml-2 ${getTextColorClass(false)}`}>{translations.loadingTypesPostes || "Chargement des types de postes..."}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${getErrorBgClass()} border ${getErrorBorderClass()} rounded-lg p-4`}>
          <p className={`${getErrorColorClass()}`}>
            {translations.errorLoadingTypesPostes || "Erreur lors du chargement des types de postes"}: {error?.response?.data?.message || error?.message}
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
          <Tag className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-[var(--accent-color-secondary)]'}`} />
          {translations.typePosteManagement || 'Gestion des Types de Postes'}
        </h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder={translations.search || "Rechercher..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-md ${getInputBgClass()} ${getInputTextColorClass()} ${getBorderColorClass()} border focus:ring-2 ${isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-[var(--accent-color-primary)]'} outline-none`}
            />
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${getTextColorClass(false)}`} />
          </div>

          {canManageTypesPostes && (
            <Button onClick={openAddTypePosteForm} variant="primary" className={`${getButtonBgClass()} ${getButtonHoverBgClass()}`}>
              <Plus className="mr-2" size={16} />
              {translations.addTypePoste || 'Ajouter un Type de Poste'}
            </Button>
          )}
        </div>
      </div>

      {/* Liste des types de postes */}
      {filteredTypesPostes.length === 0 ? (
        <Card className={`p-8 text-center ${getBgColorClass()}`}>
          <Tag className={`mx-auto h-12 w-12 ${getTextColorClass(false)} mb-4`} />
          <p className={`${getTextColorClass(false)}`}>
            {searchTerm ? translations.noMatchingTypesPostes || "Aucun type de poste correspondant à votre recherche." : translations.noTypesPostesFound || "Aucun type de poste trouvé."}
            {canManageTypesPostes && ` ${translations.startByCreatingOne || "Commencez par en créer un !"}`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypesPostes.map((typePoste) => (
            <Card key={typePoste.id} className={`p-4 hover:shadow-lg transition-shadow ${getBgColorClass()}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-semibold text-lg ${getTextColorClass(true)}`}>{typePoste.nom}</h3>
                  <p className={`text-sm ${getTextColorClass(false)}`}>
                    {typePoste.description || translations.noDescription || 'Pas de description'}
                  </p>
                </div>
                <Badge color={typePoste.estActif ? 'green' : 'gray'} size="sm">
                  {typePoste.estActif ? translations.active || 'Actif' : translations.inactive || 'Inactif'}
                </Badge>
              </div>

              {/* Informations du type de poste */}
              <div className="space-y-2 mb-4">
                <p className={`text-sm ${getTextColorClass(false)} flex items-center`}>
                  <DollarSign size={16} className={`mr-2 ${isDarkMode ? 'text-green-400' : 'text-[var(--success-color)]'}`} />
                  <span className={`font-medium ${getTextColorClass(true)}`}>{translations.hourlyRate || "Tarif Horaire Base"}:</span> {typePoste.tarifHoraireBase}€/h
                </p>
                {typePoste.icone && (
                  <p className={`text-sm ${getTextColorClass(false)} flex items-center`}>
                    <Monitor size={16} className={`mr-2 ${isDarkMode ? 'text-purple-400' : 'text-[var(--accent-color-primary)]'}`} />
                    <span className={`font-medium ${getTextColorClass(true)}`}>{translations.icon || "Icône"}:</span> {typePoste.icone}
                  </p>
                )}
                {typePoste.couleur && (
                  <p className={`text-sm ${getTextColorClass(false)} flex items-center`}>
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: typePoste.couleur }}></div>
                    <span className={`font-medium ${getTextColorClass(true)}`}>{translations.color || "Couleur"}:</span> {typePoste.couleur}
                  </p>
                )}
              </div>

              {/* Plans Tarifaires (affichage simple) */}
              {typePoste.plansTarifaires && typePoste.plansTarifaires.length > 0 && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-600">
                  <h4 className={`text-sm font-semibold mb-2 ${getTextColorClass(true)}`}>{translations.pricingPlans || "Plans Tarifaires"}:</h4>
                  <ul className="space-y-1">
                    {typePoste.plansTarifaires.map((plan, idx) => (
                      <li key={idx} className={`text-xs ${getTextColorClass(false)} flex items-center`}>
                        <Clock size={12} className="mr-1 text-gray-400" />
                        {plan.dureeMinutes} {translations.minutes || "min"} : {plan.prix}€
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className={`flex justify-end items-center pt-3 border-t ${getBorderColorClass()} mt-4`}>
                <div className="flex space-x-2">
                  {canManageTypesPostes && (
                    <>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => openEditTypePosteForm(typePoste)}
                        title={translations.edit || "Modifier"}
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => openDeleteDialog(typePoste)}
                        title={translations.delete || "Supprimer"}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Formulaire de type de poste */}
      {showTypePosteForm && (
        <TypePosteForm
          typePoste={editingTypePoste}
          onClose={closeTypePosteForm}
        />
      )}

      {/* Dialog de confirmation */}
      <ConfirmationDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDeleteTypePoste}
        onCancel={cancelDeleteTypePoste}
        confirmText={translations.delete || "Supprimer"}
        cancelText={translations.cancel || "Annuler"}
        type="danger"
        loading={deleteTypePosteMutation.isLoading}
      />
    </div>
  );
};

export default TypesPostes;
