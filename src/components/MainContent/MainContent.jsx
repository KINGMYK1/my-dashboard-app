import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppRoutes from '../../AppRoutes';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Composant principal pour le contenu
const MainContent = () => {
  const location = useLocation();
  const { isInternalNavigation } = useAuth();

  // Version simplifiée des variants pour éviter les flashs
  const pageVariants = {
    initial: { opacity: 1 }, // Commencer déjà visible
    in: { opacity: 1 },
    out: { opacity: 1 }
  };

  // Transitions extrêmement rapides ou désactivées pour éviter les flashs
  const pageTransition = {
    type: "tween",
    duration: 0.01 // Pratiquement instantané
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-[calc(100vh-6rem)]"
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainContent;
