import React from 'react';
import { useUserConnectionHistory } from '../../hooks/useMonitoring';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Spinner, Badge, Card, Button } from '../ui';
import { ArrowLeft, Calendar, Clock, Globe, Monitor } from 'lucide-react';

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
  
  const sessions = data?.data || [];
  
  // Séparer les sessions actives et terminées
  const activeSessions = sessions.filter(session => session.isActive);
  const inactiveSessions = sessions.filter(session => !session.isActive);
  
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
      
      {/* ✅ CORRECTION: Utilisation de tabs simples au lieu du composant Tabs manquant */}
      <div className="space-y-6">
        {/* Toutes les sessions */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Toutes les sessions ({sessions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.length === 0 ? (
              <p className="text-gray-500 col-span-full">Aucune session trouvée pour cet utilisateur</p>
            ) : (
              sessions.map(session => (
                <SessionHistoryCard key={session.id} session={session} />
              ))
            )}
          </div>
        </div>
        
        {/* Sessions actives */}
        {activeSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Sessions actives ({activeSessions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(session => (
                <SessionHistoryCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
        
        {/* Sessions terminées */}
        {inactiveSessions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Sessions terminées ({inactiveSessions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveSessions.map(session => (
                <SessionHistoryCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ CORRECTION: Composant de carte utilisant la durée calculée du backend
const SessionHistoryCard = ({ session }) => {
  const { 
    id,
    createdAt, 
    logoutDate, 
    logoutTime,
    lastActivity, 
    ipAddress, 
    userAgent, 
    ipChanged,
    isActive,
    logoutReason,
    duration // ✅ AJOUT: Utilisation de la durée calculée par le backend
  } = session;
  
  // ✅ CORRECTION: Utiliser la durée calculée par le backend
  const getDuration = () => {
    if (duration?.formatted) {
      return duration.formatted;
    }
    
    // Fallback si le backend n'a pas calculé la durée
    if (!createdAt) return '-';
    
    const start = new Date(createdAt);
    const end = logoutDate ? new Date(logoutDate) : 
               logoutTime ? new Date(logoutTime) :
               isActive ? new Date() : new Date(lastActivity);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  // Traduction des raisons de déconnexion
  const getLogoutReasonLabel = (reason) => {
    const reasons = {
      'EXPLICIT': 'Déconnexion manuelle',
      'TIMEOUT': 'Expiration (inactivité)',
      'NEW_LOGIN': 'Nouvelle connexion',
      'NEW_LOGIN_2FA': 'Nouvelle connexion (2FA)',
      'ADMIN_LOGOUT': 'Déconnexion par admin',
      'ADMIN_TERMINATED': 'Terminée par admin',
      'USER_DELETED': 'Utilisateur supprimé',
      'ACCOUNT_DISABLED': 'Compte désactivé',
      'SECURITY_BREACH': 'Problème de sécurité',
      'MAINTENANCE': 'Maintenance système',
      'TWO_FACTOR_DISABLED': '2FA désactivé'
    };
    
    return reasons[reason] || reason || 'Inconnue';
  };
  
  return (
    <Card className={`${isActive ? 'border-green-300 dark:border-green-700' : 'border-gray-300 dark:border-gray-700'} border overflow-hidden`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="font-medium">
            Session #{id}
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
          
          {(logoutDate || logoutTime) && (
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Fin: {format(new Date(logoutDate || logoutTime), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
            </div>
          )}
          
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Durée: {getDuration()}</span>
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
              <span className="truncate" title={userAgent}>
                {userAgent.length > 50 ? `${userAgent.substring(0, 50)}...` : userAgent}
              </span>
            </div>
          )}
          
          {/* Raison de déconnexion */}
          {!isActive && logoutReason && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Raison de fin: {getLogoutReasonLabel(logoutReason)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserConnectionHistory;