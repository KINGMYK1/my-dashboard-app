import { api } from '../api/apiService';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  /**
   * ✅ AMÉLIORATION: Connexion avec options pour forcer la régénération QR
   */
  async login(credentials, options = {}) {
    try {
      console.log('🔐 [AUTH] Tentative de connexion pour:', credentials.username);
      
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
        // ✅ NOUVEAUTÉ: Support des options de connexion
        options: {
          forceQRCodeRegeneration: options.forceQRCodeRegeneration || false,
          ...options
        }
      });
      
      console.log('📡 [AUTH] Réponse backend login:', response);
      
      // ✅ AMÉLIORATION: Gestion 2FA avec QR Code conditionnel selon le backend
      if (response.success && response.requireTwoFactor) {
        console.log('🔐 [AUTH] 2FA requis, token temporaire reçu');
        
        const result = {
          success: true,
          requireTwoFactor: true,
          tempToken: response.tempToken,
          userId: response.userId,
          message: response.message || 'Code d\'authentification à deux facteurs requis'
        };

        // ✅ CRITIQUE: Gestion des différents cas de setup 2FA selon le backend
        if (response.qrCodeUrl) {
          console.log('🆕 [AUTH] Nouveau QR Code fourni:', {
            isNewSetup: response.isNewSetup,
            setupReason: response.setupReason,
            requiresNewConfiguration: response.requiresNewConfiguration
          });
          
          result.qrCodeUrl = response.qrCodeUrl;
          result.manualEntryKey = response.manualEntryKey;
          result.isNewSetup = response.isNewSetup || false;
          result.setupReason = response.setupReason || 'STANDARD';
          result.requiresNewConfiguration = response.requiresNewConfiguration !== false;
        } else {
          console.log('📱 [AUTH] 2FA standard - Utiliser app existante');
          result.requiresNewConfiguration = false;
        }

        return result;
      }
      
      // Connexion réussie sans 2FA
      if (response.success && response.token && response.user) {
        console.log('✅ [AUTH] Connexion réussie sans 2FA pour:', response.user.username);
        
        this.token = response.token;
        this.user = response.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        const expiryDate = new Date();
        const expiresInMinutes = response.expiresIn || (6 * 60);
        expiryDate.setMinutes(expiryDate.getMinutes() + expiresInMinutes);
        localStorage.setItem('tokenExpiry', expiryDate.toISOString());
        
        this.setAuthHeader();
        return response;
      }
      
      throw new Error(response.message || 'Réponse de connexion invalide');
      
    } catch (error) {
      console.error('❌ [AUTH] Erreur de connexion:', error);
      throw error;
    }
  }

  /**
   * ✅ AMÉLIORATION: Connexion avec régénération forcée du QR Code
   */
  async loginWithQRRegeneration(credentials) {
    return this.login(credentials, { forceQRCodeRegeneration: true });
  }

  /**
   * Vérification 2FA adaptée au backend amélioré
   */
  async verifyTwoFactor(tempToken, twoFactorCode) {
    try {
      console.log('🔐 [AUTH] Vérification 2FA avec token temporaire');
      
      const response = await api.post('/auth/verify-2fa', {
        token: tempToken,
        twoFactorCode: twoFactorCode
      });
      
      console.log('📡 [AUTH] Réponse backend 2FA:', response);
      
      if (response.success && response.token && response.user) {
        console.log('✅ [AUTH] 2FA vérifié pour:', response.user.username);
        
        this.token = response.token;
        this.user = response.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        const expiryDate = new Date();
        const expiresInMinutes = response.expiresIn || (6 * 60);
        expiryDate.setMinutes(expiryDate.getMinutes() + expiresInMinutes);
        localStorage.setItem('tokenExpiry', expiryDate.toISOString());
        
        this.setAuthHeader();
        return response;
      }
      
      throw new Error(response.message || 'Code 2FA invalide');
      
    } catch (error) {
      console.error('❌ [AUTH] Erreur 2FA:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAUTÉ: Récupération du statut 2FA
   */
  async getTwoFactorStatus() {
    try {
      console.log('📊 [AUTH] Récupération statut 2FA');
      const response = await api.get('/auth/2fa/status');
      
      if (response.success) {
        console.log('✅ [AUTH] Statut 2FA récupéré:', response.data);
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur récupération statut 2FA');
    } catch (error) {
      console.error('❌ [AUTH] Erreur statut 2FA:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAUTÉ: Activation 2FA avec gestion des cycles
   */
  async enableTwoFactor(forceNewSecret = false) {
    try {
      console.log('🔐 [AUTH] Activation 2FA, force nouveau secret:', forceNewSecret);
      
      const response = await api.post('/auth/2fa/enable', {
        forceNewSecret
      });
      
      if (response.success) {
        console.log('✅ [AUTH] 2FA activé:', {
          isReactivation: response.data.isReactivation,
          isAlreadyEnabled: response.data.isAlreadyEnabled,
          isNewSetup: response.data.isNewSetup
        });
        
        return {
          success: true,
          qrCode: response.data.qrCode,
          manualEntryKey: response.data.manualEntryKey,
          isReactivation: response.data.isReactivation || false,
          isAlreadyEnabled: response.data.isAlreadyEnabled || false,
          isNewSetup: response.data.isNewSetup || false,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Erreur activation 2FA');
    } catch (error) {
      console.error('❌ [AUTH] Erreur activation 2FA:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAUTÉ: Désactivation 2FA complète
   */
  async disableTwoFactor(keepSecret = false) {
    try {
      console.log('🔓 [AUTH] Désactivation 2FA, conserver secret:', keepSecret);
      
      const response = await api.post('/auth/2fa/disable', {
        keepSecret
      });
      
      if (response.success) {
        console.log('✅ [AUTH] 2FA désactivé:', {
          wasAlreadyDisabled: response.data.wasAlreadyDisabled,
          secretRemoved: response.data.secretRemoved,
          sessionsTerminated: response.data.sessionsTerminated
        });
        
        return {
          success: true,
          wasAlreadyDisabled: response.data.wasAlreadyDisabled || false,
          secretRemoved: response.data.secretRemoved,
          sessionsTerminated: response.data.sessionsTerminated,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Erreur désactivation 2FA');
    } catch (error) {
      console.error('❌ [AUTH] Erreur désactivation 2FA:', error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAUTÉ: Régénération du secret 2FA
   */
  async regenerateTwoFactorSecret() {
    try {
      console.log('🔄 [AUTH] Régénération secret 2FA');
      
      const response = await api.post('/auth/2fa/regenerate');
      
      if (response.success) {
        console.log('✅ [AUTH] Secret 2FA régénéré');
        
        return {
          success: true,
          qrCode: response.data.qrCode,
          manualEntryKey: response.data.manualEntryKey,
          isRegeneration: true,
          message: response.message
        };
      }
      
      throw new Error(response.message || 'Erreur régénération secret 2FA');
    } catch (error) {
      console.error('❌ [AUTH] Erreur régénération secret 2FA:', error);
      throw error;
    }
  }

  /**
   * Déconnexion adaptée au backend AuthController.logout
   */
  async logout() {
    try {
      if (this.token && this.user) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.warn('⚠️ [AUTH] Erreur lors de la déconnexion backend:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    if (!this.token || !this.user) {
      return false;
    }

    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && new Date(expiry) <= new Date()) {
      console.log('🔒 [AUTH] Token expiré');
      this.clearAuthData();
      return false;
    }

    return true;
  }

  /**
   * Obtenir l'utilisateur connecté
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Vérifier si l'utilisateur a une permission
   */
  hasPermission(permission) {
    if (!this.user || !this.user.role || !this.user.role.permissions) {
      return false;
    }
    
    return this.user.role.permissions.includes(permission) || 
           this.user.role.permissions.includes('ADMIN');
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(roleName) {
    if (!this.user || !this.user.role) {
      return false;
    }
    return this.user.role.name === roleName;
  }

  /**
   * Obtenir le token actuel
   */
  getToken() {
    return this.token;
  }

  /**
   * Configurer l'en-tête d'authentification pour axios
   */
  setAuthHeader() {
    if (this.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Nettoyer les données d'authentification
   */
  clearAuthData() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Initialisation au démarrage de l'application
   */
  init() {
    if (this.isAuthenticated()) {
      this.setAuthHeader();
      return true;
    } else {
      this.clearAuthData();
      return false;
    }
  }

  /**
   * Récupérer le profil utilisateur depuis le backend
   */
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      if (response.success && response.data) {
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return response;
      }
      throw new Error('Profil utilisateur invalide');
    } catch (error) {
      console.error('❌ [AUTH] Erreur récupération profil:', error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;