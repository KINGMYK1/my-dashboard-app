import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Clock, Users } from 'lucide-react';
import { Card } from '../../../components/ui';

const MetriquesRapides = ({ statistiques, tableauDeBord, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  };

  const metriques = [
    {
      titre: 'Chiffre d\'Affaires',
      valeur: formatCurrency(statistiques?.resume?.chiffreAffaireBrut),
      sousValeur: `Encaissé: ${formatCurrency(statistiques?.resume?.chiffreAffaireEncaisse)}`,
      icone: DollarSign,
      couleur: 'green',
      evolution: tableauDeBord?.evolution?.chiffreAffaire
    },
    {
      titre: 'Transactions',
      valeur: formatNumber(statistiques?.resume?.totalTransactions),
      sousValeur: `Validées: ${formatNumber(statistiques?.resume?.transactionsValidees)}`,
      icone: BarChart3,
      couleur: 'blue',
      evolution: tableauDeBord?.evolution?.nombreTransactions
    },
    {
      titre: 'Panier Moyen',
      valeur: formatCurrency(statistiques?.resume?.panierMoyen),
      sousValeur: `Performance: ${((statistiques?.performance?.tauxPaiementComplet || 0)).toFixed(1)}%`,
      icone: Users,
      couleur: 'purple',
      evolution: tableauDeBord?.evolution?.panierMoyen
    },
    {
      titre: 'En Attente',
      valeur: formatCurrency(statistiques?.resume?.montantEnAttente),
      sousValeur: `${formatNumber(statistiques?.resume?.transactionsEnAttente)} transactions`,
      icone: Clock,
      couleur: 'orange',
      urgent: (statistiques?.resume?.montantEnAttente || 0) > 1000
    }
  ];

  const getCouleurClasse = (couleur) => {
    const couleurs = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return couleurs[couleur] || 'text-gray-600';
  };

  const getEvolutionIcon = (evolution) => {
    if (!evolution) return null;
    return evolution >= 0 ? TrendingUp : TrendingDown;
  };

  const getEvolutionCouleur = (evolution) => {
    if (!evolution) return 'text-gray-500';
    return evolution >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metriques.map((metrique, index) => {
        const IconeComponent = metrique.icone;
        const EvolutionIcon = getEvolutionIcon(metrique.evolution);
        
        return (
          <Card 
            key={index} 
            className={`p-6 relative overflow-hidden ${
              metrique.urgent ? 'ring-2 ring-orange-200 border-orange-200' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metrique.titre}
                </p>
                <p className={`text-2xl font-bold ${getCouleurClasse(metrique.couleur)} mt-1`}>
                  {metrique.valeur}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrique.sousValeur}
                </p>
                
                {/* Évolution */}
                {EvolutionIcon && (
                  <div className={`flex items-center mt-2 ${getEvolutionCouleur(metrique.evolution)}`}>
                    <EvolutionIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      {Math.abs(metrique.evolution).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`flex-shrink-0 ${getCouleurClasse(metrique.couleur)}`}>
                <IconeComponent className="w-8 h-8" />
              </div>
            </div>
            
            {/* Indicateur d'urgence */}
            {metrique.urgent && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default MetriquesRapides;