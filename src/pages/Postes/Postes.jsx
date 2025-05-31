import React, { useState } from 'react';
import { Monitor, Plus, Settings, Power, Wrench, Trash2, Edit, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePostes, useCreatePoste, useUpdatePoste, useDeletePoste, useChangerEtatPoste } from '../../hooks/usePostes';
import { Button, Card, Badge, Spinner } from '../../components/ui';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';

const Postes = () => {
  const { translations } = useLanguage();
  const { hasPermission } = useAuth();
  
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
    switch (etat) {
      case 'Disponible': return 'green';
      case 'Occupé': return 'blue';
      case 'Maintenance': return 'red';
      default: return 'gray';
    }
  };

  // Vérification des permissions
  if (!canViewPostes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">
            Vous n'avez pas les permissions pour voir les postes.
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
          <span className="ml-2">Chargement des postes...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">
            Erreur lors du chargement des postes: {error?.response?.data?.message || error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Monitor className="mr-2" />
          {translations.postes || 'Postes Gaming'}
        </h1>
        
        <div className="flex items-center space-x-4">
          {/* Toggle pour inclure les postes inactifs */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Inclure inactifs</span>
          </label>
          
          {canManagePostes && (
            <Button variant="primary">
              <Plus className="mr-2" size={16} />
              {translations.addPoste || 'Ajouter un poste'}
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold">{postes.length}</p>
            </div>
            <Monitor className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">
                {postes.filter(p => p.etat === 'Disponible').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Occupés</p>
              <p className="text-2xl font-bold text-blue-600">
                {postes.filter(p => p.etat === 'Occupé').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-bold text-red-600">
                {postes.filter(p => p.etat === 'Maintenance').length}
              </p>
            </div>
            <div className="h-8 w-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Wrench className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des postes */}
      {postes.length === 0 ? (
        <Card className="p-8 text-center">
          <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Aucun poste trouvé. 
            {canManagePostes && " Commencez par en créer un !"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {postes.map((poste) => (
            <Card key={poste.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{poste.nom}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {poste.typePoste?.nom || 'Type non défini'}
                  </p>
                </div>
                <Badge color={getEtatBadgeColor(poste.etat)} size="sm">
                  {poste.etat}
                </Badge>
              </div>

              {/* Informations du poste */}
              <div className="space-y-2 mb-4">
                {poste.position && (
                  <p className="text-sm">
                    <span className="font-medium">Position:</span> {poste.position}
                  </p>
                )}
                
                {poste.typePoste?.tarifHoraireBase && (
                  <p className="text-sm">
                    <span className="font-medium">Tarif:</span> {poste.typePoste.tarifHoraireBase}€/h
                  </p>
                )}

                {poste.notesMaintenance && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <span className="font-medium">Notes:</span> {poste.notesMaintenance}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                  {/* Changement d'état */}
                  {canManagePostes && poste.etat === 'Disponible' && (
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={() => handleChangerEtat(poste, 'Maintenance')}
                      title="Mettre en maintenance"
                    >
                      <Wrench size={12} />
                    </Button>
                  )}
                  
                  {canManagePostes && poste.etat === 'Maintenance' && (
                    <Button
                      size="xs"
                      variant="success"
                      onClick={() => handleChangerEtat(poste, 'Disponible')}
                      title="Remettre en service"
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
                    title={canManagePostes ? "Éditer" : "Voir"}
                  >
                    {canManagePostes ? <Edit size={12} /> : <Eye size={12} />}
                  </Button>
                  
                  {/* Supprimer */}
                  {canManagePostes && (
                    <Button
                      size="xs"
                      variant="danger"
                      onClick={() => openDeleteDialog(poste)}
                      title="Supprimer"
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