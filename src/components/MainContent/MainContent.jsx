import React from 'react';
import { motion } from 'framer-motion'; // Importez motion
import AppRoutes from '../../AppRoutes'; // Assurez-vous que le chemin est correct

// Composant principal pour le contenu
const MainContent = () => {

  // Variants pour l'animation de fondu
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  // Transitions pour l'animation
  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    // MODIFICATION : Ajout de classes dark: pour le thème sombre
    // bg-gray-50 en mode clair, dark:bg-gray-800 en mode sombre
    // text-gray-900 en mode clair, dark:text-gray-100 en mode sombre
    <motion.main
      className="overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out" // Nécessite l'utilisation de AnimatePresence dans un composant parent si vous changez de route
      transition={pageTransition}
    >
      {/* Ici, le composant AppRoutes gère l'affichage de la page correcte */}
      <AppRoutes />
    </motion.main>
  );
};

export default MainContent;
