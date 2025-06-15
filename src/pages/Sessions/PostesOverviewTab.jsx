import React from 'react';
import { Play, Settings, Monitor, Wifi, WifiOff, Clock, User, Euro, AlertCircle } from 'lucide-react'; // Added Clock, User, Euro, AlertCircle for session details
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const PostesOverviewTab = ({
  postes = [],
  sessionsActives = [],
  onStartSession = () => {},
  onOpenSessionActions = () => {}, // This will now open the comprehensive action modal
  canManage = true,
  isDarkMode = false,
  translations = {},
  loadingPostes = false
}) => {
  // Helper functions for theme classes
  const getTextColorClass = (isPrimary = false) => {
    return isDarkMode
      ? (isPrimary ? 'text-white' : 'text-gray-300')
      : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  };

  const getBgColorClass = () => {
    return isDarkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColorClass = () => {
    return isDarkMode ? 'border-gray-700' : 'border-gray-200';
  };

  const getCardHoverClass = () => {
    return isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50';
  };

  // Helper to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(price || 0);
  };

  // Helper to format duration from start to current time
  const formatLiveDuration = (dateHeureDebut, tempsPauseTotalMinutes = 0) => {
    const start = new Date(dateHeureDebut);
    const now = new Date();
    let diffMs = now.getTime() - start.getTime();

    // Subtract pause time from total elapsed time
    diffMs -= (tempsPauseTotalMinutes || 0) * 60 * 1000;

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 0) return '0 min'; // Avoid negative duration if system clock is off

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };


  // Normalize active sessions array for consistent access
  const normalizedSessionsActives = Array.isArray(sessionsActives) ? sessionsActives : [];

  // Helper to determine poste status and associated data
  const getPosteStatus = (poste) => {
    const activeSession = normalizedSessionsActives.find(s => s.posteId === poste.id);

    if (activeSession) {
      return {
        status: 'active-session',
        label: translations?.sessionInProgress || 'Session en cours',
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        borderColor: 'border-green-500',
        session: activeSession // Attach the active session data
      };
    }

    switch (poste.etat) {
      case 'Disponible':
        return {
          status: 'available',
          label: translations?.available || 'Disponible',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          borderColor: 'border-blue-500'
        };
      case 'Maintenance':
        return {
          status: 'maintenance',
          label: translations?.inMaintenance || 'En maintenance',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          borderColor: 'border-orange-500'
        };
      case 'Hors_Service':
        return {
          status: 'offline',
          label: translations?.outOfService || 'Hors service',
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-500'
        };
      case 'EN_PAUSE': // Handle postes whose linked session is in pause
        const pausedSession = normalizedSessionsActives.find(s => s.posteId === poste.id && s.statut === 'EN_PAUSE');
        if (pausedSession) {
          return {
            status: 'paused-session',
            label: translations?.sessionPaused || 'Session en pause',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            borderColor: 'border-orange-500',
            session: pausedSession
          };
        }
        // Fallback if poste.etat is 'EN_PAUSE' but no session linked (unlikely with hooks)
        return {
          status: 'unknown',
          label: translations?.unknownStatus || 'État inconnu',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-500'
        };
      default:
        return {
          status: 'unknown',
          label: translations?.unknownStatus || 'État inconnu',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          borderColor: 'border-gray-500'
        };
    }
  };


  if (loadingPostes) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${getBgColorClass()} ${getTextColorClass()} flex justify-center items-center h-48`}>
        <LoadingSpinner />
        <span className="ml-2">{translations?.loadingPostes || 'Chargement des postes...'}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {postes.map((poste) => {
        const statusInfo = getPosteStatus(poste);
        const session = statusInfo.session; // The associated session if available

        return (
          <div
            key={poste.id}
            className={`
              p-6 rounded-xl shadow-lg border-2 flex flex-col justify-between
              ${getBgColorClass()} ${getTextColorClass()}
              ${getCardHoverClass()}
              ${statusInfo.borderColor}
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-semibold mb-1 ${getTextColorClass(true)}`}>
                  <Monitor size={20} className="inline-block mr-2 text-blue-500" />
                  {poste.nom}
                </h3>
                <p className={`text-sm ${getTextColorClass(false)}`}>
                  {translations?.type || 'Type'}: {poste.typePoste?.nom || 'N/A'}
                </p>
                <p className={`text-sm ${getTextColorClass(false)}`}>
                  {translations?.location || 'Position'}: {poste.position || 'N/A'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Session Details if active or paused */}
            {session && (
              <div className={`p-4 mt-2 mb-4 rounded-lg border ${statusInfo.borderColor} ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-2 ${getTextColorClass(true)} flex items-center`}>
                  <Play size={16} className="inline-block mr-2" />
                  {translations?.currentSession || 'Session actuelle'}
                </h4>
                <div className="text-sm space-y-1">
                  <p className={`${getTextColorClass(false)} flex items-center`}>
                    <User size={14} className="inline-block mr-2 text-blue-400" />
                    {translations?.client || 'Client'}: {session.client?.isSystemClient ? translations?.anonymous || 'Anonyme' : `${session.client?.prenom} ${session.client?.nom}`}
                  </p>
                  <p className={`${getTextColorClass(false)} flex items-center`}>
                    <Clock size={14} className="inline-block mr-2 text-indigo-400" />
                    {translations?.elapsedTime || 'Temps écoulé'}: {formatLiveDuration(session.dateHeureDebut, session.tempsPauseTotalMinutes)}
                  </p>
                  {session.dureeEstimeeMinutes && (
                    <p className={`${getTextColorClass(false)} flex items-center`}>
                      <Clock size={14} className="inline-block mr-2 text-purple-400" />
                      {translations?.estimatedRemaining || 'Temps restant estimé'}: {Math.max(0, session.dureeEstimeeMinutes - (Math.floor(((new Date()).getTime() - new Date(session.dateHeureDebut).getTime()) / (1000 * 60)) - (session.tempsPauseTotalMinutes || 0)))} min
                    </p>
                  )}
                  {session.montantTotal > 0 && (
                    <p className={`${getTextColorClass(false)} flex items-center`}>
                      <Euro size={14} className="inline-block mr-2 text-yellow-400" />
                      {translations?.currentCost || 'Coût actuel'}: {formatPrice(session.montantTotal)}
                    </p>
                  )}
                  {session.jeuPrincipal && (
                    <p className={`${getTextColorClass(false)} flex items-center`}>
                      <Gamepad2 size={14} className="inline-block mr-2 text-pink-400" />
                      {translations?.game || 'Jeu'}: {session.jeuPrincipal}
                    </p>
                  )}
                  {session.notes && (
                    <p className={`${getTextColorClass(false)} flex items-center italic`}>
                      <Info size={14} className="inline-block mr-2 text-gray-400" />
                      {translations?.notes || 'Notes'}: {session.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-auto pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
              {statusInfo.status === 'available' && canManage && (
                <button
                  onClick={() => onStartSession(poste)} // Pass the whole poste object
                  className={`flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {translations?.startSession || 'Démarrer'}
                </button>
              )}

              {(statusInfo.status === 'active-session' || statusInfo.status === 'paused-session') && canManage && (
                <button
                  onClick={() => onOpenSessionActions(session)} // Pass the session object
                  className={`flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {translations?.manageSession || 'Gérer la session'}
                </button>
              )}

              {(statusInfo.status === 'maintenance' || statusInfo.status === 'offline') && (
                <div className="flex-1 text-center py-2 text-sm">
                  <span className={`${statusInfo.color} font-medium`}>
                    {statusInfo.label}
                  </span>
                  {/* You could add a button here to change status to available if needed */}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostesOverviewTab;
