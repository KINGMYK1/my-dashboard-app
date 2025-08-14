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
          plansMisEnAvant: type.plansTarifaires?.filter(p => p.estActif && p.estMisEnAvant) || [],
          // ✅ NOUVEAU: Calculs avancés
          tarifMoyenPlan: type.plansTarifaires?.length > 0
            ? type.plansTarifaires.reduce((sum, p) => sum + (p.tarifHoraireEquivalent || 0), 0) / type.plansTarifaires.length
            : type.tarifHoraireBase || 0,
          economieMaximale: type.plansTarifaires?.length > 0
            ? Math.max(...type.plansTarifaires.map(p => 
                type.tarifHoraireBase - (p.tarifHoraireEquivalent || type.tarifHoraireBase)
              ))
            : 0
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

// ✅ Hook pour récupérer un type de poste par ID
export function useTypePoste(typePosteId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['typePoste', typePosteId],
    queryFn: () => typePosteService.getTypePosteById(typePosteId),
    enabled: !!typePosteId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ✅ NOUVEAU: Hook pour calculs de prix en temps réel
export function useCalculerPrixSession(typePosteId, dureeMinutes, options = {}) {
  const { data: typePoste } = useTypePoste(typePosteId);
  
  return useMemo(() => {
    if (!typePoste || !dureeMinutes) {
      return { prixCalcule: 0, planUtilise: null, methodeCalcul: 'AUCUN' };
    }

    return TarifService.calculerCoutSession(typePoste, dureeMinutes, options);
  }, [typePoste, dureeMinutes, options]);
}

// ✅ NOUVEAU: Hook pour obtenir le meilleur plan tarifaire
export function useMeilleurPlan(typePosteId, dureeMinutes) {
  const { data: typePoste } = useTypePoste(typePosteId);
  
  return useMemo(() => {
    if (!typePoste?.plansTarifaires || !dureeMinutes) {
      return null;
    }

    const plansCompatibles = typePoste.plansTarifaires.filter(plan => 
      plan.estActif &&
      dureeMinutes >= plan.dureeMinutesMin &&
      (!plan.dureeMinutesMax || dureeMinutes <= plan.dureeMinutesMax)
    );

    if (plansCompatibles.length === 0) {
      return null;
    }

    // Retourner le plan avec le meilleur rapport qualité/prix
    return plansCompatibles.reduce((meilleur, plan) => 
      (plan.tarifHoraireEquivalent || 0) < (meilleur.tarifHoraireEquivalent || Infinity) ? plan : meilleur
    );
  }, [typePoste, dureeMinutes]);
}

// ✅ Hook pour simulation de scénarios tarifaires
export function useSimulerTarifs(typePosteId, dureeMinutes) {
  const { data: typePoste } = useTypePoste(typePosteId);
  
  return useMemo(() => {
    if (!typePoste || !dureeMinutes) {
      return [];
    }

    const scenarios = [];
    
    // Scénario tarif horaire
    const prixHoraire = (dureeMinutes / 60) * typePoste.tarifHoraireBase;
    scenarios.push({
      type: 'PLAN_TARIFAIRE',
      nom: 'Tarif horaire',
      prix: prixHoraire,
      description: `${typePoste.tarifHoraireBase} ${typePoste.devise}/h`,
      economie: 0
    });

    // Scénarios plans tarifaires
    if (typePoste.plansTarifaires) {
      typePoste.plansTarifaires
        .filter(plan => 
          plan.estActif &&
          dureeMinutes >= plan.dureeMinutesMin &&
          (!plan.dureeMinutesMax || dureeMinutes <= plan.dureeMinutesMax)
        )
        .forEach(plan => {
          const economie = prixHoraire - plan.prix;
          scenarios.push({
            type: 'PLAN_TARIFAIRE',
            nom: plan.nom,
            prix: plan.prix,
            description: plan.description || `Plan ${plan.dureeMinutesMin}-${plan.dureeMinutesMax || '∞'} min`,
            economie,
            plan
          });
        });
    }

    return scenarios.sort((a, b) => a.prix - b.prix);
  }, [typePoste, dureeMinutes]);
}

// ✅ Hook pour statistiques d'un type de poste
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

// ✅ CORRIGÉ: Hook pour créer un type de poste
export function useCreateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (data) => {
      console.log('📝 [CREATE_TYPE_POSTE] Données reçues:', data);
      
      // ✅ Gérer les différents formats de données
      let typePosteData, plansTarifaires;
      
      if (data.typePosteData && data.plansTarifaires !== undefined) {
        typePosteData = data.typePosteData;
        plansTarifaires = data.plansTarifaires || [];
      } else if (data.data && data.plansTarifaires !== undefined) {
        typePosteData = data.data;
        plansTarifaires = data.plansTarifaires || [];
      } else {
        typePosteData = data;
        plansTarifaires = [];
      }

      console.log('📝 [CREATE_TYPE_POSTE] Données extraites:', { typePosteData, plansTarifaires });
      
      // ✅ Validation côté client renforcée
      if (!typePosteData?.nom?.trim()) {
        throw new Error('Le nom du type de poste est requis');
      }
      
      if (!typePosteData.tarifHoraireBase || isNaN(parseFloat(typePosteData.tarifHoraireBase)) || parseFloat(typePosteData.tarifHoraireBase) <= 0) {
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

// ✅ CORRIGÉ: Hook pour mettre à jour un type de poste
export function useUpdateTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, typePosteData, plansTarifaires }) => {
      console.log('📝 [UPDATE_TYPE_POSTE] Données envoyées:', { id, typePosteData, plansTarifaires });
      
      // ✅ Validation côté client
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID du type de poste invalide');
      }

      if (!typePosteData || !typePosteData.nom) {
        throw new Error('Nom du type de poste requis');
      }

      // ✅ Envoyer les données dans le bon format
      const response = await typePosteService.updateTypePoste(parseInt(id), {
        typePosteData,
        plansTarifaires
      });
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ [UPDATE_TYPE_POSTE] Succès:', data);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.invalidateQueries({ queryKey: ['typePoste', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['typePosteStatistics', variables.id] });
      
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

// ✅ Hook pour supprimer un type de poste
export function useDeleteTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (typePosteId) => {
      console.log('🗑️ [DELETE_TYPE_POSTE] Suppression:', typePosteId);
      
      if (!typePosteId || isNaN(parseInt(typePosteId))) {
        throw new Error('ID du type de poste invalide');
      }

      const response = await typePosteService.deleteTypePoste(parseInt(typePosteId));
      return response.data;
    },
    onSuccess: (data, typePosteId) => {
      console.log('✅ [DELETE_TYPE_POSTE] Succès:', data);
      
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.removeQueries({ queryKey: ['typePoste', typePosteId] });
      queryClient.removeQueries({ queryKey: ['typePosteStatistics', typePosteId] });
      
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
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: async ({ typePosteId, options = {} }) => {
      const {
        nombrePlans = 3,
        reductionProgressive = 0.1,
        dureeBase = 60
      } = options;

      // Logique de génération côté client
      const plans = [];
      for (let i = 0; i < nombrePlans; i++) {
        const dureeMin = dureeBase * (i + 1);
        const dureeMax = i < nombrePlans - 1 ? dureeBase * (i + 2) : null;
        const reduction = i * reductionProgressive;
        
        plans.push({
          nom: `Plan ${Math.floor(dureeMin / 60)}h`,
          dureeMinutesMin: dureeMin,
          dureeMinutesMax: dureeMax,
          reduction: reduction * 100,
          estActif: true,
          ordreAffichage: i
        });
      }

      return plans;
    },
    onSuccess: (plans) => {
      showSuccess(`${plans.length} plans générés automatiquement`);
    },
    onError: (error) => {
      showError('Erreur lors de la génération des plans');
    }
  });
}
// ✅ NOUVEAU: Hook pour basculer le statut
export function useToggleTypePosteStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (id) => {
      console.log('🔄 [TOGGLE_TYPE_POSTE] ID:', id);
      const response = await typePosteService.toggleTypePosteStatus(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      console.log('✅ [TOGGLE_TYPE_POSTE] Succès:', data);
      
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      queryClient.invalidateQueries({ queryKey: ['typePoste', id] });
      
      showSuccess(
        data?.message || `Type de poste ${data?.estActif ? 'activé' : 'désactivé'} avec succès`
      );
    },
    onError: (error) => {
      console.error('❌ [TOGGLE_TYPE_POSTE] Erreur:', error);
      showError(
        error?.response?.data?.message || error?.message || 'Erreur lors du changement de statut'
      );
    }
  });
}
// Hook pour dupliquer un type de poste
export function useDupliquerTypePoste() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (typePosteId) => {
      const typePoste = await typePosteService.getTypePosteById(typePosteId);
      
      const nouveauTypePoste = {
        ...typePoste.data,
        nom: `${typePoste.data.nom} (Copie)`,
        id: undefined // Supprimer l'ID pour créer un nouveau
      };

      const response = await typePosteService.createTypePoste(
        nouveauTypePoste, 
        typePoste.data.plansTarifaires || []
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typesPostes'] });
      showSuccess(translations?.typePosteDuplicatedSuccess || 'Type de poste dupliqué avec succès');
    },
    onError: (error) => {
      showError(error?.message || 'Erreur lors de la duplication');
    }
  });
}