import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import typePosteService from '../services/typePosteService';
import TarifService from '../services/tarifService';

// ✅ Hook principal pour récupérer tous les types de postes avec enrichissement des données
export function useTypesPostes(includeInactive = false) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typesPostes', { includeInactive }],
    queryFn: async () => {
      try {
        console.log('🔄 [TYPES_POSTES] Récupération depuis API...');
        const response = await typePosteService.getAllTypesPostes(includeInactive);
        
        // ✅ Enrichir les données avec calculs côté client
        const typesEnrichis = (response.data || []).map(type => ({
          ...type,
          // Ajouter des métadonnées calculées
          nombrePlansActifs: type.plansTarifaires?.filter(p => p.estActif).length || 0,
          prixMinimum: type.plansTarifaires?.length > 0 
            ? Math.min(...type.plansTarifaires.filter(p => p.estActif).map(p => p.prix))
            : type.tarifHoraireBase || 0,
          prixMaximum: type.plansTarifaires?.length > 0
            ? Math.max(...type.plansTarifaires.filter(p => p.estActif).map(p => p.prix))
            : type.tarifHoraireBase || 0,
          // Calculs additionnels pour l'interface
          tarifHoraireFormate: TarifService.formaterPrix(type.tarifHoraireBase, type.devise),
          hasPlansTarifaires: type.plansTarifaires?.length > 0,
          plansMisEnAvant: type.plansTarifaires?.filter(p => p.estActif && p.estMisEnAvant) || []
        }));

        console.log('✅ [TYPES_POSTES] Données enrichies:', typesEnrichis.length);
        return typesEnrichis;
      } catch (error) {
        console.error('❌ [TYPES_POSTES] Erreur récupération:', error);
        showError(error?.response?.data?.message || error?.message || translations?.errorLoadingTypesPostes || 'Erreur de chargement des types de postes');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}

// ✅ Hook pour récupérer un type de poste par ID (conservé pour compatibilité)
export function useTypePoste(typePosteId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typePoste', typePosteId],
    queryFn: async () => {
      if (!typePosteId) return null;
      try {
        console.log('🔄 [TYPE_POSTE] Récupération ID:', typePosteId);
        const response = await typePosteService.getTypePosteById(typePosteId);
        return response.data;
      } catch (error) {
        console.error('❌ [TYPE_POSTE] Erreur récupération:', error);
        showError(error?.response?.data?.message || error?.message || translations?.errorLoadingTypePoste || "Erreur lors du chargement du type de poste");
        throw error;
      }
    },
    enabled: !!typePosteId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ✅ Hook pour calculs de prix en temps réel (côté client uniquement)
export function useCalculerPrixSession(typePosteId, dureeMinutes, options = {}) {
  const { data: typesPostes, isLoading } = useTypesPostes();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        data: null,
        isLoading: true,
        error: null
      };
    }

    if (!typePosteId || !dureeMinutes || !typesPostes) {
      return {
        data: null,
        isLoading: false,
        error: null
      };
    }

    const typePoste = typesPostes.find(t => t.id === parseInt(typePosteId));
    if (!typePoste) {
      return {
        data: null,
        isLoading: false,
        error: 'Type de poste non trouvé'
      };
    }

    try {
      // ✅ Calcul instantané côté client avec TarifService
      const resultat = TarifService.calculerPrixSession(typePoste, dureeMinutes, options);
      
      return {
        data: resultat,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('❌ [CALCUL_PRIX] Erreur:', error);
      return {
        data: null,
        isLoading: false,
        error: error.message || 'Erreur de calcul'
      };
    }
  }, [typePosteId, dureeMinutes, typesPostes, options, isLoading]);
}

// ✅ Hook pour obtenir le meilleur plan tarifaire
export function useMeilleurPlan(typePosteId, dureeMinutes) {
  const { data: typesPostes, isLoading } = useTypesPostes();
  
  return useMemo(() => {
    if (isLoading || !typePosteId || !dureeMinutes || !typesPostes) return null;
    
    const typePoste = typesPostes.find(t => t.id === parseInt(typePosteId));
    if (!typePoste) return null;

    try {
      return TarifService.obtenirMeilleurPlan(typePoste, dureeMinutes);
    } catch (error) {
      console.error('❌ [MEILLEUR_PLAN] Erreur:', error);
      return null;
    }
  }, [typePosteId, dureeMinutes, typesPostes, isLoading]);
}

