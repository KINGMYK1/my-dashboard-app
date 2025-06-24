import apiService from '../api/apiService';

class SessionHistoriqueService {
  constructor() {
    this.baseUrl = '/sessions/historique';
  }

  // Récupérer l'historique des sessions avec filtres
  async getSessionsHistorique(filtres = {}) {
    try {
      console.log('🔍 [SESSION_HISTORIQUE_SERVICE] Récupération historique avec filtres:', filtres);
      
      // Construire les paramètres de requête avec mapping correct
      const params = new URLSearchParams();
      
      // Mapping des filtres vers les paramètres API attendus
      const paramMapping = {
        page: 'page',
        limit: 'limit',
        sortBy: 'orderBy',
        sortOrder: 'orderDirection',
        dateDebut: 'dateDebut',
        dateFin: 'dateFin',
        statuts: 'statut',
        posteIds: 'posteId',
        clientIds: 'clientId',
        montantMin: 'montantMin',
        montantMax: 'montantMax'
      };

      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          const paramName = paramMapping[key] || key;
          
          // Gestion des tableaux (statuts, posteIds, clientIds)
          if (Array.isArray(value)) {
            value.forEach(val => {
              if (val !== '' && val !== null && val !== undefined) {
                params.append(paramName, val);
              }
            });
          } else {
            // Conversion de sortOrder
            if (key === 'sortOrder') {
              value = value.toUpperCase(); // desc -> DESC
            }
            params.append(paramName, value);
          }
        }
      });

      console.log('📤 [SESSION_HISTORIQUE_SERVICE] Paramètres envoyés:', params.toString());

      const response = await apiService.get(`${this.baseUrl}?${params.toString()}`);
      
      console.log('✅ [SESSION_HISTORIQUE_SERVICE] Réponse brute:', response);
      console.log('✅ [SESSION_HISTORIQUE_SERVICE] Données reçues:', response.data);
      
      // Normaliser la structure de réponse
      const normalizedData = this.normalizeHistoriqueResponse(response.data);
      
      console.log('🔧 [SESSION_HISTORIQUE_SERVICE] Données normalisées:', normalizedData);
      
      return normalizedData;
    } catch (error) {
      console.error('❌ [SESSION_HISTORIQUE_SERVICE] Erreur récupération historique:', error);
      console.error('❌ [SESSION_HISTORIQUE_SERVICE] Détails erreur:', error.response?.data);
      throw error;
    }
  }

  // Normaliser la réponse de l'API
  normalizeHistoriqueResponse(apiResponse) {
    // Cas 1: Réponse avec structure { success, data, pagination }
    if (apiResponse && typeof apiResponse === 'object') {
      // Si les données sont directement dans apiResponse.data
      if (apiResponse.data && Array.isArray(apiResponse.data)) {
        return {
          data: apiResponse.data.map(session => this.normalizeSessionData(session)),
          pagination: apiResponse.pagination || this.generateDefaultPagination(apiResponse.data.length),
          success: apiResponse.success !== false
        };
      }
      
      // Si les données sont directement un tableau
      if (Array.isArray(apiResponse)) {
        return {
          data: apiResponse.map(session => this.normalizeSessionData(session)),
          pagination: this.generateDefaultPagination(apiResponse.length),
          success: true
        };
      }
      
      // Si la structure est différente, essayer d'extraire les données
      const sessions = apiResponse.sessions || apiResponse.items || apiResponse.results || [];
      const pagination = apiResponse.pagination || apiResponse.meta || {};
      
      return {
        data: Array.isArray(sessions) ? sessions.map(session => this.normalizeSessionData(session)) : [],
        pagination: this.normalizePagination(pagination, sessions.length),
        success: apiResponse.success !== false
      };
    }
    
    // Cas par défaut: retourner une structure vide
    console.warn('⚠️ [SESSION_HISTORIQUE_SERVICE] Structure de réponse inattendue:', apiResponse);
    return {
      data: [],
      pagination: this.generateDefaultPagination(0),
      success: false
    };
  }

  // ✅ CORRECTION MAJEURE: Extraction améliorée des informations de transaction
  extractTransactionInfo(transactions) {
    console.log('💰 [SESSION_HISTORIQUE] Analyse transactions:', transactions);
    
    // Gérer le cas où transactions est un objet unique
    if (transactions && !Array.isArray(transactions)) {
      transactions = [transactions];
    }
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return {
        montantPaye: 0,
        montantTotal: 0,
        resteAPayer: 0,
        estPayee: false,
        modePaiement: null,
        statutTransaction: 'AUCUNE',
        numeroTransaction: null
      };
    }

    // Prendre la première transaction valide (la plus récente normalement)
    const transaction = transactions[0];
    
    // ✅ NOUVELLE LOGIQUE: Extraire les montants depuis la transaction ET la session
    const extractedInfo = {
      montantPaye: parseFloat(transaction.montantPaye || transaction.montantEncaisse || 0),
      montantTotal: parseFloat(transaction.montantTTC || transaction.totalTTC || 0),
      resteAPayer: parseFloat(transaction.resteAPayer || 0),
      estPayee: transaction.statutTransaction === 'VALIDEE' || 
                transaction.statut === 'VALIDEE' || 
                transaction.estPayee === true,
      modePaiement: transaction.modePaiement || transaction.mode_paiement || 'ESPECES',
      statutTransaction: transaction.statutTransaction || transaction.statut || 'EN_ATTENTE',
      numeroTransaction: transaction.numeroTransaction || transaction.numero || null,
      dateTransaction: transaction.dateHeure || transaction.createdAt || null
    };

    console.log('💰 [SESSION_HISTORIQUE] Info transaction extraite:', extractedInfo);
    return extractedInfo;
  }

  // Normaliser les données d'une session - CORRECTION PRINCIPALE
  normalizeSessionData(session) {
    if (!session || typeof session !== 'object') {
      return session;
    }

    console.log('🔧 [SESSION_HISTORIQUE_SERVICE] Session brute:', {
      id: session.id,
      dureeReelleMinutes: session.dureeReelleMinutes,
      montantTotal: session.montantTotal,
      montantPaye: session.montantPaye,
      resteAPayer: session.resteAPayer,
      estPayee: session.estPayee,
      transactions: session.transactions,
      dateHeureDebut: session.dateHeureDebut,
      dateHeureFin: session.dateHeureFin
    });

    // ✅ CORRECTION: Calculer la durée si elle n'existe pas
    let dureeEffectiveCalculee = session.dureeReelleMinutes || session.dureeEffectiveMinutes || 0;
    
    // Si la durée est 0 mais qu'on a les dates de début et fin, on calcule
    if (dureeEffectiveCalculee === 0 && session.dateHeureDebut && session.dateHeureFin) {
      const debut = new Date(session.dateHeureDebut);
      const fin = new Date(session.dateHeureFin);
      const diffMs = fin.getTime() - debut.getTime();
      const diffMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
      
      // Soustraire le temps de pause s'il existe
      const tempsPause = session.tempsPauseTotalMinutes || 0;
      dureeEffectiveCalculee = Math.max(0, diffMinutes - tempsPause);
      
      console.log('🕒 [SESSION_HISTORIQUE_SERVICE] Durée calculée:', {
        debut: debut.toISOString(),
        fin: fin.toISOString(),
        diffMinutes,
        tempsPause,
        dureeEffectiveCalculee
      });
    }

    // ✅ CORRECTION: Mapping correct des montants
    let coutCalculeFinal = session.montantTotal || session.coutCalculeFinal || session.cout || session.cost || 0;
    
    // ✅ NOUVEAU: Extraire les informations de paiement directement depuis la session
    const montantPaye = parseFloat(session.montantPaye || 0);
    const resteAPayer = parseFloat(session.resteAPayer || coutCalculeFinal);
    const estPayee = session.estPayee || (montantPaye >= coutCalculeFinal && coutCalculeFinal > 0);

    // ✅ NOUVEAU: Déterminer le statut de paiement
    let statutPaiement = 'NON_PAYEE';
    if (estPayee) {
      statutPaiement = 'PAYEE';
    } else if (montantPaye > 0) {
      statutPaiement = 'PARTIELLE';
    }

    const normalizedSession = {
      id: session.id,
      numeroSession: session.numeroSession || session.numero || session.sessionNumber,
      statut: session.statut || session.status || 'INCONNU',
      dateHeureDebut: session.dateHeureDebut || session.dateDebut || session.startTime,
      dateHeureFin: session.dateHeureFin || session.dateFin || session.endTime,
      
      // ✅ CORRECTION: Utiliser les valeurs calculées
      dureeEffectiveMinutes: dureeEffectiveCalculee,
      tempsPauseTotalMinutes: session.tempsPauseTotalMinutes || session.pauseDuration || 0,
      coutCalculeFinal: parseFloat(coutCalculeFinal) || 0,
      
      // ✅ NOUVEAU: Informations de paiement correctes
      montantPaye: montantPaye,
      resteAPayer: resteAPayer,
      estPayee: estPayee,
      statutPaiement: statutPaiement,
      modePaiement: session.modePaiement || null,
      
      notes: session.notes || session.commentaire || session.comment || '',
      
      // Informations client
      client: session.client ? {
        id: session.client.id,
        nom: session.client.nom || session.client.lastName,
        prenom: session.client.prenom || session.client.firstName,
        email: session.client.email,
        telephone: session.client.telephone || session.client.phone
      } : null,
      
      // Informations poste
      poste: session.poste ? {
        id: session.poste.id,
        nom: session.poste.nom || session.poste.name,
        typePoste: session.poste.typePoste ? {
          id: session.poste.typePoste.id,
          nom: session.poste.typePoste.nom || session.poste.typePoste.name,
          tarifHoraireBase: session.poste.typePoste.tarifHoraireBase || session.poste.typePoste.hourlyRate || 0
        } : null
      } : null,
      
      // ✅ CORRECTION: Informations transaction améliorées
      transaction: this.extractTransactionInfo(session.transactions || session.transaction),
      
      // Dates de gestion
      dateCreation: session.createdAt || session.dateCreation,
      dateMiseAJour: session.updatedAt || session.dateMiseAJour,
      
      // Utilisateurs
      utilisateurDemarrage: session.utilisateurDemarrage || session.startedBy,
      utilisateurCloture: session.utilisateurCloture || session.closedBy
    };

    console.log('✅ [SESSION_HISTORIQUE_SERVICE] Session normalisée:', {
      id: normalizedSession.id,
      dureeEffectiveMinutes: normalizedSession.dureeEffectiveMinutes,
      coutCalculeFinal: normalizedSession.coutCalculeFinal,
      montantPaye: normalizedSession.montantPaye,
      resteAPayer: normalizedSession.resteAPayer,
      estPayee: normalizedSession.estPayee,
      statutPaiement: normalizedSession.statutPaiement,
      transaction: normalizedSession.transaction,
      statut: normalizedSession.statut
    });

    return normalizedSession;
  }

  // Normaliser la pagination
  normalizePagination(pagination, dataLength = 0) {
    if (!pagination || typeof pagination !== 'object') {
      return this.generateDefaultPagination(dataLength);
    }

    return {
      currentPage: pagination.currentPage || pagination.page || 1,
      totalPages: pagination.totalPages || pagination.pages || Math.ceil((pagination.total || dataLength) / (pagination.limit || 10)),
      limit: pagination.limit || pagination.perPage || 10,
      total: pagination.total || pagination.count || dataLength,
      hasNext: pagination.hasNext || (pagination.currentPage || 1) < (pagination.totalPages || 1),
      hasPrev: pagination.hasPrev || (pagination.currentPage || 1) > 1
    };
  }

  // Générer une pagination par défaut
  generateDefaultPagination(dataLength) {
    return {
      currentPage: 1,
      totalPages: Math.ceil(dataLength / 10),
      limit: 10,
      total: dataLength,
      hasNext: dataLength > 10,
      hasPrev: false
    };
  }

  // Récupérer les statistiques d'historique
  async getStatistiquesHistorique(periode) {
    try {
      console.log('🔍 [SESSION_HISTORIQUE_SERVICE] Récupération statistiques pour période:', periode);
      
      const response = await apiService.get(`${this.baseUrl}/statistiques`, {
        params: { periode }
      });
      
      console.log('✅ [SESSION_HISTORIQUE_SERVICE] Statistiques reçues:', response.data);
      
      // Normaliser les statistiques
      const stats = response.data?.data || response.data || {};
      
      return {
        data: {
          totalSessions: stats.totalSessions || stats.total || 0,
          totalRevenue: stats.totalRevenue || stats.revenue || 0,
          totalDuration: stats.totalDuration || stats.duration || 0,
          satisfactionRate: stats.satisfactionRate || stats.satisfaction || 0,
          averageSessionDuration: stats.averageSessionDuration || stats.avgDuration || 0,
          completionRate: stats.completionRate || stats.completion || 0
        },
        success: true
      };
    } catch (error) {
      console.error('❌ [SESSION_HISTORIQUE_SERVICE] Erreur récupération statistiques:', error);
      // Retourner des statistiques par défaut en cas d'erreur
      return {
        data: {
          totalSessions: 0,
          totalRevenue: 0,
          totalDuration: 0,
          satisfactionRate: 0,
          averageSessionDuration: 0,
          completionRate: 0
        },
        success: false
      };
    }
  }

  // Récupérer les détails complets d'une session
  async getSessionDetails(sessionId) {
    try {
      console.log('🔍 [SESSION_HISTORIQUE_SERVICE] Récupération détails session:', sessionId);
      
      const response = await apiService.get(`/sessions/${sessionId}/details`);
      
      console.log('✅ [SESSION_HISTORIQUE_SERVICE] Détails session reçus:', response.data);
      
      return {
        data: this.normalizeSessionData(response.data?.data || response.data),
        success: true
      };
    } catch (error) {
      console.error('❌ [SESSION_HISTORIQUE_SERVICE] Erreur récupération détails:', error);
      throw error;
    }
  }

  // Exporter l'historique
  async exporterHistorique(filtres, format = 'csv') {
    try {
      console.log('📤 [SESSION_HISTORIQUE_SERVICE] Export historique:', { filtres, format });
      
      const params = new URLSearchParams();
      params.append('format', format);
      
      Object.entries(filtres).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(val => params.append(key, val));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await apiService.get(`${this.baseUrl}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historique-sessions-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [SESSION_HISTORIQUE_SERVICE] Export terminé');
      return { success: true };
    } catch (error) {
      console.error('❌ [SESSION_HISTORIQUE_SERVICE] Erreur export:', error);
      throw error;
    }
  }
}

export const sessionHistoriqueService = new SessionHistoriqueService();