import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useSessionTimerAdvanced = (sessions = []) => {
  const [timers, setTimers] = useState(new Map());
  const intervalsRef = useRef(new Map());
  const notificationsSentRef = useRef(new Map());
  const { showWarning, showError } = useNotification();

  const calculateSessionTime = useCallback((session) => {
    const now = new Date();
    const startTime = new Date(session.dateHeureDebut);
    
    // ✅ CORRECTION: Utiliser la vraie durée estimée de la session
    const plannedDuration = (session.dureeEstimeeMinutes || 60) * 60 * 1000; // Durée RÉELLE en ms
    const pauseTime = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    
    const elapsedTime = now - startTime - pauseTime;
    const remainingTime = Math.max(0, plannedDuration - elapsedTime);
    const isExpired = elapsedTime >= plannedDuration;
    const progressPercent = Math.min(150, (elapsedTime / plannedDuration) * 100);

    // ✅ DEBUG: Log pour vérifier les calculs
    console.log(`⏱️ [TIMER] Session ${session.id}:`, {
      dureeEstimee: session.dureeEstimeeMinutes,
      plannedDurationMs: plannedDuration,
      elapsedMinutes: Math.floor(elapsedTime / (1000 * 60)),
      remainingMinutes: Math.floor(remainingTime / (1000 * 60)),
      progressPercent: progressPercent
    });

    return {
      elapsedTime,
      remainingTime,
      isExpired,
      progressPercent,
      elapsedMinutes: Math.floor(elapsedTime / (1000 * 60)),
      remainingMinutes: Math.floor(remainingTime / (1000 * 60)),
      plannedDuration, // ✅ Durée réelle
      startTime,
      endTime: new Date(startTime.getTime() + plannedDuration) // ✅ Fin basée sur durée réelle
    };
  }, []);

  const sendNotificationIfNeeded = useCallback((session, timeInfo) => {
    const sessionId = session.id;
    const sent = notificationsSentRef.current.get(sessionId) || {};
    
    // Notification 5 minutes avant
    if (!sent.fiveMin && timeInfo.remainingMinutes <= 5 && timeInfo.remainingMinutes > 1) {
      showWarning(`Session ${session.poste?.nom || session.numeroSession} se termine dans 5 minutes`, {
        title: 'Session bientôt terminée',
        duration: 10000,
        priority: 'high',
        category: 'session',
        actionText: 'Voir la session',
        onAction: () => {
          // Navigation vers la session
          console.log('Navigation vers session:', sessionId);
        }
      });
      
      sent.fiveMin = true;
      notificationsSentRef.current.set(sessionId, sent);
      console.log('📢 Notification 5min envoyée pour session:', sessionId);
    }

    // Notification 1 minute avant
    if (!sent.oneMin && timeInfo.remainingMinutes <= 1 && timeInfo.remainingMinutes > 0) {
      showError(`🚨 Session ${session.poste?.nom || session.numeroSession} se termine dans 1 minute !`, {
        title: '⚠️ FIN IMMINENTE',
        duration: 0, // Persistant
        priority: 'critical',
        category: 'session',
        actionText: 'Gérer maintenant',
        onAction: () => {
          console.log('Action immédiate requise pour session:', sessionId);
        }
      });

      sent.oneMin = true;
      notificationsSentRef.current.set(sessionId, sent);
      console.log('🚨 Notification 1min envoyée pour session:', sessionId);
    }

    // Session expirée
    if (!sent.expired && timeInfo.isExpired) {
      showError(`🔥 Session ${session.poste?.nom || session.numeroSession} a DÉPASSÉ sa durée prévue !`, {
        title: '🚨 SESSION EXPIRÉE',
        duration: 0, // Persistant
        priority: 'critical',
        category: 'session',
        actionText: 'Action requise immédiatement',
        onAction: () => {
          console.log('Session expirée - action requise:', sessionId);
        }
      });

      sent.expired = true;
      notificationsSentRef.current.set(sessionId, sent);
      console.log('💥 Session expirée détectée:', sessionId);
    }
  }, [showWarning, showError]);

  const updateTimer = useCallback((session) => {
    const timeInfo = calculateSessionTime(session);
    
    setTimers(prev => new Map(prev).set(session.id, timeInfo));
    sendNotificationIfNeeded(session, timeInfo);
    
    return timeInfo;
  }, [calculateSessionTime, sendNotificationIfNeeded]);

  const startSessionTimer = useCallback((session) => {
    if (!session?.id || !session?.dateHeureDebut) return;

    const sessionId = session.id;
    
    // Éviter les doublons
    if (intervalsRef.current.has(sessionId)) {
      console.log('⚠️ Timer déjà actif pour session:', sessionId);
      return;
    }

    console.log('⏱️ Démarrage timer pour session:', sessionId);

    // Calcul initial
    updateTimer(session);

    // Interval de mise à jour (toutes les secondes)
    const interval = setInterval(() => {
      updateTimer(session);
    }, 1000);

    intervalsRef.current.set(sessionId, interval);
  }, [updateTimer]);

  const stopSessionTimer = useCallback((sessionId) => {
    console.log('🛑 Arrêt timer pour session:', sessionId);
    
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

  // Gérer les sessions actives
  useEffect(() => {
    const activeSessions = sessions.filter(s => 
      s?.statut === 'EN_COURS' && !s?.estEnPause
    );

    // Démarrer les timers pour les nouvelles sessions
    activeSessions.forEach(session => {
      if (!intervalsRef.current.has(session.id)) {
        startSessionTimer(session);
      }
    });

    // Arrêter les timers pour les sessions qui ne sont plus actives
    const activeIds = new Set(activeSessions.map(s => s.id));
    Array.from(intervalsRef.current.keys()).forEach(sessionId => {
      if (!activeIds.has(sessionId)) {
        stopSessionTimer(sessionId);
      }
    });

    return () => {
      // Cleanup sur changement de sessions
    };
  }, [sessions, startSessionTimer, stopSessionTimer]);

  // Cleanup final
  useEffect(() => {
    return () => {
      console.log('🧹 Nettoyage final des timers de sessions');
      Array.from(intervalsRef.current.values()).forEach(clearInterval);
      intervalsRef.current.clear();
      notificationsSentRef.current.clear();
    };
  }, []);

  return {
    timers,
    startSessionTimer,
    stopSessionTimer,
    getSessionTimer: (sessionId) => timers.get(sessionId)
  };
};