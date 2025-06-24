import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useNotification } from './NotificationContext';
import { isTokenExpired, getTokenExpiryDate } from '../utils/tokenUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempAuthData, setTempAuthData] = useState(null);
  const [token, setToken] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSessionExpired } = useNotification();
  
  // ✅ Refs pour éviter les boucles infinies
  const isInitializing = useRef(false);
  const loginInProgress = useRef(false);
  const redirectionHandled = useRef(false);

  // ✅ Surveillance de l'expiration du token
  useEffect(() => {
    if (token && isAuthenticated) {
      const expiryDate = getTokenExpiryDate(token);
      setSessionExpiresAt(expiryDate);
      
      const checkTokenExpiry = () => {
        if (isTokenExpired(token)) {
          console.log('🔒 [AUTH_CONTEXT] Token expiré détecté');
          clearAuthState();
          showSessionExpired();
          navigate('/', { replace: true });
        }
      };
      
      const intervalId = setInterval(checkTokenExpiry, 30000);
      return () => clearInterval(intervalId);
    } else {
      setSessionExpiresAt(null);
    }
  }, [token, isAuthenticated]);

  // Fonction pour nettoyer l'état d'authentification
  const clearAuthState = useCallback(() => {
    console.log('🧹 [AUTH_CONTEXT] Nettoyage de l\'état d\'authentification');
    setUser(null);
    setIsAuthenticated(false);
    setTwoFactorRequired(false);
    setTempAuthData(null);
    setToken(null);
    setSessionExpiresAt(null);
    redirectionHandled.current = false;
    authService.clearAuthData();
  }, []);

  // ✅ CORRECTION CRITIQUE: Gestion centralisée des redirections
  useEffect(() => {
    if (!initialAuthCheckComplete || loading) return;

    // ✅ Éviter les redirections multiples
    if (redirectionHandled.current) return;

    console.log('🔍 [AUTH_CONTEXT] Gestion des redirections:', {
      pathname: location.pathname,
      isAuthenticated,
      user: !!user,
      twoFactorRequired,
      tempAuthData: !!tempAuthData
    });

    // ✅ Cas 1: Utilisateur complètement authentifié - rediriger vers dashboard
    if (isAuthenticated && user && !twoFactorRequired) {
      if (location.pathname === '/' || location.pathname === '/verify-2fa') {
        console.log('✅ [AUTH_CONTEXT] Redirection vers dashboard');
        redirectionHandled.current = true;
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // ✅ CORRECTION: Cas 2: 2FA requis - rediriger vers page 2FA
    if (twoFactorRequired && tempAuthData?.tempToken && !isAuthenticated) {
      if (location.pathname !== '/verify-2fa') { // ✅ Condition corrigée
        console.log('✅ [AUTH_CONTEXT] Redirection vers 2FA');
        redirectionHandled.current = true;
        navigate('/verify-2fa', { replace: true }); // ✅ Route corrigée
        return;
      }
    }

    // ✅ Cas 3: Pas d'authentification - rediriger vers login
    if (!isAuthenticated && !twoFactorRequired && !tempAuthData) {
      if (location.pathname !== '/') {
        console.log('✅ [AUTH_CONTEXT] Redirection vers login');
        redirectionHandled.current = true;
        navigate('/', { replace: true });
        return;
      }
    }

  }, [initialAuthCheckComplete, loading, isAuthenticated, user, twoFactorRequired, tempAuthData, location.pathname, navigate]);

  // ✅ Initialisation au montage
  useEffect(() => {
    const initAuth = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;

      console.log('🔄 [AUTH_CONTEXT] Initialisation de l\'authentification...');
      try {
        setLoading(true);
        authService.init();
        
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          const currentToken = authService.getToken();
          
          if (currentToken && !isTokenExpired(currentToken)) {
            console.log('✅ [AUTH_CONTEXT] Utilisateur déjà connecté:', currentUser?.username);
            setUser(currentUser);
            setToken(currentToken);
            setIsAuthenticated(true);
            setTwoFactorRequired(false);
            setTempAuthData(null);
          } else {
            console.log('🔒 [AUTH_CONTEXT] Token expiré, nettoyage');
            clearAuthState();
          }
        } else {
          console.log('❌ [AUTH_CONTEXT] Aucune session active trouvée');
          clearAuthState();
        }
      } catch (error) {
        console.error('❌ [AUTH_CONTEXT] Erreur lors de l\'initialisation:', error);
        clearAuthState();
      } finally {
        setLoading(false);
        setInitialAuthCheckComplete(true);
        isInitializing.current = false;
        console.log('✅ [AUTH_CONTEXT] Initialisation terminée');
      }
    };

    initAuth();
  }, []);

  // Écouter les événements d'expiration de session
  useEffect(() => {
    const handleSessionExpired = (event) => {
      console.log('🔒 [AUTH_CONTEXT] Session expirée reçue:', event.detail);
      clearAuthState();
      showSessionExpired();
      
      if (!location.pathname.includes('/')) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, [clearAuthState, showSessionExpired, navigate, location.pathname]);

  // ✅ CORRECTION: Fonction de connexion avec qrCodeUrl
  const login = useCallback(async (credentials) => {
    if (loginInProgress.current) {
      console.log('🔄 [AUTH_CONTEXT] Connexion déjà en cours, ignorée');
      return;
    }

    loginInProgress.current = true;
    redirectionHandled.current = false;
    
    console.log('🔐 [AUTH_CONTEXT] Tentative de connexion pour:', credentials.username);
    
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      console.log('📡 [AUTH_CONTEXT] Réponse de connexion:', response);
      
      // ✅ Cas 2FA requis - MISE À JOUR pour les nouveaux champs
      if (response.success && response.requireTwoFactor) {
        console.log('🔒 [AUTH_CONTEXT] 2FA requis');
        console.log('🔍 [AUTH_CONTEXT] Réponse 2FA complète:', {
          tempToken: !!response.tempToken,
          userId: response.userId,
          message: response.message,
          qrCodeUrl: response.qrCodeUrl,
          qrCodeExists: !!response.qrCodeUrl,
          // ✅ NOUVEAUX CHAMPS
          manualEntryKey: response.manualEntryKey,
          isNewSetup: response.isNewSetup,
          setupReason: response.setupReason,
          requiresNewConfiguration: response.requiresNewConfiguration
        });

        setTwoFactorRequired(true);
        setTempAuthData({
          tempToken: response.tempToken,
          userId: response.userId,
          message: response.message,
          qrCodeUrl: response.qrCodeUrl,
          // ✅ AJOUT DES NOUVEAUX CHAMPS
          manualEntryKey: response.manualEntryKey,
          isNewSetup: response.isNewSetup || false,
          setupReason: response.setupReason || 'STANDARD',
          requiresNewConfiguration: response.requiresNewConfiguration || false
        });
        setIsAuthenticated(false);                                                                                                                                                                                                                                                                                                                                                        
        setUser(null);
        setToken(null);
        return response;
      }
      
      // ✅ Connexion réussie sans 2FA
      if (response.success && response.token && response.user) {
        console.log('✅ [AUTH_CONTEXT] Connexion réussie sans 2FA pour:', response.user.username);
        
        const currentUser = authService.getCurrentUser();
        const currentToken = authService.getToken();
        
        setUser(currentUser);
        setToken(currentToken);
        setIsAuthenticated(true);
        setTwoFactorRequired(false);
        setTempAuthData(null);
        
        return response;
      }
      
      throw new Error('Réponse de connexion invalide du serveur');
      
    } catch (error) {
      console.error('❌ [AUTH_CONTEXT] Erreur de connexion:', error);
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
      loginInProgress.current = false;
    }
  }, [clearAuthState]);

  // ✅ CORRECTION: Fonction de vérification 2FA simplifiée
  const verifyTwoFactor = useCallback(async (twoFactorCode) => {
    console.log('🔐 [AUTH_CONTEXT] Vérification 2FA...');
    redirectionHandled.current = false;
    
    try {
      setLoading(true);
      
      if (!tempAuthData?.tempToken) {
        throw new Error("Token temporaire manquant pour la vérification 2FA");
      }
      
      const response = await authService.verifyTwoFactor(tempAuthData.tempToken, twoFactorCode);
      
      console.log('📡 [AUTH_CONTEXT] Réponse 2FA:', response);
      
      if (response.success && response.token && response.user) {
        console.log('✅ [AUTH_CONTEXT] 2FA réussie pour:', response.user.username);
        
        const currentUser = authService.getCurrentUser();
        const currentToken = authService.getToken();
        
        setUser(currentUser);
        setToken(currentToken);
        setIsAuthenticated(true);
        setTwoFactorRequired(false);
        setTempAuthData(null);
        
        return response;
      }
      
      throw new Error(response.message || 'Échec de la vérification 2FA');
      
    } catch (error) {
      console.error('❌ [AUTH_CONTEXT] Erreur 2FA:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tempAuthData]);

  // Fonction de déconnexion
  const logout = useCallback(async (reason = null) => {
    console.log('🚪 [AUTH_CONTEXT] Déconnexion, raison:', reason);
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ [AUTH_CONTEXT] Erreur lors de la déconnexion:', error);
    } finally {
      clearAuthState();
      navigate('/', { replace: true });
    }
  }, [clearAuthState, navigate]);

  // Fonction de vérification de permission
  const hasPermission = useCallback((permission) => {
    // console.group(`🔐 [AUTH] Vérification permission: ${permission}`);
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      console.groupEnd();
      return false;
    }

    if (!user.role) {
      console.log('❌ Utilisateur sans rôle');
      console.groupEnd();
      return false;
    }

    if (!user.role.permissions) {
      console.log('❌ Rôle sans permissions');
      console.groupEnd();
      return false;
    }

    // console.log('👤 Utilisateur:', user.username);
    // console.log('🎭 Rôle:', user.role.name);
    // console.log('📜 Permissions disponibles:', user.role.permissions);

    // Vérifier si c'est un admin (accès total)
    const isAdmin = user.role.permissions.includes('ADMIN');
    if (isAdmin) {
      // console.log('✅ Accès ADMIN - Permission accordée');
      console.groupEnd();
      return true;
    }

    // Vérifier la permission spécifique
    const hasSpecificPermission = user.role.permissions.includes(permission);
    console.log(`🔍 Permission "${permission}":`, hasSpecificPermission);
    console.groupEnd();
    
    return hasSpecificPermission;
  }, [user]);

  // Fonction de vérification de rôle
  const hasRole = useCallback((roleName) => {
    return authService.hasRole(roleName);
  }, [user]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    loadingInitial: loading,
    initialAuthCheckComplete,
    twoFactorRequired,
    tempAuthData,
    sessionExpiresAt,
    login,
    logout,
    verifyTwoFactor,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};