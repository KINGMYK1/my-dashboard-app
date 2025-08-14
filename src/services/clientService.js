import { api } from '../api/apiService';

class ClientService {
  /**
   * Récupérer tous les clients avec filtrage avancé et pagination
   */
  async getAllClients(params = {}) {
    try {
      console.log('👥 [CLIENT_SERVICE] Récupération clients:', params);
      
      const response = await api.get('/clients', { params });
      console.log('✅ [CLIENT_SERVICE] Clients récupérés:', response);
      
      return {
        success: true,
        clients: response.data?.clients || response.data || [],
        pagination: response.pagination || {},
        message: response.message || 'Clients récupérés avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération clients:', error);
      throw error;
    }
  }

  /**
   * Récupérer un client par ID avec ses relations
   */
  async getClientById(id) {
    try {
      console.log(`👤 [CLIENT_SERVICE] Récupération client ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID client invalide');
      }
      
      const response = await api.get(`/clients/${parseInt(id)}`);
      console.log('✅ [CLIENT_SERVICE] Client récupéré:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Client récupéré avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération client:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau client NORMAL (pas de client système via cette méthode)
   */
  async createClient(clientData) {
    try {
      console.log('➕ [CLIENT_SERVICE] Création client normal:', clientData.prenom, clientData.nom);
      
      // Structure conforme au nouveau backend
      const payload = {
        prenom: clientData.prenom.trim(),
        nom: clientData.nom.trim(),
        email: clientData.email?.trim() || null,
        telephone: clientData.telephone?.trim() || null,
        dateNaissance: clientData.dateNaissance || null,
        adresse: clientData.adresse?.trim() || null,
        pseudoPrefere: clientData.pseudoPrefere?.trim() || null,
        jeuxPreferes: Array.isArray(clientData.jeuxPreferes) ? clientData.jeuxPreferes : [],
        notes: clientData.notes?.trim() || null,
        sourceAcquisition: clientData.sourceAcquisition?.trim() || null,
        // ✅ Nouveaux champs - toujours STANDARD pour les clients créés via l'interface
        typeClient: 'STANDARD',
        isSystemClient: false,
        estActif: clientData.estActif !== undefined ? clientData.estActif : true
      };

      const response = await api.post('/clients', payload);
      console.log('✅ [CLIENT_SERVICE] Client créé:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Client créé avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur création client:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un client existant
   */
  async updateClient(id, clientData) {
    try {
      console.log(`✏️ [CLIENT_SERVICE] Mise à jour client ID: ${id}`, clientData.prenom, clientData.nom);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID client invalide pour la mise à jour');
      }

      // Structure conforme au nouveau backend
      const payload = {
        prenom: clientData.prenom.trim(),
        nom: clientData.nom.trim(),
        email: clientData.email?.trim() || null,
        telephone: clientData.telephone?.trim() || null,
        dateNaissance: clientData.dateNaissance || null,
        adresse: clientData.adresse?.trim() || null,
        pseudoPrefere: clientData.pseudoPrefere?.trim() || null,
        jeuxPreferes: Array.isArray(clientData.jeuxPreferes) ? clientData.jeuxPreferes : [],
        notes: clientData.notes?.trim() || null,
        sourceAcquisition: clientData.sourceAcquisition?.trim() || null,
        estActif: clientData.estActif !== undefined ? clientData.estActif : true
        // ✅ Ne pas inclure typeClient et isSystemClient dans les mises à jour
        // Ces champs sont protégés côté backend
      };

      const response = await api.put(`/clients/${parseInt(id)}`, payload);
      console.log('✅ [CLIENT_SERVICE] Client mis à jour:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Client mis à jour avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur mise à jour client:', error);
      throw error;
    }
  }

  /**
   * Basculer le statut actif/inactif d'un client
   */
  async toggleClientStatus(id) {
    try {
      console.log(`🔄 [CLIENT_SERVICE] Changement statut client ID: ${id}`);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID client invalide pour le changement de statut');
      }
      
      const response = await api.patch(`/clients/${parseInt(id)}/toggle-status`);
      console.log('✅ [CLIENT_SERVICE] Statut client mis à jour:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Statut mis à jour avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur changement statut client:', error);
      throw error;
    }
  }

  /**
   * Rechercher des clients (exclut automatiquement le client système)
   */
  async searchClients(searchTerm, options = {}) {
    try {
      console.log(`🔍 [CLIENT_SERVICE] Recherche clients: "${searchTerm}"`);
      if (!searchTerm || searchTerm.length < 2) {
        return { success: true, clients: [], total: 0 };
      }
      
      const params = { 
        q: searchTerm, // ✅ Changé de 'search' à 'q' selon le backend
        ...options
      };
      
      const response = await api.get('/clients/search', { params });
      console.log('✅ [CLIENT_SERVICE] Recherche clients réussie:', response);
      
      return {
        success: true,
        clients: response.data || [],
        total: response.data?.length || 0,
        message: response.message || 'Recherche effectuée avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur recherche clients:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques d'un client
   */
  async getClientStats(clientId) {
    try {
      console.log(`📊 [CLIENT_SERVICE] Récupération stats client ID: ${clientId}`);
      
      if (!clientId || isNaN(parseInt(clientId))) {
        throw new Error('ID client invalide');
      }
      
      const response = await api.get(`/clients/${parseInt(clientId)}/stats`);
      console.log('✅ [CLIENT_SERVICE] Stats client récupérées:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Statistiques récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération stats client:', error);
      throw error;
    }
  }

  /**
   * Récupérer le client système
   */
  async getSystemClient() {
    try {
      console.log('🎲 [CLIENT_SERVICE] Récupération du client système');
      
      const response = await api.get('/clients/system');
      console.log('✅ [CLIENT_SERVICE] Client système récupéré:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Client système récupéré avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération client système:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques générales des clients
   */
  async getGlobalClientStats() {
    try {
      console.log('📊 [CLIENT_SERVICE] Récupération statistiques globales clients');
      
      const response = await api.get('/clients/stats/global');
      console.log('✅ [CLIENT_SERVICE] Statistiques globales récupérées:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Statistiques récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération statistiques globales:', error);
      throw error;
    }
  }

  /**
   * Ajouter une note à un client
   */
  async addClientNote(clientId, noteData) {
    try {
      console.log(`📝 [CLIENT_SERVICE] Ajout note client ID: ${clientId}`, noteData);
      
      if (!clientId || isNaN(parseInt(clientId))) {
        throw new Error('ID client invalide');
      }

      if (!noteData.contenu || !noteData.contenu.trim()) {
        throw new Error('Le contenu de la note ne peut pas être vide');
      }

      if (noteData.contenu.trim().length > 1000) {
        throw new Error('La note ne peut pas dépasser 1000 caractères');
      }

      const payload = {
        contenu: noteData.contenu.trim(),
        type: noteData.type || 'MANUELLE'
      };

      const response = await api.post(`/clients/${parseInt(clientId)}/notes`, payload);
      console.log('✅ [CLIENT_SERVICE] Note ajoutée:', response);
      
      return {
        success: true,
        data: response.data,
        message: response.message || 'Note ajoutée avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur ajout note client:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notes d'un client
   */
  async getClientNotes(clientId, options = {}) {
    try {
      console.log(`📋 [CLIENT_SERVICE] Récupération notes client ID: ${clientId}`, options);
      
      if (!clientId || isNaN(parseInt(clientId))) {
        throw new Error('ID client invalide');
      }
      
      const params = {
        page: options.page || 1,
        limit: options.limit || 10
      };
      
      const response = await api.get(`/clients/${parseInt(clientId)}/notes`, { params });
      console.log('✅ [CLIENT_SERVICE] Notes client récupérées:', response);
      
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || {},
        message: response.message || 'Notes récupérées avec succès'
      };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur récupération notes client:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'unicité d'un champ (email ou téléphone)
   */
  async checkFieldUniqueness(field, value, excludeId = null) {
    try {
      console.log(`🔍 [CLIENT_SERVICE] Vérification unicité: ${field} = ${value} (excludeId: ${excludeId})`);
      
      if (!field || !value) {
        return true;
      }
      
      const params = { field, value };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      
      const response = await api.get('/clients/check-uniqueness', { params });
      console.log(`✅ [CLIENT_SERVICE] Unicité ${field} pour ${value}:`, response.data.isUnique);
      
      return response.data.isUnique;
    } catch (error) {
      console.error(`❌ [CLIENT_SERVICE] Erreur vérification unicité ${field}:`, error);
      return false;
    }
  }

  // ✅ SUPPRESSION DES MÉTHODES OBSOLÈTES
  // - fusionnerClients (fonctionnalité supprimée)
  // - getTopClients (remplacé par les stats globales)
  // - getClientsInactifs (remplacé par les filtres dans getAllClients)
  // - exporterClients (garde la version frontend)

  /**
   * Exporter les clients (version frontend)
   */
  async exportClients({ format, data }) {
    try {
      let fileContent;
      let mimeType;
      let filenameExtension;

      if (format === 'csv') {
        fileContent = this.convertToCsv(data);
        mimeType = 'text/csv';
        filenameExtension = 'csv';
      } else if (format === 'xlsx') {
        fileContent = await this.convertToXlsx(data);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filenameExtension = 'xlsx';
      } else {
        throw new Error('Format non supporté');
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.${filenameExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export réussi' };
    } catch (error) {
      console.error('❌ [CLIENT_SERVICE] Erreur export:', error);
      throw error;
    }
  }

  convertToCsv(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(value => {
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','));

    return [headers, ...rows].join('\n');
  }

  async convertToXlsx(data) {
    const headers = Object.keys(data[0]).join('\t');
    const rows = data.map(row => Object.values(row).join('\t'));
    const textContent = [headers, ...rows].join('\n');
    return new Blob([textContent], { type: 'text/plain' });
  }
}

export default new ClientService();