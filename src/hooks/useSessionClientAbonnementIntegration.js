import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import sessionService from '../services/sessionService';
import clientService from '../services/clientService';
import abonnementService from '../services/abonnementService';

/**
 * Hook intégré pour la gestion des relations Session-Client-Abonnement
 * Centralise la logique métier complexe
 */
export const useSessionClientAbonnementIntegration = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  // ✅ Récupération des données liées
  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', 'active-with-relations'],
    queryFn: () => sessionService.getSessionsActives({ includeRelations: true }),
    refetchInterval: 5000, // Actualisation automatique
    staleTime: 3000
  });

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients', 'with-abonnements'],
    queryFn: () => clientService.getAllClients({ includeAbonnements: true }),
    staleTime: 30000 // Moins volatile
  });

  // ✅ Données enrichies avec calculs métier
  const enrichedData = useMemo(() => {
    if (!sessionsData?.data || !clientsData?.clients) {
      return {
        sessions: [],
        clients: [],
        statistiques: {
          sessionsActives: 0,
          sessionsAvecAbonnement: 0,
          clientsAvecAbonnementActif: 0,
          revenusEstimes: 0,
          economiesAbonnements: 0
        }
      };
    }

    const sessions = sessionsData.data;
    const clients = clientsData.clients;

    // Enrichir les sessions avec les données d'abonnement
    const sessionsEnrichies = sessions.map(session => {
      const client = session.Client || clients.find(c => c.id === session.clientId);
      
      if (!client) return session;

      // Trouver l'abonnement actif du client
      const abonnementActif = client.AbonnementClients?.find(ab => 
        ab.estActif && 
        new Date(ab.dateFinValidite) > new Date()
      );

      // Calculer les avantages appliqués
      let avantageApplique = null;
      let economieRealisee = 0;

      if (abonnementActif && session.avantageAbonnement) {
        const tarifNormal = session.dureeEnMinutes * (session.Poste?.TypePoste?.tarifHoraire || 0) / 60;
        economieRealisee = tarifNormal - (session.coutEstime || 0);
        
        avantageApplique = {
          type: abonnementActif.TypeAbonnement?.typeBenefice,
          valeur: abonnementActif.TypeAbonnement?.valeurBenefice,
          economie: economieRealisee
        };
      }

      return {
        ...session,
        Client: client,
        abonnementActif,
        avantageApplique,
        economieRealisee,
        // Indicateurs visuels
        hasActiveSubscription: !!abonnementActif,
        subscriptionStatus: abonnementActif 
          ? (abonnementActif.heuresRestantes > 0 ? 'ACTIF_AVEC_HEURES' : 'ACTIF_SANS_HEURES')
          : 'SANS_ABONNEMENT'
      };
    });

    // Enrichir les clients avec leurs statistiques de sessions
    const clientsEnrichis = clients.map(client => {
      const sessionsClient = sessionsEnrichies.filter(s => s.Client?.id === client.id);
      const abonnementActif = client.AbonnementClients?.find(ab => 
        ab.estActif && new Date(ab.dateFinValidite) > new Date()
      );

      const statistiquesClient = {
        nombreSessionsActives: sessionsClient.length,
        tempsJoueAujourdhui: sessionsClient.reduce((total, s) => total + (s.dureeEnMinutes || 0), 0),
        depenseEstimeeAujourdhui: sessionsClient.reduce((total, s) => total + (s.coutEstime || 0), 0),
        economieAbonnementAujourdhui: sessionsClient.reduce((total, s) => total + (s.economieRealisee || 0), 0)
      };

      return {
        ...client,
        abonnementActif,
        statistiquesClient,
        sessionsActives: sessionsClient,
        // Indicateurs pour l'interface
        isCurrentlyPlaying: sessionsClient.length > 0,
        subscriptionValue: abonnementActif ? 'PREMIUM' : 'STANDARD'
      };
    });

    // Calculs statistiques globaux
    const statistiques = {
      // Sessions
      sessionsActives: sessionsEnrichies.length,
      sessionsAvecAbonnement: sessionsEnrichies.filter(s => s.hasActiveSubscription).length,
      sessionsSansAbonnement: sessionsEnrichies.filter(s => !s.hasActiveSubscription).length,
      
      // Clients
      clientsAvecAbonnementActif: clientsEnrichis.filter(c => c.abonnementActif).length,
      clientsActuellementEnJeu: clientsEnrichis.filter(c => c.isCurrentlyPlaying).length,
      
      // Finances
      revenusEstimes: sessionsEnrichies.reduce((total, s) => total + (s.coutEstime || 0), 0),
      economiesAbonnements: sessionsEnrichies.reduce((total, s) => total + (s.economieRealisee || 0), 0),
      tarifNormalSansAbonnement: sessionsEnrichies.reduce((total, s) => {
        const tarifNormal = s.dureeEnMinutes * (s.Poste?.TypePoste?.tarifHoraire || 0) / 60;
        return total + tarifNormal;
      }, 0),
      
      // Moyennes
      dureeeMoyenneSession: sessionsEnrichies.length > 0 
        ? sessionsEnrichies.reduce((total, s) => total + (s.dureeEnMinutes || 0), 0) / sessionsEnrichies.length 
        : 0,
      
      // Taux
      tauxUtilisationAbonnements: clientsEnrichis.length > 0 
        ? (clientsEnrichis.filter(c => c.abonnementActif).length / clientsEnrichis.length) * 100 
        : 0
    };

    return {
      sessions: sessionsEnrichies,
      clients: clientsEnrichis,
      statistiques
    };
  }, [sessionsData, clientsData]);

  // ✅ Mutation pour démarrer une session avec gestion intelligente des abonnements
  const startSessionWithIntelligentSubscription = useMutation({
    mutationFn: async (sessionData) => {
      console.log('🎮 [SESSION_INTEGRATION] Démarrage session intelligente:', sessionData);

      // 1. Vérifier si le client a un abonnement actif
      if (sessionData.clientId) {
        const clientDetails = await clientService.getClientById(sessionData.clientId);
        const abonnementActif = clientDetails.data?.AbonnementClients?.find(ab => 
          ab.estActif && new Date(ab.dateFinValidite) > new Date()
        );

        if (abonnementActif) {
          // 2. Calculer automatiquement l'avantage à appliquer
          const avantageCalcule = await sessionService.calculerAvantageAbonnement({
            clientId: sessionData.clientId,
            abonnementId: abonnementActif.id,
            dureeEstimeeMinutes: sessionData.dureeEstimeeMinutes,
            posteId: sessionData.posteId
          });

          // 3. Enrichir les données de session
          sessionData = {
            ...sessionData,
            abonnementId: abonnementActif.id,
            avantageAbonnement: avantageCalcule.avantage,
            typeSession: 'AVEC_ABONNEMENT'
          };
        }
      }

      // 4. Créer la session
      return await sessionService.demarrerSessionAvecAbonnement(sessionData);
    },
    onSuccess: (data) => {
      showSuccess('Session démarrée avec succès !');
      // Invalider les caches pour actualisation
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['postes'] });
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
    },
    onError: (error) => {
      console.error('❌ [SESSION_INTEGRATION] Erreur:', error);
      showError('Erreur lors du démarrage de la session');
    }
  });

  // ✅ Mutation pour terminer une session avec gestion des abonnements
  const endSessionWithSubscriptionHandling = useMutation({
    mutationFn: async (sessionId) => {
      console.log('🏁 [SESSION_INTEGRATION] Fin session avec abonnements:', sessionId);
      
      // Récupérer les détails de la session avant de la terminer
      const sessionDetails = enrichedData.sessions.find(s => s.id === sessionId);
      
      // Terminer la session
      const result = await sessionService.terminerSession(sessionId);
      
      // Si la session utilisait un abonnement, mettre à jour les heures restantes
      if (sessionDetails?.abonnementActif && sessionDetails.avantageApplique) {
        await abonnementService.updateHeuresRestantes(
          sessionDetails.abonnementActif.id,
          -sessionDetails.dureeEnMinutes / 60 // Convertir en heures
        );
      }
      
      return result;
    },
    onSuccess: () => {
      showSuccess('Session terminée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['abonnements'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('❌ [SESSION_INTEGRATION] Erreur fin session:', error);
      showError('Erreur lors de la fin de session');
    }
  });

  // ✅ Fonction utilitaire pour obtenir les sessions d'un client
  const getClientSessions = (clientId) => {
    return enrichedData.sessions.filter(session => session.Client?.id === clientId);
  };

  // ✅ Fonction utilitaire pour obtenir les statistiques d'un client
  const getClientStats = (clientId) => {
    const client = enrichedData.clients.find(c => c.id === clientId);
    return client?.statistiquesClient || null;
  };

  // ✅ Fonction utilitaire pour vérifier si un client peut bénéficier d'avantages
  const canClientUseSubscriptionBenefits = (clientId) => {
    const client = enrichedData.clients.find(c => c.id === clientId);
    if (!client?.abonnementActif) return false;

    const abonnement = client.abonnementActif;
    const isActive = abonnement.estActif && new Date(abonnement.dateFinValidite) > new Date();
    
    if (abonnement.TypeAbonnement?.typeBenefice === 'HEURES_OFFERTES') {
      return isActive && abonnement.heuresRestantes > 0;
    }
    
    return isActive; // Pour les réductions pourcentage
  };

  return {
    // Données enrichies
    sessions: enrichedData.sessions,
    clients: enrichedData.clients,
    statistiques: enrichedData.statistiques,
    
    // États de chargement
    isLoading: loadingSessions || loadingClients,
    
    // Mutations
    startSessionWithIntelligentSubscription,
    endSessionWithSubscriptionHandling,
    
    // Utilitaires
    getClientSessions,
    getClientStats,
    canClientUseSubscriptionBenefits,
    
    // Actions de rafraîchissement
    refreshData: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  };
};
