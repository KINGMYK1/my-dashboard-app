import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import posteService from '../services/posteService';

// Hook pour récupérer tous les postes
export function usePostes(includeInactive = false) {
  return useQuery({
    queryKey: ['postes', { includeInactive }],
    queryFn: async () => {
      console.log('🔄 [USE_POSTES] Début récupération postes, includeInactive:', includeInactive);
      
      const response = await posteService.getAllPostes(includeInactive);
      
      console.log('📦 [USE_POSTES] Réponse complète:', response);
      console.log('📦 [USE_POSTES] response.data:', response.data);
      console.log('📦 [USE_POSTES] Type de response.data:', typeof response.data);
      
      // ✅ CORRECTION: Adapter selon la vraie structure de réponse
      let postes = null;
      
      if (response?.data?.data) {
        // Structure: { success: true, data: [...], message: "..." }
        postes = response.data.data;
        console.log('✅ [USE_POSTES] Données extraites via response.data.data');
      } else if (response?.data && Array.isArray(response.data)) {
        // Structure directe: [...]
        postes = response.data;
        console.log('✅ [USE_POSTES] Données extraites via response.data (array direct)');
      } else if (Array.isArray(response)) {
        // Structure ultra-directe: [...]
        postes = response;
        console.log('✅ [USE_POSTES] Données extraites via response (array direct)');
      } else {
        console.error('❌ [USE_POSTES] Structure de réponse non reconnue:', response);
        throw new Error('Structure de réponse API inattendue');
      }
      
      console.log('📋 [USE_POSTES] Postes extraits:', postes);
      console.log('📊 [USE_POSTES] Nombre de postes:', postes?.length || 0);
      
      // ✅ S'assurer que nous retournons toujours un array
      return Array.isArray(postes) ? postes : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('❌ [USE_POSTES] Erreur récupération postes:', error);
    },
    // ✅ Logging supplémentaire pour debug
    onSuccess: (data) => {
      console.log('✅ [USE_POSTES] Succès - Données finales:', data);
      console.log('✅ [USE_POSTES] Nombre de postes chargés:', data?.length || 0);
    }
  });
}

// Hook pour récupérer un poste par ID
export function usePoste(id) {
  return useQuery({
    queryKey: ['poste', id],
    queryFn: async () => {
      console.log('🔄 [USE_POSTE] Début récupération poste ID:', id);
      
      const response = await posteService.getPosteById(id);
      
      console.log('📦 [USE_POSTE] Réponse complète:', response);
      
      // ✅ CORRECTION: Adapter selon la vraie structure de réponse
      let poste = null;
      
      if (response?.data?.data) {
        poste = response.data.data;
      } else if (response?.data && typeof response.data === 'object') {
        poste = response.data;
      } else if (response && typeof response === 'object') {
        poste = response;
      } else {
        console.error('❌ [USE_POSTE] Structure de réponse non reconnue:', response);
        throw new Error('Structure de réponse API inattendue');
      }
      
      console.log('✅ [USE_POSTE] Poste extrait:', poste);
      return poste;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('❌ [USE_POSTE] Erreur récupération poste:', error);
    }
  });
}

// ✅ CORRECTION: Hook pour mettre à jour un poste
export function useUpdatePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (mutationData) => {
      console.log('🔄 [UPDATE_POSTE] Mutation appelée avec:', mutationData);
      
      // ✅ CORRECTION: Gérer les différents formats de données
      let id, data;
      
      if (mutationData.id && mutationData.data) {
        // Format: { id: 1, data: {...} }
        id = mutationData.id;
        data = mutationData.data;
      } else if (mutationData.id && mutationData.posteData) {
        // Format: { id: 1, posteData: {...} }
        id = mutationData.id;
        data = mutationData.posteData;
      } else {
        console.error('❌ [UPDATE_POSTE] Format de données invalide:', mutationData);
        throw new Error('Format de données invalide pour la mise à jour');
      }

      console.log('📝 [UPDATE_POSTE] ID extrait:', id);
      console.log('📝 [UPDATE_POSTE] Données extraites:', data);
      
      // ✅ Validation stricte avec logs détaillés
      if (!id || isNaN(parseInt(id))) {
        console.error('❌ [UPDATE_POSTE] ID invalide:', id);
        throw new Error('ID de poste invalide');
      }
      
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        console.error('❌ [UPDATE_POSTE] Données invalides:', data);
        console.error('❌ [UPDATE_POSTE] Type de data:', typeof data);
        console.error('❌ [UPDATE_POSTE] Clés de data:', data ? Object.keys(data) : 'N/A');
        throw new Error('Données de mise à jour invalides ou vides');
      }

      console.log('✅ [UPDATE_POSTE] Validation réussie, appel du service...');

      const response = await posteService.updatePoste(parseInt(id), data);
      
      // ✅ Extraire les données selon la structure de réponse
      return response?.data?.data || response?.data || response;
    },
    onSuccess: (data, variables) => {
      console.log('✅ [UPDATE_POSTE] Succès:', data);
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      
      // Essayer d'extraire l'ID de différentes façons
      const id = variables.id || variables.data?.id || variables.posteData?.id;
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['poste', id] });
      }
      
      showSuccess(
        data?.message || 
        translations?.posteUpdatedSuccess || 
        'Poste mis à jour avec succès'
      );
    },
    onError: (error, variables) => {
      console.error('❌ [UPDATE_POSTE] Erreur:', error);
      console.error('❌ [UPDATE_POSTE] Variables:', variables);
      showError(
        error?.response?.data?.message || 
        error?.message || 
        translations?.errorUpdatingPoste || 
        'Erreur lors de la mise à jour du poste'
      );
    }
  });
}

