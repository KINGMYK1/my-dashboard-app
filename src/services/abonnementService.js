import { api } from '../api/apiService';

class AbonnementService {
  /**
   * Récupérer tous les abonnements avec infos client et type d'abonnement
   * @param {Object} params - Paramètres de la requête (filtres, pagination, inclusions)
   * @returns {Promise<Object>} Liste des abonnements et pagination
   */
  async getAllAbonnements(params = {}) {
    try {
      console.log('🎯 [ABONNEMENT_SERVICE] Récupération abonnements:', params);
      
      // ✅ S'assurer que les infos client sont incluses par défaut
      const queryParams = {
        ...params,
        includeClient: params.includeClient !== false, // true par défaut
        includeTypeAbonnement: params.includeTypeAbonnement !== false
      };
      
      const response = await api.get('/abonnements', { params: queryParams });
      console.log('✅ [ABONNEMENT_SERVICE] Abonnements récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur récupération abonnements:', error);
      throw error;
    }
  }

  /**
   * Vendre un abonnement - Processus complet
   * @param {Object} abonnementData - Données de l'abonnement à vendre
   * @returns {Promise<Object>} Abonnement créé
   */

  async vendreAbonnement(abonnementData) {
    try {
      console.log('💰 [ABONNEMENT_SERVICE] Vente abonnement:', abonnementData);
      
      // ✅ Validation des données obligatoires
      if (!abonnementData.clientId || isNaN(parseInt(abonnementData.clientId))) {
        throw new Error('ID client invalide ou manquant');
      }

      if (!abonnementData.typeAbonnementId || isNaN(parseInt(abonnementData.typeAbonnementId))) {
        throw new Error('ID de type d\'abonnement invalide ou manquant');
      }

      // ✅ Préparer les données proprement
      const cleanData = {
        clientId: parseInt(abonnementData.clientId),
        typeAbonnementId: parseInt(abonnementData.typeAbonnementId),
        dateAchat: abonnementData.dateAchat || new Date().toISOString(),
        dateDebutValidite: abonnementData.dateDebutValidite || abonnementData.dateDebut || new Date().toISOString(),
        modePaiement: abonnementData.modePaiement || 'ESPECES',
        reductionPromo: parseFloat(abonnementData.reductionPromo) || 0,
        montantPaye: parseFloat(abonnementData.montantPaye) || 0,
        estPaye: Boolean(abonnementData.estPaye !== false), // true par défaut
        notes: abonnementData.notes?.trim() || '',
        sourceAchat: abonnementData.sourceAchat || 'MANUEL'
      };

      console.log('✅ [ABONNEMENT_SERVICE] Données nettoyées:', cleanData);

      const response = await api.post('/abonnements/vendre', cleanData);
       console.log('✅ [ABONNEMENT_SERVICE] Abonnement vendu:', response);
      
      return response.data;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur vente abonnement:', error);
      throw error;
    }
  }

  /**
   * Calculer le prix prévisionnel d'un abonnement
   * @param {Object} data - { typeAbonnementId, reductionPromo }
   * @returns {Promise<Object>} Détails du prix calculé
   */
  async calculerPrixAbonnement({ typeAbonnementId, reductionPromo = 0 }) {
    try {
      console.log('🧮 [ABONNEMENT_SERVICE] Calcul prix abonnement:', { typeAbonnementId, reductionPromo });
      
      // ✅ Validation des paramètres
      if (!typeAbonnementId || isNaN(parseInt(typeAbonnementId))) {
        throw new Error('ID de type d\'abonnement invalide');
      }

      // ✅ Utiliser GET avec query parameters au lieu de POST
      const response = await api.get('/abonnements/calculer-prix', {
        params: {
          typeAbonnementId: parseInt(typeAbonnementId),
          reductionPromo: parseFloat(reductionPromo) || 0
        }
      });
      
      console.log('✅ [ABONNEMENT_SERVICE] Prix calculé:', response);
      return response.data;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur calcul prix:', error);
      throw error;
    }
  }

  /**
   * Changer le statut d'un abonnement
   * @param {number} id - ID de l'abonnement
   * @param {string} statut - Nouveau statut (ACTIF, SUSPENDU, EXPIRE, EPUISÉ, ANNULE)
   * @returns {Promise<Object>} Abonnement mis à jour
   */
  async changerStatutAbonnement(id, statut) {
    try {
      console.log(`🔄 [ABONNEMENT_SERVICE] Changement statut abonnement ID: ${id} vers ${statut}`);
      const response = await api.patch(`/abonnements/${id}/statut`, { statut });
      console.log('✅ [ABONNEMENT_SERVICE] Statut abonnement mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur changement statut abonnement:', error);
      throw error;
    }
  }

