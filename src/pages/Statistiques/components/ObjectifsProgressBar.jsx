import React from 'react';

const ObjectifsProgressBar = ({ actuel, objectif, showPercentage = false, className = "" }) => {
  const pourcentage = objectif > 0 ? Math.min((actuel / objectif) * 100, 100) : 0;
  
  const getColorClass = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progression</span>
        {showPercentage && (
          <span className="font-medium">{pourcentage.toFixed(1)}%</span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColorClass(pourcentage)}`}
          style={{ width: `${pourcentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatCurrency(actuel)}</span>
        <span>{formatCurrency(objectif)}</span>
      </div>
    </div>
  );
};

export default ObjectifsProgressBar;