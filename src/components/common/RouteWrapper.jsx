import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Wrapper qui force le démontage propre des composants
 * quand on navigue vers une autre route
 */
const RouteWrapper = ({ children, routePath, onUnmount }) => {
  const location = useLocation();
  const isMountedRef = useRef(true);
  const cleanupRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    console.log(`🎯 [ROUTE_WRAPPER] Montage de ${routePath}`);

    return () => {
      isMountedRef.current = false;
      console.log(`🧹 [ROUTE_WRAPPER] Démontage de ${routePath}`);
      
      // Exécuter le cleanup personnalisé
      if (onUnmount && typeof onUnmount === 'function') {
        onUnmount();
      }
      
      // Exécuter le cleanup stocké
      if (cleanupRef.current && typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
  }, [routePath, onUnmount]);

  // Surveiller les changements de route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Si la route actuelle ne correspond plus au composant
    if (!currentPath.includes(routePath)) {
      console.log(`🚪 [ROUTE_WRAPPER] Route changée de ${routePath} vers ${currentPath}`);
      
      // Marquer comme démonté
      isMountedRef.current = false;
      
      // Déclencher le cleanup
      if (onUnmount && typeof onUnmount === 'function') {
        onUnmount();
      }
    }
  }, [location.pathname, routePath, onUnmount]);

  // Fonction pour enregistrer un cleanup
  const registerCleanup = (cleanupFn) => {
    cleanupRef.current = cleanupFn;
  };

  // Si on n'est plus sur la bonne route, ne pas rendre
  if (!location.pathname.includes(routePath)) {
    console.log(`❌ [ROUTE_WRAPPER] Route ${routePath} non active, pas de rendu`);
    return null;
  }

  // Cloner l'enfant et passer les props utiles
  return React.cloneElement(children, {
    isMountedFromRoute: isMountedRef.current,
    registerCleanup,
    ...children.props
  });
};

export default RouteWrapper;