// ✅ Hook pour simulation de scénarios tarifaires
export function useSimulerTarifs(typePosteId, dureeMinutes) {
  const { data: typesPostes, isLoading } = useTypesPostes();
  
  return useMemo(() => {
    if (isLoading || !typePosteId || !dureeMinutes || !typesPostes) return [];
    
    const typePoste = typesPostes.find(t => t.id === parseInt(typePosteId));
    if (!typePoste) return [];

    try {
      return TarifService.simulerScenarios(typePoste, dureeMinutes);
    } catch (error) {
      console.error('❌ [SIMULATION_TARIFS] Erreur:', error);
      return [];
    }
  }, [typePosteId, dureeMinutes, typesPostes, isLoading]);
}

// ✅ Hook pour statistiques d'un type de poste (API + calculs locaux)
export function useTypePosteStatistics(typePosteId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typePosteStatistics', typePosteId],
    queryFn: async () => {
      try {
        console.log('📊 [TYPE_POSTE_STATS] Récupération statistiques:', typePosteId);
        const response = await typePosteService.getTypePosteStatistics(typePosteId);
        return response.data;
      } catch (error) {
        console.error('❌ [TYPE_POSTE_STATS] Erreur:', error);
        showError(error?.response?.data?.message || error?.message || translations?.errorLoadingStatistics || 'Erreur de chargement des statistiques');
        throw error;
      }
    },
    enabled: !!typePosteId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  });
}

// ✅ CORRECTION: Hook pour créer un type de poste (amélioré)
export function useCreateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (data) => {
      console.log('📝 [CREATE_TYPE_POSTE] Données reçues:', data);
      
      // ✅ CORRECTION: Gérer les différents formats de données
      let typePosteData, plansTarifaires;
      
      if (data.typePosteData && data.plansTarifaires !== undefined) {
        // Format: { typePosteData: {...}, plansTarifaires: [...] }
        typePosteData = data.typePosteData;
        plansTarifaires = data.plansTarifaires || [];
      } else if (data.data && data.plansTarifaires !== undefined) {
        // Format: { data: {...}, plansTarifaires: [...] }
        typePosteData = data.data;
        plansTarifaires = data.plansTarifaires || [];
      } else {
        // Format direct: { nom, tarifHoraireBase, ... }
        typePosteData = data;
        plansTarifaires = [];
      }

      console.log('📝 [CREATE_TYPE_POSTE] Données extraites:', { typePosteData, plansTarifaires });
      
      // ✅ Validation côté client renforcée avec logs détaillés
      console.log('🔍 [CREATE_TYPE_POSTE] Validation - nom:', typePosteData?.nom);
      console.log('🔍 [CREATE_TYPE_POSTE] Validation - nom après trim:', typePosteData?.nom?.trim());
      
      if (!typePosteData?.nom?.trim()) {
        console.error('❌ [CREATE_TYPE_POSTE] Validation échouée: nom manquant ou vide');
        console.error('❌ [CREATE_TYPE_POSTE] typePosteData:', typePosteData);
        throw new Error('Le nom du type de poste est requis');
      }
      
      if (!typePosteData.tarifHoraireBase || isNaN(parseFloat(typePosteData.tarifHoraireBase)) || parseFloat(typePosteData.tarifHoraireBase) <= 0) {
        console.error('❌ [CREATE_TYPE_POSTE] Validation échouée: tarif invalide');
        console.error('❌ [CREATE_TYPE_POSTE] tarifHoraireBase:', typePosteData.tarifHoraireBase);
        throw new Error('Le tarif horaire doit être supérieur à 0');
      }

      console.log('✅ [CREATE_TYPE_POSTE] Validation réussie, envoi vers le service...');

      const response = await typePosteService.createTypePoste(typePosteData, plansTarifaires);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ [CREATE_TYPE_POSTE] Succès:', data);
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(
        data?.message || translations?.typePosteCreatedSuccess || 'Type de poste créé avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [CREATE_TYPE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || error?.message || translations?.errorCreatingTypePoste || 'Erreur lors de la création du type de poste'
      );
    }
  });
}

