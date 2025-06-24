import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import posteService from '../services/posteService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// ✅ Actions du reducer
const POSTES_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_POSTES: 'SET_POSTES',
  UPDATE_POSTE: 'UPDATE_POSTE',
  ADD_POSTE: 'ADD_POSTE',
  REMOVE_POSTE: 'REMOVE_POSTE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// ✅ État initial
const initialState = {
  postes: [],
  loading: false,
  error: null,
  lastUpdate: null
};

// ✅ Reducer
const postesReducer = (state, action) => {
  switch (action.type) {
    case POSTES_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case POSTES_ACTIONS.SET_POSTES:
      return {
        ...state,
        postes: action.payload,
        loading: false,
        error: null,
        lastUpdate: new Date().toISOString()
      };

    case POSTES_ACTIONS.UPDATE_POSTE:
      return {
        ...state,
        postes: state.postes.map(poste =>
          poste.id === action.payload.id ? { ...poste, ...action.payload } : poste
        ),
        lastUpdate: new Date().toISOString()
      };

    case POSTES_ACTIONS.ADD_POSTE:
      return {
        ...state,
        postes: [...state.postes, action.payload],
        lastUpdate: new Date().toISOString()
      };

    case POSTES_ACTIONS.REMOVE_POSTE:
      return {
        ...state,
        postes: state.postes.filter(poste => poste.id !== action.payload),
        lastUpdate: new Date().toISOString()
      };

    case POSTES_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case POSTES_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// ✅ Context
const PostesContext = createContext(null);

export const PostesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postesReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { showError } = useNotification();

  // ✅ Charger les postes
  const loadPostes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: POSTES_ACTIONS.SET_LOADING, payload: true });
      
      const response = await posteService.getAllPostes();
      
      dispatch({ 
        type: POSTES_ACTIONS.SET_POSTES, 
        payload: response.data || [] 
      });
    } catch (error) {
      console.error('❌ [POSTES_CONTEXT] Erreur chargement:', error);
      dispatch({ 
        type: POSTES_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      showError('Erreur lors du chargement des postes');
    }
  }, [isAuthenticated, showError]);

  // ✅ Mettre à jour un poste
  const updatePoste = useCallback((posteData) => {
    dispatch({ 
      type: POSTES_ACTIONS.UPDATE_POSTE, 
      payload: posteData 
    });
  }, []);

  // ✅ Écouter les événements
  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePosteUpdate = (event) => {
      updatePoste(event.detail);
    };

    window.addEventListener('poste:updated', handlePosteUpdate);
    
    return () => {
      window.removeEventListener('poste:updated', handlePosteUpdate);
    };
  }, [isAuthenticated, updatePoste]);

  // ✅ Charger au montage
  useEffect(() => {
    loadPostes();
  }, [loadPostes]);

  const value = {
    ...state,
    loadPostes,
    updatePoste
  };

  return (
    <PostesContext.Provider value={value}>
      {children}
    </PostesContext.Provider>
  );
};

export const usePostes = () => {
  const context = useContext(PostesContext);
  if (!context) {
    throw new Error('usePostes doit être utilisé dans un PostesProvider');
  }
  return context;
};