import { api } from '../api/apiService';

const posteService = {
  // Récupérer tous les postes
  getAllPostes: async (includeInactive = false) => {
    try {
      const response = await api.get('/postes', {
        params: { includeInactive }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur dans getAllPostes:", error);
      throw error;
    }
  },
  
  // Récupérer un poste par ID
  getPosteById: async (id) => {
    try {
      const response = await api.get(`/postes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur dans getPosteById:", error);
      throw error;
    }
  },
  
  // Créer un poste
  createPoste: async (posteData) => {
    try {
      const response = await api.post('/postes', posteData);
      return response.data;
    } catch (error) {
      console.error("Erreur dans createPoste:", error);
      throw error;
    }
  },
  
  // Mettre à jour un poste
  updatePoste: async (id, posteData) => {
    try {
      const response = await api.put(`/postes/${id}`, posteData);
      return response.data;
    } catch (error) {
      console.error("Erreur dans updatePoste:", error);
      throw error;
    }
  },
  
  // Changer l'état d'un poste
  changerEtatPoste: async (id, etat, notesMaintenance) => {
    try {
      const response = await api.put(`/postes/${id}/etat`, {
        etat,
        notesMaintenance
      });
      return response.data;
    } catch (error) {
      console.error("Erreur dans changerEtatPoste:", error);
      throw error;
    }
  },
  
  // Supprimer un poste
  deletePoste: async (id) => {
    try {
      const response = await api.delete(`/postes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur dans deletePoste:", error);
      throw error;
    }
  }
};

export default posteService;