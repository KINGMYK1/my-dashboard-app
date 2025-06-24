// hooks/useSessionNotifications.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
  useEndSession,
  usePauseSession,
  useResumeSession,
  useExtendSession,
  useCancelSession
} from './useSessions'; // Assurez-vous que ce chemin est correct

// ✅ NOUVEAU: Hook principal pour gérer les notifications de sessions
export const useSessionNotificationsManager = (sessions = []) => {
  const [activeNotifications, setActiveNotifications] = useState([]); // Pour les avertissements et sessions expirées nécessitant une action
  const [expiredSessionsAlerts, setExpiredSessionsAlerts] = useState(new Set()); // Pour les IDs de sessions expirées à afficher dans l'alerte générale
  const sessionTimersRef = useRef(new Map()); // Pour stocker les IDs des setInterval
  const notificationStatesRef = useRef(new Map()); // Pour suivre l'état des notifications (envoyées ou non)

  const { showWarning, showError, showSuccess, showSystemNotification } = useNotification();

  // Mutations pour les actions de session (avec intégration de notifications)
  const endSessionMutation = useEndSession();
  const pauseSessionMutation = usePauseSession();
  const resumeSessionMutation = useResumeSession();
  const extendSessionMutation = useExtendSession();
  const cancelSessionMutation = useCancelSession(); // Pour la terminaison forcée

  // Fonction pour ajouter une notification à l'état
  const addNotification = useCallback((notification) => {
    setActiveNotifications(prev => {
      // Éviter les doublons basés sur sessionId et type
      if (prev.some(n => n.session.id === notification.session.id && n.type === notification.type)) {
        return prev;
      }
      return [...prev, notification];
    });
  }, []);

  // Fonction pour retirer une notification
  const removeNotification = useCallback((sessionId, type) => {
    setActiveNotifications(prev => prev.filter(n => !(n.session.id === sessionId && n.type === type)));
    // Réinitialiser l'état de la notification envoyée
    notificationStatesRef.current.delete(`${sessionId}-${type}`);
  }, []);

  // Fonction pour marquer une session comme "expirée" pour l'alerte générale
  const addExpiredSessionAlert = useCallback((sessionId) => {
    setExpiredSessionsAlerts(prev => new Set(prev).add(sessionId));
  }, []);

  // Fonction pour retirer une session de l'alerte générale
  const removeExpiredSessionAlert = useCallback((sessionId) => {
    setExpiredSessionsAlerts(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  }, []);

  // Fonction pour gérer la prolongation d'une session
  const handleExtendSession = useCallback(async (sessionId, additionalMinutes) => {
    try {
      await extendSessionMutation.mutateAsync({ sessionId, additionalMinutes });
      showSuccess(`Session ${sessionId} prolongée de ${additionalMinutes} minutes.`, { category: 'session', priority: 'normal' });
      removeNotification(sessionId, 'warning');
      removeNotification(sessionId, 'expired');
    } catch (error) {
      showError(`Erreur lors de la prolongation de la session ${sessionId}: ${error.message}`, { category: 'session', priority: 'high' });
    }
  }, [extendSessionMutation, showSuccess, showError, removeNotification]);

  // Fonction pour gérer la terminaison d'une session
  const handleTerminateSession = useCallback(async (sessionId, paymentData) => {
    try {
      await endSessionMutation.mutateAsync({ sessionId, paymentData });
      showSuccess(`Session ${sessionId} terminée.`, { category: 'session', priority: 'normal' });
      removeNotification(sessionId, 'warning');
      removeNotification(sessionId, 'expired');
      removeExpiredSessionAlert(sessionId); // Aussi de l'alerte générale
    } catch (error) {
      showError(`Erreur lors de la terminaison de la session ${sessionId}: ${error.message}`, { category: 'session', priority: 'high' });
    }
  }, [endSessionMutation, showSuccess, showError, removeNotification, removeExpiredSessionAlert]);

  // Fonction pour gérer la suspension d'une session
  const handleSuspendSession = useCallback(async (sessionId) => {
    try {
      await pauseSessionMutation.mutateAsync(sessionId);
      showSuccess(`Session ${sessionId} suspendue.`, { category: 'session', priority: 'normal' });
      removeNotification(sessionId, 'warning');
      removeNotification(sessionId, 'expired');
    } catch (error) {
      showError(`Erreur lors de la suspension de la session ${sessionId}: ${error.message}`, { category: 'session', priority: 'high' });
    }
  }, [pauseSessionMutation, showSuccess, showError, removeNotification]);

  // Fonction pour gérer la reprise d'une session
  const handleResumeSession = useCallback(async (sessionId) => {
    try {
      await resumeSessionMutation.mutateAsync(sessionId);
      showSuccess(`Session ${sessionId} reprise.`, { category: 'session', priority: 'normal' });
      removeNotification(sessionId, 'warning');
      removeNotification(sessionId, 'expired');
      removeExpiredSessionAlert(sessionId); // Si elle était expirée et mise en pause
    } catch (error) {
      showError(`Erreur lors de la reprise de la session ${sessionId}: ${error.message}`, { category: 'session', priority: 'high' });
    }
  }, [resumeSessionMutation, showSuccess, showError, removeNotification, removeExpiredSessionAlert]);

  // Fonction pour forcer la terminaison d'une session expirée (depuis l'alerte générale)
  const forceTerminateExpiredSession = useCallback(async (sessionId) => {
    try {
      await cancelSessionMutation.mutateAsync({ sessionId, raison: "Terminaison forcée suite à l'expiration" });
      showSuccess(`Session expirée ${sessionId} terminée de force.`, { category: 'session', priority: 'high' });
      removeNotification(sessionId, 'expired');
      removeExpiredSessionAlert(sessionId);
    } catch (error) {
      showError(`Erreur lors de la terminaison forcée de la session ${sessionId}: ${error.message}`, { category: 'session', priority: 'critical' });
    }
  }, [cancelSessionMutation, showSuccess, showError, removeNotification, removeExpiredSessionAlert]);

  // Fonction pour démarrer le suivi d'une session
  const startSessionTracking = useCallback((session) => {
    if (!session?.id || !session?.dureeEstimeeMinutes) {
      console.warn('⚠️ [useSessionNotificationsManager] Session invalide pour le suivi:', session);
      return;
    }

    const sessionId = session.id;
    // Si la session est déjà suivie, on ne fait rien ou on met à jour si nécessaire
    if (sessionTimersRef.current.has(sessionId)) {
      // Optionnel: implémenter une logique de mise à jour si la durée estimée change
      // Pour l'instant, on suppose que si elle est là, elle est à jour
      return;
    }

    console.log('🎯 [useSessionNotificationsManager] Démarrage suivi session:', sessionId);

    const startTime = new Date(session.dateHeureDebut);
    const durationMs = session.dureeEstimeeMinutes * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);

    // Calculer les temps de notification (5min et 1min avant)
    const warning5MinTime = new Date(endTime.getTime() - 5 * 60 * 1000);
    const warning1MinTime = new Date(endTime.getTime() - 1 * 60 * 1000);

    const intervalId = setInterval(() => {
      const now = new Date();
      const timeRemainingMs = endTime.getTime() - now.getTime();
      const minutesLeft = Math.ceil(timeRemainingMs / (60 * 1000));
      const secondsLeft = Math.ceil(timeRemainingMs / 1000);

      // Mettre à jour les données du timer pour la SessionCard si nécessaire
      // Bien que SessionCard utilise son propre useSessionTimer, on peut avoir ici un état global
      // pour le cas où on voudrait afficher le temps restant directement dans la notification.
      // Pour l'instant, on passe simplement 'minutesLeft' à la notification.

      // Vérifier les avertissements
      if (minutesLeft <= 5 && minutesLeft > 1 && !notificationStatesRef.current.has(`${sessionId}-warning-5min`)) {
        addNotification({
          id: `warning-5min-${sessionId}`,
          type: 'warning',
          session: session,
          minutesLeft: 5,
          canDismiss: true,
          duration: 30000 // Afficher pendant 30 secondes
        });
        notificationStatesRef.current.set(`${sessionId}-warning-5min`, true);
        showWarning(`La session ${session.numeroSession} se terminera dans 5 minutes.`, { category: 'session', priority: 'normal', duration: 10000 });
      }

      if (minutesLeft === 1 && !notificationStatesRef.current.has(`${sessionId}-warning-1min`)) {
        addNotification({
          id: `warning-1min-${sessionId}`,
          type: 'warning',
          session: session,
          minutesLeft: 1,
          canDismiss: true,
          duration: 30000 // Afficher pendant 30 secondes
        });
        notificationStatesRef.current.set(`${sessionId}-warning-1min`, true);
        showWarning(`La session ${session.numeroSession} se terminera dans 1 minute !`, { category: 'session', priority: 'high', duration: 15000 });
      }

      // Vérifier l'expiration
      if (minutesLeft <= 0 && !notificationStatesRef.current.has(`${sessionId}-expired`)) {
        addNotification({
          id: `expired-${sessionId}`,
          type: 'expired',
          session: session,
          minutesLeft: 0,
          canDismiss: false, // Ne peut pas être dismissée, doit être traitée
          duration: 0 // Persistante
        });
        addExpiredSessionAlert(sessionId); // Ajouter à la liste des sessions expirées pour l'alerte générale
        notificationStatesRef.current.set(`${sessionId}-expired`, true);
        showError(`La session ${session.numeroSession} a expiré !`, { category: 'session', priority: 'critical', duration: 0 }); // Alerte persistante
        clearInterval(intervalId); // Arrêter le timer car la session est expirée
        sessionTimersRef.current.delete(sessionId);
      }
    }, 1000); // Vérifier toutes les secondes

    sessionTimersRef.current.set(sessionId, intervalId);
  }, [addNotification, addExpiredSessionAlert, showWarning, showError]);

  // Fonction pour arrêter le suivi d'une session
  const stopSessionTracking = useCallback((sessionId) => {
    console.log('🛑 [useSessionNotificationsManager] Arrêt suivi session:', sessionId);
    if (sessionTimersRef.current.has(sessionId)) {
      clearInterval(sessionTimersRef.current.get(sessionId));
      sessionTimersRef.current.delete(sessionId);
    }
    // Retirer toutes les notifications associées à cette session
    setActiveNotifications(prev => prev.filter(n => n.session.id !== sessionId));
    notificationStatesRef.current.delete(`${sessionId}-warning-5min`);
    notificationStatesRef.current.delete(`${sessionId}-warning-1min`);
    notificationStatesRef.current.delete(`${sessionId}-expired`);
    removeExpiredSessionAlert(sessionId);
  }, [removeNotification, removeExpiredSessionAlert]);

  // Effet pour synchroniser les sessions actives avec le suivi des notifications
  useEffect(() => {
    const currentTrackedIds = new Set(Array.from(sessionTimersRef.current.keys()));
    const activeSessionIds = new Set(sessions.filter(s => s.statut === 'EN_COURS' && !s.estEnPause).map(s => s.id));

    // Démarrer le suivi pour les nouvelles sessions actives
    sessions.forEach(session => {
      if (session.statut === 'EN_COURS' && !session.estEnPause && !currentTrackedIds.has(session.id)) {
        startSessionTracking(session);
      }
    });

    // Arrêter le suivi pour les sessions qui ne sont plus actives ou qui ont changé de statut
    Array.from(currentTrackedIds).forEach(trackedId => {
      const session = sessions.find(s => s.id === trackedId);
      if (!activeSessionIds.has(trackedId) || (session && (session.statut !== 'EN_COURS' || session.estEnPause))) {
        stopSessionTracking(trackedId);
      }
    });

    // Cleanup quand le composant est démonté
    return () => {
      console.log('🧹 [useSessionNotificationsManager] Nettoyage de tous les timers de sessions');
      Array.from(sessionTimersRef.current.values()).forEach(clearInterval);
      sessionTimersRef.current.clear();
    };
  }, [sessions, startSessionTracking, stopSessionTracking]);

  // Retourne les notifications actives et les sessions expirées pour l'affichage
  return {
    activeNotifications,
    expiredSessions: Array.from(expiredSessionsAlerts), // Convertir en tableau pour le composant ExpiredSessionsAlert
    handleExtendSession,
    handleTerminateSession,
    handleSuspendSession,
    handleResumeSession,
    forceTerminateExpiredSession,
    dismissNotification: removeNotification, // Fonction pour permettre de dismiss une notification (si canDismiss est true)
  };
};

