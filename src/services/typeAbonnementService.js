import { api } from '../api/apiService';

class TypeAbonnementService {
  /**
   * Récupérer tous les types d'abonnements
   */
  async getAllTypesAbonnements(params = {}) {
    try {
      console.log('📦 [TYPE_ABONNEMENT_SERVICE] Récupération types abonnements:', params);
      
      const response = await api.get('/type-abonnements', { params });
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Types abonnements récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur récupération types abonnements:', error);
      throw error;
    }
  }

  /**
   * Récupérer un type d'abonnement par ID
   */
  async getTypeAbonnementById(id) {
    try {
      console.log(`📋 [TYPE_ABONNEMENT_SERVICE] Récupération type abonnement ID: ${id}`);
      
      const response = await api.get(`/type-abonnements/${id}`);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Type abonnement récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur récupération type abonnement:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Calculer le prix d'un abonnement (conforme aux routes backend)
   */
  async calculerPrixAbonnement(typeAbonnementId, reductionPromo = 0) {
    try {
      console.log(`💰 [TYPE_ABONNEMENT_SERVICE] Calcul prix abonnement ID: ${typeAbonnementId}`, { reductionPromo });
      
      const response = await api.get('/type-abonnements/calculer-prix', {
        params: {
          typeAbonnementId,
          reductionPromo
        }
      });
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Prix calculé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur calcul prix:', error);
      throw error;
    }
  }

  /**
   * Créer un type d'abonnement
   */
  async createTypeAbonnement(typeData) {
    try {
      console.log('💳 [TYPE_ABONNEMENT_SERVICE] Création type abonnement:', typeData);
      
      // ✅ Validation des données selon les routes backend
      if (!typeData.nom || !typeData.nombreHeures || !typeData.prixPackage || !typeData.tarifHoraireNormal) {
        throw new Error('Données de type d\'abonnement incomplètes');
      }

      // Validation des valeurs numériques
      if (parseFloat(typeData.nombreHeures) < 0.5) {
        throw new Error('Le nombre d\'heures doit être au minimum 0.5');
      }

      if (parseFloat(typeData.prixPackage) <= 0) {
        throw new Error('Le prix du package doit être positif');
      }

      if (parseFloat(typeData.tarifHoraireNormal) <= 0) {
        throw new Error('Le tarif horaire normal doit être positif');
      }

      // ✅ Structurer les données selon l'API backend
      const payload = {
        nom: typeData.nom.trim(),
        description: typeData.description ? typeData.description.trim() : null,
        nombreHeures: parseFloat(typeData.nombreHeures),
        prixPackage: parseFloat(typeData.prixPackage),
        tarifHoraireNormal: parseFloat(typeData.tarifHoraireNormal),
        dureeValiditeMois: parseInt(typeData.dureeValiditeMois) || 12,
        typePostesAutorises: typeData.typePostesAutorises && typeData.typePostesAutorises.length > 0 
          ? typeData.typePostesAutorises.map(id => parseInt(id))
          : null,
        heuresMinParSession: parseFloat(typeData.heuresMinParSession) || 0.25,
        heuresMaxParSession: typeData.heuresMaxParSession ? parseFloat(typeData.heuresMaxParSession) : null,
        estPromo: Boolean(typeData.estPromo),
        dateDebutPromo: typeData.estPromo && typeData.dateDebutPromo ? typeData.dateDebutPromo : null,
        dateFinPromo: typeData.estPromo && typeData.dateFinPromo ? typeData.dateFinPromo : null,
        couleur: typeData.couleur || '#3B82F6',
        ordreAffichage: parseInt(typeData.ordreAffichage) || 999
      };

      const response = await api.post('/type-abonnements', payload);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Type abonnement créé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur création type abonnement:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un type d'abonnement
   */
  async updateTypeAbonnement(id, typeData) {
    try {
      console.log(`📝 [TYPE_ABONNEMENT_SERVICE] Mise à jour type abonnement ID: ${id}`, typeData);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type d\'abonnement invalide');
      }

      // ✅ Structurer les données selon l'API backend (validation automatique)
      const payload = {};
      
      if (typeData.nom !== undefined) {
        if (!typeData.nom.trim() || typeData.nom.trim().length < 2 || typeData.nom.trim().length > 100) {
          throw new Error('Le nom doit faire entre 2 et 100 caractères');
        }
        payload.nom = typeData.nom.trim();
      }
      
      if (typeData.description !== undefined) {
        payload.description = typeData.description ? typeData.description.trim() : null;
      }
      
      if (typeData.nombreHeures !== undefined) {
        const heures = parseFloat(typeData.nombreHeures);
        if (heures < 0.5) throw new Error('Le nombre d\'heures doit être au minimum 0.5');
        payload.nombreHeures = heures;
      }
      
      if (typeData.prixPackage !== undefined) {
        const prix = parseFloat(typeData.prixPackage);
        if (prix <= 0) throw new Error('Le prix du package doit être positif');
        payload.prixPackage = prix;
      }
      
      if (typeData.tarifHoraireNormal !== undefined) {
        const tarif = parseFloat(typeData.tarifHoraireNormal);
        if (tarif <= 0) throw new Error('Le tarif horaire normal doit être positif');
        payload.tarifHoraireNormal = tarif;
      }
      
      if (typeData.dureeValiditeMois !== undefined) {
        const duree = parseInt(typeData.dureeValiditeMois);
        if (duree < 1 || duree > 60) throw new Error('La durée de validité doit être entre 1 et 60 mois');
        payload.dureeValiditeMois = duree;
      }
      
      if (typeData.typePostesAutorises !== undefined) {
        payload.typePostesAutorises = typeData.typePostesAutorises && typeData.typePostesAutorises.length > 0 
          ? typeData.typePostesAutorises.map(id => parseInt(id))
          : null;
      }
      
      if (typeData.heuresMinParSession !== undefined) payload.heuresMinParSession = parseFloat(typeData.heuresMinParSession);
      if (typeData.heuresMaxParSession !== undefined) payload.heuresMaxParSession = typeData.heuresMaxParSession ? parseFloat(typeData.heuresMaxParSession) : null;
      if (typeData.estPromo !== undefined) payload.estPromo = Boolean(typeData.estPromo);
      if (typeData.dateDebutPromo !== undefined) payload.dateDebutPromo = typeData.dateDebutPromo;
      if (typeData.dateFinPromo !== undefined) payload.dateFinPromo = typeData.dateFinPromo;
      if (typeData.couleur !== undefined) payload.couleur = typeData.couleur;
      if (typeData.ordreAffichage !== undefined) payload.ordreAffichage = parseInt(typeData.ordreAffichage);
      if (typeData.estActif !== undefined) payload.estActif = Boolean(typeData.estActif);

      const response = await api.put(`/type-abonnements/${parseInt(id)}`, payload);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Type abonnement mis à jour:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur mise à jour type abonnement:', error);
      throw error;
    }
  }

  /**
   * Supprimer un type d'abonnement
   */
  async deleteTypeAbonnement(id) {
    try {
      console.log(`🗑️ [TYPE_ABONNEMENT_SERVICE] Suppression type abonnement ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type d\'abonnement invalide');
      }
      
      const response = await api.delete(`/type-abonnements/${parseInt(id)}`);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Type abonnement supprimé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur suppression type abonnement:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Activer/Désactiver un type d'abonnement (conforme aux routes backend)
   */
  async toggleTypeAbonnementStatus(id) {
    try {
      console.log(`🔄 [TYPE_ABONNEMENT_SERVICE] Toggle status type abonnement ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type d\'abonnement invalide');
      }
      
      const response = await api.patch(`/type-abonnements/${parseInt(id)}/toggle-status`);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Status basculé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur toggle status:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Dupliquer un type d'abonnement (conforme aux routes backend)
   */
  async duplicateTypeAbonnement(id) {
    try {
      console.log(`📋 [TYPE_ABONNEMENT_SERVICE] Duplication type abonnement ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type d\'abonnement invalide');
      }
      
      const response = await api.post(`/type-abonnements/${parseInt(id)}/duplicate`);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Type abonnement dupliqué:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur duplication type abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques d'un type d'abonnement (conforme aux routes backend)
   */
  async getTypeAbonnementStatistiques(id) {
    try {
      console.log(`📊 [TYPE_ABONNEMENT_SERVICE] Récupération stats type abonnement ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type d\'abonnement invalide');
      }
      
      const response = await api.get(`/type-abonnements/${parseInt(id)}/statistiques`);
      console.log('✅ [TYPE_ABONNEMENT_SERVICE] Stats récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_ABONNEMENT_SERVICE] Erreur récupération stats:', error);
      throw error;
    }
  }
}

export const typeAbonnementService = new TypeAbonnementService();
export default typeAbonnementService;