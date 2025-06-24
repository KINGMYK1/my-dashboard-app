import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGamingCenterMap } from '../../contexts/GamingCenterMapContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Card, Button, Input, Select, Switch, Modal, LoadingSpinner } from '../ui';
import { Settings, Move, Grid, Save, RotateCcw, Maximize2, Play, Pause, Square } from 'lucide-react';

const GamingCenterMap = () => {
  const { effectiveTheme } = useTheme();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ État du composant Map
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

  // ✅ États locaux pour l'interface
  const [draggedPoste, setDraggedPoste] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPosteDetails, setShowPosteDetails] = useState(false);
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  // ✅ Refs pour la manipulation
  const mapRef = useRef(null);
  const configFormRef = useRef(null);

  // ✅ Configuration temporaire pour le modal
  const [tempConfig, setTempConfig] = useState(mapConfig);

  // ✅ Synchroniser la config temporaire
  useEffect(() => {
    setTempConfig(mapConfig);
  }, [mapConfig]);

  // ✅ Fonctions utilitaires
  const getPosteStatusColor = useCallback((statut) => {
    const colors = {
      'DISPONIBLE': '#10B981', // Vert
      'OCCUPE': '#EF4444',     // Rouge
      'MAINTENANCE': '#F59E0B', // Orange
      'HORS_SERVICE': '#6B7280' // Gris
    };
    return colors[statut] || '#6B7280';
  }, []);

  const getPosteStatusText = useCallback((statut) => {
    const texts = {
      'DISPONIBLE': 'Disponible',
      'OCCUPE': 'Occupé',
      'MAINTENANCE': 'Maintenance',
      'HORS_SERVICE': 'Hors service'
    };
    return texts[statut] || statut;
  }, []);

  const snapToGrid = useCallback((x, y) => {
    if (!mapConfig.snapToGrid) return { x, y };
    
    const gridSize = mapConfig.gridSize || 20;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [mapConfig.snapToGrid, mapConfig.gridSize]);

  // ✅ Gestionnaires d'événements de drag & drop
  const handleMouseDown = useCallback((e, poste) => {
    if (!editMode || !canEdit) return;

    const rect = mapRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - poste.mapPosition.x * mapScale;
    const offsetY = e.clientY - rect.top - poste.mapPosition.y * mapScale;

    setDraggedPoste(poste);
    setDragOffset({ x: offsetX, y: offsetY });
    selectPoste(poste.id);

    e.preventDefault();
  }, [editMode, canEdit, mapScale, selectPoste]);

  const handleMouseMove = useCallback((e) => {
    if (!draggedPoste || !editMode) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragOffset.x) / mapScale;
    const y = (e.clientY - rect.top - dragOffset.y) / mapScale;

    // ✅ Contraintes de la map
    const constrainedX = Math.max(0, Math.min(x, mapConfig.width - 60));
    const constrainedY = Math.max(0, Math.min(y, mapConfig.height - 60));

    const snappedPos = snapToGrid(constrainedX, constrainedY);

    // ✅ Mise à jour temporaire pour le feedback visuel
    setDraggedPoste(prev => ({
      ...prev,
      mapPosition: { x: snappedPos.x, y: snappedPos.y }
    }));
  }, [draggedPoste, editMode, dragOffset, mapScale, mapConfig.width, mapConfig.height, snapToGrid]);

  const handleMouseUp = useCallback(async () => {
    if (!draggedPoste || !editMode) return;

    try {
      await updatePostePosition(
        draggedPoste.id, 
        draggedPoste.mapPosition.x, 
        draggedPoste.mapPosition.y
      );
      showSuccess(`Position du poste ${draggedPoste.nom} mise à jour`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde position:', error);
      showError('Erreur lors de la sauvegarde de la position');
    } finally {
      setDraggedPoste(null);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [draggedPoste, editMode, updatePostePosition, showSuccess, showError]);

  // ✅ Gestionnaires d'événements globaux
  useEffect(() => {
    if (editMode && draggedPoste) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [editMode, draggedPoste, handleMouseMove, handleMouseUp]);

  // ✅ Actions sur les postes
  const handlePosteAction = useCallback(async (poste, action) => {
    try {
      switch (action) {
        case 'start':
          // TODO: Intégrer avec SessionService.demarrerSession
          console.log('Démarrer session sur', poste.nom);
          break;
        case 'pause':
          // TODO: Intégrer avec SessionService.pauseSession
          console.log('Pause session sur', poste.nom);
          break;
        case 'stop':
          // TODO: Intégrer avec SessionService.terminerSession
          console.log('Arrêter session sur', poste.nom);
          break;
        case 'maintenance':
          // TODO: Intégrer avec PosteService.setMaintenance
          console.log('Mettre en maintenance', poste.nom);
          break;
        default:
          console.warn('Action inconnue:', action);
      }
    } catch (error) {
      console.error('❌ Erreur action poste:', error);
      showError(`Erreur lors de l'action ${action}`);
    }
  }, [showError]);

  // ✅ Sauvegarde de la configuration
  const handleSaveConfig = useCallback(async () => {
    try {
      await updateMapConfig(tempConfig);
      setShowConfigModal(false);
      showSuccess('Configuration de la map sauvegardée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde config:', error);
      showError('Erreur lors de la sauvegarde de la configuration');
    }
  }, [tempConfig, updateMapConfig, showSuccess, showError]);

  // ✅ Zoom et pan
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setMapScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
    }
  }, []);

  // ✅ Grille de fond
  const renderGrid = useCallback(() => {
    if (!mapConfig.showGrid) return null;

    const gridSize = mapConfig.gridSize || 20;
    const lines = [];

    // Lignes verticales
    for (let x = 0; x <= mapConfig.width; x += gridSize) {
      lines.push(
        <line
          key={`v${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={mapConfig.height}
          stroke={isDarkMode ? '#374151' : '#E5E7EB'}
          strokeWidth={0.5}
        />
      );
    }

    // Lignes horizontales
    for (let y = 0; y <= mapConfig.height; y += gridSize) {
      lines.push(
        <line
          key={`h${y}`}
          x1={0}
          y1={y}
          x2={mapConfig.width}
          y2={y}
          stroke={isDarkMode ? '#374151' : '#E5E7EB'}
          strokeWidth={0.5}
        />
      );
    }

    return <g>{lines}</g>;
  }, [mapConfig.showGrid, mapConfig.gridSize, mapConfig.width, mapConfig.height, isDarkMode]);

  // ✅ Rendu d'un poste
  const renderPoste = useCallback((poste) => {
    const isSelected = selectedPoste === poste.id;
    const isDragged = draggedPoste?.id === poste.id;
    const currentPoste = isDragged ? draggedPoste : poste;
    
    const statusColor = getPosteStatusColor(currentPoste.statut);
    const canDrag = editMode && canEdit;

    return (
      <g
        key={poste.id}
        transform={`translate(${currentPoste.mapPosition.x}, ${currentPoste.mapPosition.y})`}
        style={{
          cursor: canDrag ? 'move' : 'pointer',
          opacity: isDragged ? 0.8 : 1
        }}
        onMouseDown={(e) => handleMouseDown(e, poste)}
        onClick={() => !editMode && setShowPosteDetails(true)}
      >
        {/* Bordure de sélection */}
        {isSelected && (
          <rect
            x={-3}
            y={-3}
            width={66}
            height={66}
            fill="none"
            stroke={isDarkMode ? '#60A5FA' : '#3B82F6'}
            strokeWidth={2}
            strokeDasharray="4,4"
            rx={8}
          />
        )}
        
        {/* Corps du poste */}
        <rect
          x={0}
          y={0}
          width={60}
          height={60}
          fill={statusColor}
          stroke={isDarkMode ? '#374151' : '#D1D5DB'}
          strokeWidth={1}
          rx={6}
          opacity={0.9}
        />
        
        {/* Icône du type de poste */}
        <text
          x={30}
          y={25}
          textAnchor="middle"
          fontSize="16"
          fill="white"
        >
          {poste.icon || '🎮'}
        </text>
        
        {/* Nom du poste */}
        <text
          x={30}
          y={40}
          textAnchor="middle"
          fontSize="10"
          fill="white"
          fontWeight="bold"
        >
          {poste.nom}
        </text>
        
        {/* Indicateur de session active */}
        {poste.session && (
          <circle
            cx={50}
            cy={10}
            r={4}
            fill="#EF4444"
            stroke="white"
            strokeWidth={1}
          />
        )}
        
        {/* Revenus du jour (si disponible) */}
        {poste.revenue > 0 && !editMode && (
          <text
            x={30}
            y={75}
            textAnchor="middle"
            fontSize="8"
            fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
          >
            {poste.revenue.toFixed(0)} MAD
          </text>
        )}
      </g>
    );
  }, [
    selectedPoste, 
    draggedPoste, 
    editMode, 
    canEdit, 
    isDarkMode, 
    getPosteStatusColor, 
    handleMouseDown
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur lors du chargement de la map</p>
          <Button onClick={loadMapData}>Réessayer</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ Barre d'outils */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Plan du Gaming Center
            </h2>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  onClick={toggleEditMode}
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                >
                  <Move size={16} className="mr-2" />
                  {editMode ? 'Arrêter l\'édition' : 'Éditer'}
                </Button>
              )}
              
              {canEdit && (
                <Button
                  onClick={() => setShowConfigModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Settings size={16} className="mr-2" />
                  Configuration
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setMapScale(prev => Math.max(0.5, prev - 0.1))}
                variant="outline"
                size="sm"
              >
                -
              </Button>
              <span className="text-sm min-w-12 text-center">
                {Math.round(mapScale * 100)}%
              </span>
              <Button
                onClick={() => setMapScale(prev => Math.min(3, prev + 0.1))}
                variant="outline"
                size="sm"
              >
                +
              </Button>
              <Button
                onClick={() => setMapScale(1)}
                variant="outline"
                size="sm"
              >
                <RotateCcw size={16} />
              </Button>
            </div>
            
            {/* Légende */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Occupé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ✅ Map principale */}
      <Card className="overflow-hidden">
        <div 
          ref={mapRef}
          className="relative overflow-auto"
          style={{ height: '600px' }}
          onWheel={handleWheel}
        >
          <svg
            width={mapConfig.width * mapScale}
            height={mapConfig.height * mapScale}
            viewBox={`0 0 ${mapConfig.width} ${mapConfig.height}`}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
              backgroundImage: mapConfig.backgroundImage ? `url(${mapConfig.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Grille */}
            {renderGrid()}
            
            {/* Postes */}
            {postes.map(renderPoste)}
            
            {/* Overlay d'édition */}
            {editMode && (
              <text
                x={mapConfig.width / 2}
                y={30}
                textAnchor="middle"
                fontSize="14"
                fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
                opacity={0.7}
              >
                Mode édition activé - Glissez-déposez les postes pour les repositionner
              </text>
            )}
          </svg>
        </div>
      </Card>

      {/* ✅ Modal de configuration */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configuration de la Map"
        size="md"
      >
        <form ref={configFormRef} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Largeur (px)
              </label>
              <Input
                type="number"
                value={tempConfig.width}
                onChange={(e) => setTempConfig(prev => ({
                  ...prev,
                  width: parseInt(e.target.value) || 1200
                }))}
                min={800}
                max={3000}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Hauteur (px)
              </label>
              <Input
                type="number"
                value={tempConfig.height}
                onChange={(e) => setTempConfig(prev => ({
                  ...prev,
                  height: parseInt(e.target.value) || 800
                }))}
                min={600}
                max={2000}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Taille de grille (px)
            </label>
            <Input
              type="number"
              value={tempConfig.gridSize}
              onChange={(e) => setTempConfig(prev => ({
                ...prev,
                gridSize: parseInt(e.target.value) || 20
              }))}
              min={10}
              max={50}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Afficher la grille
            </label>
            <Switch
              checked={tempConfig.showGrid}
              onChange={(checked) => setTempConfig(prev => ({
                ...prev,
                showGrid: checked
              }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Alignement sur la grille
            </label>
            <Switch
              checked={tempConfig.snapToGrid}
              onChange={(checked) => setTempConfig(prev => ({
                ...prev,
                snapToGrid: checked
              }))}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfigModal(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveConfig}
            >
              <Save size={16} className="mr-2" />
              Sauvegarder
            </Button>
          </div>
        </form>
      </Modal>

      {/* ✅ Panneau de détails du poste sélectionné */}
      {selectedPoste && showPosteDetails && (
        <Modal
          isOpen={showPosteDetails}
          onClose={() => {
            setShowPosteDetails(false);
            selectPoste(null);
          }}
          title="Détails du Poste"
          size="md"
        >
          {(() => {
            const poste = postes.find(p => p.id === selectedPoste);
            if (!poste) return null;
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Nom</h3>
                    <p className="text-lg">{poste.nom}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Type</h3>
                    <p className="text-lg">{poste.typePoste?.nom}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Statut</h3>
                    <span 
                      className="inline-block px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: getPosteStatusColor(poste.statut) }}
                    >
                      {getPosteStatusText(poste.statut)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Revenus aujourd'hui</h3>
                    <p className="text-lg font-bold text-green-600">
                      {poste.revenue?.toFixed(2) || '0.00'} MAD
                    </p>
                  </div>
                </div>
                
                {poste.session && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Session Active</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Client:</span> {poste.session.client?.nom || 'Anonyme'}</p>
                      <p><span className="font-medium">Début:</span> {new Date(poste.session.dateHeureDebut).toLocaleString()}</p>
                      <p><span className="font-medium">Durée:</span> {poste.session.dureeEcoulee} min</p>
                      <p><span className="font-medium">Coût:</span> {poste.session.coutCalcule?.toFixed(2)} MAD</p>
                    </div>
                  </div>
                )}
                
                {hasPermission('SESSIONS_MANAGE') && (
                  <div className="flex gap-2 pt-4">
                    {poste.statut === 'DISPONIBLE' && (
                      <Button
                        onClick={() => handlePosteAction(poste, 'start')}
                        className="flex-1"
                      >
                        <Play size={16} className="mr-2" />
                        Démarrer Session
                      </Button>
                    )}
                    
                    {poste.statut === 'OCCUPE' && (
                      <>
                        <Button
                          onClick={() => handlePosteAction(poste, 'pause')}
                          variant="outline"
                          className="flex-1"
                        >
                          <Pause size={16} className="mr-2" />
                          Pause
                        </Button>
                        <Button
                          onClick={() => handlePosteAction(poste, 'stop')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Square size={16} className="mr-2" />
                          Terminer
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={() => handlePosteAction(poste, 'maintenance')}
                      variant="outline"
                    >
                      Maintenance
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};

export default GamingCenterMap;