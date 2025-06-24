import React from 'react';
import { Check, Clock, Euro } from 'lucide-react';

const PlanSelector = ({ 
  options, 
  selectedPlan, 
  onSelectPlan, 
  dureeEstimee,
  isDarkMode 
}) => {
  const formatDuration = (minutes) => {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (heures === 0) return `${mins}min`;
    if (mins === 0) return `${heures}h`;
    return `${heures}h${mins}min`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-blue-500" />
        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Durée estimée: {formatDuration(dureeEstimee)}
        </span>
      </div>

      {options.map((option) => (
        <div
          key={option.id}
          onClick={() => onSelectPlan(option)}
          className={`
            relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${selectedPlan?.id === option.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
            }
            ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}
          `}
        >
          {/* Badge recommandé */}
          {option.recommande && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Recommandé
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                {selectedPlan?.id === option.id && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {option.nom}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatPrice(option.prix)}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDuration(option.dureeMinutes)}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {option.prixParMinute} MAD/min
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanSelector;