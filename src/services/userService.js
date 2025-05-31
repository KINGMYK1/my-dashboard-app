import { api } from '../api/apiService';

const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      console.log('📡 Appel API: GET /users');
      const response = await api.get('/users');
      console.log('✅ Réponse getAllUsers:', response);
      return response; // apiService gère déjà response.data
    } catch (error) {
      console.error("❌ Erreur dans getAllUsers:", error);
      throw error;
    }
  },
  
  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    try {
      console.log('📡 Appel API: GET /users/' + id);
      const response = await api.get(`/users/${id}`);
      console.log('✅ Réponse getUserById:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans getUserById:", error);
      throw error;
    }
  },
  
  // Récupérer le profil de l'utilisateur connecté
  getUserProfile: async () => {
    try {
      console.log('📡 Appel API: GET /users/profile');
      const response = await api.get('/users/profile');
      console.log('✅ Réponse getUserProfile:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans getUserProfile:", error);
      throw error;
    }
  },
  
  // Créer un utilisateur avec la nouvelle logique hiérarchique
  createUser: async (userData) => {
    try {
      console.log('📡 Appel API: POST /users', userData);
      const response = await api.post('/users', userData);
      console.log('✅ Réponse createUser:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans createUser:", error);
      throw error;
    }
  },
  
  // Mettre à jour un utilisateur avec contrôles hiérarchiques
  updateUser: async (id, userData) => {
    try {
      console.log('📡 Appel API: PUT /users/' + id, userData);
      const response = await api.put(`/users/${id}`, userData);
      console.log('✅ Réponse updateUser:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans updateUser:", error);
      throw error;
    }
  },
  
  // Supprimer un utilisateur
  deleteUser: async (id) => {
    try {
      console.log('📡 Appel API: DELETE /users/' + id);
      const response = await api.delete(`/users/${id}`);
      console.log('✅ Réponse deleteUser:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans deleteUser:", error);
      throw error;
    }
  },
  
  // Activer un utilisateur
  activateUser: async (id) => {
    try {
      console.log('📡 Appel API: PUT /users/' + id + '/activate');
      const response = await api.put(`/users/${id}/activate`);
      console.log('✅ Réponse activateUser:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans activateUser:", error);
      throw error;
    }
  },
  
  // Désactiver un utilisateur
  deactivateUser: async (id) => {
    try {
      console.log('📡 Appel API: PUT /users/' + id + '/deactivate');
      const response = await api.put(`/users/${id}/deactivate`);
      console.log('✅ Réponse deactivateUser:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans deactivateUser:", error);
      throw error;
    }
  },
  
  // Changer le rôle d'un utilisateur
  changeUserRole: async (userId, roleId) => {
    try {
      console.log('📡 Appel API: POST /users/change-role', { userId, roleId });
      const response = await api.post('/users/change-role', { userId, roleId });
      console.log('✅ Réponse changeUserRole:', response);
      return response;
    } catch (error) {
      console.error("❌ Erreur dans changeUserRole:", error);
      
      // Gérer les erreurs spécifiques
      if (error.response?.data?.errorCode === 'INSUFFICIENT_ROLE_PERMISSIONS') {
        throw {
          ...error,
          userMessage: `Vous n'avez pas les droits pour effectuer ce changement de rôle`
        };
      }
      
      throw error;
    }
  }
};

export { userService };
export default userService;