import React, { useState, useEffect } from 'react';
import { Activity, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card } from '../../../components/ui';

const MetriquesTempsReel = ({ tableauDeBord }) => {
  const [metriques, setMetriques] = useState({
    caTempsReel: 0,
    transactionsTempsReel: 0,
    dernierPaiement: null,
    tendance: 0
  });

  const [animation, setAnimation] = useState({
    ca: false,
    transactions: false
  });

  useEffect(() => {
    if (tableauDeBord?.jour) {
      const nouvellescaMetriques = {
        caTempsReel: tableauDeBord.jour.resume.chiffreAffaireBrut,
        transactionsTempsReel: tableauDeBord.jour.resume.totalTransactions,
        dernierPaiement: new Date(),
        tendance: Math.random() * 10 - 5 // Simulation de tendance
      };

      // Animation si les valeurs changent
      if (nouvellescaMetriques.caTempsReel !== metriques.caTempsReel) {
        setAnimation(prev => ({ ...prev, ca: true }));
        setTimeout(() => setAnimation(prev => ({ ...prev, ca: false })), 1000);
      }

      if (nouvellescaMetriques.transactionsTempsReel !== metriques.transactionsTempsReel) {
        setAnimation(prev => ({ ...prev, transactions: true }));
        setTimeout(() => setAnimation(prev => ({ ...prev, transactions: false })), 1000);
      }

      setMetriques(nouvellescaMetriques);
    }
  }, [tableauDeBord, metriques.caTempsReel, metriques.transactionsTempsReel]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CA en temps réel */}
      <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">CA Temps Réel</p>
            <p className={`text-2xl font-bold transition-all duration-500 ${
              animation.ca ? 'scale-110 text-yellow-300' : ''
            }`}>
              {formatCurrency(metriques.caTempsReel)}
            </p>
          </div>
          <DollarSign className={`w-8 h-8 text-green-200 ${
            animation.ca ? 'animate-pulse' : ''
          }`} />
        </div>
        <div className="flex items-center mt-2">
          <Activity className="w-4 h-4 mr-1" />
          <span className="text-xs text-green-100">Live</span>
        </div>
      </Card>

      {/* Transactions temps réel */}
      <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Transactions Live</p>
            <p className={`text-2xl font-bold transition-all duration-500 ${
              animation.transactions ? 'scale-110 text-yellow-300' : ''
            }`}>
              {metriques.transactionsTempsReel}
            </p>
          </div>
          <TrendingUp className={`w-8 h-8 text-blue-200 ${
            animation.transactions ? 'animate-bounce' : ''
          }`} />
        </div>
        <div className="flex items-center mt-2">
          <Activity className="w-4 h-4 mr-1" />
          <span className="text-xs text-blue-100">Actif</span>
        </div>
      </Card>

      {/* Dernier paiement */}
      <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Dernier Paiement</p>
            <p className="text-lg font-bold">
              {metriques.dernierPaiement ? formatTime(metriques.dernierPaiement) : '--:--:--'}
            </p>
          </div>
          <Clock className="w-8 h-8 text-purple-200" />
        </div>
        <div className="flex items-center mt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs text-purple-100">En ligne</span>
        </div>
      </Card>

      {/* Tendance */}
      <Card className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Tendance</p>
            <p className={`text-2xl font-bold ${
              metriques.tendance >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {metriques.tendance >= 0 ? '+' : ''}{metriques.tendance.toFixed(1)}%
            </p>
          </div>
          <TrendingUp className={`w-8 h-8 text-orange-200 ${
            metriques.tendance >= 0 ? '' : 'transform rotate-180'
          }`} />
        </div>
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            metriques.tendance >= 0 ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-xs text-orange-100">
            {metriques.tendance >= 0 ? 'Positive' : 'Négative'}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default MetriquesTempsReel;