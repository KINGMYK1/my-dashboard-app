import React, { useState } from 'react';
import { useActivityLogs } from '../../hooks/useMonitoring';
import { useMonitoring } from '../../contexts/MonitoringContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, Button, Badge, Spinner } from '../ui';
import { Search, Filter, Eye, User, Calendar, AlertTriangle } from 'lucide-react';

const ActivityLogList = ({ onUserSelect }) => {
  const { filters, updateFilters } = useMonitoring();
  const { data, isLoading, isError, error, refetch } = useActivityLogs();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value, page: 1 });
  };

  if (isLoading) {
    return <Spinner size="lg" className="mx-auto my-8" />;
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des logs: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }

  // ✅ CORRECTION: Vérification de la structure des données
  console.log('📋 [ACTIVITY_LOGS] Structure des données reçues:', data);
  
  const logs = Array.isArray(data?.data) ? data.data : data || [];
  const stats = data?.stats || {};
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Journaux d'Activité
        </h2>
        
        {/* ✅ CORRECTION: Affichage conditionnel des stats */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.successCount || 0}</div>
                <div className="text-sm text-gray-500">Succès</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failureCount || 0}</div>
                <div className="text-sm text-gray-500">Échecs</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalToday || 0}</div>
                <div className="text-sm text-gray-500">Aujourd'hui</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.successRate || 0}%</div>
                <div className="text-sm text-gray-500">Taux de succès</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Button type="submit">
              <Search size={16} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Toutes les actions</option>
              <option value="LOGIN_SUCCESS">Connexion</option>
              <option value="LOGOUT">Déconnexion</option>
              <option value="CREATE">Création</option>
              <option value="UPDATE">Modification</option>
              <option value="DELETE">Suppression</option>
            </select>
            
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILURE">Échec</option>
              <option value="WARNING">Avertissement</option>
            </select>
          </div>
        </form>
      </Card>

      {/* Liste des logs */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Aucun log d'activité trouvé
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.User ? `${log.User.firstName} ${log.User.lastName}` : 'Système'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {log.User ? `@${log.User.username}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={getActionVariant(log.action)}
                        className="text-xs"
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {log.description}
                      </div>
                      {log.resourceType && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {log.resourceType} {log.resourceId && `#${log.resourceId}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(log.status)}>
                        {getStatusLabel(log.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </div>
                      {log.ipAddress && (
                        <div className="text-xs text-gray-400">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.User && onUserSelect && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUserSelect(log.User.id)}
                        >
                          <Eye size={14} className="mr-1" />
                          Voir utilisateur
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} éléments)
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                >
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Fonctions utilitaires
const getActionVariant = (action) => {
  const variants = {
    'LOGIN_SUCCESS': 'success',
    'LOGOUT': 'secondary',
    'CREATE': 'info',
    'UPDATE': 'warning',
    'DELETE': 'destructive',
    'ADMIN_TERMINATE_SESSION': 'destructive'
  };
  return variants[action] || 'secondary';
};

const getStatusVariant = (status) => {
  const variants = {
    'SUCCESS': 'success',
    'FAILURE': 'destructive',
    'WARNING': 'warning',
    'INFO': 'info'
  };
  return variants[status] || 'secondary';
};

const getStatusLabel = (status) => {
  const labels = {
    'SUCCESS': 'Succès',
    'FAILURE': 'Échec',
    'WARNING': 'Avertissement',
    'INFO': 'Information'
  };
  return labels[status] || status;
};

export default ActivityLogList;