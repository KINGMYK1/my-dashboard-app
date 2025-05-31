import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SplashScreen from '../SplashScreen/SplashScreen';

// Composant Image optimisé (inchangé)
const OptimizedImage = ({
  src,
  alt,
  className = '',
  style = {},
  placeholder = true,
  placeholderColor = '#8b5cf6',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-700 rounded-full`}
        style={style}
        {...props}
      >
        <div className="text-purple-400 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
            GC
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={style}>
      {!isLoaded && placeholder && (
        <div
          className={`${className} absolute inset-0 flex items-center justify-center animate-pulse rounded-full`}
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
            ...style
          }}
        >
          <div
            className="w-8 h-8 rounded-full animate-spin border-2 border-t-transparent"
            style={{ borderColor: placeholderColor }}
          />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={style}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
};

const LoginPage = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    loading,
    initialAuthCheckComplete,
    login
  } = useAuth();

  const { translations } = useLanguage();

  // ✅ SOLUTION: Valeurs par défaut pour éviter les erreurs
  const safeTranslations = {
    gamingClubTitle: 'Gaming Club',
    managementSystemSubtitle: 'Système de Gestion',
    usernameLabel: 'Nom d\'utilisateur',
    usernamePlaceholder: 'Entrez votre nom d\'utilisateur',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    rememberMe: 'Se souvenir de moi',
    loginButton: 'Se connecter',
    loginError: 'Erreur de connexion',
    copyright: 'Tous droits réservés. MYK.',
    ...translations // Les traductions réelles écrasent les valeurs par défaut
  };

  // Préchargement des images critiques
  useEffect(() => {
    const preloadImages = ['/logo2.png', '/logo.png'];
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      console.log('🔐 [LOGIN] Tentative de connexion...');

      await login({
        username: nomUtilisateur,
        password: motDePasse,
        rememberMe
      });

    } catch (error) {
      console.error('❌ [LOGIN] Erreur de connexion:', error);
      setErrorMessage(error.message || safeTranslations.loginError);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage du SplashScreen SEULEMENT pendant l'initialisation
  if (!initialAuthCheckComplete) {
    console.log('⏳ [LOGIN] Chargement initial...');
    return <SplashScreen />;
  }

  console.log('✅ [LOGIN] Affichage de la page de connexion');

  // ✅ FONCTION UTILITAIRE pour gérer le copyright de manière sécurisée
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
    
    // Si pas de MYK dans le texte, afficher tel quel
    return copyrightText;
  };

  // Rendu de la page de connexion avec le design sombre d'origine
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
            radial-gradient(circle at 20% 20%, #6366f1 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, #ec4899 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, #06b6d4 0%, transparent 50%)
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
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Cercles décoratifs animés */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-purple-400 opacity-20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border border-blue-400 opacity-20 rounded-full animate-bounce" />
      <div className="absolute top-1/3 right-20 w-16 h-16 border border-pink-400 opacity-20 rounded-full animate-pulse" />

      {/* Contenu principal */}
      <div
        className="w-full max-w-md p-8 relative z-10 transform hover:scale-100 transition-transform duration-300"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          borderRadius: '1.5rem',
          boxShadow: '0 0 30px rgba(76, 29, 149, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(139, 92, 246, 0.4)'
        }}
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="p-3 rounded-full"
              style={{
                width: '110px',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <OptimizedImage
                src="/logo2.png"
                alt="Gaming Club Logo"
                className="w-full h-full object-cover"
                placeholder={true}
                placeholderColor="#8b5cf6"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse">
            {safeTranslations.gamingClubTitle}
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            {safeTranslations.managementSystemSubtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-2 rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ nom d'utilisateur */}
          <div className="group">
            <label htmlFor="nomUtilisateur" className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-purple-300">
              {safeTranslations.usernameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <input
                id="nomUtilisateur"
                type="text"
                className="pl-10 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 group-hover:shadow-lg"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
                placeholder={safeTranslations.usernamePlaceholder}
                value={nomUtilisateur}
                onChange={(e) => setNomUtilisateur(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Champ mot de passe */}
          <div className="group">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-purple-300">
              {safeTranslations.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
              </div>
              <input
                id="motDePasse"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-12 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 group-hover:shadow-lg"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
                placeholder={safeTranslations.passwordPlaceholder}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Case à cocher */}
          <div className="flex items-center group">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-500 rounded bg-gray-700 transition-all duration-300"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 group-hover:text-purple-300 transition-colors cursor-pointer">
              {safeTranslations.rememberMe}
            </label>
          </div>

          {/* Message d'erreur */}
          {showError && (
            <div
              className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg text-sm flex items-center border border-red-500"
              style={{
                animation: 'shake 0.5s ease-in-out'
              }}
            >
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl"
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-semibold">{safeTranslations.loginButton}</span>
                <LogIn size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

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
        
        .hover\\:scale-104 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
