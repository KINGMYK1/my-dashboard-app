import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import roleService from '../services/roleService';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Hook pour récupérer la liste des rôles
export function useRoles() {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await roleService.getAllRoles();
        
        // Traitement de la réponse
        if (!response) {
          throw new Error("Réponse invalide du serveur");
        }
        
        let rolesData;
        if (response.data?.data) {
          rolesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          rolesData = response.data;
        } else if (Array.isArray(response)) {
          rolesData = response;
        } else {
          console.warn('Format de réponse inattendu pour les rôles:', response);
          rolesData = [];
        }
        
        if (!Array.isArray(rolesData)) {
          console.error('Format de données rôles invalide:', rolesData);
          throw new Error("Format de données rôles invalide");
        }
        
        return rolesData;
      } catch (error) {
        logError(error, 'useRoles');
        const errorMessage = getErrorMessage(error, translations);
        showError(errorMessage);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });
}

// Hook pour récupérer un rôle par ID
export function useRole(roleId) {
  const { showError } = useNotification();
  const { translations } = useLanguage();

  return useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      if (!roleId) return null;
      try {
        const response = await roleService.getRoleById(roleId);
        return response.data || response;
      } catch (error) {
        logError(error, `useRole(${roleId})`);
        const errorMessage = getErrorMessage(error, translations);
        showError(errorMessage);
        return null;
      }
    },
    enabled: !!roleId,
  });
}

// Hook pour créer un rôle
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (roleData) => {
      try {
        const response = await roleService.createRole(roleData);
        return response.data || response;
      } catch (error) {
        logError(error, 'useCreateRole');
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess(data?.message || "Rôle créé avec succès");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, translations);
      showError(errorMessage);
    }
  });
}

// Hook pour mettre à jour un rôle
export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, roleData }) => {
      try {
        const response = await roleService.updateRole(id, roleData);
        return response.data || response;
      } catch (error) {
        logError(error, `useUpdateRole(${id})`);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      showSuccess(data?.message || "Rôle mis à jour avec succès");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, translations);
      showError(errorMessage);
    }
  });
}

// Hook pour supprimer un rôle
export function useDeleteRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  const { translations } = useLanguage();

  return useMutation({
    mutationFn: async (roleId) => {
      try {
        const response = await roleService.deleteRole(roleId);
        return response.data || response;
      } catch (error) {
        logError(error, `useDeleteRole(${roleId})`);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showSuccess(data?.message || "Rôle supprimé avec succès");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, translations);
      showError(errorMessage);
    }
  });
}