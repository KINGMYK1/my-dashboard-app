import { api } from '../api/apiService';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(credentials, options = {}) {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
        options: {
          forceQRCodeRegeneration: options.forceQRCodeRegeneration || false,
          ...options
        }
      });
      
      if (response.success && response.requireTwoFactor) {
        const result = {
          success: true,
          requireTwoFactor: true,
          tempToken: response.tempToken,
          userId: response.userId,
          message: response.message || 'Code d\'authentification à deux facteurs requis'
        };

        if (response.qrCodeUrl) {
          result.qrCodeUrl = response.qrCodeUrl;
          result.manualEntryKey = response.manualEntryKey;
          result.isNewSetup = response.isNewSetup || false;
          result.setupReason = response.setupReason || 'STANDARD';
          result.requiresNewConfiguration = response.requiresNewConfiguration !== false;
        } else {
          result.requiresNewConfiguration = false;
        }

        return result;
      }
      
      if (response.success && response.token && response.user) {
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
      console.error('❌ [AUTH] Erreur connexion:', error.message);
      throw error;
    }
  }

  async verifyTwoFactor(tempToken, twoFactorCode) {
    try {
      const response = await api.post('/auth/verify-2fa', {
        token: tempToken,
        twoFactorCode: twoFactorCode
      });
      
      if (response.success && response.token && response.user) {
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
      console.error('❌ [AUTH] Erreur 2FA:', error.message);
      throw error;
    }
  }

  async getTwoFactorStatus() {
    try {
      const response = await api.get('/auth/2fa/status');
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Erreur récupération statut 2FA');
    } catch (error) {
      console.error('❌ [AUTH] Erreur statut 2FA:', error);
      throw error;
    }
  }

  async enableTwoFactor(forceNewSecret = false) {
    try {
      const response = await api.post('/auth/2fa/enable', {
        forceNewSecret
      });
      
      if (response.success) {
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

  async disableTwoFactor(keepSecret = false) {
    try {
      const response = await api.post('/auth/2fa/disable', {
        keepSecret
      });
      
      if (response.success) {
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

  async regenerateTwoFactorSecret() {
    try {
      const response = await api.post('/auth/2fa/regenerate');
      
      if (response.success) {
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

  async logout() {
    try {
      if (this.token && this.user) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.warn('⚠️ [AUTH] Erreur déconnexion:', error.message);
    } finally {
      this.clearAuthData();
    }
  }

  isAuthenticated() {
    if (!this.token || !this.user) {
      return false;
    }

    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && new Date(expiry) <= new Date()) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  getCurrentUser() {
    return this.user;
  }

  hasPermission(permission) {
    if (!this.user || !this.user.role || !this.user.role.permissions) {
      return false;
    }
    
    return this.user.role.permissions.includes(permission) || 
           this.user.role.permissions.includes('ADMIN');
  }

  hasRole(roleName) {
    if (!this.user || !this.user.role) {
      return false;
    }
    return this.user.role.name === roleName;
  }

  getToken() {
    return this.token;
  }

  setAuthHeader() {
    if (this.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  clearAuthData() {
    this.token = null;
    this.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    
    delete api.defaults.headers.common['Authorization'];
  }

  init() {
    if (this.isAuthenticated()) {
      this.setAuthHeader();
      return true;
    } else {
      this.clearAuthData();
      return false;
    }
  }

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