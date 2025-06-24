import { api } from '../api/apiService';

class MapService {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
  }

  // ✅ Récupérer les données complètes de la map
  async getMapData() {
    try {
      console.log('📍 [MAP_SERVICE] Récupération données map...');
      
      const response = await api.get('/map/layout');
      
      if (response.success) {
        const mapData = {
          postes: response.data.postes.map(poste => ({
            id: poste.id,
            nom: poste.nom,
            typePoste: poste.typePoste,
            statut: poste.statut,
            mapPosition: poste.mapPosition || { x: 0, y: 0 },
            session: poste.sessionActive || null,
            // Informations visuelles
            color: this.getPosteColor(poste.statut),
            icon: this.getPosteIcon(poste.typePoste?.nom),
            // Métadonnées
            lastActivity: poste.lastActivity,
            revenue: poste.todayRevenue || 0
          })),
          config: response.data.config || {}
        };

        this.cache.set('mapData', mapData);
        this.lastUpdate = new Date();
        
        return mapData;
      }
      
      throw new Error(response.message || 'Erreur récupération données map');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur récupération map:', error);
      throw error;
    }
  }

  // ✅ Mettre à jour la position d'un poste
  async updatePostePosition(posteId, x, y) {
    try {
      console.log(`📍 [MAP_SERVICE] Mise à jour position poste ${posteId}: ${x}, ${y}`);
      
      const response = await api.patch(`/postes/${posteId}/position`, {
        mapPosition: { x, y }
      });
      
      if (response.success) {
        // ✅ Émettre un événement pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('map:postePositionUpdated', {
          detail: { posteId, x, y }
        }));
        
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur mise à jour position');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur position:', error);
      throw error;
    }
  }

  // ✅ Mettre à jour la configuration de la map
  async updateMapConfig(config) {
    try {
      console.log('🔧 [MAP_SERVICE] Mise à jour config map:', config);
      
      const response = await api.patch('/map/config', config);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur mise à jour configuration');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur config:', error);
      throw error;
    }
  }

  // ✅ Obtenir les statistiques d'un poste
  async getPosteStatistics(posteId, period = 'today') {
    try {
      const response = await api.get(`/postes/${posteId}/statistics?period=${period}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur récupération statistiques');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur statistiques:', error);
      throw error;
    }
  }

  // ✅ Actions sur les postes depuis la map
  async startSessionFromMap(posteId, sessionData) {
    try {
      const response = await api.post('/sessions/start', {
        posteId,
        ...sessionData
      });
      
      if (response.success) {
        // ✅ Émettre événement de démarrage de session
        window.dispatchEvent(new CustomEvent('session:started', {
          detail: { session: response.data }
        }));
        
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur démarrage session');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur démarrage session:', error);
      throw error;
    }
  }

  async endSessionFromMap(sessionId) {
    try {
      const response = await api.post(`/sessions/${sessionId}/end`);
      
      if (response.success) {
        // ✅ Émettre événement de fin de session
        window.dispatchEvent(new CustomEvent('session:ended', {
          detail: { session: response.data }
        }));
        
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur fin session');
    } catch (error) {
      console.error('❌ [MAP_SERVICE] Erreur fin session:', error);
      throw error;
    }
  }

  // ✅ Utilitaires visuels
  getPosteColor(statut) {
    const colors = {
      'DISPONIBLE': '#10B981', // Vert
      'OCCUPE': '#EF4444',     // Rouge
      'MAINTENANCE': '#F59E0B', // Orange
      'HORS_SERVICE': '#6B7280' // Gris
    };
    return colors[statut] || '#6B7280';
  }

  getPosteIcon(typePoste) {
    const icons = {
      'PS4': '🎮',
      'PS5': '🎮',
      'XBOX': '🎮',
      'PC': '💻',
      'NINTENDO': '🕹️'
    };
    return icons[typePoste] || '🎮';
  }

  // ✅ Cache management
  clearCache() {
    this.cache.clear();
    this.lastUpdate = null;
  }

  isCacheValid(maxAge = 30000) { // 30 secondes
    return this.lastUpdate && (Date.now() - this.lastUpdate.getTime()) < maxAge;
  }
}

const mapService = new MapService();
export default mapService;