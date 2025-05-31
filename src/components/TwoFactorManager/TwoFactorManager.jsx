import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Smartphone, AlertTriangle, CheckCircle, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';

const TwoFactorManager = () => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [manualKey, setManualKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showManualKey, setShowManualKey] = useState(false);
  const [actionType, setActionType] = useState('');
  
  const { showSuccess, showError, showWarning } = useNotification();

  // Récupérer le statut 2FA au chargement
  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      setLoading(true);
      const statusData = await authService.getTwoFactorStatus();
      setStatus(statusData);
      console.log('📊 [2FA_MANAGER] Statut 2FA:', statusData);
    } catch (error) {
      console.error('❌ [2FA_MANAGER] Erreur récupération statut:', error);
      showError('Impossible de récupérer le statut de l\'authentification 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTwoFactor = async (forceNew = false) => {
    setLoading(true);
    setActionType(forceNew ? 'regenerate' : 'enable');
    
    try {
      const result = await authService.enableTwoFactor(forceNew);
      
      if (result.success) {
        setQrCode(result.qrCode);
        setManualKey(result.manualEntryKey);
        setShowQRCode(true);
        
        // Rafraîchir le statut
        await fetchTwoFactorStatus();
        
        if (result.isAlreadyEnabled) {
          showWarning('L\'authentification 2FA est déjà activée');
        } else if (result.isReactivation) {
          showSuccess('Authentification 2FA réactivée avec un nouveau secret de sécurité');
        } else {
          showSuccess('Authentification 2FA activée avec succès');
        }
        
        console.log('✅ [2FA_MANAGER] 2FA activé:', {
          isReactivation: result.isReactivation,
          isAlreadyEnabled: result.isAlreadyEnabled,
          isNewSetup: result.isNewSetup
        });
      }
    } catch (error) {
      console.error('❌ [2FA_MANAGER] Erreur activation:', error);
      showError(error.message || 'Erreur lors de l\'activation de l\'authentification 2FA');
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const handleDisableTwoFactor = async () => {
    const confirmed = window.confirm(
      '⚠️ ATTENTION: Désactiver l\'authentification 2FA réduira la sécurité de votre compte.\n\n' +
      'Cette action va :\n' +
      '• Supprimer votre secret 2FA actuel\n' +
      '• Terminer toutes vos sessions actives\n' +
      '• Vous déconnecter pour sécuriser votre compte\n\n' +
      'Êtes-vous certain de vouloir continuer ?'
    );

    if (!confirmed) return;

    setLoading(true);
    setActionType('disable');
    
    try {
      const result = await authService.disableTwoFactor(false); // Ne pas conserver le secret
      
      if (result.success) {
        setQrCode(null);
        setManualKey('');
        setShowQRCode(false);
        setShowManualKey(false);
        
        // Rafraîchir le statut
        await fetchTwoFactorStatus();
        
        if (result.wasAlreadyDisabled) {
          showWarning('L\'authentification 2FA était déjà désactivée');
        } else {
          showSuccess('Authentification 2FA désactivée avec succès');
          
          // Avertir de la déconnexion imminente
          setTimeout(() => {
            showWarning('Vous allez être déconnecté pour sécuriser votre compte...');
            setTimeout(() => {
              window.location.reload(); // Force la déconnexion
            }, 2000);
          }, 1000);
        }
        
        console.log('✅ [2FA_MANAGER] 2FA désactivé:', {
          secretRemoved: result.secretRemoved,
          sessionsTerminated: result.sessionsTerminated
        });
      }
    } catch (error) {
      console.error('❌ [2FA_MANAGER] Erreur désactivation:', error);
      showError(error.message || 'Erreur lors de la désactivation de l\'authentification 2FA');
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const handleRegenerateSecret = async () => {
    const confirmed = window.confirm(
      '🔄 Régénération du Secret 2FA\n\n' +
      'Cette action va :\n' +
      '• Invalider votre configuration 2FA actuelle\n' +
      '• Générer un nouveau secret de sécurité\n' +
      '• Vous devrez reconfigurer votre application d\'authentification\n\n' +
      'Continuer ?'
    );

    if (!confirmed) return;

    setLoading(true);
    setActionType('regenerate');
    
    try {
      const result = await authService.regenerateTwoFactorSecret();
      
      if (result.success) {
        setQrCode(result.qrCode);
        setManualKey(result.manualEntryKey);
        setShowQRCode(true);
        setShowManualKey(false);
        
        showSuccess('Secret 2FA régénéré avec succès. Veuillez reconfigurer votre application.');
        
        console.log('✅ [2FA_MANAGER] Secret régénéré');
      }
    } catch (error) {
      console.error('❌ [2FA_MANAGER] Erreur régénération:', error);
      showError(error.message || 'Erreur lors de la régénération du secret 2FA');
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const badges = {
      'ACTIVE': {
        icon: <CheckCircle size={16} />,
        text: 'Activé et Configuré',
        className: 'bg-green-900 bg-opacity-50 text-green-200 border-green-500'
      },
      'ENABLED_NO_SECRET': {
        icon: <AlertTriangle size={16} />,
        text: 'Activé mais Secret Manquant',
        className: 'bg-orange-900 bg-opacity-50 text-orange-200 border-orange-500'
      },
      'DISABLED': {
        icon: <X size={16} />,
        text: 'Désactivé',
        className: 'bg-red-900 bg-opacity-50 text-red-200 border-red-500'
      }
    };

    const badge = badges[status.status] || badges['DISABLED'];

    return (
      <div className={`flex items-center px-3 py-2 rounded-lg border ${badge.className}`}>
        {badge.icon}
        <span className="ml-2 font-medium">{badge.text}</span>
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Clé copiée dans le presse-papiers');
    }).catch(() => {
      showError('Erreur lors de la copie');
    });
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <span className="ml-3 text-gray-300">Chargement du statut 2FA...</span>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-4xl mx-auto p-6 relative"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: '1rem',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}
    >
      {/* En-tête */}
      <div className="flex items-center mb-6">
        <Shield size={32} className="text-purple-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">
          Authentification à Deux Facteurs (2FA)
        </h2>
      </div>

      {/* Statut actuel */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Statut Actuel</h3>
        {getStatusBadge()}
        
        {status && (
          <div className="mt-3 text-sm text-gray-400">
            <p>Utilisateur: <span className="text-purple-400 font-medium">{status.username}</span></p>
            <p>Secret configuré: <span className={status.hasSecret ? 'text-green-400' : 'text-red-400'}>
              {status.hasSecret ? 'Oui' : 'Non'}
            </span></p>
          </div>
        )}
      </div>

      {/* Actions selon l'état */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Actions Disponibles</h3>
        
        {status?.status === 'DISABLED' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              L'authentification à deux facteurs n'est pas activée. Activez-la pour renforcer la sécurité de votre compte.
            </p>
            <button 
              onClick={() => handleEnableTwoFactor(false)}
              disabled={loading}
              className="flex items-center px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading && actionType === 'enable' ? 
                  'linear-gradient(90deg, #64748b 0%, #64748b 100%)' :
                  'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              {loading && actionType === 'enable' ? (
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2" />
              ) : (
                <Shield size={20} className="mr-2" />
              )}
              {loading && actionType === 'enable' ? 'Activation...' : 'Activer l\'Authentification 2FA'}
            </button>
          </div>
        )}

        {status?.status === 'ACTIVE' && (
          <div className="space-y-4">
            <p className="text-gray-300">
              L'authentification à deux facteurs est active et configurée.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setShowQRCode(!showQRCode)}
                className="flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                <Eye size={16} className="mr-2" />
                {showQRCode ? 'Masquer QR Code' : 'Afficher QR Code'}
              </button>
              
              <button 
                onClick={handleRegenerateSecret}
                disabled={loading}
                className="flex items-center px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && actionType === 'regenerate' ? (
                  <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                {loading && actionType === 'regenerate' ? 'Régénération...' : 'Régénérer Secret'}
              </button>
              
              <button 
                onClick={handleDisableTwoFactor}
                disabled={loading}
                className="flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && actionType === 'disable' ? (
                  <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2" />
                ) : (
                  <X size={16} className="mr-2" />
                )}
                {loading && actionType === 'disable' ? 'Désactivation...' : 'Désactiver 2FA'}
              </button>
            </div>
          </div>
        )}

        {status?.status === 'ENABLED_NO_SECRET' && (
          <div className="space-y-4">
            <div className="p-4 bg-orange-900 bg-opacity-50 text-orange-200 rounded-lg border border-orange-500">
              <div className="flex items-center">
                <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Problème de Configuration Détecté</p>
                  <p className="text-sm">2FA activé mais secret manquant. Réparation nécessaire.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleEnableTwoFactor(true)}
              disabled={loading}
              className="flex items-center px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading && actionType === 'regenerate' ? 
                  'linear-gradient(90deg, #64748b 0%, #64748b 100%)' :
                  'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              {loading && actionType === 'regenerate' ? (
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2" />
              ) : (
                <RefreshCw size={20} className="mr-2" />
              )}
              {loading && actionType === 'regenerate' ? 'Réparation...' : 'Réparer la Configuration'}
            </button>
          </div>
        )}
      </div>

      {/* Affichage QR Code et configuration */}
      {showQRCode && qrCode && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300">Configuration de l'Application d'Authentification</h3>
          
          {/* QR Code */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <img 
                  src={qrCode} 
                  alt="QR Code 2FA" 
                  className="w-64 h-64 rounded-lg"
                />
              </div>
            </div>
            
            {/* Instructions */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center text-gray-400 text-sm">
                <Smartphone size={16} className="mr-2" />
                <span>Scannez avec Google Authenticator, Authy, ou toute autre application TOTP</span>
              </div>
              
              {/* Clé manuelle */}
              {manualKey && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-300">Clé Manuelle :</h4>
                    <button
                      onClick={() => setShowManualKey(!showManualKey)}
                      className="flex items-center text-purple-400 hover:text-purple-300 text-sm"
                    >
                      {showManualKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span className="ml-1">{showManualKey ? 'Masquer' : 'Afficher'}</span>
                    </button>
                  </div>
                  
                  {showManualKey && (
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 bg-gray-800 text-green-400 p-3 rounded-lg text-sm break-all font-mono">
                        {manualKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(manualKey)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Copier
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Instructions détaillées */}
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Instructions :</h4>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li>1. Installez une application d'authentification (Google Authenticator, Authy, Microsoft Authenticator)</li>
                  <li>2. Ouvrez l'application et sélectionnez "Ajouter un compte"</li>
                  <li>3. Scannez le QR Code ci-contre ou saisissez la clé manuelle</li>
                  <li>4. L'application génèrera des codes à 6 chiffres toutes les 30 secondes</li>
                  <li>5. Utilisez ces codes lors de vos prochaines connexions</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorManager;