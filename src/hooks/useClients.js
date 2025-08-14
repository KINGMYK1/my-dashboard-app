import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import clientService from '../services/clientService';

// Hook principal pour récupérer tous les clients avec filtres
export function useClients(filters = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientService.getAllClients(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ [USE_CLIENTS] Erreur récupération clients:', error);
      showError(error?.message || translations?.errorLoadingClients || 'Erreur lors du chargement des clients');
    }
  });
}

// Hook pour récupérer un client par ID
export function useClient(clientId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientService.getClientById(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération du client:', error);
      showError(error?.message || translations?.errorLoadingClient || 'Erreur lors du chargement du client');
    }
  });
}

// ✅ NOUVEAU: Hook pour récupérer les clients éligibles pour un abonnement
export function useClientsEligibles(filters = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clientsEligibles', filters],
    queryFn: () => clientService.getAllClients({
      ...filters,
      estActif: true, // Seulement les clients actifs
      includeSystem: false, // Exclure le client système
      typeClient: 'STANDARD' // Seulement les clients normaux
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => ({
      ...data,
      clients: (data?.data?.clients || []).filter(client => 
        client.estActif && 
        !client.isSystemClient && 
        client.typeClient === 'STANDARD'
      )
    }),
    onError: (error) => {
      console.error('Erreur lors de la récupération des clients éligibles:', error);
      showError(error?.message || translations?.errorLoadingEligibleClients || 'Erreur lors du chargement des clients éligibles');
    }
  });
}

// ✅ NOUVEAU: Hook pour les suggestions de clients (autocomplétion)
export function useClientsSuggestions(searchTerm, limit = 5) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clientsSuggestions', searchTerm, limit],
    queryFn: () => clientService.getAllClients({
      search: searchTerm,
      estActif: true,
      includeSystem: false,
      typeClient: 'STANDARD',
      limit: limit
    }),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 secondes
    retry: 1,
    refetchOnWindowFocus: false,
    select: (data) => ({
      ...data,
      clients: (data?.data?.clients || []).filter(client => 
        client.estActif && 
        !client.isSystemClient && 
        client.typeClient === 'STANDARD'
      )
    }),
    onError: (error) => {
      console.error('Erreur lors de la recherche de clients:', error);
      // Ne pas afficher d'erreur pour les suggestions
    }
  });
}

// Hook pour créer un client
export function useCreateClient() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: clientService.createClient,
    onSuccess: (response) => {
      console.log('✅ [CREATE_CLIENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientsEligibles'] });
      showSuccess(response?.data?.message || response?.message || translations?.clientCreatedSuccess || 'Client créé avec succès');
    },
    onError: (error) => {
      console.error('❌ [CREATE_CLIENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorCreatingClient || 'Erreur lors de la création du client');
    }
  });
}

// Hook pour mettre à jour un client
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ id, clientData }) => clientService.updateClient(id, clientData),
    onSuccess: (response, variables) => {
      console.log('✅ [UPDATE_CLIENT] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clientsEligibles'] });
      showSuccess(response?.data?.message || response?.message || translations?.clientUpdatedSuccess || 'Client mis à jour avec succès');
    },
    onError: (error) => {
      console.error('❌ [UPDATE_CLIENT] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorUpdatingClient || 'Erreur lors de la mise à jour du client');
    }
  });
}

// Hook pour basculer le statut d'un client
export function useToggleClientStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ id }) => clientService.toggleClientStatus(id),
    onSuccess: (response, variables) => {
      console.log('✅ [TOGGLE_CLIENT_STATUS] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clientsEligibles'] });
      showSuccess(response?.data?.message || response?.message || translations?.clientStatusUpdated || 'Statut du client mis à jour');
    },
    onError: (error) => {
      console.error('❌ [TOGGLE_CLIENT_STATUS] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorUpdatingClientStatus || 'Erreur lors de la mise à jour du statut');
    }
  });
}

// Hook pour récupérer les statistiques d'un client
export function useClientStatistiques(clientId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['client', clientId, 'statistiques'],
    queryFn: () => clientService.getClientStatistiques(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques:', error);
      showError(error?.message || translations?.errorLoadingStats || 'Erreur lors du chargement des statistiques');
    }
  });
}

