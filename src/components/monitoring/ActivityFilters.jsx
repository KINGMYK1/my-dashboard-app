import React, { useState } from 'react';
import { useMonitoring } from '../../contexts/MonitoringContext';
import { Card, Button, Select, DatePicker } from '../ui';
import { X, Filter, RefreshCw } from 'lucide-react';

const ActivityFilters = () => {
  const { filters, updateFilters } = useMonitoring();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleReset = () => {
    updateFilters({
      userId: null,
      action: null,
      status: null,
      resourceType: null,
      startDate: null,
      endDate: null,
      page: 1
    });
  };
  
  const applyFilters = () => {
    // La mise à jour s'effectue automatiquement via les handleChange
    setIsExpanded(false);
  };
  
  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    { value: 'LOGIN', label: 'Connexion' },
    { value: 'LOGIN_FAILED', label: 'Échec de connexion' },
    { value: 'LOGOUT', label: 'Déconnexion' },
    { value: 'SESSION_START', label: 'Début de session' },
    { value: 'SESSION_END', label: 'Fin de session' },
    { value: 'IP_CHANGE', label: 'Changement d\'IP' },
    { value: 'CREATE', label: 'Création' },
    { value: 'UPDATE', label: 'Mise à jour' },
    { value: 'DELETE', label: 'Suppression' },
    { value: 'ERROR', label: 'Erreur' },
    { value: 'PERMISSION_DENIED', label: 'Accès refusé' }
  ];
  
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'SUCCESS', label: 'Succès' },
    { value: 'FAILURE', label: 'Échec' },
    { value: 'WARNING', label: 'Avertissement' },
    { value: 'INFO', label: 'Information' }
  ];
  
  const resourceTypeOptions = [
    { value: '', label: 'Tous les types de ressources' },
    { value: 'USER', label: 'Utilisateur' },
    { value: 'ROLE', label: 'Rôle' },
    { value: 'PERMISSION', label: 'Permission' },
    { value: 'USER_SESSION', label: 'Session utilisateur' },
    { value: 'REFRESH_TOKEN', label: 'Token de rafraîchissement' }
  ];
  
  // Déterminer si des filtres sont appliqués
  const hasActiveFilters = filters.userId || filters.action || filters.status || 
                          filters.resourceType || filters.startDate || filters.endDate;
  
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Button
          variant={isExpanded ? "primary" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-1" /> 
          {isExpanded ? 'Masquer les filtres' : 'Afficher les filtres'}
        </Button>
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleReset} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4 mr-1" /> Réinitialiser
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action
              </label>
              <Select
                value={filters.action || ''}
                onChange={(e) => updateFilters({ action: e.target.value || null, page: 1 })}
                options={actionOptions}
              />
            </div>
            
            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <Select
                value={filters.status || ''}
                onChange={(e) => updateFilters({ status: e.target.value || null, page: 1 })}
                options={statusOptions}
              />
            </div>
            
            {/* Filtre par type de ressource */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de ressource
              </label>
              <Select
                value={filters.resourceType || ''}
                onChange={(e) => updateFilters({ resourceType: e.target.value || null, page: 1 })}
                options={resourceTypeOptions}
              />
            </div>
            
            {/* Filtre par date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début
              </label>
              <DatePicker
                selected={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(date) => updateFilters({ startDate: date, page: 1 })}
                placeholderText="Sélectionner une date"
                maxDate={filters.endDate ? new Date(filters.endDate) : undefined}
              />
            </div>
            
            {/* Filtre par date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin
              </label>
              <DatePicker
                selected={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(date) => updateFilters({ endDate: date, page: 1 })}
                placeholderText="Sélectionner une date"
                minDate={filters.startDate ? new Date(filters.startDate) : undefined}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleReset} className="mr-2">
              <RefreshCw className="w-4 h-4 mr-1" /> Réinitialiser
            </Button>
            <Button onClick={applyFilters}>
              Appliquer les filtres
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivityFilters;