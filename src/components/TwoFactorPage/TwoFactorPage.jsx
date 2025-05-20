import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom'; // Supprimé useNavigate
import { useAuth } from '../../contexts/AuthContext';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import SplashScreen from '../SplashScreen/SplashScreen';


const TwoFactorPage = () => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // MODIFICATION : Utilise loadingInitial et initialAuthCheckComplete
  const { user, loadingInitial, initialAuthCheckComplete, twoFactorRequired, tempAuthData, verifyTwoFactor } = useAuth();
  // Suppression de useNavigate

  // Ce useEffect est simplifié, il réagit aux changements d'état d'authentification
  // pour s'assurer que si l'état change *après* le chargement initial,
  // et que l'utilisateur est connecté ou 2FA n'est plus requise, la page est redirigée.
  useEffect(() => {
      // Si la vérification initiale est terminée
      if (initialAuthCheckComplete) {
          if (user) {
              // Si l'utilisateur est connecté, il devrait être redirigé par AuthContext
          } else if (!twoFactorRequired || !tempAuthData) {
              // Si 2FA n'est plus requise ou données temporaires manquantes, AuthContext devrait déjà avoir navigué
          }
      }
  }, [user, twoFactorRequired, tempAuthData, initialAuthCheckComplete]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowError(false);
    setErrorMessage('');

    try {
      // La fonction verifyTwoFactor du contexte gère l'appel API et la navigation
      await verifyTwoFactor(twoFactorCode);
      // La redirection est gérée dans le contexte après succès
    } catch (error) {
      console.error('Erreur de vérification 2FA dans le composant:', error.message);
      setErrorMessage(error.message || 'Code 2FA incorrect. Veuillez réessayer.');
      setShowError(true);
    }
  };

  // MODIFICATION : Afficher le splash screen si la vérification d'authentification initiale n'est pas terminée
  if (!initialAuthCheckComplete) {
    return <SplashScreen />;
  }

  // Ces redirections sont redondantes avec le useEffect de AuthContext, mais agissent comme un filet de sécurité
  // et peuvent rendre le rendu plus rapide pour les cas simples.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!twoFactorRequired || !tempAuthData) {
    return <Navigate to="/" replace />;
  }


  // Styles (peut être adapté avec Tailwind)
  const styles = {
      container: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      },
      card: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '1rem',
        boxShadow: '0 0 20px rgba(76, 29, 149, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      },
       inputField: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        transition: 'all 0.3s ease',
      },
       verifyBtn: {
        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        transition: 'all 0.3s ease',
      },
  };


  return (
     <div className="w-full min-h-screen flex flex-col items-center justify-center" style={styles.container}>
        <div className="w-full max-w-md p-8 text-center" style={styles.card}>
            <Shield size={64} className="text-purple-400 mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-white mb-4">Vérification en deux étapes</h1>
            <p className="text-gray-300 mb-6">
                Veuillez entrer le code de vérification de votre application d'authentification.
            </p>

            {tempAuthData.qrCodeUrl && (
                <div className="mb-6 flex justify-center">
                    <img src={tempAuthData.qrCodeUrl} alt="QR Code 2FA" className="rounded-lg border border-gray-700" />
                </div>
            )}
             {tempAuthData.qrCodeUrl && (
                 <p className="text-gray-400 text-sm mb-6">Scannez ce code avec votre application d'authentification (ex: Google Authenticator) et entrez le code généré.</p>
             )}


            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-300 mb-2">Code de vérification</label>
                     <input
                        id="twoFactorCode"
                        type="text"
                        className="pl-3 pr-3 py-3 w-full rounded-lg text-white placeholder-gray-400 outline-none text-center tracking-widest"
                        style={styles.inputField}
                        placeholder="------"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        required
                        maxLength={6} // Les codes TOTP ont généralement 6 chiffres
                      />
                </div>

                 {showError && (
                    <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                      <XCircle size={20} className="mr-2" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center"
                    style={styles.verifyBtn}
                    disabled={loadingInitial} // Désactiver le bouton pendant l'appel API verifyTwoFactor
                >
                     {loadingInitial ? (
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                     ) : (
                        <>
                          <span>Vérifier</span>
                          <CheckCircle size={20} className="ml-2" />
                        </>
                     )}
                </button>
            </form>
        </div>
     </div>
  );
};

export default TwoFactorPage;
