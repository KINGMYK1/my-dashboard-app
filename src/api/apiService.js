import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gaming-center-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse amélioré
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ ${error.response?.status || 'Network'} ${error.config?.url}:`, 
      error.response?.data?.message || error.message);
    
    // Gestion centralisée des erreurs d'authentification
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.errorCode;
      
      // ✅ AJOUT: Gestion spécifique de la session terminée
      if (errorCode === 'SESSION_TERMINATED' || 
          errorCode === 'SESSION_EXPIRED' || 
          errorCode === 'TOKEN_EXPIRED' || 
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'USER_INACTIVE') {
        
        console.log('🔒 [API] Session terminée détectée, déconnexion forcée');
        
        // Importer et nettoyer les données d'auth
        const authService = (await import('../services/authService')).default;
        authService.clearAuthData();
        
        // Émettre un événement personnalisé pour informer l'app
        window.dispatchEvent(new CustomEvent('auth:sessionExpired', {
          detail: { 
            errorCode, 
            message: error.response.data?.message,
            reason: 'Session terminée par un administrateur' 
          }
        }));
        
        // Rediriger vers la page de connexion
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/';
        }
      }
    }
    
    // Retourner l'erreur dans un format standardisé
    const errorData = error.response?.data || { 
      success: false, 
      message: error.message || 'Erreur réseau',
      errorCode: 'NETWORK_ERROR'
    };
    
    return Promise.reject(errorData);
  }
);

export { api };
export default api;