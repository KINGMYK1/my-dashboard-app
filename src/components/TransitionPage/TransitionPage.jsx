import React, { useState, useEffect } from 'react';
import SplashScreen from '../SplashScreen/SplashScreen';

// Composant qui gère la transition entre les pages
const TransitionPage = ({ onTransitionComplete, destination }) => {
  const [transitioning, setTransitioning] = useState(true);
  
  useEffect(() => {
    // Attendre que le navigateur ait terminé le rendu initial
    requestAnimationFrame(() => {
      // Phase 1 : permettre au splash d'apparaître complètement
      const timer1 = setTimeout(() => {
        // Marquer la transition comme terminée après un délai adéquat
        setTransitioning(false);
        
        // Phase 2 : attendre que la transition de sortie soit terminée
        const timer2 = setTimeout(() => {
          // Informer le parent que la transition est complètement terminée
          onTransitionComplete(destination);
        }, 500); // Correspond à la durée de la transition CSS dans SplashScreen
        
        return () => clearTimeout(timer2);
      }, 1200); // Délai suffisant pour garantir que le SplashScreen est entièrement visible
      
      return () => clearTimeout(timer1);
    });
  }, [onTransitionComplete, destination]);

  // Afficher le SplashScreen pendant la transition
  return <SplashScreen controlled={true} fadeOut={!transitioning} />;
};

export default TransitionPage;