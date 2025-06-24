import { api } from '../api/apiService';

class PlanTarifaireService {
  constructor() {
    this.baseUrl = '/plans-tarifaires';
  }

  /**
   * ✅ NOUVEAU: Récupérer tous les plans tarifaires
   */
  async getAllPlans() {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Récupération de tous les plans...');
      
      const response = await api.get(this.baseUrl);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plans récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur récupération plans:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les plans actifs
   */
  async getActivePlans() {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Récupération plans actifs...');
      
      const response = await api.get(`${this.baseUrl}/actifs`);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plans actifs récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur récupération plans actifs:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer un plan par ID
   */
  async getPlanById(planId) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Récupération plan par ID:', planId);
      
      const response = await api.get(`${this.baseUrl}/${planId}`);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plan récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur récupération plan:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Créer un nouveau plan tarifaire
   */
  async createPlan(planData) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Création plan:', planData);
      
      const payload = {
        nom: planData.nom,
        description: planData.description || '',
        typeTarification: planData.typeTarification, // 'HORAIRE' | 'FORFAIT' | 'PALIER'
        tarifHoraire: planData.tarifHoraire ? parseFloat(planData.tarifHoraire) : null,
        dureeMinutes: planData.dureeMinutes ? parseInt(planData.dureeMinutes) : null,
        prixForfait: planData.prixForfait ? parseFloat(planData.prixForfait) : null,
        paliers: planData.paliers || [], // Pour les paliers de tarification
        estActif: planData.estActif !== false,
        couleur: planData.couleur || '#3B82F6',
        typePosteIds: planData.typePosteIds || [] // Types de postes compatibles
      };

      const response = await api.post(this.baseUrl, payload);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plan créé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur création plan:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Mettre à jour un plan tarifaire
   */
  async updatePlan(planId, planData) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Mise à jour plan:', planId, planData);
      
      const payload = {
        nom: planData.nom,
        description: planData.description || '',
        typeTarification: planData.typeTarification,
        tarifHoraire: planData.tarifHoraire ? parseFloat(planData.tarifHoraire) : null,
        dureeMinutes: planData.dureeMinutes ? parseInt(planData.dureeMinutes) : null,
        prixForfait: planData.prixForfait ? parseFloat(planData.prixForfait) : null,
        paliers: planData.paliers || [],
        estActif: planData.estActif !== false,
        couleur: planData.couleur || '#3B82F6',
        typePosteIds: planData.typePosteIds || []
      };

      const response = await api.put(`${this.baseUrl}/${planId}`, payload);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plan mis à jour:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur mise à jour plan:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Supprimer un plan tarifaire
   */
  async deletePlan(planId) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Suppression plan:', planId);
      
      const response = await api.delete(`${this.baseUrl}/${planId}`);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plan supprimé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur suppression plan:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Calculer le prix pour un plan et une durée donnés
   */
  async calculatePrice(planId, dureeMinutes, typePosteId = null) {
    try {
      console.log('💰 [PLAN_TARIFAIRE_SERVICE] Calcul prix:', { planId, dureeMinutes, typePosteId });
      
      const payload = {
        dureeMinutes: parseInt(dureeMinutes),
        typePosteId: typePosteId ? parseInt(typePosteId) : null
      };

      const response = await api.post(`${this.baseUrl}/${planId}/calculer-prix`, payload);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Prix calculé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur calcul prix:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les plans compatibles pour un type de poste
   */
  async getPlansForTypePoste(typePosteId) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Récupération plans pour type poste:', typePosteId);
      
      const response = await api.get(`${this.baseUrl}/type-poste/${typePosteId}`);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plans compatibles récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur récupération plans compatibles:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Activer/Désactiver un plan
   */
  async togglePlanStatus(planId, estActif) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Changement statut plan:', planId, estActif);
      
      const response = await api.patch(`${this.baseUrl}/${planId}/statut`, {
        estActif: estActif
      });
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Statut plan changé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur changement statut:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Dupliquer un plan tarifaire
   */
  async duplicatePlan(planId, nouveauNom) {
    try {
      console.log('💵 [PLAN_TARIFAIRE_SERVICE] Duplication plan:', planId, nouveauNom);
      
      const response = await api.post(`${this.baseUrl}/${planId}/dupliquer`, {
        nom: nouveauNom
      });
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Plan dupliqué:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur duplication plan:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les statistiques d'utilisation des plans
   */
  async getPlanStatistics(planId, filters = {}) {
    try {
      console.log('📊 [PLAN_TARIFAIRE_SERVICE] Récupération statistiques plan:', planId, filters);
      
      const params = new URLSearchParams();
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.periode) params.append('periode', filters.periode);

      const response = await api.get(`${this.baseUrl}/${planId}/statistiques?${params.toString()}`);
      console.log('✅ [PLAN_TARIFAIRE_SERVICE] Statistiques récupérées:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [PLAN_TARIFAIRE_SERVICE] Erreur récupération statistiques:', error);
      throw error;