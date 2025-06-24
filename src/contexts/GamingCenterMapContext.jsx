import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import mapService from '../services/mapService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// ✅ Actions du reducer Map
const MAP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_MAP_DATA: 'SET_MAP_DATA',
  UPDATE_POSTE_STATUS: 'UPDATE_POSTE_STATUS',
  UPDATE_POSTE_POSITION: 'UPDATE_POSTE_POSITION',
  ADD_POSTE: 'ADD_POSTE',
  REMOVE_POSTE: 'REMOVE_POSTE',
  SET_EDIT_MODE: 'SET_EDIT_MODE',
  SET_SELECTED_POSTE: 'SET_SELECTED_POSTE',
  SET_MAP_CONFIG: 'SET_MAP_CONFIG',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// ✅ État initial Map
const initialMapState = {
  // Configuration de la map
  mapConfig: {
    width: 1200,
    height: 800,
    backgroundImage: null,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true
  },
  
  // Postes et leur placement
  postes: [],
  
  // États d'interaction
  editMode: false,
  selectedPoste: null,
  
  // États de chargement
  loading: false,
  error: null,
  
  // Métadonnées
  lastUpdate: null
};

// ✅ Reducer Map
const mapReducer = (state, action) => {
  switch (action.type) {
    case MAP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case MAP_ACTIONS.SET_MAP_DATA:
      return {
        ...state,
        postes: action.payload.postes || [],
        mapConfig: { ...state.mapConfig, ...action.payload.config },
        lastUpdate: new Date().toISOString(),
        loading: false,
        error: null
      };

    case MAP_ACTIONS.UPDATE_POSTE_STATUS:
      return {
        ...state,
        postes: state.postes.map(poste => 
          poste.id === action.payload.posteId 
            ? { ...poste, statut: action.payload.statut, session: action.payload.session }
            : poste
        ),
        lastUpdate: new Date().toISOString()
      };

    case MAP_ACTIONS.UPDATE_POSTE_POSITION:
      return {
        ...state,
        postes: state.postes.map(poste => 
          poste.id === action.payload.posteId 
            ? { 
                ...poste, 
                mapPosition: {
                  x: action.payload.x,
                  y: action.payload.y
                }
              }
            : poste
        ),
        lastUpdate: new Date().toISOString()
      };

    case MAP_ACTIONS.ADD_POSTE:
      return {
        ...state,
        postes: [...state.postes, action.payload],
        lastUpdate: new Date().toISOString()
      };

    case MAP_ACTIONS.REMOVE_POSTE:
      return {
        ...state,
        postes: state.postes.filter(poste => poste.id !== action.payload),
        selectedPoste: state.selectedPoste === action.payload ? null : state.selectedPoste,
        lastUpdate: new Date().toISOString()
      };

    case MAP_ACTIONS.SET_EDIT_MODE:
      return {
        ...state,
        editMode: action.payload,
        selectedPoste: action.payload ? state.selectedPoste : null
      };

    case MAP_ACTIONS.SET_SELECTED_POSTE:
      return {
        ...state,
        selectedPoste: action.payload
      };

    case MAP_ACTIONS.SET_MAP_CONFIG:
      return {
        ...state,
        mapConfig: { ...state.mapConfig, ...action.payload }
      };

    case MAP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case MAP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// ✅ Context Map
const GamingCenterMapContext = createContext(null);

export const GamingCenterMapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const { isAuthenticated, hasPermission } = useAuth();
  const { showError, showSuccess } = useNotification();

  // ✅ Charger les données de la map
  const loadMapData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: MAP_ACTIONS.SET_LOADING, payload: true });
      
      const mapData = await mapService.getMapData();
      
      dispatch({ 
        type: MAP_ACTIONS.SET_MAP_DATA, 
        payload: mapData 
      });
    } catch (error) {
      console.error('❌ [MAP] Erreur chargement map:', error);
      dispatch({ 
        type: MAP_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      showError('Erreur lors du chargement de la map');
    }
  }, [isAuthenticated, showError]);

  // ✅ Sauvegarder la position d'un poste
  const updatePostePosition = useCallback(async (posteId, x, y) => {
    if (!hasPermission('POSTES_MANAGE')) {
      showError('Vous n\'avez pas les permissions pour modifier les postes');
      return;
    }

    try {
      // ✅ Snap to grid si activé
      const finalX = state.mapConfig.snapToGrid 
        ? Math.round(x / state.mapConfig.gridSize) * state.mapConfig.gridSize
        : x;
      const finalY = state.mapConfig.snapToGrid 
        ? Math.round(y / state.mapConfig.gridSize) * state.mapConfig.gridSize
        : y;

      // Update local state first for immediate feedback
      dispatch({
        type: MAP_ACTIONS.UPDATE_POSTE_POSITION,
        payload: { posteId, x: finalX, y: finalY }
      });

      // Save to server
      await mapService.updatePostePosition(posteId, finalX, finalY);
      
    } catch (error) {
      console.error('❌ [MAP] Erreur mise à jour position:', error);
      showError('Erreur lors de la sauvegarde de la position');
      // Recharger pour corriger l'état local
      loadMapData();
    }
  }, [hasPermission, state.mapConfig, showError, loadMapData]);

  // ✅ Mettre à jour le statut d'un poste en temps réel
  const updatePosteStatus = useCallback((posteId, statut, session = null) => {
    dispatch({
      type: MAP_ACTIONS.UPDATE_POSTE_STATUS,
      payload: { posteId, statut, session }
    });
  }, []);

  // ✅ Actions d'édition
  const toggleEditMode = useCallback(() => {
    if (!hasPermission('POSTES_MANAGE')) {
      showError('Vous n\'avez pas les permissions pour modifier la map');
      return;
    }

    dispatch({ 
      type: MAP_ACTIONS.SET_EDIT_MODE, 
      payload: !state.editMode 
    });
  }, [hasPermission, state.editMode, showError]);

  const selectPoste = useCallback((posteId) => {
    dispatch({ 
      type: MAP_ACTIONS.SET_SELECTED_POSTE, 
      payload: posteId 
    });
  }, []);

  const updateMapConfig = useCallback(async (newConfig) => {
    if (!hasPermission('POSTES_MANAGE')) {
      showError('Vous n\'avez pas les permissions pour modifier la configuration');
      return;
    }

    try {
      dispatch({ 
        type: MAP_ACTIONS.SET_MAP_CONFIG, 
        payload: newConfig 
      });

      await mapService.updateMapConfig(newConfig);
      showSuccess('Configuration de la map mise à jour');
    } catch (error) {
      console.error('❌ [MAP] Erreur config map:', error);
      showError('Erreur lors de la sauvegarde de la configuration');
    }
  }, [hasPermission, showError, showSuccess]);

  // ✅ Écouter les événements en temps réel
  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePosteStatusUpdate = (event) => {
      const { posteId, statut, session } = event.detail;
      updatePosteStatus(posteId, statut, session);
    };

    const handleSessionStarted = (event) => {
      const { session } = event.detail;
      if (session?.posteId) {
        updatePosteStatus(session.posteId, 'OCCUPE', session);
      }
    };

    const handleSessionEnded = (event) => {
      const { session } = event.detail;
      if (session?.posteId) {
        updatePosteStatus(session.posteId, 'DISPONIBLE', null);
      }
    };

    // ✅ S'abonner aux événements
    window.addEventListener('poste:statusUpdate', handlePosteStatusUpdate);
    window.addEventListener('session:started', handleSessionStarted);
    window.addEventListener('session:ended', handleSessionEnded);

    return () => {
      window.removeEventListener('poste:statusUpdate', handlePosteStatusUpdate);
      window.removeEventListener('session:started', handleSessionStarted);
      window.removeEventListener('session:ended', handleSessionEnded);
    };
  }, [isAuthenticated, updatePosteStatus]);

  // ✅ Charger les données au montage
  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  const value = {
    // État
    ...state,
    
    // Actions
    loadMapData,
    updatePostePosition,
    updatePosteStatus,
    toggleEditMode,
    selectPoste,
    updateMapConfig,
    
    // Utilitaires
    canEdit: hasPermission('POSTES_MANAGE')
  };

  return (
    <GamingCenterMapContext.Provider value={value}>
      {children}
    </GamingCenterMapContext.Provider>
  );
};

export const useGamingCenterMap = () => {
  const context = useContext(GamingCenterMapContext);
  if (!context) {
    throw new Error('useGamingCenterMap doit être utilisé dans un GamingCenterMapProvider');
  }
  return context;
};

export { MAP_ACTIONS };