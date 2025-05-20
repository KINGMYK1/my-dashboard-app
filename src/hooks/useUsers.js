import { useQuery } from '@tanstack/react-query';
import apiService from '../api/apiService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiService.getUsers();
      return response.data;
    },
    // Les données utilisateur sont considérées fraîches pendant 2 minutes
    staleTime: 120000,
  });
}