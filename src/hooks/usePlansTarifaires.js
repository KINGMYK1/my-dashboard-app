import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansTarifairesAPI } from '../services/api/plansTarifairesAPI';

// ✅ Hook pour récupérer tous les plans tarifaires
export const usePlansTarifaires = (options = {}) => {
  return useQuery({
    queryKey: ['plansTarifaires', options],
    queryFn: () => plansTarifairesAPI.getAll(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options
  });
};

// ✅ Hook pour récupérer un plan par ID
export const usePlanTarifaire = (id, options = {}) => {
  return useQuery({
    queryKey: ['planTarifaire', id],
    queryFn: () => plansTarifairesAPI.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    ...options
  });
};

// ✅ Hook pour créer un plan tarifaire
export const useCreatePlanTarifaire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: plansTarifairesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plansTarifaires'] });
    }
  });
};

// ✅ Hook pour mettre à jour un plan tarifaire
export const useUpdatePlanTarifaire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => plansTarifairesAPI.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['plansTarifaires'] });
      queryClient.invalidateQueries({ queryKey: ['planTarifaire', id] });
    }
  });
};

// ✅ Hook pour supprimer un plan tarifaire
export const useDeletePlanTarifaire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: plansTarifairesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plansTarifaires'] });
    }
  });
};