// Pas de changements nécessaires pour useSessionTimerStatus si SessionCard l'utilise déjà.
// Si vous voulez fusionner les timers, cela nécessiterait une refonte plus importante.
// Pour l'instant, on garde useSessionTimerStatus pour l'affichage visuel dans SessionCard
// et useSessionNotificationsManager pour la logique des notifications.
export const useSessionTimerStatus = (activeSessionIds = []) => {
  const [timerStatuses, setTimerStatuses] = useState(new Map());

  useEffect(() => {
    if (!activeSessionIds || activeSessionIds.length === 0) {
      setTimerStatuses(new Map());
      return;
    }

    const updateStatuses = () => {
      const newStatuses = new Map();

      activeSessionIds.forEach(sessionId => {
        if (sessionId) {
          // Cette logique devrait idéalement être alimentée par les vraies données de session
          // passées ou récupérées pour être précises.
          // Pour cet exemple, je simule une durée et un temps écoulé.
          // En production, il faudrait récupérer la session complète pour calculer ça.
          // Pour l'intégration, on peut supposer que les sessions passées à ce hook
          // ont au moins `dateHeureDebut` et `dureeEstimeeMinutes`.
          const session = activeSessionIds.find(s => s.id === sessionId); // Ceci n'est pas optimal, mieux serait de passer les objets sessions entiers
          if (session) {
            const now = new Date();
            const startTime = new Date(session.dateHeureDebut);
            const plannedDurationMs = (session.dureeEstimeeMinutes || 60) * 60 * 1000;
            const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;

            const elapsedTimeMs = now - startTime - pauseTimeMs;
            const remainingTimeMs = Math.max(0, plannedDurationMs - elapsedTimeMs);

            const elapsedMinutes = Math.floor(elapsedTimeMs / (1000 * 60));
            const remainingMinutes = Math.ceil(remainingTimeMs / (1000 * 60));
            const totalMinutes = plannedDurationMs / (1000 * 60);
            const progressPercent = Math.min(100, (elapsedTimeMs / plannedDurationMs) * 100);
            const isExpired = elapsedTimeMs >= plannedDurationMs;
            const plannedEndTime = new Date(startTime.getTime() + plannedDurationMs);

            newStatuses.set(sessionId, {
              elapsedMinutes,
              remainingMinutes,
              progressPercent,
              isExpired,
              plannedMinutes: totalMinutes,
              plannedEndTime: plannedEndTime,
              isWarning5Min: remainingMinutes <= 5 && remainingMinutes > 1 && !isExpired,
              isWarning1Min: remainingMinutes === 1 && !isExpired,
            });
          }
        }
      });
      setTimerStatuses(newStatuses);
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, 1000); // Mettre à jour toutes les secondes pour la précision visuelle

    return () => clearInterval(interval);
  }, [activeSessionIds]); // Dépendance sur les IDs des sessions actives

  return timerStatuses;
};