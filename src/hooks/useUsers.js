import { useQuery } from '@tanstack/react-query';
import apiService from '../api/apiService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await apiService.getUsers();
        return response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        // Retourner des données vides mais structurées pour éviter les erreurs
        return [];
      }
    },
    // Configuration pour minimiser les flashs
    staleTime: 120000,
    cacheTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    // Utiliser des données vides préformatées pendant le chargement
    placeholderData: [],
    // Retarder l'affichage de l'état de chargement pour éviter les flashs sur les chargements rapides
    useErrorBoundary: false,
  });
}