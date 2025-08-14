import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Bell, Volume2, VolumeX, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import audioNotificationService from '../../services/audioNotificationService';

const SessionExpiryNotification = ({ 
  sessions = [],
  onDismiss,
  onForceTerminate,
  enabled = true 
}) => {
  const { effectiveTheme } = useTheme();
  const { showWarning, showError } = useNotification();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [dismissedSessions, setDismissedSessions] = useState(new Set());
  const notificationsSentRef = useRef(new Map());
  const isDarkMode = effectiveTheme === 'dark';

  // Calculer les informations de temps pour chaque session
  const getSessionTimeInfo = (session) => {
    if (!session?.dateHeureDebut) return null;

    const now = new Date();
    const startTime = new Date(session.dateHeureDebut);
    const plannedDurationMinutes = session.dureeEstimeeMinutes || 60;
    const plannedDuration = plannedDurationMinutes * 60 * 1000;
    const pauseTime = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    
    const elapsedTime = Math.max(0, now - startTime - pauseTime);
    const remainingTime = Math.max(0, plannedDuration - elapsedTime);
    const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
    
    return {
      sessionId: session.id,
      remainingMinutes,
      isExpired: elapsedTime >= plannedDuration,
      isWarning5Min: remainingMinutes <= 5 && remainingMinutes > 1,
      isWarning1Min: remainingMinutes <= 1 && remainingMinutes > 0,
      posteName: session.poste?.nom || `Poste ${session.posteId}`,
      numeroSession: session.numeroSession || `SESS-${session.id}`
    };
  };

  // Filtrer et analyser les sessions
  const analyzeSessionsForNotifications = () => {
    if (!enabled || !Array.isArray(sessions)) return [];

    return sessions
      .map(getSessionTimeInfo)
      .filter(info => info && !dismissedSessions.has(info.sessionId))
      .filter(info => info.isWarning5Min || info.isWarning1Min || info.isExpired);
  };

  const sessionsToNotify = analyzeSessionsForNotifications();

  // Envoyer les notifications
  useEffect(() => {
    if (!enabled || sessionsToNotify.length === 0) return;

    sessionsToNotify.forEach(async (sessionInfo) => {
      const { sessionId, remainingMinutes, isExpired, isWarning5Min, isWarning1Min, posteName } = sessionInfo;
      const sent = notificationsSentRef.current.get(sessionId) || {};

      // Alerte 5 minutes
      if (isWarning5Min && !sent.fiveMin) {
        showWarning(`⏰ Session ${posteName} se termine dans 5 minutes`, {
          title: 'Session bientôt terminée',
          duration: 6000,
          category: 'session'
        });

        if (audioEnabled) {
          await audioNotificationService.playSessionWarning5Min();
        }

        sent.fiveMin = true;
        notificationsSentRef.current.set(sessionId, sent);
      }

      // Alerte 1 minute
      if (isWarning1Min && !sent.oneMin) {
        showError(`🚨 Session ${posteName} se termine dans 1 MINUTE !`, {
          title: '⚠️ FIN IMMINENTE',
          duration: 0, // Persistant
          category: 'session',
          priority: 'high'
        });

        if (audioEnabled) {
          await audioNotificationService.playSessionWarning1Min();
        }

        sent.oneMin = true;
        notificationsSentRef.current.set(sessionId, sent);
      }

      // Session expirée
      if (isExpired && !sent.expired) {
        showError(`🔥 Session ${posteName} a DÉPASSÉ sa durée prévue !`, {
          title: '🚨 SESSION EXPIRÉE',
          duration: 0, // Persistant
          category: 'session',
          priority: 'critical'
        });

        if (audioEnabled) {
          await audioNotificationService.playSessionExpired();
        }

        sent.expired = true;
        notificationsSentRef.current.set(sessionId, sent);
      }
    });
  }, [sessionsToNotify, audioEnabled, showWarning, showError, enabled]);

  // Interface utilisateur pour les alertes critiques
  const urgentSessions = sessionsToNotify.filter(s => s.isWarning1Min || s.isExpired);

  if (urgentSessions.length === 0) return null;

  const handleDismissSession = (sessionId) => {
    setDismissedSessions(prev => new Set([...prev, sessionId]));
  };

  const handleToggleAudio = async () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    audioNotificationService.setEnabled(newState);
    
    if (newState) {
      // Test du son quand on réactive
      await audioNotificationService.testSound('warning_5min');
    }
  };

  const getAlertColor = (sessionInfo) => {
    if (sessionInfo.isExpired) return 'red';
    if (sessionInfo.isWarning1Min) return 'orange';
    return 'yellow';
  };

  const getAlertClasses = (color) => {
    const baseClasses = isDarkMode 
      ? 'border-2 rounded-lg shadow-lg backdrop-blur-sm' 
      : 'border-2 rounded-lg shadow-lg';

    switch (color) {
      case 'red':
        return `${baseClasses} ${isDarkMode 
          ? 'bg-red-900/30 border-red-500 animate-pulse' 
          : 'bg-red-50 border-red-500 animate-pulse'}`;
      case 'orange':
        return `${baseClasses} ${isDarkMode 
          ? 'bg-orange-900/30 border-orange-500 animate-bounce' 
          : 'bg-orange-50 border-orange-500 animate-bounce'}`;
      default:
        return `${baseClasses} ${isDarkMode 
          ? 'bg-yellow-900/30 border-yellow-500' 
          : 'bg-yellow-50 border-yellow-500'}`;
    }
  };

  const textClasses = isDarkMode ? 'text-white' : 'text-gray-900';
  const mutedTextClasses = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Contrôles audio */}
      <div className="flex justify-end">
        <button
          onClick={handleToggleAudio}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg border`}
          title={audioEnabled ? 'Désactiver les sons' : 'Activer les sons'}
        >
          {audioEnabled ? (
            <Volume2 size={16} className="text-green-500" />
          ) : (
            <VolumeX size={16} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Alertes de session */}
      {urgentSessions.map((sessionInfo) => {
        const color = getAlertColor(sessionInfo);
        const iconColor = color === 'red' ? 'text-red-500' : 
                         color === 'orange' ? 'text-orange-500' : 'text-yellow-500';

        return (
          <div key={sessionInfo.sessionId} className={getAlertClasses(color)}>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {sessionInfo.isExpired ? (
                      <AlertTriangle className={`${iconColor} animate-pulse`} size={24} />
                    ) : (
                      <Clock className={iconColor} size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold ${textClasses} text-lg`}>
                      {sessionInfo.isExpired ? '🔥 SESSION EXPIRÉE' :
                       sessionInfo.isWarning1Min ? '🚨 FIN IMMINENTE' : '⏰ BIENTÔT TERMINÉ'}
                    </h3>
                    
                    <p className={`text-sm ${mutedTextClasses} mt-1`}>
                      {sessionInfo.posteName} • {sessionInfo.numeroSession}
                    </p>
                    
                    {!sessionInfo.isExpired && (
                      <p className={`text-sm font-medium ${iconColor} mt-2`}>
                        ⏱️ Temps restant: {sessionInfo.remainingMinutes} minute{sessionInfo.remainingMinutes > 1 ? 's' : ''}
                      </p>
                    )}
                    
                    {sessionInfo.isExpired && (
                      <p className={`text-sm font-medium ${iconColor} mt-2`}>
                        ⚠️ Durée dépassée - Action requise
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDismissSession(sessionInfo.sessionId)}
                  className={`flex-shrink-0 ${mutedTextClasses} hover:${textClasses} ml-2`}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <button
                  onClick={() => onForceTerminate?.(sessionInfo.sessionId)}
                  className={`text-xs px-3 py-2 rounded font-medium ${
                    sessionInfo.isExpired 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  🚀 Terminer maintenant
                </button>
                
                <Bell className={`${iconColor} animate-pulse`} size={14} />
                <span className={`text-xs ${mutedTextClasses}`}>
                  Alerte activée
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionExpiryNotification;
