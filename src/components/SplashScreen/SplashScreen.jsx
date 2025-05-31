import React, { useState, useEffect } from 'react';
import OptimizedImage from '../common/OptimizedImage'; // AJOUT MANQUANT

const SplashScreen = ({ controlled = false, fadeOut = false, maxDuration = 3000 }) => {
  const [internalFadeOut, setInternalFadeOut] = useState(false);
  const [isUnmounting, setIsUnmounting] = useState(false);
  const [forceHide, setForceHide] = useState(false);
  
  const shouldFadeOut = controlled ? fadeOut : internalFadeOut;

  // Force la disparition du SplashScreen après un délai maximum
  useEffect(() => {
    const maxTimer = setTimeout(() => {
      setForceHide(true);
    }, maxDuration);
    
    return () => clearTimeout(maxTimer);
  }, [maxDuration]);

  useEffect(() => {
    // Si non contrôlé, déclencher le fadeOut automatiquement après un délai
    if (!controlled) {
      const timer = setTimeout(() => {
        setInternalFadeOut(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [controlled]);

  useEffect(() => {
    // Gérer la transition de démontage
    if (shouldFadeOut || forceHide) {
      const unmountTimer = setTimeout(() => {
        setIsUnmounting(true);
      }, 700); // Correspond à la durée de la transition
      
      return () => clearTimeout(unmountTimer);
    }
  }, [shouldFadeOut, forceHide]);

  if (isUnmounting && (shouldFadeOut || forceHide)) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center justify-center z-[9999] transition-all duration-700 ${
        (shouldFadeOut || forceHide) ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        pointerEvents: (shouldFadeOut || forceHide) ? 'none' : 'auto',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      }}
    >
      {/* Logo avec animation améliorée */}
      <div className="w-28 h-28 mb-8 animate-pulse" style={{ 
        filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.8))',
        animation: 'pulse 2s infinite'
      }}>
        <OptimizedImage 
          src="/logo2.png" 
          alt="Gaming Club Logo" 
          className="w-full h-full object-contain" 
          placeholder={true}
          placeholderColor="#8b5cf6"
        />
      </div>
      
      <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
        GAMING CLUB
      </h1>
      
      <div className="mt-6">
        <div className="w-14 h-14 rounded-full border-4 border-t-purple-500 border-r-purple-400 border-b-purple-300 border-l-purple-200 animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;