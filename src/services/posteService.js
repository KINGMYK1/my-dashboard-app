import { api } from '../api/apiService';

const posteService = {
  // Récupérer tous les postes
  getAllPostes: async (includeInactive = false) => {
    try {
      console.log('📋 [POSTE_SERVICE] Récupération postes, includeInactive:', includeInactive);
      
      const response = await api.get('/postes', {
        params: { includeInactive }
      });
      
      console.log('📦 [POSTE_SERVICE] Réponse brute getAllPostes:', response);
      console.log('📦 [POSTE_SERVICE] response.data:', response.data);
      console.log('📦 [POSTE_SERVICE] Type de response.data:', typeof response.data);
      
      // ✅ Debug approfondi de la structure
      if (response.data) {
        console.log('🔍 [POSTE_SERVICE] Clés de response.data:', Object.keys(response.data));
        if (response.data.data) {
          console.log('🔍 [POSTE_SERVICE] response.data.data:', response.data.data);
          console.log('🔍 [POSTE_SERVICE] Type de response.data.data:', typeof response.data.data);
          console.log('🔍 [POSTE_SERVICE] Est array?:', Array.isArray(response.data.data));
        }
      }
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans getAllPostes:", error);
      throw error;
    }
  },
  
  // Récupérer un poste par ID
  getPosteById: async (id) => {
    try {
      console.log('📋 [POSTE_SERVICE] Récupération poste ID:', id);
      
      const response = await api.get(`/postes/${id}`);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute getPosteById:', response);
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans getPosteById:", error);
      throw error;
    }
  },

  // Obtenir les statistiques d'un poste
  getPosteStatistics: async (id) => {
    try {
      console.log('📊 [POSTE_SERVICE] Récupération statistiques poste ID:', id);
      
      const response = await api.get(`/postes/${id}/statistics`);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute getPosteStatistics:', response);
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans getPosteStatistics:", error);
      throw error;
    }
  },
  
  // Créer un poste
  createPoste: async (posteData) => {
    try {
      console.log('📝 [POSTE_SERVICE] Création poste:', posteData);
      
      // ✅ Nettoyer et structurer les données
      const cleanData = {
        nom: posteData.nom?.trim(),
        typePosteId: parseInt(posteData.typePosteId),
        position: posteData.position?.trim() || null,
        notesMaintenance: posteData.notesMaintenance || '',
        estActif: posteData.estActif !== undefined ? Boolean(posteData.estActif) : true,
        etat: posteData.etat || 'Disponible'
      };

      console.log('📝 [POSTE_SERVICE] Données nettoyées:', cleanData);
      
      const response = await api.post('/postes', cleanData);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute createPoste:', response);
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans createPoste:", error);
      throw error;
    }
  },
  
  // ✅ CORRECTION: Mettre à jour un poste avec structure correcte
  updatePoste: async (id, posteData) => {
    try {
      console.log('📝 [POSTE_SERVICE] Mise à jour poste ID:', id, 'Données:', posteData);
      
      // ✅ Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de poste invalide');
      }

      // ✅ Validation des données avec logs détaillés
      if (!posteData || typeof posteData !== 'object') {
        console.error('❌ [POSTE_SERVICE] Données invalides - pas un objet:', posteData);
        throw new Error('Données de mise à jour invalides - objet requis');
      }
      
      const dataKeys = Object.keys(posteData);
      if (dataKeys.length === 0) {
        console.error('❌ [POSTE_SERVICE] Données vides:', posteData);
        throw new Error('Données de mise à jour vides');
      }
      
      console.log('🔍 [POSTE_SERVICE] Clés des données reçues:', dataKeys);

      // ✅ Nettoyer et structurer les données
      const cleanData = {};
      
      if (posteData.nom !== undefined && posteData.nom !== null) {
        const nom = String(posteData.nom).trim();
        if (nom) {
          cleanData.nom = nom;
        } else {
          throw new Error('Le nom du poste ne peut pas être vide');
        }
      }
      
      if (posteData.typePosteId !== undefined && posteData.typePosteId !== null) {
        const typePosteId = parseInt(posteData.typePosteId);
        if (!isNaN(typePosteId) && typePosteId > 0) {
          cleanData.typePosteId = typePosteId;
        } else {
          throw new Error('Type de poste invalide');
        }
      }
      
      if (posteData.position !== undefined) {
        cleanData.position = posteData.position ? String(posteData.position).trim() : null;
      }
      
      if (posteData.notesMaintenance !== undefined) {
        cleanData.notesMaintenance = posteData.notesMaintenance ? String(posteData.notesMaintenance) : '';
      }
      
      if (posteData.estActif !== undefined && posteData.estActif !== null) {
        cleanData.estActif = Boolean(posteData.estActif);
      }
      
      if (posteData.etat !== undefined && posteData.etat !== null) {
        const etatsValides = ['Disponible', 'Occupé', 'Maintenance', 'Hors_Service'];
        if (etatsValides.includes(posteData.etat)) {
          cleanData.etat = posteData.etat;
        }
      }

      console.log('📝 [POSTE_SERVICE] Données nettoyées pour envoi:', cleanData);

      // ✅ Vérifier qu'il y a des données à envoyer
      if (Object.keys(cleanData).length === 0) {
        throw new Error('Aucune donnée valide à mettre à jour');
      }
      
      const response = await api.put(`/postes/${parseInt(id)}`, cleanData);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute updatePoste:', response);
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans updatePoste:", error);
      throw error;
    }
  },

  // ✅ CORRECTION: Changer l'état d'un poste avec validation
  changerEtatPoste: async (id, data) => {
    try {
      console.log('🔄 [POSTE_SERVICE] Changement état - ID:', id, 'Data:', data);
      
      // ✅ Validation côté client
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de poste invalide');
      }
      
      if (!data?.nouvelEtat) {
        throw new Error('Nouvel état requis');
      }

      // ✅ Validation de l'état
      const etatsValides = ['Disponible', 'Occupé', 'Maintenance', 'Hors_Service'];
      if (!etatsValides.includes(data.nouvelEtat)) {
        throw new Error(`État invalide. États autorisés: ${etatsValides.join(', ')}`);
      }

      // ✅ Structurer les données pour le backend
      const payload = {
        nouvelEtat: data.nouvelEtat
      };

      // Ajouter les notes de maintenance si fournie
      if (data.notesMaintenance?.trim()) {
        payload.notesMaintenance = data.notesMaintenance.trim();
      }

      console.log('📝 [POSTE_SERVICE] Payload envoyé:', payload);

      const response = await api.put(`/postes/${parseInt(id)}/etat`, payload);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute changerEtatPoste:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [POSTE_SERVICE] Erreur changement état:', error);
      throw error;
    }
  },

  // Supprimer un poste
  deletePoste: async (id) => {
    try {
      console.log('🗑️ [POSTE_SERVICE] Suppression poste ID:', id);
      
      // ✅ Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de poste invalide');
      }
      
      const response = await api.delete(`/postes/${parseInt(id)}`);
      
      console.log('📦 [POSTE_SERVICE] Réponse brute deletePoste:', response);
      
      return response;
    } catch (error) {
      console.error("❌ [POSTE_SERVICE] Erreur dans deletePoste:", error);
      throw error;
    }
  }
};

export default posteService;