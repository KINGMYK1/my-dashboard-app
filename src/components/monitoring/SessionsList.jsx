import React, { useState, useEffect } from 'react';
import { useActiveSessions } from '../../hooks/useMonitoring';
import { useMonitoring } from '../../contexts/MonitoringContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Users, 
  Activity, 
  Clock, 
  Power, 
  AlertTriangle, 
  RefreshCw,
  Calendar,
  Globe, 
  Monitor 
} from 'lucide-react';
import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog';

const SessionsList = ({ onUserSelect }) => {
  const { filters, updateFilters, terminateSession } = useMonitoring();
  const [sessionToTerminate, setSessionToTerminate] = useState(null);
  const { data, isLoading, isError, error, refetch } = useActiveSessions();
  
  // ✅ AJOUT: Rafraîchissement automatique plus fréquent
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Rafraîchir toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  const handleInactivityPeriodChange = (minutes) => {
    updateFilters({ inactivityPeriod: minutes });
  };
  
  const handleTerminateSession = async () => {
    if (sessionToTerminate) {
      try {
        await terminateSession.mutateAsync(sessionToTerminate);
        setSessionToTerminate(null);
        // Rafraîchir immédiatement après terminaison
        setTimeout(() => refetch(), 1000);
      } catch (error) {
        console.error('Erreur terminaison session:', error);
      }
    }
  };

  const handleUserClick = (userId) => {
    console.log(`👤 [SESSIONS] Clic sur utilisateur ${userId}`);
    if (onUserSelect && typeof onUserSelect === 'function') {
      onUserSelect(userId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des sessions: {error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }
  
  const sessions = data?.data || {};
  const { active = [], inactive = [] } = sessions;
  const counts = data?.counts || { active: 0, inactive: 0, total: 0 };
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sessions Utilisateurs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {counts.total} sessions au total ({counts.active} actives, {counts.inactive} inactives)
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
                className={`px-3 py-1.5 text-sm font-medium border ${
                  filters.inactivityPeriod === minutes 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                } ${minutes === 15 ? 'rounded-l-md' : ''} ${minutes === 60 ? 'rounded-r-md' : ''}`}
              >
                {minutes} min
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => refetch()}
            className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Actualiser
          </button>
        </div>
      </div>
      
      {/* Sessions actives */}
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-green-500" /> Sessions actives ({active.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {active.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucune session active pour le moment</p>
        ) : (
          active.map(session => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onUserSelect={handleUserClick}
              onTerminate={() => setSessionToTerminate(session.id)}
            />
          ))
        )}
      </div>
      
      {/* Sessions inactives */}
      {inactive.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Sessions inactives ({inactive.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactive.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onUserSelect={handleUserClick}
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
        message="Êtes-vous sûr de vouloir terminer cette session utilisateur ? L'utilisateur sera immédiatement déconnecté."
        confirmButtonText="Terminer la session"
        cancelButtonText="Annuler"
        loading={terminateSession.isPending}
      />
    </div>
  );
};

// ✅ AMÉLIORATION: Composant de carte de session avec durée temps réel
const SessionCard = ({ session, onUserSelect, onTerminate, inactive = false }) => {
  const { user, createdAt, lastActivity, ipAddress, userAgent, ipChanged, duration: initialDuration } = session;
  const [currentDuration, setCurrentDuration] = useState(initialDuration);
  
  // ✅ AJOUT: Mise à jour de la durée en temps réel pour les sessions actives
  useEffect(() => {
    if (!inactive && createdAt) {
      const interval = setInterval(() => {
        const startTime = new Date(createdAt);
        const currentTime = new Date();
        const durationMs = currentTime - startTime;
        const durationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
        
        setCurrentDuration({
          minutes: durationMinutes,
          hours: Math.floor(durationMinutes / 60),
          displayMinutes: durationMinutes % 60,
          formatted: durationMinutes > 60 
            ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
            : `${durationMinutes}m`
        });
      }, 1000); // Mise à jour chaque seconde
      
      return () => clearInterval(interval);
    }
  }, [inactive, createdAt]);
  
  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return 'Inconnu';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Navigateur inconnu';
  };
  
  const isCurrentlyActive = session.isCurrentlyActive !== undefined 
    ? session.isCurrentlyActive 
    : !inactive;
  
  return (
    <div className={`p-4 rounded-lg border ${
      isCurrentlyActive 
        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' 
        : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
    } overflow-hidden`}>
      <div className="flex justify-between items-start mb-3">
        <div 
          className="font-medium cursor-pointer hover:text-purple-600 transition-colors" 
          onClick={() => onUserSelect && onUserSelect(user.id)}
        >
          {user.firstName} {user.lastName}
          <div className="text-sm text-gray-500">@{user.username}</div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isCurrentlyActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {isCurrentlyActive ? 'Active' : 'Inactive'}
        </span>
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

        {/* ✅ Affichage de la durée mise à jour */}
        {currentDuration?.formatted && (
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Durée: {currentDuration.formatted}</span>
          </div>
        )}
        
        <div className="flex items-center">
          <Globe className="w-4 h-4 mr-2 text-gray-400" />
          <span>{ipAddress}</span>
          {ipChanged && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
              <AlertTriangle className="w-3 h-3 mr-1 inline" /> IP changée
            </span>
          )}
        </div>
        
        <div className="flex items-center mt-1">
          <Monitor className="w-4 h-4 mr-2 text-gray-400" />
          <span>{getBrowserInfo(userAgent)}</span>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button 
          onClick={() => onUserSelect && onUserSelect(user.id)}
          className="flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
        >
          <Users className="w-4 h-4 mr-1" /> Voir l'historique
        </button>
        
        <button 
          onClick={onTerminate}
          className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <Power className="w-4 h-4 mr-1" /> Terminer
        </button>
      </div>
    </div>
  );
};

export default SessionsList;