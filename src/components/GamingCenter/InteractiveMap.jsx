import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGamingCenterMap } from '../../contexts/GamingCenterMapContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Button, Modal, Input, Select, Badge, LoadingSpinner } from '../ui';
import { 
  Move, 
  Settings, 
  Plus, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Play,
  Pause,
  Square,
  Clock,
  DollarSign,
  User,
  Monitor
} from 'lucide-react';

const InteractiveMap = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  
  const {
    postes,
    mapConfig,
    editMode,
    selectedPoste,
    loading,
    error,
    canEdit,
    toggleEditMode,
    selectPoste,
    updatePostePosition,
    updateMapConfig,
    loadMapData
  } = useGamingCenterMap();

  const { hasPermission } = useAuth();

  // États locaux
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPoste, setDraggedPoste] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPosteModal, setShowPosteModal] = useState(false);

  // Refs
  const mapRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 });

  // ✅ Configuration des couleurs par statut
  const getPosteColors = useCallback((statut) => {
    const colors = {
      'DISPONIBLE': {
        bg: isDarkMode ? '#10B981' : '#10B981',
        border: isDarkMode ? '#059669' : '#047857',
        text: '#FFFFFF'
      },
      'OCCUPE': {
        bg: isDarkMode ? '#EF4444' : '#EF4444',
        border: isDarkMode ? '#DC2626' : '#B91C1C',
        text: '#FFFFFF'
      },
      'MAINTENANCE': {
        bg: isDarkMode ? '#F59E0B' : '#F59E0B',
        border: isDarkMode ? '#D97706' : '#B45309',
        text: '#FFFFFF'
      },
      'HORS_SERVICE': {
        bg: isDarkMode ? '#6B7280' : '#6B7280',
        border: isDarkMode ? '#4B5563' : '#374151',
        text: '#FFFFFF'
      }
    };
    return colors[statut] || colors['HORS_SERVICE'];
  }, [isDarkMode]);

  // ✅ Gestion du zoom
  const handleZoom = useCallback((direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev * 1.2, 3) 
        : Math.max(prev / 1.2, 0.3);
      return newZoom;
    });
  }, []);

  // ✅ Reset de la vue
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ✅ Gestion du panning de la map
  const handleMapMouseDown = useCallback((e) => {
    if (editMode) return;
    
    setIsDragging(true);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  }, [editMode, pan]);

  const handleMapMouseMove = useCallback((e) => {
    if (!isDragging || editMode) return;
    
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  }, [isDragging, editMode]);

  const handleMapMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ✅ Gestion du drag & drop des postes
  const handlePosteMouseDown = useCallback((e, poste) => {
    if (!editMode) {
      selectPoste(poste.id);
      setShowPosteModal(true);
      return;
    }

    e.stopPropagation();
    setDraggedPoste(poste);
    
    const mapRect = mapRef.current.getBoundingClientRect();
    const posteRect = e.target.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - posteRect.left - posteRect.width / 2,
      y: e.clientY - posteRect.top - posteRect.height / 2
    });
  }, [editMode, selectPoste]);

  const handlePosteDrag = useCallback((e) => {
    if (!draggedPoste || !editMode) return;
    
    const mapRect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - mapRect.left - dragOffset.x) / zoom - pan.x / zoom;
    const y = (e.clientY - mapRect.top - dragOffset.y) / zoom - pan.y / zoom;
    
    // ✅ Contraintes de la map
    const constrainedX = Math.max(0, Math.min(x, mapConfig.width - 100));
    const constrainedY = Math.max(0, Math.min(y, mapConfig.height - 80));
    
    updatePostePosition(draggedPoste.id, constrainedX, constrainedY);
  }, [draggedPoste, editMode, zoom, pan, dragOffset, mapConfig, updatePostePosition]);

  const handlePosteDrop = useCallback(() => {
    setDraggedPoste(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // ✅ Événements globaux
  useEffect(() => {
    if (editMode && draggedPoste) {
      document.addEventListener('mousemove', handlePosteDrag);
      document.addEventListener('mouseup', handlePosteDrop);
      
      return () => {
        document.removeEventListener('mousemove', handlePosteDrag);
        document.removeEventListener('mouseup', handlePosteDrop);
      };
    }
  }, [editMode, draggedPoste, handlePosteDrag, handlePosteDrop]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMapMouseMove);
      document.addEventListener('mouseup', handleMapMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMapMouseMove);
        document.removeEventListener('mouseup', handleMapMouseUp);
      };
    }
  }, [isDragging, handleMapMouseMove, handleMapMouseUp]);

  // ✅ Actions sur les postes
  const handleStartSession = useCallback((posteId) => {
    // TODO: Intégrer avec le service de sessions
    console.log('Démarrer session pour poste:', posteId);
  }, []);

  const handlePauseSession = useCallback((sessionId) => {
    // TODO: Intégrer avec le service de sessions
    console.log('Mettre en pause session:', sessionId);
  }, []);

  const handleEndSession = useCallback((sessionId) => {
    // TODO: Intégrer avec le service de sessions
    console.log('Terminer session:', sessionId);
  }, []);

  // ✅ Composant Poste
  const PosteComponent = ({ poste }) => {
    const colors = getPosteColors(poste.statut);
    const isSelected = selectedPoste === poste.id;
    
    return (
      <div
        className={`absolute cursor-pointer transition-all duration-200 ${
          editMode ? 'hover:scale-110' : 'hover:scale-105'
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: poste.mapPosition.x,
          top: poste.mapPosition.y,
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          zIndex: draggedPoste?.id === poste.id ? 1000 : 10
        }}
        onMouseDown={(e) => handlePosteMouseDown(e, poste)}
      >
        <div
          className="relative min-w-[100px] min-h-[80px] rounded-lg border-2 shadow-lg flex flex-col items-center justify-center p-2"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
            color: colors.text
          }}
        >
          {/* Icon et nom */}
          <div className="flex items-center gap-1 mb-1">
            <Monitor size={16} />
            <span className="text-xs font-medium">{poste.nom}</span>
          </div>
          
          {/* Type de poste */}
          <div className="text-xs opacity-90 mb-1">
            {poste.typePoste?.nom}
          </div>
          
          {/* Statut badge */}
          <Badge 
            variant={poste.statut === 'DISPONIBLE' ? 'success' : 
                    poste.statut === 'OCCUPE' ? 'destructive' : 'warning'}
            className="text-xs px-1 py-0"
          >
            {poste.statut}
          </Badge>
          
          {/* Informations de session si occupé */}
          {poste.statut === 'OCCUPE' && poste.session && (
            <div className="mt-1 text-xs text-center">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{poste.session.dureeEcoulee || '0'}min</span>
              </div>
              {poste.session.client && (
                <div className="flex items-center gap-1">
                  <User size={10} />
                  <span>{poste.session.client.nom}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Actions rapides en mode édition */}
          {editMode && (
            <div className="absolute -top-2 -right-2">
              <Move size={12} className="text-white bg-blue-500 rounded p-1" />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Erreur lors du chargement de la map</p>
        <Button onClick={loadMapData}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Plan du Gaming Center
        </h2>
        
        <div className="flex gap-2">
          {/* Contrôles de zoom */}
          <div className="flex gap-1">
            <Button
              onClick={() => handleZoom('in')}
              variant="outline"
              size="sm"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              onClick={() => handleZoom('out')}
              variant="outline"
              size="sm"
            >
              <ZoomOut size={16} />
            </Button>
            <Button
              onClick={resetView}
              variant="outline"
              size="sm"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
          
          {/* Mode édition */}
          {canEdit && (
            <Button
              onClick={toggleEditMode}
              variant={editMode ? 'default' : 'outline'}
              size="sm"
            >
              <Move size={16} className="mr-2" />
              {editMode ? 'Terminer l\'édition' : 'Modifier'}
            </Button>
          )}
          
          {/* Configuration */}
          {hasPermission('POSTES_MANAGE') && (
            <Button
              onClick={() => setShowConfigModal(true)}
              variant="outline"
              size="sm"
            >
              <Settings size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Occupé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span>Hors service</span>
        </div>
      </div>

      {/* Container de la map */}
      <Card className="relative overflow-hidden">
        <div
          ref={mapRef}
          className={`relative bg-gray-100 dark:bg-gray-800 ${
            editMode ? 'cursor-move' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            width: mapConfig.width,
            height: mapConfig.height,
            backgroundImage: mapConfig.showGrid 
              ? `linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
                 linear-gradient(#e5e7eb 1px, transparent 1px)`
              : 'none',
            backgroundSize: mapConfig.showGrid 
              ? `${mapConfig.gridSize}px ${mapConfig.gridSize}px` 
              : 'auto'
          }}
          onMouseDown={handleMapMouseDown}
        >
          {/* Image de fond si définie */}
          {mapConfig.backgroundImage && (
            <img
              src={mapConfig.backgroundImage}
              alt="Plan du centre"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              draggable={false}
            />
          )}
          
          {/* Postes */}
          {postes.map((poste) => (
            <PosteComponent key={poste.id} poste={poste} />
          ))}
        </div>
      </Card>

      {/* Instructions en mode édition */}
      {editMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Mode édition activé :</strong> Cliquez et glissez les postes pour les repositionner. 
            Les positions sont sauvegardées automatiquement.
          </p>
        </div>
      )}

      {/* Modal de configuration */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configuration de la Map"
      >
        <ConfigurationForm 
          config={mapConfig}
          onSave={(newConfig) => {
            updateMapConfig(newConfig);
            setShowConfigModal(false);
          }}
          onCancel={() => setShowConfigModal(false)}
        />
      </Modal>

      {/* Modal de détails du poste */}
      <Modal
        isOpen={showPosteModal}
        onClose={() => {
          setShowPosteModal(false);
          selectPoste(null);
        }}
        title="Détails du Poste"
      >
        {selectedPoste && (
          <PosteDetailsModal
            poste={postes.find(p => p.id === selectedPoste)}
            onStartSession={handleStartSession}
            onPauseSession={handlePauseSession}
            onEndSession={handleEndSession}
            onClose={() => {
              setShowPosteModal(false);
              selectPoste(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

// ✅ Formulaire de configuration
const ConfigurationForm = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Largeur</label>
          <Input
            type="number"
            value={formData.width}
            onChange={(e) => setFormData({
              ...formData,
              width: parseInt(e.target.value)
            })}
            min="800"
            max="2000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hauteur</label>
          <Input
            type="number"
            value={formData.height}
            onChange={(e) => setFormData({
              ...formData,
              height: parseInt(e.target.value)
            })}
            min="600"
            max="1500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Taille de la grille</label>
        <Input
          type="number"
          value={formData.gridSize}
          onChange={(e) => setFormData({
            ...formData,
            gridSize: parseInt(e.target.value)
          })}
          min="10"
          max="50"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.showGrid}
            onChange={(e) => setFormData({
              ...formData,
              showGrid: e.target.checked
            })}
          />
          Afficher la grille
        </label>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.snapToGrid}
            onChange={(e) => setFormData({
              ...formData,
              snapToGrid: e.target.checked
            })}
          />
          Aimanter à la grille
        </label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit">Sauvegarder</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
};

// ✅ Modal de détails du poste
const PosteDetailsModal = ({ 
  poste, 
  onStartSession, 
  onPauseSession, 
  onEndSession, 
  onClose 
}) => {
  if (!poste) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">{poste.nom}</h3>
          <p className="text-sm text-gray-600">{poste.typePoste?.nom}</p>
        </div>
        <div className="text-right">
          <Badge variant={
            poste.statut === 'DISPONIBLE' ? 'success' : 
            poste.statut === 'OCCUPE' ? 'destructive' : 'warning'
          }>
            {poste.statut}
          </Badge>
        </div>
      </div>
      
      {/* Informations de session */}
      {poste.session && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <h4 className="font-medium mb-2">Session active</h4>
          <div className="space-y-1 text-sm">
            <div>Client: {poste.session.client?.nom || 'Anonyme'}</div>
            <div>Durée: {poste.session.dureeEcoulee || 0} minutes</div>
            <div>Coût: {poste.session.coutProvisoire || 0} MAD</div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {poste.statut === 'DISPONIBLE' && (
          <Button
            onClick={() => {
              onStartSession(poste.id);
              onClose();
            }}
            className="flex-1"
          >
            <Play size={16} className="mr-2" />
            Démarrer session
          </Button>
        )}
        
        {poste.statut === 'OCCUPE' && poste.session && (
          <>
            <Button
              onClick={() => {
                onPauseSession(poste.session.id);
                onClose();
              }}
              variant="outline"
              className="flex-1"
            >
              <Pause size={16} className="mr-2" />
              Pause
            </Button>
            <Button
              onClick={() => {
                onEndSession(poste.session.id);
                onClose();
              }}
              variant="destructive"
              className="flex-1"
            >
              <Square size={16} className="mr-2" />
              Terminer
            </Button>
          </>
        )}
      </div>
      
      {/* Statistiques du jour */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <h4 className="font-medium mb-2">Statistiques du jour</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Temps d'utilisation</span>
            </div>
            <div className="font-medium">{poste.todayUsage || 0} min</div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span>Revenus</span>
            </div>
            <div className="font-medium">{poste.todayRevenue || 0} MAD</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;