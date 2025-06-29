import { useMutation } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import api from '../api/apiService';

/**
 * Hook pour calculer le prix d'une session en temps réel
 */
export function useCalculerPrixSession() {
  const { showError } = useNotification();

  return useMutation({
    mutationFn: async ({ posteId, dureeMinutes, abonnementId = null }) => {
      console.log('💰 [HOOK] Calcul prix session:', { posteId, dureeMinutes, abonnementId });
      
      try {
        const response = await api.post('/sessions/calculer-prix', {
          posteId: parseInt(posteId),
          dureeMinutes: parseInt(dureeMinutes),
          abonnementId
        });
        
        return response.data;
      } catch (error) {
        console.error('❌ [HOOK] Erreur calcul prix:', error);
        throw new Error(error.response?.data?.message || error.message || 'Erreur lors du calcul du prix');
      }
    },
    onError: (error) => {
      console.error('❌ [HOOK] Erreur calcul prix:', error);
      showError(`Erreur lors du calcul du prix: ${error.message}`);
    }
  });
}

export default useCalculerPrixSession;