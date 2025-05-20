import axios from 'axios';
import { isTokenExpired } from '../utils/tokenUtils';

// Variable pour stocker la fonction showSessionExpired depuis le contexte
// Elle sera définie dynamiquement après le montage du contexte
let notifySessionExpired = null;

// Fonction pour initialiser la notification
export const initializeSessionNotification = (showExpiredFn) => {
  notifySessionExpired = showExpiredFn;
};

// Définir l'URL de base de votre backend
const API_BASE_URL = 'http://localhost:3000/api';

// Créer une instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter un intercepteur pour inclure le token JWT dans les requêtes
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le stockage local
    const token = localStorage.getItem('jwtToken');

    // Définir les endpoints publics qui ne nécessitent PAS de token
    const publicEndpoints = [
      '/auth/register',
      '/auth/login',
      '/auth/verify-2fa',
      '/utilisateurs/request-password-reset',
      '/utilisateurs/reset-password',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.startsWith(endpoint));

    if (token && !isPublicEndpoint) {
      // Vérifier si le token est expiré avant de l'ajouter aux en-têtes
      if (isTokenExpired(token)) {
        // Si le token est expiré, le supprimer
        localStorage.removeItem('jwtToken');
        
        // Afficher la notification d'expiration de session si disponible
        if (notifySessionExpired) {
          notifySessionExpired();
        }
        
        // Rediriger uniquement si nous ne sommes pas déjà sur la page de connexion ou de vérification 2FA
        if (window.location.pathname !== '/' && window.location.pathname !== '/verify-2fa') {
          window.location.href = '/';
        }
      } else {
        // Sinon, ajouter le token valide aux en-têtes
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable pour éviter les doubles redirections lors des erreurs 401
let redirectionInProgress = false;

// Intercepteur pour gérer les réponses et les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si l'erreur est 401 (Unauthorized)
    if (error.response && error.response.status === 401 && !redirectionInProgress) {
      // Empêcher les redirections multiples
      redirectionInProgress = true;
      
      // Déconnecter l'utilisateur
      localStorage.removeItem('jwtToken');
      
      // Afficher la notification d'expiration de session si disponible
      if (notifySessionExpired) {
        notifySessionExpired();
      }
      
      // Rediriger vers la page de connexion
      if (window.location.pathname !== '/' && window.location.pathname !== '/verify-2fa') {
        window.location.href = '/';
        
        // Réinitialiser le flag après la redirection
        setTimeout(() => {
          redirectionInProgress = false;
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

const apiService = {
  // Authentification
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', {
    username: credentials.nomUtilisateur,
    password: credentials.motDePasse
  }),
  verifyTwoFactor: (data) => api.post('/auth/verify-2fa', data),
  getUserProfile: () => api.get('/utilisateurs/profil'),
  
  // Fonction pour récupérer la liste des utilisateurs
  getUsers: () => api.get('/utilisateurs'),
  
  // Fonction pour récupérer un utilisateur spécifique
  getUser: (id) => api.get(`/utilisateurs/${id}`),
  
  // Fonction pour créer un utilisateur
  createUser: (userData) => api.post('/utilisateurs', userData),
  
  // Fonction pour mettre à jour un utilisateur
  updateUser: (id, userData) => api.put(`/utilisateurs/${id}`, userData),
  
  // Fonction pour supprimer un utilisateur
  deleteUser: (id) => api.delete(`/utilisateurs/${id}`),
};

export default apiService;
