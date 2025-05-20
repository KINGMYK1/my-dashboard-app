import React, { useState, useEffect } from 'react';

const SplashScreen = ({ controlled = false, fadeOut = false }) => {
  // État interne si non contrôlé
  const [internalFadeOut, setInternalFadeOut] = useState(false);
  // État pour contrôler l'affichage complet
  const [isUnmounting, setIsUnmounting] = useState(false);
  
  // Utiliser fadeOut externe si contrôlé, sinon l'état interne
  const shouldFadeOut = controlled ? fadeOut : internalFadeOut;

  // Effet pour gestion automatique du fadeOut si non contrôlé
  useEffect(() => {
    if (!controlled) {
      // Augmenter la durée du SplashScreen pour s'assurer que tout est bien chargé
      const timer = setTimeout(() => {
        setInternalFadeOut(true);
        
        // Commencer le démontage après la transition d'opacité
        setTimeout(() => {
          setIsUnmounting(true);
        }, 700); // Correspond à la durée de transition
      }, 1500); // Augmenté à 1.5s pour garantir un chargement complet

      return () => clearTimeout(timer);
    } else if (fadeOut) {
      // Si contrôlé et fadeOut est true, programmer le démontage
      const unmountTimer = setTimeout(() => {
        setIsUnmounting(true);
      }, 700); // Correspond à la durée de transition
      
      return () => clearTimeout(unmountTimer);
    }
  }, [controlled, fadeOut]);

  // Si le composant est en cours de démontage et que nous voulons qu'il disparaisse
  if (isUnmounting && shouldFadeOut) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-[9999] transition-all duration-700 ${shouldFadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        pointerEvents: shouldFadeOut ? 'none' : 'auto',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDelay: shouldFadeOut ? '100ms' : '0ms',
        // Garantir que le composant occupe vraiment tout l'écran
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <div className="w-24 h-24 mb-8" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))' }}>
        {/* Logo SVG avec animation */}
        <svg className="w-full h-full animate-pulse" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176z" fill="#8b5cf6"/>
          <path d="M192 192h-48v128h48V192zM368 192h-48v128h48V192zM288 240h-64v32h64v-32z" fill="#8b5cf6"/>
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
        GAMING CENTER
      </h1>
      
      {/* Spinner circulaire */}
      <div className="mt-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-purple-400 border-b-purple-300 border-l-purple-200 animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;