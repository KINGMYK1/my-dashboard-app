import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';

// ✅ NOUVEAU: Hook pour gérer les notifications de sessions avec logique corrigée
export const useSessionNotificationsManager = () => {
  const [trackedSessions, setTrackedSessions] = useState(new Map());
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [expiredSessions, setExpiredSessions] = useState([]);
  const timersRef = useRef(new Map());
  const { showWarning, showError, showSuccess } = useNotification();

  // ✅ CORRECTION: Démarrer le suivi d'une session
  const startSessionTracking = useCallback((session) => {
    if (!session?.id || !session?.dureeEstimeeMinutes) {
      console.warn('⚠️ Session invalide pour le suivi:', session);
      return;
    }

    const sessionId = session.id;
    
    // Éviter les doublons
    if (trackedSessions.has(sessionId)) {
      console.log('🔄 Session déjà suivie:', sessionId);
      return;
    }

    console.log('🎯 Démarrage suivi session:', sessionId);

    const startTime = new Date(session.dateHeureDebut);
    const durationMs = session.dureeEstimeeMinutes * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    
    // Calculer les temps de notification (5min et 1min avant)
    const warning5MinTime = new Date(endTime.getTime() - 5 * 60 * 1000);
    const warning1MinTime = new Date(endTime.getTime() - 1 * 60 * 1000);
    
    const sessionData = {
      ...session,
      startTime,
      endTime,
      durationMs,
      warning5MinSent: false,
      warning1MinSent: false,
      expired: false
    };

    setTrackedSessions(prev => new Map(prev).set(sessionId, sessionData));

    // Timer principal pour vérifier l'état
    const checkTimer = setInterval(() => {
      const now = new Date();
      const sessionData = trackedSessions.get(sessionId);
      
      if (!sessionData) {
        clearInterval(checkTimer);
        return;
      }

      // ✅ Notification 5 minutes avant
      if (!sessionData.warning5MinSent && now >= warning5MinTime && now < warning1MinTime) {
        sessionData.warning5MinSent = true;
        showWarning(`Session ${session.poste?.nom || session.numeroSession} se termine dans 5 minutes`, {
          title: 'Session bientôt terminée',
          duration: 10000,
          priority: 'high',
          category: 'session'
        });
        console.log('⏰ Notification 5min envoyée pour session:', sessionId);
      }

      // ✅ Notification 1 minute avant
      if (!sessionData.warning1MinSent && now >= warning1MinTime && now < endTime) {
        sessionData.warning1MinSent = true;
        showWarning(`Session ${session.poste?.nom || session.numeroSession} se termine dans 1 minute`, {
          title: 'Session termine bientôt',
          duration: 15000,
          priority: 'critical',
          category: 'session'
        });
        console.log('⏰ Notification 1min envoyée pour session:', sessionId);
      }

      // ✅ Session expirée - ne pas mettre en pause automatiquement
      if (!sessionData.expired && now >= endTime) {
        sessionData.expired = true;
        
        // Marquer comme expirée sans pause automatique
        setExpiredSessions(prev => {
          const exists = prev.find(s => s.id === sessionId);
          if (!exists) {
            return [...prev, { ...session, isExpired: true, expiredAt: now }];
          }
          return prev;
        });

        showError(`Session ${session.poste?.nom || session.numeroSession} a dépassé sa durée prévue`, {
          title: 'Session expirée',
          duration: 0, // Persistant
          priority: 'critical',
          category: 'session'
        });

        console.log('🚨 Session expirée détectée:', sessionId);
      }
    }, 1000); // Vérifier toutes les secondes

    timersRef.current.set(sessionId, checkTimer);
  }, [trackedSessions, showWarning, showError]);

  // ✅ Arrêter le suivi d'une session
  const stopSessionTracking = useCallback((sessionId) => {
    console.log('🛑 Arrêt suivi session:', sessionId);
    
    setTrackedSessions(prev => {
      const newMap = new Map(prev);
      newMap.delete(sessionId);
      return newMap;
    });

    setExpiredSessions(prev => prev.filter(s => s.id !== sessionId));

    // Nettoyer le timer
    const timer = timersRef.current.get(sessionId);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(sessionId);
    }
  }, []);

  // ✅ Actions sur les sessions expirées
  const handleExtendSession = useCallback(async (session, minutes) => {
    console.log('⏰ Prolongation session:', session.id, minutes);
    // Cette fonction sera appelée par le composant parent
    stopSessionTracking(session.id);
  }, [stopSessionTracking]);

  const handleTerminateSession = useCallback(async (session, paymentData) => {
    console.log('🔚 Terminaison session:', session.id);
    stopSessionTracking(session.id);
  }, [stopSessionTracking]);

  const handleSuspendSession = useCallback(async (session, reason) => {
    console.log('⏸️ Suspension session:', session.id);
    stopSessionTracking(session.id);
  }, [stopSessionTracking]);

  const handleResumeSession = useCallback(async (session) => {
    console.log('▶️ Reprise session:', session.id);
    startSessionTracking(session);
  }, [startSessionTracking]);

  const forceTerminateExpiredSession = useCallback((sessionId) => {
    console.log('💀 Terminaison forcée session expirée:', sessionId);
    stopSessionTracking(sessionId);
  }, [stopSessionTracking]);

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      console.log('🧹 Nettoyage des timers de sessions');
      timersRef.current.forEach(timer => clearInterval(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    activeNotifications,
    expiredSessions,
    trackedSessions,
    startSessionTracking,
    stopSessionTracking,
    handleExtendSession,
    handleTerminateSession,
    handleSuspendSession,
    handleResumeSession,
    forceTerminateExpiredSession
  };
};

// ✅ Hook pour le statut des timers
export const useSessionTimerStatus = (sessionIds) => {
  const [timerStatuses, setTimerStatuses] = useState(new Map());

  useEffect(() => {
    if (!sessionIds || sessionIds.length === 0) {
      setTimerStatuses(new Map());
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const newStatuses = new Map();

      sessionIds.forEach(sessionId => {
        // Cette logique devrait être alimentée par les vraies données de session
        // Pour l'instant, on simule un statut basique
        const mockSessionData = {
          startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30min ago
          duration: 60 * 60 * 1000, // 1 heure
        };

        const elapsedMs = now - mockSessionData.startTime;
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        const totalMinutes = mockSessionData.duration / (1000 * 60);
        const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
        const progressPercent = Math.min(100, (elapsedMinutes / totalMinutes) * 100);
        const isExpired = elapsedMinutes >= totalMinutes;

        newStatuses.set(sessionId, {
          elapsedMinutes,
          remainingMinutes,
          progressPercent,
          isExpired,
          totalMinutes
        });
      });

      setTimerStatuses(newStatuses);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionIds]);

  return timerStatuses;
};