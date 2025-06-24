import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Monitor, Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
// ✅ CORRIGÉ: Import des bons hooks
import { useSessionsActives, useSessionsEnPause } from '../../hooks/useSessions';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const SessionsList = ({ onUserSelect, refreshInterval = 30000 }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ CORRIGÉ: Utilisation des hooks corrigés
  const { 
    data: sessionsActives, 
    isLoading: loadingActives, 
    isError: errorActives,
    refetch: refetchActives 
  } = useSessionsActives();

  const { 
    data: sessionsEnPause, 
    isLoading: loadingPause, 
    isError: errorPause,
    refetch: refetchPause 
  } = useSessionsEnPause();

  const [sessionToTerminate, setSessionToTerminate] = useState(null);

  // ✅ AJOUT: Rafraîchissement automatique des sessions
  useEffect(() => {
    const interval = setInterval(() => {
      refetchActives();
      refetchPause();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refetchActives, refetchPause, refreshInterval]);
  
  const handleTerminateSession = async (sessionId) => {
    setSessionToTerminate(sessionId);
  };

  const confirmTerminateSession = async () => {
    if (!sessionToTerminate) return;
    
    try {
      // Appel à l'API pour terminer la session
      // ✅ À REMPLACER PAR LA LOGIQUE D'API RÉELLE
      console.log(`Terminer la session ${sessionToTerminate}`);
      
      setSessionToTerminate(null);
      // Rafraîchir les données après terminaison
      refetchActives();
      refetchPause();
    } catch (error) {
      console.error('Erreur lors de la terminaison de la session:', error);
    }
  };

  if (loadingActives || loadingPause) {
    return <LoadingSpinner />;
  }
  
  if (errorActives || errorPause) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
        <p>Erreur lors du chargement des sessions</p>
        <button 
          onClick={() => {
            refetchActives();
            refetchPause();
          }} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sessions Utilisateurs
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {sessionsActives.length + sessionsEnPause.length} sessions au total ({sessionsActives.length} actives, {sessionsEnPause.length} en pause)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refetchActives();
              refetchPause();
            }}
            className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Actualiser
          </button>
        </div>
      </div>
      
      {/* Sessions actives */}
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
        <Monitor className="w-5 h-5 mr-2 text-green-500" /> Sessions actives ({sessionsActives.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {sessionsActives.length === 0 ? (
          <p className="text-gray-500 col-span-full">Aucune session active pour le moment</p>
        ) : (
          sessionsActives.map(session => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onUserSelect={onUserSelect}
              onTerminate={() => handleTerminateSession(session.id)}
              isActive
            />
          ))
        )}
      </div>
      
      {/* Sessions en pause */}
      {sessionsEnPause.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Sessions en pause ({sessionsEnPause.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionsEnPause.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onUserSelect={onUserSelect}
                onTerminate={() => handleTerminateSession(session.id)}
                isActive={false}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Dialogue de confirmation */}
      {sessionToTerminate && (
        <ConfirmationDialog
          isOpen={!!sessionToTerminate}
          onClose={() => setSessionToTerminate(null)}
          onConfirm={confirmTerminateSession}
          title="Terminer la session utilisateur"
          message="Êtes-vous sûr de vouloir terminer cette session utilisateur ? L'utilisateur sera immédiatement déconnecté."
          confirmButtonText="Terminer la session"
          cancelButtonText="Annuler"
          loading={false} // ✅ À GÉRER SELON L'ÉTAT DE L'API
        />
      )}
    </div>
  );
};

// ✅ AMÉLIORATION: Composant de carte de session avec durée temps réel
const SessionCard = ({ session, onUserSelect, onTerminate, isActive }) => {
  const { user, createdAt, lastActivity, ipAddress, userAgent, ipChanged } = session;
  
  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return 'Inconnu';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Navigateur inconnu';
  };
  
  return (
    <div className={`p-4 rounded-lg border ${
      isActive 
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
          isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
        }`}>
          {isActive ? 'Active' : 'En pause'}
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