import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppRoutes from '../../AppRoutes';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Composant principal pour le contenu
const MainContent = () => {
  const location = useLocation();
  const { isInternalNavigation } = useAuth();

  // Variants simplifiés pour une animation plus rapide
  const pageVariants = {
    initial: { opacity: isInternalNavigation ? 0.8 : 0 },
    in: { opacity: 1 },
    out: { opacity: isInternalNavigation ? 0.8 : 0 }
  };

  // Transitions ultra-rapides pour les navigations internes
  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: isInternalNavigation ? 0.1 : 0.2
  };

  return (
    // bg-gray-50 en mode clair, dark:bg-gray-800 en mode sombre
    // text-gray-900 en mode clair, dark:text-gray-100 en mode sombre
    <div className="overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-[calc(100vh-6rem)]" // Assure une hauteur minimale
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainContent;
