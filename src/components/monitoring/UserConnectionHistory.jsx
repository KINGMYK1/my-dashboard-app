import React from 'react';
import { useUserConnectionHistory } from '../../hooks/useMonitoring';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Spinner, Badge, Card, Button, Tabs, Tab } from '../ui';
import { Globe, Clock, Monitor, Calendar, User, ArrowLeft } from 'lucide-react';

const UserConnectionHistory = ({ userId, onBack }) => {
  const { data, isLoading, isError, error, refetch } = useUserConnectionHistory(userId);
  
  if (isLoading && !data) {
    return <Spinner size="lg" className="mx-auto my-8" />;
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement de l'historique: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }
  
  const { sessions = [], loginActivities = [] } = data?.data || {};
  
  return (
    <div>
      <div className="flex items-center mb-6">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mr-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
        )}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Historique de connexion de l'utilisateur
        </h2>
      </div>
      
      <Tabs>
        <Tab label="Sessions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 col-span-full">Aucune session trouvée pour cet utilisateur</p>
            ) : (
              sessions.map(session => (
                <SessionHistoryCard key={session.id} session={session} />
              ))
            )}
          </div>
        </Tab>
        
        <Tab label="Activités de connexion">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Action</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Statut</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">IP</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {loginActivities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      Aucune activité de connexion trouvée pour cet utilisateur
                    </td>
                  </tr>
                ) : (
                  loginActivities.map(activity => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="font-medium">{format(new Date(activity.createdAt), 'dd/MM/yyyy')}</div>
                        <div className="text-xs">{format(new Date(activity.createdAt), 'HH:mm:ss')}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <ActionBadge action={activity.action} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <StatusBadge status={activity.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {activity.ipAddress || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {activity.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

// Composant de carte d'historique de session
const SessionHistoryCard = ({ session }) => {
  const { createdAt, logoutDate, lastActivity, ipAddress, userAgent, ipChanged } = session;
  
  // État de la session
  const isActive = session.isActive;
  
  // Calcul de la durée de session
  const getDuration = () => {
    if (!createdAt) return '-';
    
    const start = new Date(createdAt);
    const end = logoutDate ? new Date(logoutDate) : isActive ? new Date() : new Date(lastActivity);
    const durationMs = end - start;
    
    // Convertir en heures, minutes, secondes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  return (
    <Card className={`${isActive ? 'border-green-300 dark:border-green-700' : 'border-gray-300 dark:border-gray-700'} border overflow-hidden`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="font-medium">
            Session {session.id}
            <Badge color={isActive ? 'green' : 'gray'} className="ml-2">
              {isActive ? 'Active' : 'Terminée'}
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Début: {format(new Date(createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
          </div>
          
          {logoutDate && (
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Fin: {format(new Date(logoutDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
            </div>
          )}
          
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Durée: {getDuration()}</span>
          </div>
          
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-400" />
            <span>{ipAddress}</span>
            {ipChanged && (
              <Badge color="red" size="sm" className="ml-2">
                IP changée
              </Badge>
            )}
          </div>
          
          {userAgent && (
            <div className="flex items-center mt-1">
              <Monitor className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{userAgent}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Composant pour afficher le type d'action avec une couleur appropriée
const ActionBadge = ({ action }) => {
  let color = 'gray';
  
  if (action === 'LOGIN') {
    color = 'green';
  } else if (action === 'LOGOUT' || action === 'SESSION_END') {
    color = 'blue';
  } else if (action === 'LOGIN_FAILED') {
    color = 'red';
  } else if (action === 'SESSION_START') {
    color = 'purple';
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

export default UserConnectionHistory;