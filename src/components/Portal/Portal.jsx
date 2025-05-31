import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, containerId = 'modal-root' }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Chercher le conteneur existant
    let modalContainer = document.getElementById(containerId);
    
    // Créer le conteneur s'il n'existe pas
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = containerId;
      modalContainer.style.position = 'relative';
      modalContainer.style.zIndex = '2099';
      document.body.appendChild(modalContainer);
    }
    
    setContainer(modalContainer);
    
    // Cleanup lors du démontage
    return () => {
      if (modalContainer && modalContainer.parentNode && modalContainer.children.length === 0) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    };
  }, [containerId]);

  // Gérer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (container) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurer le scroll du body
        document.body.style.overflow = 'unset';
      };
    }
  }, [container]);

  return container ? createPortal(children, container) : null;
};

export default Portal;