import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SplashScreen from '../SplashScreen/SplashScreen';

const LoginPage = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, loading, initialAuthCheckComplete, login, twoFactorRequired, tempAuthData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (twoFactorRequired && tempAuthData) {
      navigate('/verify-2fa');
    }
  }, [user, twoFactorRequired, tempAuthData, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowError(false);
    setErrorMessage('');

    try {
      await login({ nomUtilisateur, motDePasse });
    } catch (error) {
      console.error('Erreur de connexion dans le composant:', error.message);
      setErrorMessage(error.message || 'Une erreur est survenue lors de la connexion.');
      setShowError(true);
    }
  };

  // Si la vérification d'authentification n'est pas terminée, afficher un écran de chargement
  if (!initialAuthCheckComplete || loading) {
    return <SplashScreen />;
  }

  // Si l'utilisateur est déjà connecté, rediriger directement vers le dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Styles (conservés tels quels, mais l'utilisation de classes Tailwind est recommandée)
  const styles = {
    body: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    loginContainer: {
      backgroundColor: 'rgba(30, 41, 59, 0.8)',
      borderRadius: '1rem',
      boxShadow: '0 0 20px rgba(76, 29, 149, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
    },
    loginBtn: {
      background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
      transition: 'all 0.3s ease',
    },
    inputField: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      transition: 'all 0.3s ease',
    },
    logoGlow: {
      filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))',
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center" style={styles.body}>
      <div className="w-full max-w-md p-8" style={styles.loginContainer}>
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div style={styles.logoGlow}>
              {/* Icône SVG conservée car elle fait partie du logo */}
              <svg className="w-24 h-24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176z" fill="#8b5cf6"/>
                <path d="M192 192h-48v128h48V192zM368 192h-48v128h48V192zM288 240h-64v32h64v-32z" fill="#8b5cf6"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">GAMING CENTER</h1>
          <p className="text-gray-300 mt-2">Système de Gestion</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nomUtilisateur" className="block text-sm font-medium text-gray-300 mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* MODIFICATION : Icône Lucide React */}
                <User size={20} className="text-purple-400" /> {/* size={20} pour une taille similaire */}
              </div>
              <input
                id="nomUtilisateur"
                type="text"
                className="pl-10 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none"
                style={styles.inputField}
                placeholder="Entrez votre nom d'utilisateur"
                value={nomUtilisateur}
                onChange={(e) => setNomUtilisateur(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 {/* MODIFICATION : Icône Lucide React */}
                <Lock size={20} className="text-purple-400" /> {/* size={20} pour une taille similaire */}
              </div>
              <input
                id="motDePasse"
                type="password"
                className="pl-10 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none"
                style={styles.inputField}
                placeholder="Entrez votre mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-500 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">Se souvenir de moi</label>
            </div>
          </div>

          {showError && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-6 text-sm">
              {/* MODIFICATION : Icône Lucide React */}
              <AlertCircle size={20} className="mr-2" /> {/* size={20} pour une taille similaire */}
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center"
            style={styles.loginBtn}
          >
            <span>Connexion</span>
             {/* MODIFICATION : Icône Lucide React */}
            <LogIn size={20} className="ml-2" /> {/* size={20} pour une taille similaire */}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>© 2025 Gaming Center Management. Tous droits réservés par MYK.</p>
        </div>
      </div>
    </div>
  );
};

// Styles (Note: L'utilisation de classes Tailwind est généralement préférée aux styles inline pour la cohérence)
const styles = {
  body: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  loginContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '1rem',
    boxShadow: '0 0 20px rgba(76, 29, 149, 0.5)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  loginBtn: {
    background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
    transition: 'all 0.3s ease',
  },
  inputField: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
  },
  logoGlow: {
    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))',
  }
};


export default LoginPage;
