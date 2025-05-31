import { api } from '../api/apiService';

class RoleService {
  /**
   * Récupérer tous les rôles avec leurs permissions
   */
  async getAllRoles() {
    try {
      console.log('📋 [ROLE_SERVICE] Récupération de tous les rôles...');
      
      const response = await api.get('/roles');
      console.log('✅ [ROLE_SERVICE] Rôles récupérés:', response);
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message: response.message || 'Rôles récupérés avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur récupération rôles:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des rôles');
    }
  }

  /**
   * Récupérer un rôle par ID
   */
  async getRoleById(id) {
    try {
      console.log(`🔍 [ROLE_SERVICE] Récupération du rôle ID: ${id}`);
      
      const response = await api.get(`/roles/${id}`);
      console.log('✅ [ROLE_SERVICE] Rôle récupéré:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Rôle récupéré avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur récupération rôle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du rôle');
    }
  }

  /**
   * Créer un nouveau rôle
   */
  async createRole(roleData) {
    try {
      console.log('➕ [ROLE_SERVICE] Création du rôle:', roleData);
      
      const response = await api.post('/roles', roleData);
      console.log('✅ [ROLE_SERVICE] Rôle créé:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Rôle créé avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur création rôle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du rôle');
    }
  }

  /**
   * Mettre à jour un rôle
   */
  async updateRole(id, roleData) {
    try {
      console.log(`✏️ [ROLE_SERVICE] Modification du rôle ID: ${id}`, roleData);
      
      const response = await api.put(`/roles/${id}`, roleData);
      console.log('✅ [ROLE_SERVICE] Rôle modifié:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Rôle modifié avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur modification rôle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification du rôle');
    }
  }

  /**
   * Supprimer un rôle
   */
  async deleteRole(id) {
    try {
      console.log(`🗑️ [ROLE_SERVICE] Suppression du rôle ID: ${id}`);
      
      const response = await api.delete(`/roles/${id}`);
      console.log('✅ [ROLE_SERVICE] Rôle supprimé');
      
      return {
        success: true,
        message: response.message || 'Rôle supprimé avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur suppression rôle:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du rôle');
    }
  }

  /**
   * Récupérer les permissions d'un rôle
   */
  async getRolePermissions(id) {
    try {
      console.log(`🔑 [ROLE_SERVICE] Récupération des permissions du rôle ID: ${id}`);
      
      const response = await api.get(`/roles/${id}/permissions`);
      console.log('✅ [ROLE_SERVICE] Permissions du rôle récupérées:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Permissions du rôle récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur récupération permissions:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des permissions');
    }
  }

  /**
   * Assigner des permissions à un rôle
   */
  async assignPermissionsToRole(id, permissions) {
    try {
      console.log(`🔗 [ROLE_SERVICE] Attribution des permissions au rôle ID: ${id}`, permissions);
      
      const response = await api.post(`/roles/${id}/permissions`, { permissions });
      console.log('✅ [ROLE_SERVICE] Permissions attribuées:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Permissions attribuées avec succès'
      };
    } catch (error) {
      console.error('❌ [ROLE_SERVICE] Erreur attribution permissions:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'attribution des permissions');
    }
  }
}

const roleService = new RoleService();
export default roleService;