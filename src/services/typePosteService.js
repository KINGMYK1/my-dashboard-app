import { api } from '../api/apiService';

const typePosteService = {
  // Récupérer tous les types de postes
  getAllTypesPostes: async () => {
    try {
      const response = await api.get('/types-postes');
      return response.data;
    } catch (error) {
      console.error("Erreur dans getAllTypesPostes:", error);
      throw error;
    }
  },
  
  // Récupérer un type de poste par ID
  getTypePosteById: async (id) => {
    try {
      const response = await api.get(`/types-postes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur dans getTypePosteById:", error);
      throw error;
    }
  },
  
  // Créer un type de poste
  createTypePoste: async (typePosteData) => {
    try {
      const response = await api.post('/types-postes', typePosteData);
      return response.data;
    } catch (error) {
      console.error("Erreur dans createTypePoste:", error);
      throw error;
    }
  },
  
  // Mettre à jour un type de poste
  updateTypePoste: async (id, typePosteData) => {
    try {
      const response = await api.put(`/types-postes/${id}`, typePosteData);
      return response.data;
    } catch (error) {
      console.error("Erreur dans updateTypePoste:", error);
      throw error;
    }
  },
  
  // Supprimer un type de poste
  deleteTypePoste: async (id) => {
    try {
      const response = await api.delete(`/types-postes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur dans deleteTypePoste:", error);
      throw error;
    }
  },
  
  // Calculer le prix d'une session
  calculerPrixSession: async (typePosteId, dureeMinutes) => {
    try {
      const response = await api.get('/types-postes/calculer-prix', {
        params: { typePosteId, dureeMinutes }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur dans calculerPrixSession:", error);
      throw error;
    }
  }
};

export default typePosteService;