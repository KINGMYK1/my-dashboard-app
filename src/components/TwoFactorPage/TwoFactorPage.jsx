import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// MODIFICATION : Import des icônes Lucide React
import { Shield, CheckCircle, XCircle } from 'lucide-react';


const TwoFactorPage = () => {
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const { user, loading, twoFactorRequired, tempAuthData, verifyTwoFactor } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (!twoFactorRequired || !tempAuthData) {
      navigate('/');
    }
  }, [user, twoFactorRequired, tempAuthData, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowError(false);
    setErrorMessage('');

    try {
      await verifyTwoFactor(twoFactorCode);
    } catch (error) {
      console.error('Erreur de vérification 2FA dans le composant:', error.message);
      setErrorMessage(error.message || 'Code 2FA incorrect. Veuillez réessayer.');
      setShowError(true);
    }
  };

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


  if (loading) {
      return <div>Chargement de l'état d'authentification...</div>;
  }

   if (!twoFactorRequired || !tempAuthData) {
       return null;
   }


  return (
     <div className="w-full min-h-screen flex flex-col items-center justify-center" style={styles.container}>
        <div className="w-full max-w-md p-8 text-center" style={styles.card}>
            {/* MODIFICATION : Icône Lucide React */}
            <Shield size={64} className="text-purple-400 mb-4 mx-auto" /> {/* size et mx-auto pour centrer */}
            <h1 className="text-2xl font-bold text-white mb-4">Vérification en deux étapes</h1>
            <p className="text-gray-300 mb-6">
                Veuillez entrer le code de vérification de votre application d'authentification.
            </p>

            {/* Afficher le QR code si disponible (première connexion avec 2FA) */}
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
                      {/* MODIFICATION : Icône Lucide React */}
                      <XCircle size={20} className="mr-2" /> {/* size={20} pour une taille similaire */}
                      <span>{errorMessage}</span>
                    </div>
                  )}

                <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center"
                    style={styles.verifyBtn}
                >
                    <span>Vérifier</span>
                    {/* MODIFICATION : Icône Lucide React */}
                    <CheckCircle size={20} className="ml-2" /> {/* size={20} pour une taille similaire */}
                </button>
            </form>
        </div>
     </div>
  );
};

export default TwoFactorPage;
