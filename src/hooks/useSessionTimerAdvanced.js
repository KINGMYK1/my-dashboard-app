import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useSessionTimerAdvanced = (options = {}) => {
  const [timers, setTimers] = useState(new Map());
  const [activeSessions, setActiveSessions] = useState([]);
  const intervalsRef = useRef(new Map());
  const notificationsSentRef = useRef(new Map());
  const { showWarning, showError } = useNotification();

  // ✅ CORRECTION: Extraction des options avec valeurs par défaut
  const {
    onSessionExpired = () => {},
    onSessionWarning = () => {},
    updateInterval = 1000,
    warningMinutes = [5, 1],
    enableNotifications = true,
    enabled = true
  } = options;

  const calculateSessionTime = useCallback((session) => {
    if (!session?.dateHeureDebut) {
      console.warn('❌ [TIMER] Session sans dateHeureDebut:', session);
      return null;
    }

    const now = new Date();
    const startTime = new Date(session.dateHeureDebut);
    
    // ✅ CORRECTION: Validation de la date
    if (isNaN(startTime.getTime())) {
      console.error('❌ [TIMER] Date de début invalide:', session.dateHeureDebut);
      return null;
    }
    
    // ✅ CORRECTION: Utiliser la vraie durée estimée de la session
    const plannedDurationMinutes = session.dureeEstimeeMinutes || session.dureeMinutes || 60;
    const plannedDuration = plannedDurationMinutes * 60 * 1000; // Durée en ms
    const pauseTime = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    
    const elapsedTime = Math.max(0, now - startTime - pauseTime);
    const remainingTime = Math.max(0, plannedDuration - elapsedTime);
    const isExpired = elapsedTime >= plannedDuration;
    const progressPercent = Math.min(150, (elapsedTime / plannedDuration) * 100);

    const timeInfo = {
      elapsedTime,
      remainingTime,
      isExpired,
      progressPercent,
      elapsedMinutes: Math.floor(elapsedTime / (1000 * 60)),
      remainingMinutes: Math.floor(remainingTime / (1000 * 60)),
      plannedDurationMinutes,
      plannedDuration,
      startTime,
      endTime: new Date(startTime.getTime() + plannedDuration),
      isPaused: session.statut === 'EN_PAUSE' || session.estEnPause,
      sessionId: session.id,
      posteName: session.poste?.nom || `Poste ${session.posteId}`,
      numeroSession: session.numeroSession || `SESS-${session.id}`
    };

    // ✅ DEBUG conditionnel
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`⏱️ [TIMER] Session ${session.id}:`, {
    //     dureeEstimee: plannedDurationMinutes,
    //     elapsedMinutes: timeInfo.elapsedMinutes,
    //     remainingMinutes: timeInfo.remainingMinutes,
    //     progressPercent: Math.round(progressPercent),
    //     statut: session.statut
    //   });
    // }

    return timeInfo;
  }, []);

  const sendNotificationIfNeeded = useCallback((session, timeInfo) => {
    if (!enableNotifications || !timeInfo) return;

    const sessionId = session.id;
    const sent = notificationsSentRef.current.get(sessionId) || {};
    
    // ✅ CORRECTION: Notifications configurables
    if (warningMinutes.includes(5) && !sent.fiveMin && timeInfo.remainingMinutes <= 5 && timeInfo.remainingMinutes > 1) {
      showWarning(`Session ${timeInfo.posteName} se termine dans 5 minutes`, {
        title: 'Session bientôt terminée',
        duration: 8000
      });
      
      sent.fiveMin = true;
      notificationsSentRef.current.set(sessionId, sent);
      onSessionWarning(sessionId, 5);
    }

    if (warningMinutes.includes(1) && !sent.oneMin && timeInfo.remainingMinutes <= 1 && timeInfo.remainingMinutes > 0) {
      showError(`🚨 Session ${timeInfo.posteName} se termine dans 1 minute !`, {
        title: '⚠️ FIN IMMINENTE',
        duration: 0
      });

      sent.oneMin = true;
      notificationsSentRef.current.set(sessionId, sent);
      onSessionWarning(sessionId, 1);
    }

    if (!sent.expired && timeInfo.isExpired) {
      showError(`🔥 Session ${timeInfo.posteName} a DÉPASSÉ sa durée prévue !`, {
        title: '🚨 SESSION EXPIRÉE',
        duration: 0
      });

      sent.expired = true;
      notificationsSentRef.current.set(sessionId, sent);
      onSessionExpired(sessionId);
    }
  }, [showWarning, showError, onSessionExpired, onSessionWarning, enableNotifications, warningMinutes]);

  const stopSessionTracking = useCallback((sessionId) => {
    if (!sessionId) return;

    console.log('🛑 [TIMER] Arrêt tracking session:', sessionId);
    
    const interval = intervalsRef.current.get(sessionId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(sessionId);
    }

    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.delete(sessionId);
      return newTimers;
    });

    notificationsSentRef.current.delete(sessionId);
  }, []);

  const updateTimer = useCallback((session) => {
    if (!session?.id) return null;

    const timeInfo = calculateSessionTime(session);
    if (!timeInfo) return null;
    
    setTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(session.id, timeInfo);
      return newTimers;
    });

    sendNotificationIfNeeded(session, timeInfo);
    
    return timeInfo;
  }, [calculateSessionTime, sendNotificationIfNeeded]);

  // Ref pour éviter les dépendances circulaires
  const activeSessionsRef = useRef([]);
  
  const startSessionTracking = useCallback((session) => {
    if (!session?.id || !session?.dateHeureDebut) {
      console.warn('❌ [TIMER] Session invalide pour tracking:', session);
      return;
    }

    const sessionId = session.id;
    
    // Éviter les doublons
    if (intervalsRef.current.has(sessionId)) {
      console.log('⚠️ [TIMER] Timer déjà actif pour session:', sessionId);
      return;
    }

    console.log('⏱️ [TIMER] Démarrage tracking session:', sessionId);

    // Calcul initial
    updateTimer(session);

    // Interval de mise à jour
    const interval = setInterval(() => {
      // ✅ SÉCURITÉ: Vérifier que la session est toujours active via ref
      const currentSession = activeSessionsRef.current.find(s => s.id === sessionId);
      if (currentSession && (currentSession.statut === 'EN_COURS' || currentSession.statut === 'EN_PAUSE')) {
        updateTimer(currentSession);
      } else {
        // Arrêter le timer si la session n'est plus active
        stopSessionTracking(sessionId);
      }
    }, updateInterval);

    intervalsRef.current.set(sessionId, interval);
  }, [updateTimer, updateInterval, stopSessionTracking]);

  const updateActiveSessions = useCallback((sessions) => {
    // ✅ CORRECTION: Validation et normalisation
    let normalizedSessions = [];
    
    if (Array.isArray(sessions)) {
      normalizedSessions = sessions;
    } else if (sessions?.data && Array.isArray(sessions.data)) {
      normalizedSessions = sessions.data;
    } else if (sessions) {
      console.warn('❌ [TIMER] Sessions reçues ne sont pas un array:', typeof sessions, sessions);
      return;
    }

    // Filtrer seulement les sessions actives ou en pause
    const activeSessionsList = normalizedSessions.filter(session => 
      session && 
      session.id && 
      (session.statut === 'EN_COURS' || session.statut === 'EN_PAUSE') &&
      session.dateHeureDebut
    );

    // console.log(`🎯 [TIMER] Mise à jour: ${activeSessionsList.length} sessions actives`);

    // ✅ Mise à jour des refs et state
    activeSessionsRef.current = activeSessionsList;
    setActiveSessions(activeSessionsList);

    // Démarrer le tracking pour les nouvelles sessions
    activeSessionsList.forEach(session => {
      if (!intervalsRef.current.has(session.id)) {
        startSessionTracking(session);
      }
    });

    // Arrêter le tracking pour les sessions qui ne sont plus actives
    const activeIds = new Set(activeSessionsList.map(s => s.id));
    Array.from(intervalsRef.current.keys()).forEach(sessionId => {
      if (!activeIds.has(sessionId)) {
        stopSessionTracking(sessionId);
      }
    });
  }, [startSessionTracking, stopSessionTracking]);

  const getSessionProgress = useCallback((sessionId) => {
    return timers.get(sessionId) || null;
  }, [timers]);

  const clearAllTimers = useCallback(() => {
    console.log('🧹 [TIMER] Nettoyage de tous les timers');
    Array.from(intervalsRef.current.values()).forEach(clearInterval);
    intervalsRef.current.clear();
    notificationsSentRef.current.clear();
    activeSessionsRef.current = [];
    setTimers(new Map());
    setActiveSessions([]);
  }, []);

  // Cleanup final
  useEffect(() => {
    return () => {
      console.log('🧹 [TIMER] Nettoyage final des timers');
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    timers,
    activeSessions,
    startSessionTracking,
    stopSessionTracking,
    updateActiveSessions,
    getSessionProgress,
    clearAllTimers,
    // ✅ NOUVELLES méthodes pour compatibilité
    getSessionTimer: getSessionProgress,
    startSessionTimer: startSessionTracking,
    stopSessionTimer: stopSessionTracking
  };
};

export default useSessionTimerAdvanced;