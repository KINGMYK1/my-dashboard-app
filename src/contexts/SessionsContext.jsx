import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import sessionService from '../services/sessionService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// ✅ Actions du reducer
const SESSIONS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ACTIVE_SESSIONS: 'SET_ACTIVE_SESSIONS',
  SET_PAUSED_SESSIONS: 'SET_PAUSED_SESSIONS',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  REMOVE_SESSION: 'REMOVE_SESSION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// ✅ État initial
const initialState = {
  activeSessions: [],
  pausedSessions: [],
  loading: false,
  error: null,
  lastUpdate: null
};

// ✅ Reducer
const sessionsReducer = (state, action) => {
  switch (action.type) {
    case SESSIONS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case SESSIONS_ACTIONS.SET_ACTIVE_SESSIONS:
      return {
        ...state,
        activeSessions: action.payload,
        loading: false,
        error: null,
        lastUpdate: new Date().toISOString()
      };

    case SESSIONS_ACTIONS.SET_PAUSED_SESSIONS:
      return {
        ...state,
        pausedSessions: action.payload,
        lastUpdate: new Date().toISOString()
      };

    case SESSIONS_ACTIONS.ADD_SESSION:
      return {
        ...state,
        activeSessions: [...state.activeSessions, action.payload],
        lastUpdate: new Date().toISOString()
      };

    case SESSIONS_ACTIONS.UPDATE_SESSION:
      const { sessionId, updates } = action.payload;
      return {
        ...state,
        activeSessions: state.activeSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        pausedSessions: state.pausedSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        lastUpdate: new Date().toISOString()
      };

    case SESSIONS_ACTIONS.REMOVE_SESSION:
      return {
        ...state,
        activeSessions: state.activeSessions.filter(s => s.id !== action.payload),
        pausedSessions: state.pausedSessions.filter(s => s.id !== action.payload),
        lastUpdate: new Date().toISOString()
      };

    case SESSIONS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case SESSIONS_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// ✅ Context
const SessionsContext = createContext(null);

export const SessionsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sessionsReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { showError } = useNotification();

  // ✅ Charger les sessions actives - SEULEMENT sur événement
  const loadActiveSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const sessions = await sessionService.getActiveSessions();
      dispatch({ 
        type: SESSIONS_ACTIONS.SET_ACTIVE_SESSIONS, 
        payload: sessions || [] 
      });
    } catch (error) {
      console.error('❌ [SESSIONS_CONTEXT] Erreur sessions actives:', error);
      dispatch({ 
        type: SESSIONS_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
    }
  }, [isAuthenticated]);

  // ✅ Charger les sessions en pause - SEULEMENT sur événement
  const loadPausedSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const sessions = await sessionService.getPausedSessions();
      dispatch({ 
        type: SESSIONS_ACTIONS.SET_PAUSED_SESSIONS, 
        payload: sessions || [] 
      });
    } catch (error) {
      console.error('❌ [SESSIONS_CONTEXT] Erreur sessions pause:', error);
    }
  }, [isAuthenticated]);

  // ✅ Actions sur les sessions
  const updateSession = useCallback((sessionId, updates) => {
    dispatch({
      type: SESSIONS_ACTIONS.UPDATE_SESSION,
      payload: { sessionId, updates }
    });
  }, []);

  const addSession = useCallback((session) => {
    dispatch({
      type: SESSIONS_ACTIONS.ADD_SESSION,
      payload: session
    });
  }, []);

  const removeSession = useCallback((sessionId) => {
    dispatch({
      type: SESSIONS_ACTIONS.REMOVE_SESSION,
      payload: sessionId
    });
  }, []);

  // ✅ Écouter les événements SEULEMENT
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleSessionStarted = (event) => {
      addSession(event.detail.session);
    };

    const handleSessionUpdated = (event) => {
      updateSession(event.detail.sessionId, event.detail.updates);
    };

    const handleSessionEnded = (event) => {
      removeSession(event.detail.sessionId);
    };

    const handleSessionPaused = (event) => {
      updateSession(event.detail.sessionId, { statut: 'EN_PAUSE' });
      loadPausedSessions(); // Recharger les sessions en pause
    };

    const handleSessionResumed = (event) => {
      updateSession(event.detail.sessionId, { statut: 'EN_COURS' });
      loadActiveSessions(); // Recharger les sessions actives
    };

    // ✅ S'abonner aux événements
    window.addEventListener('session:started', handleSessionStarted);
    window.addEventListener('session:updated', handleSessionUpdated);
    window.addEventListener('session:ended', handleSessionEnded);
    window.addEventListener('session:paused', handleSessionPaused);
    window.addEventListener('session:resumed', handleSessionResumed);

    return () => {
      window.removeEventListener('session:started', handleSessionStarted);
      window.removeEventListener('session:updated', handleSessionUpdated);
      window.removeEventListener('session:ended', handleSessionEnded);
      window.removeEventListener('session:paused', handleSessionPaused);
      window.removeEventListener('session:resumed', handleSessionResumed);
    };
  }, [isAuthenticated, addSession, updateSession, removeSession, loadActiveSessions, loadPausedSessions]);

  // ✅ Chargement initial UNIQUEMENT
  useEffect(() => {
    if (isAuthenticated) {
      loadActiveSessions();
      loadPausedSessions();
    }
  }, [isAuthenticated, loadActiveSessions, loadPausedSessions]);

  const value = {
    ...state,
    loadActiveSessions,
    loadPausedSessions,
    updateSession,
    addSession,
    removeSession
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessions doit être utilisé dans un SessionsProvider');
  }
  return context;
};