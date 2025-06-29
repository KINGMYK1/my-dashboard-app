import React from 'react';
import { Trophy, TrendingUp, Monitor, DollarSign } from 'lucide-react';
import { Card, Badge } from '../../../components/ui';

const TopPostes = ({ postes, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  };

  const getMedalIcon = (position) => {
    const medals = {
      0: '🥇',
      1: '🥈', 
      2: '🥉'
    };
    return medals[position] || `#${position + 1}`;
  };

  const getMedalColor = (position) => {
    const colors = {
      0: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      1: 'bg-gray-100 text-gray-800 border-gray-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[position] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!postes || postes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune donnée de poste disponible</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Top Postes par Performance
        </h3>
        <Badge variant="secondary">
          {postes.length} postes analysés
        </Badge>
      </div>

      <div className="space-y-4">
        {postes.slice(0, 10).map((poste, index) => (
          <div key={poste.posteId} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {/* Position et médaille */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-sm border-2 ${getMedalColor(index)}`}>
              {getMedalIcon(index)}
            </div>

            {/* Informations du poste */}
            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {poste.nomPoste}
                </h4>
                <div className="flex items-center text-green-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-bold">{formatCurrency(poste.chiffreAffaire)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>📊 {formatNumber(poste.nombreTransactions)} transactions</span>
                  <span>💰 Panier: {formatCurrency(poste.panierMoyen)}</span>
                </div>
                
                {/* Indicateur de performance */}
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {((poste.chiffreAffaire / (postes[0]?.chiffreAffaire || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {postes.length > 10 && (
          <div className="text-center py-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/statistiques/postes'}
            >
              Voir tous les postes ({postes.length})
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TopPostes;