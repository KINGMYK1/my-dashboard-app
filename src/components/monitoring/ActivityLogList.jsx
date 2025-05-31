import React from 'react';
import { useActivityLogs } from '../../hooks/useMonitoring';
import { useMonitoring } from '../../contexts/MonitoringContext';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Spinner, Badge, Card, Button, Pagination } from '../ui';
import ActivityFilters from './ActivityFilters';

const ActivityLogList = ({ onUserSelect }) => {
  const { filters, updateFilters } = useMonitoring();
  const { data, isLoading, isError, error, refetch } = useActivityLogs();
  
  const handlePageChange = (page) => {
    updateFilters({ page });
  };
  
  if (isLoading && !data) {
    return <Spinner size="lg" className="mx-auto my-8" />;
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des logs d'activité: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }
  
  const logs = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 50, totalPages: 1 };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Logs d'Activité
        </h2>
        
        <ActivityFilters />
      </div>
      
      {logs.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>Aucun log d'activité ne correspond aux critères de recherche</p>
          <Button 
            onClick={() => updateFilters({ 
              userId: null, 
              action: null, 
              status: null, 
              resourceType: null,
              startDate: null,
              endDate: null
            })} 
            className="mt-2"
          >
            Réinitialiser les filtres
          </Button>
        </Card>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Utilisateur</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Action</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Statut</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Ressource</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">IP</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="font-medium">{format(new Date(log.createdAt), 'dd/MM/yyyy')}</div>
                    <div className="text-xs">{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {log.user ? (
                      <div 
                        className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-purple-600 transition-colors" 
                        onClick={() => onUserSelect(log.userId)}
                      >
                        {log.user.firstName} {log.user.lastName}
                        <div className="text-xs text-gray-500">@{log.user.username}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Système</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.resourceType ? (
                      <>
                        <span className="font-medium">{log.resourceType}</span>
                        {log.resourceId && <span className="text-xs ml-1">#{log.resourceId}</span>}
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.ipAddress || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Button 
                      size="xs" 
                      variant="ghost" 
                      onClick={() => {
                        // Afficher les détails du log (modal ou expansion)
                      }}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Affichage de {Math.min(pagination.total, (pagination.page - 1) * pagination.limit + 1)} à {Math.min(pagination.total, pagination.page * pagination.limit)} sur {pagination.total} résultats
        </div>
        
        <Pagination 
          currentPage={pagination.page} 
          totalPages={pagination.totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    </div>
  );
};

// Composant pour afficher le type d'action avec une couleur appropriée
const ActionBadge = ({ action }) => {
  let color = 'gray';
  
  if (['LOGIN', 'LOGOUT', 'SESSION_START', 'SESSION_END'].includes(action)) {
    color = 'blue';
  } else if (['CREATE', 'USER_CREATE', 'ROLE_CREATE'].includes(action)) {
    color = 'green';
  } else if (['UPDATE', 'USER_UPDATE', 'ROLE_UPDATE'].includes(action)) {
    color = 'yellow';
  } else if (['DELETE', 'USER_DELETE', 'ROLE_DELETE'].includes(action)) {
    color = 'red';
  } else if (['ERROR', 'LOGIN_FAILED', 'PERMISSION_DENIED'].includes(action)) {
    color = 'red';
  }
  
  return <Badge color={color}>{action}</Badge>;
};

// Composant pour afficher le statut avec une couleur appropriée
const StatusBadge = ({ status }) => {
  let color;
  
  switch (status) {
    case 'SUCCESS':
      color = 'green';
      break;
    case 'FAILURE':
      color = 'red';
      break;
    case 'WARNING':
      color = 'yellow';
      break;
    case 'INFO':
      color = 'blue';
      break;
    default:
      color = 'gray';
  }
  
  return <Badge color={color}>{status}</Badge>;
};

export default ActivityLogList;