// Hook pour récupérer les statistiques générales des clients
export function useGlobalClientStats() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clients', 'statistiques', 'global'],
    queryFn: () => clientService.getGlobalClientStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      showError(error?.message || translations?.errorLoadingGlobalStats || 'Erreur lors du chargement des statistiques globales');
    }
  });
}

// Hook pour récupérer le client système
export function useSystemClient() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['client', 'system'],
    queryFn: () => clientService.getSystemClient(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération du client système:', error);
      showError(error?.message || translations?.errorLoadingSystemClient || 'Erreur lors du chargement du client système');
    }
  });
}

// Hook pour ajouter une note à un client
export function useAddClientNote() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ clientId, noteData }) => clientService.addClientNote(clientId, noteData),
    onSuccess: (response, variables) => {
      console.log('✅ [ADD_CLIENT_NOTE] Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId, 'notes'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      showSuccess(response?.data?.message || response?.message || translations?.noteAddedSuccess || 'Note ajoutée avec succès');
    },
    onError: (error) => {
      console.error('❌ [ADD_CLIENT_NOTE] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorAddingNote || 'Erreur lors de l\'ajout de la note');
    }
  });
}

// Hook pour récupérer les notes d'un client
export function useClientNotes(clientId, options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['client', clientId, 'notes', options],
    queryFn: () => clientService.getClientNotes(clientId, options),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des notes:', error);
      showError(error?.message || translations?.errorLoadingNotes || 'Erreur lors du chargement des notes');
    }
  });
}

// Hook pour rechercher des clients
export function useSearchClients(searchTerm, options = {}) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clients', 'search', searchTerm, options],
    queryFn: () => clientService.searchClients(searchTerm, options),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 secondes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la recherche de clients:', error);
      // Ne pas afficher d'erreur pour les recherches
    }
  });
}

// ✅ NOUVEAU: Hook pour vérifier l'unicité d'un client (email/téléphone)
export function useVerifierUniciteClient(champ, valeur, clientIdAExclure = null) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['client', 'unicite', champ, valeur, clientIdAExclure],
    queryFn: () => clientService.verifierUniciteClient(champ, valeur, clientIdAExclure),
    enabled: !!valeur && valeur.trim().length > 0,
    staleTime: 30 * 1000, // 30 secondes
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Erreur lors de la vérification d\'unicité:', error);
      // Ne pas afficher d'erreur pour les vérifications d'unicité
    }
  });
}

// ✅ NOUVEAU: Hook pour exporter les clients
export function useExporterClients() {
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: ({ filters, format }) => clientService.exporterClients(filters, format),
    onSuccess: (response, variables) => {
      console.log('✅ [EXPORTER_CLIENTS] Succès:', response);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = variables.format.toLowerCase();
      const filename = `clients_${new Date().toISOString().split('T')[0]}.${extension}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess(translations?.exportSuccessful || 'Export réussi');
    },
    onError: (error) => {
      console.error('❌ [EXPORTER_CLIENTS] Erreur:', error);
      showError(error?.response?.data?.message || error?.message || translations?.errorExporting || 'Erreur lors de l\'export');
    }
  });
}

// ✅ NOUVEAU: Hook pour récupérer les clients récents
export function useClientsRecents(limite = 10) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clients', 'recents', limite],
    queryFn: () => clientService.getClientsRecents(limite),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des clients récents:', error);
      showError(error?.message || translations?.errorLoadingRecentClients || 'Erreur lors du chargement des clients récents');
    }
  });
}

// ✅ NOUVEAU: Hook pour récupérer les clients avec abonnements actifs
export function useClientsAvecAbonnements() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['clients', 'avecAbonnements'],
    queryFn: () => clientService.getClientsAvecAbonnements(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Erreur lors de la récupération des clients avec abonnements:', error);
      showError(error?.message || translations?.errorLoadingClientsWithSubscriptions || 'Erreur lors du chargement des clients avec abonnements');
    }
  });
}