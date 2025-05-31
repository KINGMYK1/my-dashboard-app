import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Shield, CheckCircle, XCircle, ArrowLeft, QrCode, Smartphone } from 'lucide-react';
import SplashScreen from '../SplashScreen/SplashScreen';

const TwoFactorPage = () => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const {
    loading,
    initialAuthCheckComplete,
    twoFactorRequired,
    tempAuthData,
    verifyTwoFactor,
    logout,
  } = useAuth();

  const { translations } = useLanguage();

  const isSubmitting = useRef(false);

  // ✅ AMÉLIORATION: Traductions sécurisées avec valeurs par défaut
  const safeTranslations = {
    twoFactorVerificationTitle: 'Vérification 2FA',
    twoFactorInstructionsInitial: 'Configurez l\'authentification à deux facteurs en scannant le QR code ci-dessous.',
    twoFactorInstructionsExisting: 'Entrez le code à 6 chiffres de votre application d\'authentification.',
    hideQRCode: 'Masquer le QR Code',
    showQRCode: 'Afficher le QR Code',
    scanQRCode: 'Scannez avec votre app',
    instructions: 'Instructions',
    installAuthenticatorApp: 'Installez une app d\'authentification (Google Authenticator, Authy, etc.)',
    scanQRCodeAbove: 'Scannez le QR code ci-dessus',
    enterGeneratedCode: 'Entrez le code généré par l\'app',
    verificationCodeLabel: 'Code de vérification',
    codeAutoSubmitHint: 'Le code sera vérifié automatiquement une fois saisi',
    verifyButton: 'Vérifier',
    returnToLogin: 'Retour à la connexion',
    codeMustBe6Digits: 'Le code doit contenir 6 chiffres',
    tempAuthDataMissing: 'Données d\'authentification temporaires manquantes',
    incorrect2FACode: 'Code 2FA incorrect',
    copyright: 'Tous droits réservés. MYK.',
    ...translations
  };

  // ✅ CORRECTION: Gestion automatique du QR code selon le type de setup
  useEffect(() => {
    console.log('🔍 [2FA_PAGE] TempAuthData:', tempAuthData);
    
    if (tempAuthData?.qrCodeUrl) {
      console.log('📱 [2FA_PAGE] QR Code détecté, affichage automatique');
      setShowQRCode(true);
    } else {
      console.log('📱 [2FA_PAGE] Pas de QR Code, utilisation app existante');
      setShowQRCode(false);
    }
  }, [tempAuthData]);

  const handleReturnToLogin = () => {
    console.log('🔙 [2FA_PAGE] Retour au login.');
    logout('cancel2fa');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setShowError(false);
    setErrorMessage('');

    // Validation du code 2FA
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setErrorMessage(safeTranslations.codeMustBe6Digits);
      setShowError(true);
      isSubmitting.current = false;
      return;
    }

    try {
      if (!tempAuthData?.tempToken) {
        throw new Error(safeTranslations.tempAuthDataMissing);
      }

      console.log('🔐 [2FA_PAGE] Soumission du code 2FA.');
      await verifyTwoFactor(twoFactorCode);

    } catch (error) {
      console.error('❌ [2FA_PAGE] Erreur de vérification 2FA:', error);
      setErrorMessage(error.message || safeTranslations.incorrect2FACode);
      setShowError(true);
      setTwoFactorCode('');
    } finally {
      isSubmitting.current = false;
    }
  };

  // Fonction pour gérer le copyright de manière sécurisée
  const renderCopyright = () => {
    const copyrightText = safeTranslations.copyright || 'Tous droits réservés. MYK.';
    
    if (copyrightText.includes('MYK')) {
      const parts = copyrightText.split('MYK');
      return (
        <>
          {parts[0]}
          <span className="text-purple-400 font-medium">MYK</span>
          {parts[1] || ''}
        </>
      );
    }
    
    return copyrightText;
  };

  // Afficher le SplashScreen si la vérification d'authentification initiale n'est pas terminée
  if (!initialAuthCheckComplete || loading) {
    console.log('⏳ [2FA_PAGE] Initialisation ou chargement AuthContext...');
    return <SplashScreen />;
  }

  // Si la 2FA n'est PAS requise OU si tempAuthData est manquant,
  // cette page n'est pas applicable. Retourner null pour laisser AuthContext rediriger.
  if (!twoFactorRequired || !tempAuthData?.tempToken) {
    console.log('❌ [2FA_PAGE] Conditions pour la page 2FA non remplies. Retourne null pour laisser AuthContext rediriger.');
    return null;
  }

  console.log('✅ [2FA_PAGE] Affichage de la page 2FA.');

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      }}
    >
      {/* Éléments décoratifs de fond */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, #ec4899 0%, transparent 50%)
          `
        }}
      />

      {/* Grille de fond animée */}
      <div
        className="absolute inset-0 opacity-1"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Cercles décoratifs animés */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-purple-400 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border border-blue-400 opacity-20 rounded-full animate-bounce" />

      {/* Contenu principal */}
      <div
        className="w-full max-w-lg p-8 text-center relative z-10 transform hover:scale-102 transition-transform duration-300"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '1.5rem',
          boxShadow: '0 0 30px rgba(76, 29, 149, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(139, 92, 246, 0.4)'
        }}
      >
        <div className="mb-4">
          <Shield size={64} className="text-purple-400 mx-auto animate-pulse" style={{
            filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))'
          }} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {safeTranslations.twoFactorVerificationTitle}
        </h1>

        {/* ✅ AMÉLIORATION: Gestion conditionnelle selon le type de setup */}
        {tempAuthData?.qrCodeUrl ? (
          <>
            <p className="text-gray-300 mb-6">
              {tempAuthData.setupReason === 'REACTIVATION_SETUP' 
                ? "🔄 Votre authentification à deux facteurs a été réactivée. Veuillez scanner ce nouveau QR code pour configurer votre application d'authentification."
                : tempAuthData.setupReason === 'SECRET_REGENERATION'
                ? "🔧 Un nouveau secret a été généré pour des raisons de sécurité. Veuillez reconfigurer votre application d'authentification."
                : tempAuthData.setupReason === 'USER_REQUESTED_REGENERATION'
                ? "🔄 Vous avez demandé la régénération du QR code. Veuillez scanner ce nouveau code."
                : safeTranslations.twoFactorInstructionsInitial}
            </p>

            {/* ✅ Messages spécifiques selon le contexte */}
            {tempAuthData.setupReason === 'REACTIVATION_SETUP' && (
              <div className="bg-orange-900 bg-opacity-50 text-orange-200 p-4 rounded-lg text-sm mb-6 border border-orange-500">
                <div className="flex items-center">
                  <Shield size={20} className="mr-3 flex-shrink-0" />
                  <span>
                    ⚠️ Pour des raisons de sécurité, un nouveau secret a été généré. 
                    Vous devez reconfigurer votre application d'authentification.
                  </span>
                </div>
              </div>
            )}

            {tempAuthData.setupReason === 'SECRET_REGENERATION' && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg text-sm mb-6 border border-red-500">
                <div className="flex items-center">
                  <Shield size={20} className="mr-3 flex-shrink-0" />
                  <span>
                    🔧 Le secret 2FA a été régénéré automatiquement. Supprimez l'ancien compte 
                    de votre app et configurez ce nouveau QR code.
                  </span>
                </div>
              </div>
            )}

            {/* Section QR Code avec bouton toggle */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-purple-400 mb-4 flex items-center justify-center mx-auto hover:text-purple-300 transition-colors duration-300"
              >
                <QrCode size={20} className="mr-2" />
                <span>{showQRCode ? safeTranslations.hideQRCode : safeTranslations.showQRCode}</span>
              </button>

              {showQRCode && (
                <div className="mb-6 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-lg shadow-lg transition-transform duration-300 hover:scale-102 mb-4" style={{
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                  }}>
                    <img
                      src={tempAuthData.qrCodeUrl}
                      alt="QR Code 2FA"
                      className="rounded-lg max-w-[200px] w-full"
                    />
                  </div>
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <Smartphone size={16} className="mr-2" />
                    <span>{safeTranslations.scanQRCode}</span>
                  </div>

                  {/* ✅ NOUVEAU: Affichage de la clé manuelle si disponible */}
                  {tempAuthData.manualEntryKey && (
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3 mb-4 border border-gray-600">
                      <p className="text-xs text-gray-400 mb-2">Clé manuelle (si scan impossible) :</p>
                      <p className="text-sm text-white font-mono break-all">{tempAuthData.manualEntryKey}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Instructions adaptées selon le contexte */}
              <div className="text-xs text-gray-400 mb-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-600">
                <p className="mb-2"><strong>{safeTranslations.instructions} :</strong></p>
                <ol className="text-left space-y-1">
                  <li>1. {tempAuthData.setupReason === 'REACTIVATION_SETUP' || tempAuthData.setupReason === 'SECRET_REGENERATION'
                    ? "Ouvrez votre application d'authentification existante"
                    : safeTranslations.installAuthenticatorApp}</li>
                  <li>2. {tempAuthData.setupReason === 'REACTIVATION_SETUP' || tempAuthData.setupReason === 'SECRET_REGENERATION'
                    ? "Supprimez l'ancien compte Gaming Center et scannez ce nouveau QR code"
                    : safeTranslations.scanQRCodeAbove}</li>
                  <li>3. {safeTranslations.enterGeneratedCode}</li>
                  {(tempAuthData.setupReason === 'REACTIVATION_SETUP' || tempAuthData.setupReason === 'SECRET_REGENERATION') && (
                    <li className="text-orange-300 font-medium">4. ⚠️ L'ancien code ne fonctionnera plus après cette configuration</li>
                  )}
                </ol>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-300 mb-6">
            {safeTranslations.twoFactorInstructionsExisting}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="twoFactorCode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {safeTranslations.verificationCodeLabel}
            </label>
            <input
              id="twoFactorCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="pl-3 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none text-center tracking-widest focus:ring-2 focus:ring-purple-400 transition-all duration-300 text-2xl"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
              placeholder="000000"
              value={twoFactorCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setTwoFactorCode(value);
                if (value.length === 6 && !isSubmitting.current) {
                  setTimeout(() => {
                    if (document.getElementById('twoFactorCode').value === value) {
                      handleSubmit(e);
                    }
                  }, 300);
                }
              }}
              required
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              disabled={loading || isSubmitting.current}
            />
            <div className="mt-2 text-xs text-gray-400">
              {safeTranslations.codeAutoSubmitHint}
            </div>
          </div>

          {showError && (
            <div
              className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg text-sm flex items-center animate-shake border border-red-500 mb-6"
              style={{ animation: 'shake 0.5s ease-in-out' }}
            >
              <XCircle size={20} className="mr-3 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Message d'aide contextuel */}
          {tempAuthData?.message && (
            <div className="bg-blue-900 bg-opacity-50 text-blue-200 p-4 rounded-lg text-sm mb-6 border border-blue-500">
              <div className="flex items-center">
                <Shield size={20} className="mr-3 flex-shrink-0" />
                <span>{tempAuthData.message}</span>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center transform hover:scale-102 active:scale-98 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
            disabled={loading || isSubmitting.current || twoFactorCode.length !== 6}
          >
            {loading || isSubmitting.current ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-semibold">{safeTranslations.verifyButton}</span>
                <CheckCircle size={20} className="ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Lien de retour */}
        <div className="mt-6">
          <button
            onClick={handleReturnToLogin}
            className="text-gray-400 hover:text-purple-300 text-sm transition-colors duration-300 flex items-center justify-center mx-auto"
            disabled={loading || isSubmitting.current}
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>{safeTranslations.returnToLogin}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-4" />
          <p className="text-xs text-gray-400 opacity-75">
            © 2025 Gaming Center Management. {renderCopyright()}
          </p>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default TwoFactorPage;