// ✅ CORRECTION: Hook pour changer l'état d'un poste
export function useChangerEtatPoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, etat, notesMaintenance }) => {
      console.log('🔄 [CHANGER_ETAT_POSTE] Données reçues:', { id, etat, notesMaintenance });
      
      // ✅ Validation stricte
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de poste invalide');
      }
      
      if (!etat) {
        throw new Error('Nouvel état requis');
      }

      const payload = {
        nouvelEtat: etat // ✅ Utiliser 'nouvelEtat' comme attendu par le backend
      };

      // Ajouter les notes de maintenance si fournie
      if (notesMaintenance?.trim()) {
        payload.notesMaintenance = notesMaintenance.trim();
      }

      console.log('📝 [CHANGER_ETAT_POSTE] Payload envoyé:', payload);

      const response = await posteService.changerEtatPoste(parseInt(id), payload);
      
      // ✅ Extraire les données selon la structure de réponse
      return response?.data?.data || response?.data || response;
    },
    onSuccess: (data, variables) => {
      console.log('✅ [CHANGER_ETAT_POSTE] Succès:', data);
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      queryClient.invalidateQueries({ queryKey: ['poste', variables.id] });
      
      showSuccess(
        data?.message || 
        translations?.posteStateChangedSuccess || 
        `État du poste changé vers "${variables.etat}" avec succès`
      );
    },
    onError: (error, variables) => {
      console.error('❌ [CHANGER_ETAT_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || 
        error?.message || 
        translations?.errorChangingPosteState || 
        'Erreur lors du changement d\'état du poste'
      );
    }
  });
}

// Hook pour créer un poste
export function useCreatePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (data) => {
      console.log('📝 [CREATE_POSTE] Données reçues:', data);
      
      // ✅ Validation de base
      if (!data.nom || !data.typePosteId) {
        throw new Error('Le nom et le type de poste sont requis');
      }

      const response = await posteService.createPoste(data);
      
      // ✅ Extraire les données selon la structure de réponse
      return response?.data?.data || response?.data || response;
    },
    onSuccess: (data) => {
      console.log('✅ [CREATE_POSTE] Succès:', data);
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      
      showSuccess(
        data?.message || 
        translations?.posteCreatedSuccess || 
        'Poste créé avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [CREATE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || 
        error?.message || 
        translations?.errorCreatingPoste || 
        'Erreur lors de la création du poste'
      );
    }
  });
}

// Hook pour supprimer un poste
export function useDeletePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (id) => {
      console.log('🗑️ [DELETE_POSTE] ID:', id);
      
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID de poste invalide');
      }

      const response = await posteService.deletePoste(parseInt(id));
      
      // ✅ Extraire les données selon la structure de réponse
      return response?.data || response;
    },
    onSuccess: (data) => {
      console.log('✅ [DELETE_POSTE] Succès:', data);
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      
      showSuccess(
        data?.message || 
        translations?.posteDeletedSuccess || 
        'Poste supprimé avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [DELETE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || 
        error?.message || 
        translations?.errorDeletingPoste || 
        'Erreur lors de la suppression du poste'
      );
    }
  });
}

// Hook pour obtenir les statistiques d'un poste
export function usePosteStatistics(id) {
  return useQuery({
    queryKey: ['poste-statistics', id],
    queryFn: async () => {
      console.log('📊 [USE_POSTE_STATISTICS] Début récupération statistiques ID:', id);
      
      const response = await posteService.getPosteStatistics(id);
      
      console.log('📦 [USE_POSTE_STATISTICS] Réponse:', response);
      
      // ✅ Extraire les données selon la structure de réponse
      let statistics = null;
      
      if (response?.data?.data) {
        statistics = response.data.data;
      } else if (response?.data) {
        statistics = response.data;
      } else {
        statistics = response;
      }
      
      console.log('✅ [USE_POSTE_STATISTICS] Statistiques extraites:', statistics);
      return statistics;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les statistiques
    onError: (error) => {
      console.error('❌ [USE_POSTE_STATISTICS] Erreur récupération statistiques:', error);
    }
  });
}

// ✅ AJOUT: Hook spécialisé pour récupérer les postes disponibles pour une session
export function usePostesDisponibles() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['postes', 'disponibles'],
    queryFn: async () => {
      console.log('🔄 [USE_POSTES_DISPONIBLES] Récupération postes disponibles');
      
      const response = await posteService.getAllPostes(false); // Seulement les actifs
      
      // Extraire les données selon la structure de réponse
      let postes = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        postes = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        postes = response.data;
      } else if (Array.isArray(response)) {
        postes = response;
      }
      
      // Filtrer les postes disponibles uniquement
      const postesDisponibles = postes.filter(poste => 
        poste.estActif && 
        (poste.etat === 'Disponible' || poste.etat === 'disponible') &&
        poste.typePoste // S'assurer qu'il a un type
      );
      
      console.log('✅ [USE_POSTES_DISPONIBLES] Postes disponibles:', postesDisponibles.length);
      
      return postesDisponibles;
    },
    staleTime: 30000, // 30 secondes - plus court pour les sessions
    refetchInterval: 60000, // Actualiser toutes les minutes
    onError: (error) => {
      console.error('❌ [USE_POSTES_DISPONIBLES] Erreur:', error);
      showError(translations?.errorLoadingPostes || 'Erreur lors du chargement des postes');
    }
  });
}