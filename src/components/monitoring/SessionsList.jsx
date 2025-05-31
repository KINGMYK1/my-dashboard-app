import React, { useState } from 'react';
import { useActiveSessions } from '../../hooks/useMonitoring';
import { useMonitoring } from '../../contexts/MonitoringContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Spinner, Badge, Card, Button } from '../ui';
import { 
  Users, 
  Activity, 
  Clock, 
  Power, 
  AlertTriangle, 
  RefreshCw,  // Ajout de l'icône de rafraîchissement
  Calendar,   // Ajout des icônes manquantes
  Globe, 
  Monitor 
} from 'lucide-react';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

const SessionsList = ({ onUserSelect }) => {
  const { filters, updateFilters, terminateSession } = useMonitoring();
  const [sessionToTerminate, setSessionToTerminate] = useState(null);
  const { data, isLoading, isError, error, refetch } = useActiveSessions();
  
  const handleInactivityPeriodChange = (minutes) => {
    updateFilters({ inactivityPeriod: minutes });
  };
  
  const handleTerminateSession = async () => {
    if (sessionToTerminate) {
      await terminateSession.mutateAsync(sessionToTerminate);
      setSessionToTerminate(null);
    }
  };
  
  if (isLoading) {
    return <Spinner size="lg" className="mx-auto my-8" />;
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des sessions: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-2">Réessayer</Button>
      </div>
    );
  }
  
  const { active = [], inactive = [] } = data?.data || {};
  const { counts = {} } = data || {};
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sessions Utilisateurs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {counts.total || 0} sessions au total ({counts.active || 0} actives, {counts.inactive || 0} inactives)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Période d'inactivité:
          </span>
          <div className="flex rounded-md shadow-sm">
            {[15, 30, 60].map(minutes => (
              <button
                key={minutes}
                onClick={() => handleInactivityPeriodChange(minutes)}
                className={`px-3 py-1.5 text-sm font-medium ${
                  filters.inactivityPeriod === minutes 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                } ${minutes === 15 ? 'rounded-l-md' : ''} ${minutes === 60 ? 'rounded-r-md' : ''}`}
              >
                {minutes} min
              </button>
            ))}
          </div>
          
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" /> Actualiser
          </Button>
        </div>
      </div>
      
      {/* Sessions actives */}
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-green-500" /> Sessions actives
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {active.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucune session active pour le moment</p>
        ) : (
          active.map(session => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onUserSelect={onUserSelect}
              onTerminate={() => setSessionToTerminate(session.id)}
            />
          ))
        )}
      </div>
      
      {/* Sessions inactives */}
      {inactive.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Sessions inactives
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactive.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onUserSelect={onUserSelect}
                onTerminate={() => setSessionToTerminate(session.id)}
                inactive
              />
            ))}
          </div>
        </>
      )}
      
      {/* Dialogue de confirmation */}
      <ConfirmationDialog
        isOpen={!!sessionToTerminate}
        onClose={() => setSessionToTerminate(null)}
        onConfirm={handleTerminateSession}
        title="Terminer la session utilisateur"
        message="Êtes-vous sûr de vouloir terminer cette session utilisateur ? L'utilisateur devra se reconnecter."
        confirmLabel="Terminer la session"
        cancelLabel="Annuler"
        isLoading={terminateSession.isLoading}
      />
    </div>
  );
};

// Composant de carte de session
const SessionCard = ({ session, onUserSelect, onTerminate, inactive = false }) => {
  const { user, createdAt, lastActivity, ipAddress, userAgent, ipChanged } = session;
  
  // Extraire les informations du user agent
  const browser = getBrowserInfo(userAgent);
  
  return (
    <Card className={`${inactive ? 'border-yellow-300 dark:border-yellow-700' : 'border-green-300 dark:border-green-700'} border overflow-hidden`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div 
            className="font-medium cursor-pointer hover:text-purple-600 transition-colors" 
            onClick={() => onUserSelect(user.id)}
          >
            {user.firstName} {user.lastName}
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
          
          <Badge color={inactive ? 'yellow' : 'green'}>
            {inactive ? 'Inactive' : 'Active'}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>Dernière activité: {formatDistanceToNow(new Date(lastActivity), { addSuffix: true, locale: fr })}</span>
          </div>
          
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Connecté le: {new Date(createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-400" />
            <span>{ipAddress}</span>
            {ipChanged && (
              <Badge color="red" size="sm" className="ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" /> IP changée
              </Badge>
            )}
          </div>
          
          <div className="flex items-center mt-1">
            <Monitor className="w-4 h-4 mr-2 text-gray-400" />
            <span>{browser}</span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onUserSelect(user.id)}
          >
            <Users className="w-4 h-4 mr-1" /> Voir l'historique
          </Button>
          
          <Button 
            size="sm" 
            variant="danger" 
            onClick={onTerminate}
          >
            <Power className="w-4 h-4 mr-1" /> Terminer
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Fonction utilitaire pour extraire les informations du user agent
const getBrowserInfo = (userAgent) => {
  if (!userAgent) return 'Inconnu';
  
  // Extraction simplifiée, à améliorer avec une bibliothèque comme ua-parser-js
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
  
  return 'Navigateur inconnu';
};

export default SessionsList;