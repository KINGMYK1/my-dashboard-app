// src/utils/errorHandler.js
/**
 * Types d'erreurs standards côté frontend
 */
export const ErrorTypes = {
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_PASSWORD: 'INVALID_PASSWORD',
    ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
    TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
    INVALID_2FA_CODE: 'INVALID_2FA_CODE',
    MISSING_TOKEN: 'MISSING_TOKEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN'
  },
  
  AUTHORIZATION: {
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS'
  },
  
  USER: {
    ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    CREATION_FAILED: 'USER_CREATION_FAILED',
    UPDATE_FAILED: 'USER_UPDATE_FAILED',
    SELF_DELETE: 'SELF_DELETE_NOT_ALLOWED',
    LAST_ADMIN: 'LAST_ADMIN_DELETE',
    NOT_FOUND: 'USER_NOT_FOUND'
  },
  
  ROLE: {
    NOT_FOUND: 'ROLE_NOT_FOUND',
    ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
    ADMIN_REQUIRED: 'ADMIN_REQUIRED',
    ROLE_IN_USE: 'ROLE_IN_USE'
  },
  
  PERMISSION: {
    NOT_FOUND: 'PERMISSION_NOT_FOUND',
    ALREADY_EXISTS: 'PERMISSION_ALREADY_EXISTS',
    PERMISSION_IN_USE: 'PERMISSION_IN_USE'
  },
  
  VALIDATION: {
    MISSING_FIELDS: 'MISSING_FIELDS',
    INVALID_FORMAT: 'INVALID_FORMAT'
  },
  
  GENERIC: {
    NOT_FOUND: 'RESOURCE_NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'REQUEST_TIMEOUT'
  }
};

/**
 * Vérifie si une erreur correspond à un type spécifique
 */
export const isErrorOfType = (error, errorType) => {
  if (!error) return false;
  
  if (error.response?.data?.errorCode) {
    return error.response.data.errorCode === errorType;
  }
  
  if (error.errorCode) {
    return error.errorCode === errorType;
  }
  
  return false;
};

/**
 * Obtient un message d'erreur adapté au contexte
 */
export const getErrorMessage = (error, translations = {}) => {
  console.log('🔍 getErrorMessage appelé avec:', error);
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.errorCode) {
    const errorCode = error.response.data.errorCode;
    return errorCode
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  if (error?.message === 'Network Error') {
    return translations?.networkError || 'Erreur réseau. Veuillez vérifier votre connexion.';
  }
  
  return error?.message || translations?.unknownError || 'Une erreur est survenue';
};

/**
 * Analyse les erreurs de validation
 */
export const getValidationErrors = (error) => {
  if (error?.response?.data?.validationErrors) {
    return error.response.data.validationErrors;
  }
  
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const validationErrors = {};
    
    error.response.data.errors.forEach(err => {
      if (err.field && err.message) {
        validationErrors[err.field] = err.message;
      }
    });
    
    return validationErrors;
  }
  
  if (isErrorOfType(error, ErrorTypes.VALIDATION.MISSING_FIELDS)) {
    return { general: 'Veuillez remplir tous les champs obligatoires' };
  }
  
  return {};
};

/**
 * Journal d'erreur centralisé
 */
export const logError = (error, context = '') => {
  console.error(`❌ Erreur ${context ? `dans ${context}` : ''}:`, error);
  
  // Structure complète de l'erreur pour debug
  if (error?.response) {
    console.error('📡 Réponse serveur:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      headers: error.response.headers
    });
  }
};