// ✅ Hook pour mettre à jour un type de poste (amélioré)
export function useUpdateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, data, plansTarifaires, typePosteData }) => {
      console.log('📝 [UPDATE_TYPE_POSTE] ID:', id, 'Données:', { data, plansTarifaires, typePosteData });
      
      // ✅ Validation côté client
      const idToUse = id || data?.id || typePosteData?.id;
      if (!idToUse || isNaN(parseInt(idToUse))) {
        throw new Error('ID du type de poste invalide');
      }

      // Compatibilité avec les différents formats d'appel
      const dataToUse = typePosteData || data;
      const plansToUse = plansTarifaires;

      const response = await typePosteService.updateTypePoste(parseInt(idToUse), dataToUse, plansToUse);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ [UPDATE_TYPE_POSTE] Succès:', data);
      const id = variables.id || variables.data?.id || variables.typePosteData?.id;
      
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.invalidateQueries({ queryKey: ['typePoste', id] });
      queryClient.invalidateQueries({ queryKey: ['typePosteStatistics', id] });
      
      showSuccess(
        data?.message || translations?.typePosteUpdatedSuccess || 'Type de poste mis à jour avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [UPDATE_TYPE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || error?.message || translations?.errorUpdatingTypePoste || 'Erreur lors de la mise à jour du type de poste'
      );
    }
  });
}

// ✅ Hook pour supprimer un type de poste (amélioré)
export function useDeleteTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (typePosteId) => {
      console.log('🗑️ [DELETE_TYPE_POSTE] ID:', typePosteId);
      
      if (!typePosteId || isNaN(parseInt(typePosteId))) {
        throw new Error('ID du type de poste invalide');
      }

      const response = await typePosteService.deleteTypePoste(parseInt(typePosteId));
      return response.data;
    },
    onSuccess: (data, typePosteId) => {
      console.log('✅ [DELETE_TYPE_POSTE] Succès');
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.removeQueries({ queryKey: ['typePoste', parseInt(typePosteId)] });
      queryClient.removeQueries({ queryKey: ['typePosteStatistics', parseInt(typePosteId)] });
      
      showSuccess(
        data?.message || translations?.typePosteDeletedSuccess || 'Type de poste supprimé avec succès'
      );
    },
    onError: (error) => {
      console.error('❌ [DELETE_TYPE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || error?.message || translations?.errorDeletingTypePoste || 'Erreur lors de la suppression du type de poste'
      );
    }
  });
}

// ✅ NOUVEAUX HOOKS - Fonctionnalités avancées

// Hook pour générer automatiquement des plans tarifaires
export function useGenererPlansAutomatiques() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: async ({ id, options }) => {
      console.log('🔧 [GENERER_PLANS] ID:', id, 'Options:', options);
      const response = await typePosteService.genererPlansAutomatiques(id, options);
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ [GENERER_PLANS] Succès');
      queryClient.invalidateQueries({ queryKey: ['typePoste', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(data?.message || 'Plans tarifaires générés avec succès');
    },
    onError: (error) => {
      console.error('❌ [GENERER_PLANS] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || 'Erreur lors de la génération des plans tarifaires');
    }
  });
}

// Hook pour dupliquer un type de poste
export function useDupliquerTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: async ({ id, nouveauNom }) => {
      console.log('📋 [DUPLIQUER_TYPE] ID:', id, 'Nouveau nom:', nouveauNom);
      const response = await typePosteService.dupliquerTypePoste(id, nouveauNom);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ [DUPLIQUER_TYPE] Succès');
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(`Type de poste dupliqué vers "${data?.nom}" avec succès`);
    },
    onError: (error) => {
      console.error('❌ [DUPLIQUER_TYPE] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || 'Erreur lors de la duplication du type de poste');
    }
  });
}

// ✅ FALLBACK pour simulation de tarifs (méthode temporaire si API non disponible)
export function useSimulerTarifsDeprecated() {
  const { showError } = useNotification();

  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await typePosteService.simulerTarifs(params);
        return response.data;
      } catch (error) {
        // Fallback si l'API n'existe pas encore
        console.warn("API simulerTarifs non disponible, utilisation d'un fallback");
        return {
          typePoste: "Simulation",
          devise: params.devise || "DH",
          dureeMinutes: params.dureeMinutes || 60,
          modeCalcul: "SIMULATION",
          optionsTarification: [
            {
              type: "SIMULATION",
              nom: "Tarif simulé",
              prix: (params.tarifHoraire || 20) * ((params.dureeMinutes || 60) / 60),
              prixHoraireEquivalent: params.tarifHoraire || 20,
              estRecommandee: true
            }
          ]
        };
      }
    },
    onError: (error) => {
      console.error("❌ [SIMULATION_DEPRECATED] Erreur:", error);
      showError(error?.response?.data?.message || error?.message || 'Erreur lors de la simulation des tarifs');
    }
  });
}