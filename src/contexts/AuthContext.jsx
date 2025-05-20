import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../api/apiService';
import { useNavigate, useLocation } from 'react-router-dom';

// Créer le Contexte d'Authentification
const AuthContext = createContext();

// Provider pour envelopper l'application ou une partie de l'application
export const AuthProvider = ({ children }) => {
  // État pour l'utilisateur connecté (null si non connecté)
  const [user, setUser] = useState(null);
  // État pour indiquer si l'application est en cours de chargement INITIAL (vérification du token au démarrage)
  const [loading, setLoading] = useState(true);
  // Nouvel état pour suivre les navigations internes (ne pas afficher le loader pour ces cas)
  const [isInternalNavigation, setIsInternalNavigation] = useState(false);
  // État pour stocker le token JWT (le token FINAL après login ou 2FA)
  const [token, setToken] = useState(localStorage.getItem('jwtToken')); 
  // État pour gérer si la 2FA est requise après la connexion initiale
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  // État pour stocker temporairement le token et les données (ex: QR code URL) si 2FA est requise
  const [tempAuthData, setTempAuthData] = useState(null);
  // État pour suivre si la vérification initiale est terminée
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Effet pour vérifier le token et charger l'utilisateur au montage ou quand le token change
  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      // Récupérer le token directement du localStorage à chaque vérification
      const currentToken = localStorage.getItem('jwtToken');
      
      // Ne pas mettre loading à true si c'est juste une navigation interne
      // Les chemins qui commencent par /dashboard/ sont considérés comme des navigations internes
      const isDashboardNavigation = location.pathname.startsWith('/dashboard/');
      
      if (!isDashboardNavigation && !initialAuthCheckComplete) {
        setLoading(true); // Commencer le chargement pour les pages principales seulement
      }

      // Si un token existe (dans local storage)
      if (currentToken) {
        try {
          // Tente de récupérer le profil utilisateur avec le token existant
          const response = await apiService.getUserProfile();

          // Si le composant est toujours monté, mettre à jour l'état
          if (isMounted) {
            setUser(response.data);
            setTwoFactorRequired(false);
            setTempAuthData(null);
            
            // Décider où naviguer en fonction de la route actuelle
            if (location.pathname === '/' || location.pathname === '/verify-2fa') {
              navigate('/dashboard', { replace: true }); // Utiliser replace pour éviter les entrées d'historique inutiles
            }
          }
        } catch (error) {
          console.error('Token invalide ou expiré:', error);
          
          // Si le composant est toujours monté, réinitialiser l'état
          if (isMounted) {
            localStorage.removeItem('jwtToken');
            setToken(null);
            setUser(null);
            
            // Rediriger vers la page de connexion si on n'y est pas déjà
            if (location.pathname !== '/') {
              navigate('/', { replace: true });
            }
          }
        } finally {
          // Marquer la vérification d'auth initiale comme terminée
          if (isMounted) {
            setLoading(false);
            setIsInternalNavigation(false);
            setInitialAuthCheckComplete(true);
          }
        }
      } else {
        // Pas de token, pas d'utilisateur connecté
        if (isMounted) {
          setUser(null);
          setTwoFactorRequired(false);
          setTempAuthData(null);
          
          // Rediriger vers la page de login si pas déjà là et pas sur la page 2FA
          if (location.pathname !== '/' && location.pathname !== '/verify-2fa') {
            navigate('/', { replace: true });
          }
          
          // Marquer la vérification d'auth initiale comme terminée
          setLoading(false);
          setIsInternalNavigation(false);
          setInitialAuthCheckComplete(true);
        }
      }
    };

    // N'exécuter loadUser que lors du montage initial, ou si token change,
    // ou lors des navigations externes (pas à l'intérieur du dashboard)
    const isFirstLoad = !initialAuthCheckComplete;
    const isTokenChange = token !== localStorage.getItem('jwtToken');
    const isExternalNavigation = !isInternalNavigation;
    
    if (isFirstLoad || isTokenChange || (isExternalNavigation && !location.pathname.startsWith('/dashboard'))) {
      loadUser();
    }

    return () => {
      isMounted = false; // Éviter les mises à jour d'état après démontage
    };
  }, [token, navigate, location.pathname, isInternalNavigation, initialAuthCheckComplete]);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      // Appelle le service API avec les credentials (nomUtilisateur, motDePasse)
      const response = await apiService.login(credentials);
      // Destructuration de la réponse du backend selon votre documentation
      const { success, token: receivedToken, twoFactorRequired: is2FARequired, qrCodeUrl, user: userData } = response.data;

      if (success) {
        if (is2FARequired) {
          // Si la 2FA est requise, stocke le token temporaire et les données associées
          // Ce token est celui reçu de /auth/login, il sera utilisé pour /auth/verify-2fa
          setToken(receivedToken); // Stocke le token temporaire dans l'état du contexte (utile pour la vérification 2FA)
          setTwoFactorRequired(true);
          // Stocke le token temporaire et l'URL du QR code dans les données temporaires
          setTempAuthData({ token: receivedToken, qrCodeUrl });
          setUser(null); // L'utilisateur n'est pas encore complètement authentifié
          localStorage.removeItem('jwtToken'); // S'assurer que le token final n'est pas stocké prématurément
          navigate('/verify-2fa'); // Redirige vers la page de vérification 2FA

        } else {
          // Connexion réussie sans 2FA
          localStorage.setItem('jwtToken', receivedToken); // Stocke le token FINAL
          setToken(receivedToken); // Met à jour l'état du token (déclenche useEffect pour charger le profil)
          setTwoFactorRequired(false);
          setTempAuthData(null);
          // L'utilisateur (userData de la réponse de login) et la redirection vers le dashboard
          // seront gérés par le useEffect déclenché par setToken
          // setUser(userData); // Optionnel: si le backend renvoie l'utilisateur complet ici
        }
        // Retourne true ou la réponse complète si le composant appelant a besoin de plus d'infos
        return response.data;

      } else {
        // Gérer l'échec de la connexion basé sur la réponse du backend
        // Le backend renvoie { success: false, message: "..." }
        console.error('Échec de la connexion:', response.data.message);
        throw new Error(response.data.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API de connexion:', error);
      // Propager l'erreur pour que le composant LoginPage puisse l'afficher
      // Axios errors might have response.data.message
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue lors de la connexion';
      throw new Error(errorMessage);
    }
  };

   // Fonction de vérification 2FA
   const verifyTwoFactor = async (twoFactorCode) => {
     try {
       // Utilise le token temporaire stocké dans tempAuthData
       if (!tempAuthData || !tempAuthData.token) {
           throw new Error("Token temporaire 2FA manquant. Veuillez vous reconnecter.");
       }
       const temporaryToken = tempAuthData.token;

       // Appelle le service API pour vérifier le code 2FA
       // Envoie le token temporaire et le code 2FA
       const response = await apiService.verifyTwoFactor({ token: temporaryToken, twoFactorCode });
       // Destructuration de la réponse du backend selon votre documentation
       const { success, token: finalToken, user: userData } = response.data;

       if (success) {
         localStorage.setItem('jwtToken', finalToken); // Stocke le token FINAL après 2FA
         setToken(finalToken); // Met à jour l'état du token (déclenche useEffect pour charger le profil)
         setTwoFactorRequired(false);
         setTempAuthData(null); // Réinitialise les données temporaires
         // L'utilisateur (userData de la réponse de verify-2fa) et la redirection vers le dashboard
         // seront gérés par le useEffect
         // setUser(userData); // Optionnel: si le backend renvoie l'utilisateur complet ici
         return response.data; // Retourne la réponse complète si besoin
       } else {
         // Gérer l'échec de la vérification 2FA
         console.error('Échec de la vérification 2FA:', response.data.message);
         throw new Error(response.data.message || 'Code 2FA incorrect.');
       }
     } catch (error) {
        console.error('Erreur lors de la vérification 2FA:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue lors de la vérification 2FA';
        throw new Error(errorMessage); // Propager l'erreur
     }
   };


  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Optionnel: Appeler l'endpoint de déconnexion côté backend si existant
      // await apiService.logout(); // Si vous avez un endpoint /auth/logout

    } finally {
      // Nettoyage côté frontend
      localStorage.removeItem('jwtToken'); // Supprime le token du stockage local
      setToken(null); // Réinitialise l'état du token (déclenche useEffect qui mettra user à null et redirigera)
      // Les états user, twoFactorRequired, tempAuthData seront réinitialisés par le useEffect
      // Redirection gérée par useEffect si token devient null
    }
  };

  // Fournir l'état d'authentification et les fonctions via le contexte
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      initialAuthCheckComplete,
      token,
      twoFactorRequired,
      tempAuthData,
      isInternalNavigation,
      setIsInternalNavigation,
      login,
      logout,
      verifyTwoFactor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
