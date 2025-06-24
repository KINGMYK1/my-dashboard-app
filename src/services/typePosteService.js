import { api } from '../api/apiService';

class TypePosteService {
  constructor() {
    this.baseUrl = '/postes/types';
  }

  /**
   * ✅ CORRECTION: Récupérer tous les types de poste avec plans tarifaires
   */
  async getAllTypesPostes(includeInactive = true) {
    try {
      console.log('🎮 [TYPE_POSTE_SERVICE] Récupération types de poste...');
      
      const params = new URLSearchParams();
      if (includeInactive) params.append('includeInactive', 'true');
      
      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      console.log('✅ [TYPE_POSTE_SERVICE] Types de poste récupérés:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Créer un type de poste avec ses plans tarifaires
   */
  async createTypePoste(typePosteData, plansTarifaires = []) {
    try {
      console.log('📝 [TYPE_POSTE_SERVICE] Création:', { typePosteData, plansTarifaires });
      
      const payload = {
        typePosteData,
        plansTarifaires
      };

      const response = await api.post(this.baseUrl, payload);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Création réussie:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur création:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Mettre à jour un type de poste avec ses plans tarifaires
   */
  async updateTypePoste(id, data) {
    try {
      console.log('📝 [TYPE_POSTE_SERVICE] Mise à jour ID:', id, 'Données:', data);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de type de poste invalide');
      }

      const response = await api.put(`${this.baseUrl}/${parseInt(id)}`, data);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Mise à jour réussie:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur mise à jour:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer un type de poste par ID avec ses plans
   */
  async getTypePosteById(typePosteId) {
    try {
      console.log('🎮 [TYPE_POSTE_SERVICE] Récupération type de poste par ID:', typePosteId);
      
      const response = await api.get(`${this.baseUrl}/${typePosteId}`);
      console.log('✅ [TYPE_POSTE_SERVICE] Type de poste récupéré:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération par ID:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Supprimer un type de poste
   */
  async deleteTypePoste(typePosteId) {
    try {
      console.log('🎮 [TYPE_POSTE_SERVICE] Suppression type de poste:', typePosteId);
      
      const response = await api.delete(`${this.baseUrl}/${typePosteId}`);
      console.log('✅ [TYPE_POSTE_SERVICE] Type de poste supprimé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Activer/Désactiver un type de poste
   */
  async toggleTypePosteStatus(typePosteId, estActif) {
    try {
      console.log('🎮 [TYPE_POSTE_SERVICE] Changement statut:', typePosteId, estActif);
      
      const response = await api.patch(`${this.baseUrl}/${typePosteId}/toggle-status`, {
        estActif: estActif
      });
      console.log('✅ [TYPE_POSTE_SERVICE] Statut changé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur changement statut:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Dupliquer un type de poste avec ses plans
   */
  async duplicateTypePoste(typePosteId, nouveauNom) {
    try {
      console.log('🎮 [TYPE_POSTE_SERVICE] Duplication type de poste:', typePosteId, nouveauNom);
      
      const response = await api.post(`${this.baseUrl}/${typePosteId}/dupliquer`, {
        nouveauNom: nouveauNom
      });
      console.log('✅ [TYPE_POSTE_SERVICE] Type de poste dupliqué:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur duplication:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Calculer le prix pour un plan tarifaire
   */
  async calculerPrixPlan(planId, dureeMinutes) {
    try {
      console.log('💰 [TYPE_POSTE_SERVICE] Calcul prix plan:', planId, dureeMinutes);
      
      const response = await api.post(`/plans-tarifaires/${planId}/calculer-prix`, {
        dureeMinutes: parseInt(dureeMinutes)
      });
      console.log('✅ [TYPE_POSTE_SERVICE] Prix calculé:', response);
      
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur calcul prix:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Récupérer les statistiques d'un type de poste
   */
  // async getTypePosteStatistics(typePosteId, options = {}) {
  //   try {
  //     console.log('📊 [TYPE_POSTE_SERVICE] Récupération statistiques pour type:', typePosteId, options);
      
  //     if (!typePosteId || isNaN(parseInt(typePosteId))) {
  //       throw new Error('ID de type de poste invalide pour les statistiques');
  //     }

  //     const params = new URLSearchParams();
      
  //     // ✅ Paramètres de date
  //     if (options.dateDebut) {
  //       params.append('dateDebut', options.dateDebut);
  //     }
  //     if (options.dateFin) {
  //       params.append('dateFin', options.dateFin);
  //     }
      
  //     // ✅ Période prédéfinie (jour, semaine, mois, année)
  //     if (options.periode) {
  //       params.append('periode', options.periode);
  //     }
      
  //     // ✅ Inclure les détails par poste
  //     if (options.includePostesDetails) {
  //       params.append('includePostesDetails', 'true');
  //     }
      
  //     // ✅ Inclure les données de revenus
  //     if (options.includeRevenus) {
  //       params.append('includeRevenus', 'true');
  //     }

  //     const queryString = params.toString();
  //     const url = `${this.baseUrl}/${typePosteId}/statistics${queryString ? `?${queryString}` : ''}`;
      
  //     const response = await api.get(url);
      
  //     console.log('✅ [TYPE_POSTE_SERVICE] Statistiques récupérées:', response);
  //     return response;
  //   } catch (error) {
  //     console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération statistiques:', error);
  //     throw error;
  //   }
  // }

  /**
   * ✅ NOUVEAU: Récupérer les statistiques globales de tous les types de poste
   */
  async getAllTypesPostesStatistics(options = {}) {
    try {
      console.log('📊 [TYPE_POSTE_SERVICE] Récupération statistiques globales:', options);
      
      const params = new URLSearchParams();
      
      if (options.dateDebut) {
        params.append('dateDebut', options.dateDebut);
      }
      if (options.dateFin) {
        params.append('dateFin', options.dateFin);
      }
      if (options.periode) {
        params.append('periode', options.periode);
      }
      if (options.groupBy) {
        params.append('groupBy', options.groupBy); // 'jour', 'semaine', 'mois'
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Statistiques globales récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération statistiques globales:', error);
      throw error;
    }
  }
// ...existing code...

  /**
   * ✅ CORRECTION: Récupérer les statistiques d'un type de poste
   */
  async getTypePosteStatistics(typePosteId, options = {}) {
    try {
      console.log('📊 [TYPE_POSTE_SERVICE] Récupération statistiques pour type:', typePosteId, options);
      
      if (!typePosteId || isNaN(parseInt(typePosteId))) {
        throw new Error('ID de type de poste invalide pour les statistiques');
      }

      const params = new URLSearchParams();
      
      // ✅ Paramètres de date
      if (options.dateDebut) {
        params.append('dateDebut', options.dateDebut);
      }
      if (options.dateFin) {
        params.append('dateFin', options.dateFin);
      }
      
      // ✅ Période prédéfinie (jour, semaine, mois, année)
      if (options.periode) {
        params.append('periode', options.periode);
      }
      
      // ✅ Inclure les détails par poste
      if (options.includePostesDetails) {
        params.append('includePostesDetails', 'true');
      }
      
      // ✅ Inclure les données de revenus
      if (options.includeRevenus) {
        params.append('includeRevenus', 'true');
      }

      const queryString = params.toString();
      // ✅ CORRECTION: Utiliser 'statistics' au lieu de 'statistiques'
      const url = `${this.baseUrl}/${typePosteId}/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Statistiques récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération statistiques:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer les statistiques globales de tous les types de poste
   */
  async getAllTypesPostesStatistics(options = {}) {
    try {
      console.log('📊 [TYPE_POSTE_SERVICE] Récupération statistiques globales:', options);
      
      const params = new URLSearchParams();
      
      if (options.dateDebut) {
        params.append('dateDebut', options.dateDebut);
      }
      if (options.dateFin) {
        params.append('dateFin', options.dateFin);
      }
      if (options.periode) {
        params.append('periode', options.periode);
      }
      if (options.groupBy) {
        params.append('groupBy', options.groupBy); // 'jour', 'semaine', 'mois'
      }

      const queryString = params.toString();
      // ✅ CORRECTION: Utiliser 'statistics' au lieu de 'statistiques'
      const url = `${this.baseUrl}/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Statistiques globales récupérées:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération statistiques globales:', error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupérer le rapport d'utilisation détaillé
   */
  async getTypePosteUsageReport(typePosteId, options = {}) {
    try {
      console.log('📈 [TYPE_POSTE_SERVICE] Récupération rapport d\'utilisation:', typePosteId, options);
      
      if (!typePosteId || isNaN(parseInt(typePosteId))) {
        throw new Error('ID de type de poste invalide pour le rapport');
      }

      const params = new URLSearchParams();
      
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      if (options.groupBy) params.append('groupBy', options.groupBy);
      if (options.includeHourlyBreakdown) params.append('includeHourlyBreakdown', 'true');

      const queryString = params.toString();
      // ✅ CORRECTION: Utiliser 'usage-report' cohérent
      const url = `${this.baseUrl}/${typePosteId}/usage-report${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Rapport d\'utilisation récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération rapport:', error);
      throw error;
    }
  }

// ...existing code...
  /**
   * ✅ NOUVEAU: Récupérer le rapport d'utilisation détaillé
   */
  async getTypePosteUsageReport(typePosteId, options = {}) {
    try {
      console.log('📈 [TYPE_POSTE_SERVICE] Récupération rapport d\'utilisation:', typePosteId, options);
      
      if (!typePosteId || isNaN(parseInt(typePosteId))) {
        throw new Error('ID de type de poste invalide pour le rapport');
      }

      const params = new URLSearchParams();
      
      if (options.dateDebut) params.append('dateDebut', options.dateDebut);
      if (options.dateFin) params.append('dateFin', options.dateFin);
      if (options.groupBy) params.append('groupBy', options.groupBy);
      if (options.includeHourlyBreakdown) params.append('includeHourlyBreakdown', 'true');

      const queryString = params.toString();
      const url = `${this.baseUrl}/${typePosteId}/rapport-utilisation${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      console.log('✅ [TYPE_POSTE_SERVICE] Rapport d\'utilisation récupéré:', response);
      return response;
    } catch (error) {
      console.error('❌ [TYPE_POSTE_SERVICE] Erreur récupération rapport:', error);
      throw error;
    }
  }
  
}

export const typePosteService = new TypePosteService();
export default typePosteService;