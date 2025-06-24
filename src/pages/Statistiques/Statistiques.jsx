import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Statistiques = () => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <BarChart3 size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h1 className="text-3xl font-bold mb-4">Statistiques Détaillées</h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Page en cours de développement
          </p>
          <div className="mt-8 p-6 rounded-lg border-2 border-dashed border-purple-300">
            <p className="text-sm">
              Cette page contiendra les statistiques avancées des postes et sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;