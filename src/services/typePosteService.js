import { api } from '../api/apiService';

const typePosteService = {
  // Récupérer tous les types de postes
  getAllTypesPostes: async (includeInactive = false) => {
    try {
      console.log('📋 [TYPE_POSTE_SERVICE] Récupération types postes, includeInactive:', includeInactive);
      
      const response = await api.get('/postes/types', {
        params: { includeInactive }
      });
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans getAllTypesPostes:", error);
      throw error;
    }
  },

  // Récupérer un type de poste par ID
  getTypePosteById: async (id) => {
    try {
      console.log('📋 [TYPE_POSTE_SERVICE] Récupération type poste ID:', id);
      
      const response = await api.get(`/postes/types/${id}`);
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans getTypePosteById:", error);
      throw error;
    }
  },

  // ✅ CORRECTION: Créer un type de poste avec structure correcte
  createTypePoste: async (typePosteData, plansTarifaires = []) => {
    try {
      console.log('📝 [TYPE_POSTE_SERVICE] Création type poste:', { typePosteData, plansTarifaires });
      
      // ✅ Validation approfondie côté service
      if (!typePosteData || typeof typePosteData !== 'object') {
        throw new Error('Données du type de poste manquantes ou invalides');
      }
      
      if (!typePosteData.nom || typeof typePosteData.nom !== 'string' || !typePosteData.nom.trim()) {
        throw new Error('Le nom du type de poste est requis et ne peut pas être vide');
      }
      
      if (!typePosteData.tarifHoraireBase || isNaN(parseFloat(typePosteData.tarifHoraireBase)) || parseFloat(typePosteData.tarifHoraireBase) <= 0) {
        throw new Error('Le tarif horaire doit être un nombre positif');
      }
      
      // ✅ Structurer les données selon ce que le backend attend
      const payload = {
        typePosteData: {
          nom: String(typePosteData.nom).trim(),
          description: typePosteData.description ? String(typePosteData.description).trim() : null,
          tarifHoraireBase: parseFloat(typePosteData.tarifHoraireBase),
          devise: typePosteData.devise || 'DH',
          dureeMinSession: parseInt(typePosteData.dureeMinSession) || 15,
          intervalleFacturation: parseInt(typePosteData.intervalleFacturation) || 15,
          icone: typePosteData.icone ? String(typePosteData.icone).trim() : null,
          couleur: typePosteData.couleur || '#3B82F6',
          ordreAffichage: parseInt(typePosteData.ordreAffichage) || 999,
          estActif: Boolean(typePosteData.estActif !== false) // Par défaut true
        },
        plansTarifaires: Array.isArray(plansTarifaires) ? plansTarifaires : []
      };

      console.log('📝 [TYPE_POSTE_SERVICE] Payload structuré:', payload);
      
      const response = await api.post('/postes/types', payload);
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans createTypePoste:", error);
      throw error;
    }
  },

  // ✅ CORRECTION: Mettre à jour un type de poste avec structure correcte  
  updateTypePoste: async (id, typePosteData, plansTarifaires = null) => {
    try {
      console.log('📝 [TYPE_POSTE_SERVICE] Mise à jour type poste ID:', id, { typePosteData, plansTarifaires });
      
      // ✅ Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type de poste invalide');
      }

      // ✅ Structurer les données selon ce que le backend attend
      const payload = {};
      
      // Données du type de poste si fournies
      if (typePosteData && typeof typePosteData === 'object') {
        payload.typePosteData = {
          nom: typePosteData.nom?.trim(),
          description: typePosteData.description || null,
          tarifHoraireBase: typePosteData.tarifHoraireBase ? parseFloat(typePosteData.tarifHoraireBase) : undefined,
          devise: typePosteData.devise || undefined,
          dureeMinSession: typePosteData.dureeMinSession ? parseInt(typePosteData.dureeMinSession) : undefined,
          intervalleFacturation: typePosteData.intervalleFacturation ? parseInt(typePosteData.intervalleFacturation) : undefined,
          icone: typePosteData.icone,
          couleur: typePosteData.couleur,
          ordreAffichage: typePosteData.ordreAffichage ? parseInt(typePosteData.ordreAffichage) : undefined,
          estActif: typePosteData.estActif !== undefined ? Boolean(typePosteData.estActif) : undefined
        };

        // Supprimer les propriétés undefined
        Object.keys(payload.typePosteData).forEach(key => {
          if (payload.typePosteData[key] === undefined) {
            delete payload.typePosteData[key];
          }
        });
      }
      
      // Plans tarifaires si fournis
      if (plansTarifaires !== null) {
        payload.plansTarifaires = plansTarifaires || [];
      }

      console.log('📝 [TYPE_POSTE_SERVICE] Payload structuré:', payload);
      
      const response = await api.put(`/postes/types/${parseInt(id)}`, payload);
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans updateTypePoste:", error);
      throw error;
    }
  },

  // Supprimer un type de poste
  deleteTypePoste: async (id) => {
    try {
      console.log('🗑️ [TYPE_POSTE_SERVICE] Suppression type poste ID:', id);
      
      // ✅ Validation de l'ID
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type de poste invalide');
      }
      
      const response = await api.delete(`/postes/types/${parseInt(id)}`);
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans deleteTypePoste:", error);
      throw error;
    }
  },

  // Obtenir les statistiques d'un type de poste
  getTypePosteStatistics: async (id) => {
    try {
      console.log('📊 [TYPE_POSTE_SERVICE] Récupération statistiques type poste ID:', id);
      
      const response = await api.get(`/postes/types/${id}/statistics`);
      return response;
    } catch (error) {
      console.error("❌ [TYPE_POSTE_SERVICE] Erreur dans getTypePosteStatistics:", error);
      throw error;
    }
  }
};

export default typePosteService;