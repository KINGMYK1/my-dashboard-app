import axios from 'axios';

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
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
  
  // AJOUT : Fonction pour récupérer la liste des utilisateurs
  getUsers: () => api.get('/utilisateurs'),
  
  // AJOUT : Fonction pour récupérer un utilisateur spécifique
  getUser: (id) => api.get(`/utilisateurs/${id}`),
  
  // AJOUT : Fonction pour créer un utilisateur
  createUser: (userData) => api.post('/utilisateurs', userData),
  
  // AJOUT : Fonction pour mettre à jour un utilisateur
  updateUser: (id, userData) => api.put(`/utilisateurs/${id}`, userData),
  
  // AJOUT : Fonction pour supprimer un utilisateur
  deleteUser: (id) => api.delete(`/utilisateurs/${id}`),
};

export default apiService;
