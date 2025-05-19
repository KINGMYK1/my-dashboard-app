import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simuler une vérification d'identifiants (à remplacer par votre API)
    // MODIFICATION : Redirection vers /dashboard
    if (username === 'admin' && password === 'password') {
      // Connexion réussie
      // Dans une vraie application, vous stockeriez un token ou un état d'auth ici
      navigate('/dashboard'); // Redirige vers le tableau de bord
    } else {
      // Afficher message d'erreur
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // Masquer après 3 secondes
    }
  };

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
      // Note: Les pseudo-classes comme '&:hover' ne fonctionnent pas directement avec les styles inline.
      // Il faudrait les gérer avec des états ou utiliser du CSS/Tailwind.
      // '&:hover': {
      //   transform: 'translateY(-2px)',
      //   boxShadow: '0 4px 12px rgba(139, 92, 246, 0.5)',
      // }
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
    // MODIFICATION : Applique le style de body au conteneur principal de la page
    <div className="w-full min-h-screen flex flex-col items-center justify-center" style={styles.body}>
      <div className="w-full max-w-md p-8" style={styles.loginContainer}>
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div style={styles.logoGlow}>
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-user text-purple-400"></i>
              </div>
              <input
                id="username"
                type="text"
                className="pl-10 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none"
                style={styles.inputField}
                placeholder="Entrez votre nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-lock text-purple-400"></i>
              </div>
              <input
                id="password"
                type="password"
                className="pl-10 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none"
                style={styles.inputField}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>Identifiants incorrects. Veuillez réessayer.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center"
            style={styles.loginBtn}
          >
            <span>Connexion</span>
            <i className="fas fa-sign-in-alt ml-2"></i>
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
    // minHeight: '100vh', // Géré par les classes Tailwind sur le div parent
    // display: 'flex', // Géré par les classes Tailwind sur le div parent
    // flexDirection: 'column', // Géré par les classes Tailwind sur le div parent
    // alignItems: 'center', // Géré par les classes Tailwind sur le div parent
    // justifyContent: 'center', // Géré par les classes Tailwind sur le div parent
    color: '#fff', // Géré par les classes Tailwind sur le div parent
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Peut être défini dans index.css ou tailwind.config.js
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
    // Note: Les pseudo-classes comme '&:hover' ne fonctionnent pas directement avec les styles inline.
    // Il faudrait les gérer avec des états ou utiliser du CSS/Tailwind.
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
