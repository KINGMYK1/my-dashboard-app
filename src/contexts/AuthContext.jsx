import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiService from '../api/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from './NotificationContext';

// Créer le Contexte d'Authentification
const AuthContext = createContext();

// Provider pour envelopper l'application ou une partie de l'application
export const AuthProvider = ({ children }) => {
  // États existants...
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [token, setToken] = useState(null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempAuthData, setTempAuthData] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  
  // Ajout de l'état pour la navigation interne
  const [isInternalNavigation, setIsInternalNavigation] = useState(false);

  // Nouveaux états pour la transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDestination, setTransitionDestination] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showSessionExpired } = useNotification();

  // Fonction pour charger le profil utilisateur à partir d'un token existant
  // Cette fonction est utilisée au démarrage de l'app ou lors du rafraîchissement
  const loadUserFromToken = useCallback(async (currentToken) => {
      if (!currentToken) {
          setUser(null);
          setToken(null);
          return;
      }

      try {
          // Tente de récupérer le profil utilisateur avec le token existant
          const response = await apiService.getUserProfile();
          setUser(response.data); // Met à jour l'état utilisateur
          setToken(currentToken); // S'assure que le token est dans l'état
          setTwoFactorRequired(false);
          setTempAuthData(null);
      } catch (error) {
          console.error('Échec du chargement du profil utilisateur avec token existant:', error);
          // Si le token est invalide ou expiré (ex: 401), effacer le token et l'utilisateur
          if (error.response && error.response.status === 401) {
              localStorage.removeItem('jwtToken');
              setUser(null);
              setToken(null);
          } else {
             // Gérer d'autres erreurs (réseau, 500) en déconnectant aussi
             localStorage.removeItem('jwtToken');
             setUser(null);
             setToken(null);
          }
      }
  }, []); // Aucune dépendance ici car elle n'utilise pas d'états du contexte directement pour éviter les boucles

  // Effet principal pour la vérification d'authentification au démarrage de l'application
  useEffect(() => {
      let isMounted = true; // Pour éviter les mises à jour d'état sur un composant démonté

      const performInitialAuthCheck = async () => {
          setLoadingInitial(true);
          const storedToken = localStorage.getItem('jwtToken');

          if (storedToken) {
              await loadUserFromToken(storedToken); // Tente de charger l'utilisateur
          } else {
              setUser(null);
              setToken(null);
          }

          if (isMounted) {
              setLoadingInitial(false);
              setInitialAuthCheckComplete(true);
          }
      };

      if (!initialAuthCheckComplete) {
          performInitialAuthCheck();
      }

      return () => {
          isMounted = false; // Nettoyage
      };
  }, [initialAuthCheckComplete, loadUserFromToken]); // Dépendance à initialAuthCheckComplete et loadUserFromToken

  // Effet pour gérer les redirections après que la vérification initiale est terminée
  // et/ou que les états d'authentification changent
  useEffect(() => {
      if (!initialAuthCheckComplete) {
          return; // Attendre que la vérification initiale soit terminée
      }

      // Si l'utilisateur est connecté (authentification complète)
      if (user) {
          // Rediriger vers le dashboard si on est sur la page de login ou 2FA
          if (location.pathname === '/' || location.pathname === '/verify-2fa') {
              navigate('/dashboard', { replace: true });
          }
      }
      // Si la 2FA est requise et les données temporaires sont présentes
      else if (twoFactorRequired && tempAuthData) {
           // Rediriger vers la page 2FA si on n'y est pas déjà
           if (location.pathname !== '/verify-2fa') {
               navigate('/verify-2fa', { replace: true });
           }
      }
      // Si pas d'utilisateur et pas de 2FA requise (non authentifié)
      else {
          // Rediriger vers la page de login si on n'y est pas déjà et pas sur la page 2FA
          if (location.pathname !== '/' && location.pathname !== '/verify-2fa') {
               navigate('/', { replace: true });
          }
      }
  }, [user, twoFactorRequired, tempAuthData, initialAuthCheckComplete, navigate, location.pathname]);


  // Fonction de connexion
  const login = async (credentials) => {
    setLoadingInitial(true); // Indiquer le début d'une opération d'auth
    try {
      const response = await apiService.login(credentials);
      const { success, token: receivedToken, twoFactorRequired: is2FARequired, qrCodeUrl, user: userData } = response.data;

      if (success) {
        if (is2FARequired) {
          // Si la 2FA est requise, stocke le token temporaire et les données associées
          setToken(receivedToken); // Stocke le token temporaire
          setTwoFactorRequired(true);
          setTempAuthData({ token: receivedToken, qrCodeUrl }); // Stocke token et QR code
          setUser(null); // Pas encore complètement authentifié
          localStorage.removeItem('jwtToken'); // S'assurer que le token final n'est pas stocké
          
          // Transition fluide vers la page 2FA
          setIsTransitioning(true);
          setTransitionDestination('/verify-2fa');
        } else {
          // Connexion réussie sans 2FA
          localStorage.setItem('jwtToken', receivedToken); // Stocke le token FINAL
          setToken(receivedToken); // Met à jour l'état du token
          setUser(userData); // Met à jour l'utilisateur directement ici
          setTwoFactorRequired(false);
          setTempAuthData(null);
          
          // Transition fluide vers le dashboard
          setIsTransitioning(true);
          setTransitionDestination('/dashboard');
        }
        return response.data;
      } else {
        console.error('Échec de la connexion:', response.data.message);
        throw new Error(response.data.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API de connexion:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue lors de la connexion';
      throw new Error(errorMessage);
    } finally {
        setLoadingInitial(false);
    }
  };

   // Fonction de vérification 2FA
   const verifyTwoFactor = async (twoFactorCode) => {
     setLoadingInitial(true); // Indiquer le début d'une opération d'auth
     try {
       if (!tempAuthData || !tempAuthData.token) {
           throw new Error("Token temporaire 2FA manquant. Veuillez vous reconnecter.");
       }
       const temporaryToken = tempAuthData.token;

       const response = await apiService.verifyTwoFactor({ token: temporaryToken, twoFactorCode });
       const { success, token: finalToken, user: userData } = response.data;

       if (success) {
         localStorage.setItem('jwtToken', finalToken); // Stocke le token FINAL
         setToken(finalToken); // Met à jour l'état du token
         setUser(userData); // MODIFICATION CLÉ : Met à jour l'utilisateur directement ici
         setTwoFactorRequired(false);
         setTempAuthData(null); // Réinitialise les données temporaires
         // La navigation vers /dashboard est gérée par le useEffect de redirection
         return response.data;
       } else {
         console.error('Échec de la vérification 2FA:', response.data.message);
         throw new Error(response.data.message || 'Code 2FA incorrect.');
       }
     } catch (error) {
        console.error('Erreur lors de la vérification 2FA:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue lors de la vérification 2FA';
        throw new Error(errorMessage);
     } finally {
        setLoadingInitial(false); // Fin de l'opération d'auth
     }
   };

  // Fonction de déconnexion améliorée
  const logout = useCallback((reason = null) => {
    // Activer le mode chargement pour empêcher les flashs
    setLoadingInitial(true);
    
    // Si la raison est "expired", afficher la notification
    if (reason === 'expired') {
      showSessionExpired();
    }
    
    // Léger délai avant la déconnexion réelle pour permettre les animations
    // et éviter les changements d'interface trop brutaux
    setTimeout(() => {
      // Nettoyage côté frontend
      localStorage.removeItem('jwtToken');
      setToken(null);
      setUser(null);
      setTwoFactorRequired(false);
      setTempAuthData(null);
      
      // Rediriger explicitement ici avant de terminer le chargement
      navigate('/', { replace: true });
      
      // Terminer le chargement après que la navigation est terminée
      setTimeout(() => {
        setLoadingInitial(false);
      }, 100);
    }, 50);
  }, [showSessionExpired, navigate]);

  // Vérification de l'expiration du token
  useEffect(() => {
    if (token) {
      // Fonction pour vérifier si le token est expiré
      const checkTokenExpiration = () => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000; // Convertir en millisecondes
          
          if (Date.now() >= expiry) {
            console.log("Token expiré, déconnexion...");
            logout('expired'); // Indiquer que la raison est l'expiration
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          logout();
        }
      };

      // Vérifier immédiatement
      checkTokenExpiration();
      
      // Puis vérifier à intervalles réguliers (toutes les 30 secondes par exemple)
      const interval = setInterval(checkTokenExpiration, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token, logout]);

  // Fonction de callback pour la fin de transition
  const handleTransitionComplete = useCallback((destination) => {
    // Réinitialiser les états de transition
    setIsTransitioning(false);
    setTransitionDestination(null);
    
    // Effectuer la navigation vers la destination
    navigate(destination, { replace: true });
  }, [navigate]);

  // Fournir l'état d'authentification et les fonctions via le contexte
  return (
    <AuthContext.Provider value={{
      user,
      loadingInitial, // Indique si la vérification initiale est en cours
      initialAuthCheckComplete, // Indique si la vérification initiale est terminée
      token,
      twoFactorRequired,
      tempAuthData,
      isInternalNavigation,
      setIsInternalNavigation, // Exporter la fonction pour le Sidebar
      login,
      logout,
      verifyTwoFactor,
      isTransitioning, // Nouvel état pour la transition
      transitionDestination, // Destination de la transition
      handleTransitionComplete, // Fonction de callback pour la fin de transition
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
