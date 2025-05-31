import { api } from '../api/apiService';

class PermissionService {
  /**
   * Récupérer toutes les permissions
   */
  async getAllPermissions() {
    try {
      console.log('🔑 [PERMISSION_SERVICE] Récupération de toutes les permissions...');
      
      const response = await api.get('/permissions');
      console.log('✅ [PERMISSION_SERVICE] Permissions récupérées:', response);
      
      return {
        success: true,
        data: response.data || [],
        message: response.message || 'Permissions récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ [PERMISSION_SERVICE] Erreur récupération permissions:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des permissions');
    }
  }

  /**
   * Récupérer une permission par ID
   */
  async getPermissionById(id) {
    try {
      console.log(`🔍 [PERMISSION_SERVICE] Récupération de la permission ID: ${id}`);
      
      const response = await api.get(`/permissions/${id}`);
      console.log('✅ [PERMISSION_SERVICE] Permission récupérée:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Permission récupérée avec succès'
      };
    } catch (error) {
      console.error('❌ [PERMISSION_SERVICE] Erreur récupération permission:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la permission');
    }
  }

  /**
   * Créer une nouvelle permission
   */
  async createPermission(permissionData) {
    try {
      console.log('➕ [PERMISSION_SERVICE] Création de la permission:', permissionData);
      
      const response = await api.post('/permissions', permissionData);
      console.log('✅ [PERMISSION_SERVICE] Permission créée:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Permission créée avec succès'
      };
    } catch (error) {
      console.error('❌ [PERMISSION_SERVICE] Erreur création permission:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la permission');
    }
  }

  /**
   * Mettre à jour une permission
   */
  async updatePermission(id, permissionData) {
    try {
      console.log(`✏️ [PERMISSION_SERVICE] Modification de la permission ID: ${id}`, permissionData);
      
      const response = await api.put(`/permissions/${id}`, permissionData);
      console.log('✅ [PERMISSION_SERVICE] Permission modifiée:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Permission modifiée avec succès'
      };
    } catch (error) {
      console.error('❌ [PERMISSION_SERVICE] Erreur modification permission:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification de la permission');
    }
  }

  /**
   * Supprimer une permission
   */
  async deletePermission(id) {
    try {
      console.log(`🗑️ [PERMISSION_SERVICE] Suppression de la permission ID: ${id}`);
      
      const response = await api.delete(`/permissions/${id}`);
      console.log('✅ [PERMISSION_SERVICE] Permission supprimée');
      
      return {
        success: true,
        message: response.message || 'Permission supprimée avec succès'
      };
    } catch (error) {
      console.error('❌ [PERMISSION_SERVICE] Erreur suppression permission:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la permission');
    }
  }
}

const permissionService = new PermissionService();
export default permissionService;