  /**
   * Annuler un abonnement
   * @param {number} id - ID de l'abonnement à annuler
   * @returns {Promise<Object>} Message de succès
   */
  async annulerAbonnement(id) {
    try {
      console.log(`🚫 [ABONNEMENT_SERVICE] Annulation abonnement ID: ${id}`);
      const response = await api.patch(`/abonnements/${id}/annuler`);
      console.log('✅ [ABONNEMENT_SERVICE] Abonnement annulé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur annulation abonnement:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Vérifier la disponibilité d'un abonnement
   */
  async verifierDisponibiliteAbonnement(abonnementId, dureeHeure = 1) {
    try {
      console.log(`✔️ [ABONNEMENT_SERVICE] Vérification disponibilité abonnement ID: ${abonnementId}`, { dureeHeure });
      
      if (!abonnementId || isNaN(parseInt(abonnementId))) {
        throw new Error('ID d\'abonnement invalide');
      }
      
      const response = await api.get(`/abonnements/${parseInt(abonnementId)}/availability`, {
        params: { dureeHeure: parseFloat(dureeHeure) }
      });
      console.log('✅ [ABONNEMENT_SERVICE] Disponibilité vérifiée:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur vérification disponibilité:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Consommer des heures d'un abonnement
   */
  async consommerHeures(abonnementId, dureeHeure, sessionId = null) {
    try {
      console.log(`⏱️ [ABONNEMENT_SERVICE] Consommation heures abonnement ID: ${abonnementId}`, { dureeHeure, sessionId });
      
      if (!abonnementId || isNaN(parseInt(abonnementId))) {
        throw new Error('ID d\'abonnement invalide');
      }

      if (!dureeHeure || dureeHeure <= 0) {
        throw new Error('Durée en heures invalide');
      }
      
      const response = await api.post(`/abonnements/${parseInt(abonnementId)}/consommer-heures`, {
        dureeHeure: parseFloat(dureeHeure),
        sessionId: sessionId ? parseInt(sessionId) : null
      });
      console.log('✅ [ABONNEMENT_SERVICE] Heures consommées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur consommation heures:', error);
      throw error;
    }
  }

  /**
   * Récupérer un abonnement par ID avec détails complets
   */
  async getAbonnementById(id) {
    try {
      console.log(`📋 [ABONNEMENT_SERVICE] Récupération abonnement ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID d\'abonnement invalide');
      }
      
      const response = await api.get(`/abonnements/${parseInt(id)}`);
      console.log('✅ [ABONNEMENT_SERVICE] Abonnement récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur récupération abonnement:', error);
      throw error;
    }
  }

  /**
   * Récupérer les abonnements actifs d'un client spécifique
   */
  async getAbonnementsActifsClient(clientId) {
    try {
      console.log(`👤 [ABONNEMENT_SERVICE] Récupération abonnements actifs client ID: ${clientId}`);
      
      if (!clientId || isNaN(parseInt(clientId))) {
        throw new Error('ID client invalide');
      }
      
      const response = await api.get(`/abonnements/client/${parseInt(clientId)}/actifs`);
      console.log('✅ [ABONNEMENT_SERVICE] Abonnements actifs récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur récupération abonnements actifs:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les sessions d'un abonnement
   */
  async getAbonnementSessions(abonnementId, options = {}) {
    try {
      console.log(`📜 [ABONNEMENT_SERVICE] Récupération sessions abonnement ID: ${abonnementId}`, options);
      
      if (!abonnementId || isNaN(parseInt(abonnementId))) {
        throw new Error('ID d\'abonnement invalide');
      }
      
      const response = await api.get(`/abonnements/${parseInt(abonnementId)}/sessions`, {
        params: options
      });
      console.log('✅ [ABONNEMENT_SERVICE] Sessions récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur récupération sessions:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les abonnements expirant bientôt
   */
  async getAbonnementsExpirantBientot(jours = 7) {
    try {
      console.log(`⚠️ [ABONNEMENT_SERVICE] Récupération abonnements expirant dans ${jours} jours`);
      
      if (jours < 1 || jours > 90) {
        throw new Error('Nombre de jours doit être entre 1 et 90');
      }
      
      const response = await api.get('/abonnements/expirations', {
        params: { jours: parseInt(jours) }
      });
      console.log('✅ [ABONNEMENT_SERVICE] Abonnements expirant récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur récupération abonnements expirant:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des abonnements
   * @param {number} periode - Période en jours pour les statistiques
   * @returns {Promise<Object>} Statistiques des abonnements
   */
  async getStatistiquesAbonnements(periode = 30) {
    try {
      console.log(`📊 [ABONNEMENT_SERVICE] Récupération statistiques abonnements pour ${periode} jours`);
      
      if (periode < 1 || periode > 365) {
        throw new Error('Période doit être entre 1 et 365 jours');
      }
      
      const response = await api.get('/abonnements/statistiques', {
        params: { periode: parseInt(periode) }
      });
      console.log('✅ [ABONNEMENT_SERVICE] Statistiques récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [ABONNEMENT_SERVICE] Erreur statistiques abonnements:', error);
      throw error;
    }
  }
}

export const abonnementService = new AbonnementService();
export default abonnementService;