import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { effectiveTheme } = useTheme();

  const isDarkMode = effectiveTheme === 'dark';

  // Fallback values for translations
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
    ...translations
  };

  // Preload critical images
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

  // Display SplashScreen ONLY during initialization
  if (!initialAuthCheckComplete) {
    console.log('⏳ [LOGIN] Chargement initial...');
    return <SplashScreen />;
  }

  console.log('✅ [LOGIN] Affichage de la page de connexion');

  // Utility function to handle copyright securely
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

  // Dynamic styles based on theme
  const bgColor = isDarkMode ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)' : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 25%, #a5b4fc 50%, #818cf8 75%, #6366f1 100%)';
  const cardBg = isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const cardBorder = isDarkMode ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(99, 102, 241, 0.4)';
  const cardShadow = isDarkMode ? '0 0 30px rgba(76, 29, 149, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : '0 0 30px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(0, 0, 0, 0.05)';
  const titleGradient = isDarkMode ? 'from-indigo-400 via-purple-400 to-pink-400' : 'from-blue-600 via-indigo-600 to-purple-600';
  const subtitleColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const labelColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const labelHoverColor = isDarkMode ? 'group-hover:text-purple-300' : 'group-hover:text-blue-600';
  const inputBg = isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.8)';
  const inputBorder = isDarkMode ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)';
  const inputText = isDarkMode ? 'text-white' : 'text-gray-900';
  const inputPlaceholder = isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const inputFocusRing = isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-blue-400';
  const iconColor = isDarkMode ? 'text-purple-400' : 'text-blue-600';
  const iconHoverColor = isDarkMode ? 'group-hover:text-purple-300' : 'group-hover:text-blue-500';
  const checkboxColor = isDarkMode ? 'text-purple-600 focus:ring-purple-500 border-gray-500 bg-gray-700' : 'text-blue-600 focus:ring-blue-500 border-gray-300 bg-white';
  const errorBg = isDarkMode ? 'bg-red-900 bg-opacity-50 text-red-200 border-red-500' : 'bg-red-100 text-red-800 border-red-400';
  const buttonBg = isDarkMode ? 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #818cf8 100%)';
  const buttonShadow = isDarkMode ? '0 4px 15px rgba(139, 92, 246, 0.4)' : '0 4px 15px rgba(59, 130, 246, 0.3)';
  const footerTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const footerDivider = isDarkMode ? 'via-purple-400' : 'via-blue-400';
  const footerAccentColor = isDarkMode ? 'text-purple-400' : 'text-blue-600';

  // Colors for background elements and gaming shapes
  const darkThemeColors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'];
  const lightThemeColors = ['#3b82f6', '#60a5fa', '#818cf8', '#a5b4fc'];
  const backgroundElementColors = isDarkMode ? darkThemeColors : lightThemeColors;

  // SVG paths for gaming shapes (X, O, Triangle, Square)
  const gamingShapes = [
    // X
    <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    // O (Circle)
    <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none"/>,
    // Triangle
    <path d="M12 2L2 22H22L12 2Z" strokeWidth="2" fill="none"/>,
    // Square
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" strokeWidth="2" fill="none"/>
  ];

  const getRandomColor = () => backgroundElementColors[Math.floor(Math.random() * backgroundElementColors.length)];

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: bgColor,
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, ${backgroundElementColors[0]} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${backgroundElementColors[1]} 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, ${backgroundElementColors[2]} 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, ${backgroundElementColors[3]} 0%, transparent 50%)
          `
        }}
      />

      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-1"
        style={{
          backgroundImage: `
            linear-gradient(${isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: getRandomColor(),
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Animated decorative circles (existing) */}
      <div className={`absolute top-10 left-10 w-32 h-32 border ${isDarkMode ? 'border-purple-400' : 'border-blue-400'} opacity-20 rounded-full animate-spin-slow`} />
      <div className={`absolute bottom-10 right-10 w-24 h-24 border ${isDarkMode ? 'border-blue-400' : 'border-indigo-400'} opacity-20 rounded-full animate-bounce`} />
      <div className={`absolute top-1/3 right-20 w-16 h-16 border ${isDarkMode ? 'border-pink-400' : 'border-purple-400'} opacity-20 rounded-full animate-pulse`} />

      {/* New Gaming Shapes */}
      {[...Array(15)].map((_, i) => {
        const shape = gamingShapes[Math.floor(Math.random() * gamingShapes.length)];
        const size = Math.random() * 40 + 20; // Size between 20px and 60px
        const color = getRandomColor();
        const animationDuration = `${Math.random() * 10 + 5}s`; // 5 to 15 seconds
        const animationDelay = `${Math.random() * 5}s`; // 0 to 5 seconds
        const animationType = ['animate-float', 'animate-spin-slow', 'animate-pulse'][Math.floor(Math.random() * 3)];

        return (
          <svg
            key={`gaming-shape-${i}`}
            className={`absolute opacity-15 ${animationType}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: animationDuration,
              animationDelay: animationDelay,
              transform: `rotate(${Math.random() * 360}deg)` // Initial random rotation
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
          >
            {shape}
          </svg>
        );
      })}

      {/* Main content */}
      <div
        className="w-full max-w-md p-8 relative z-10 transform hover:scale-100 transition-transform duration-300"
        style={{
          backgroundColor: cardBg,
          borderRadius: '1.5rem',
          boxShadow: cardShadow,
          backdropFilter: 'blur(15px)',
          border: cardBorder
        }}
      >
        {/* Logo and title */}
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
                placeholderColor={isDarkMode ? '#8b5cf6' : '#6366f1'}
              />
            </div>
          </div>

          <h1 className={`text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${titleGradient} animate-pulse`}>
            {safeTranslations.gamingClubTitle}
          </h1>
          <p className={`${subtitleColor} text-lg font-medium`}>
            {safeTranslations.managementSystemSubtitle}
          </p>
          <div className={`w-20 h-1 bg-gradient-to-r ${titleGradient} mx-auto mt-2 rounded-full`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field */}
          <div className="group">
            <label htmlFor="nomUtilisateur" className={`block text-sm font-medium ${labelColor} mb-2 transition-colors ${labelHoverColor}`}>
              {safeTranslations.usernameLabel}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className={`${iconColor} ${iconHoverColor} transition-colors`} />
              </div>
              <input
                id="nomUtilisateur"
                type="text"
                className={`pl-10 pr-3 py-3 w-full rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${inputText} ${inputPlaceholder}`}
                style={{
                  backgroundColor: inputBg,
                  border: inputBorder,
                }}
                placeholder={safeTranslations.usernamePlaceholder}
                value={nomUtilisateur}
                onChange={(e) => setNomUtilisateur(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="group">
            <label htmlFor="motDePasse" className={`block text-sm font-medium ${labelColor} mb-2 transition-colors ${labelHoverColor}`}>
              {safeTranslations.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className={`${iconColor} ${iconHoverColor} transition-colors`} />
              </div>
              <input
                id="motDePasse"
                type={showPassword ? "text" : "password"}
                className={`pl-10 pr-12 py-3 w-full rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all duration-300 group-hover:shadow-lg ${inputText} ${inputPlaceholder}`}
                style={{
                  backgroundColor: inputBg,
                  border: inputBorder,
                }}
                placeholder={safeTranslations.passwordPlaceholder}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${iconColor} hover:text-purple-300 transition-colors`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center group">
            <input
              id="remember-me"
              type="checkbox"
              className={`h-4 w-4 rounded transition-all duration-300 ${checkboxColor}`}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="remember-me" className={`ml-2 block text-sm ${labelColor} ${labelHoverColor} transition-colors cursor-pointer`}>
              {safeTranslations.rememberMe}
            </label>
          </div>

          {/* Error message */}
          {showError && (
            <div
              className={`p-4 rounded-lg text-sm flex items-center border animate-shake ${errorBg}`}
              style={{ animation: 'shake 0.5s ease-in-out' }}
            >
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl"
            style={{
              background: buttonBg,
              boxShadow: buttonShadow
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
          <div className={`w-full h-px bg-gradient-to-r from-transparent ${footerDivider} to-transparent mb-4`} />
          <p className={`text-xs ${footerTextColor} opacity-75`}>
            © 2025 Gaming Center Management. {renderCopyright()}
          </p>
        </div>
      </div>

      {/* Animation styles */}
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

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
