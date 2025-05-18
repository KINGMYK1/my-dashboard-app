import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext'; // Importez le hook de langue si déjà mis en place

// Page utilisateurs d'exemple
const Users = () => {
  // Si vous avez déjà mis en place le contexte de langue, utilisez le hook
  const { translations } = useLanguage();

  return (
    <div className="space-y-6">
      {/* MODIFICATION : Utilisation de la traduction pour le titre et ajout dark: */}
      {/* text-gray-800 en mode clair, dark:text-gray-200 en mode sombre */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{translations?.userManagement || 'User Management'}</h1>

      {/* MODIFICATION : Ajout dark: pour le conteneur principal */}
      {/* bg-white en mode clair, dark:bg-gray-700 en mode sombre */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        {/* MODIFICATION : Utilisation de la traduction pour le titre et ajout dark: */}
        {/* text-gray-800 en mode clair, dark:text-gray-200 en mode sombre */}
        <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">{translations?.userList || 'User List'}</h2>
        {/* Contenu à implémenter */}
        {/* MODIFICATION : Utilisation des traductions et ajout dark: */}
        {/* text-gray-700 en mode clair, dark:text-gray-300 en mode sombre */}
        <p className="text-gray-700 dark:text-gray-300">{translations?.userManagementPlaceholder || 'User management interface to be implemented based on specific needs.'}</p>
        {/* MODIFICATION : Utilisation des traductions et ajout dark: */}
        {/* text-gray-600 en mode clair, dark:text-gray-400 en mode sombre */}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {translations?.userManagementDetails || 'Here you would add features like displaying a user table, forms for adding/editing users, managing roles and permissions, etc.'}
        </p>
      </div>
    </div>
  );
};

export default Users;
