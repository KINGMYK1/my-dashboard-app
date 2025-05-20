import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUsers } from '../../hooks/useUsers';

// Page utilisateurs d'exemple
const Users = () => {
  const { translations } = useLanguage();
  const { data: users, isLoading, isError, error } = useUsers();

  // Exemple de données à afficher même pendant le chargement
  const usersData = useMemo(() => {
    if (users && Array.isArray(users)) {
      return users;
    }
    
    // Données fictives pendant le chargement pour éviter un flash de contenu vide
    return [
      {
        id: 1,
        username: "Chargement...",
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        isActive: true
      }
    ];
  }, [users]);

  // Rendre la même structure mais avec des placeholders si nécessaire
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {translations?.userManagement || 'Gestion des Utilisateurs'}
      </h1>

      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">
          {translations?.userList || 'Liste des utilisateurs'}
        </h2>

        {/* Table des utilisateurs - toujours présente pour éviter les flashs */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom d'utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {usersData.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-600 ${isLoading ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{isLoading ? "..." : user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{isLoading ? "..." : user.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{isLoading ? "..." : user.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{isLoading ? "..." : user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {isError && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
              <p>Erreur: {error?.message || "Impossible de charger les utilisateurs"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Users);
