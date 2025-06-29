import React from 'react';
import { AlertTriangle, Clock, TrendingDown, Info } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';

const AlertesFinancieres = ({ alertes }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const alertesData = [
    {
      type: 'urgent',
      visible: alertes.transactionsUrgentes > 0,
      icone: AlertTriangle,
      titre: 'Transactions en attente urgentes',
      description: `${alertes.transactionsUrgentes} transactions en attente depuis plus de 24h (${formatCurrency(alertes.montantEnAttente)})`,
      action: 'Voir les transactions',
      actionUrl: '/transactions?statut=EN_ATTENTE'
    },
    {
      type: 'warning',
      visible: alertes.stockBas > 0,
      icone: Clock,
      titre: 'Stock bas détecté',
      description: `${alertes.stockBas} articles en rupture de stock`,
      action: 'Gérer le stock',
      actionUrl: '/stock'
    },
    {
      type: 'info',
      visible: alertes.performanceBaisse,
      icone: TrendingDown,
      titre: 'Performance en baisse',
      description: 'Le chiffre d\'affaires est en baisse par rapport à la période précédente',
      action: 'Voir les statistiques',
      actionUrl: '/statistiques'
    }
  ];

  const alertesVisibles = alertesData.filter(alerte => alerte.visible);

  if (alertesVisibles.length === 0) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center">
          <Info className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h3 className="font-medium text-green-800">Tout va bien !</h3>
            <p className="text-sm text-green-600">Aucune alerte financière en cours</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
        Alertes Financières
      </h3>
      
      <div className="space-y-3">
        {alertesVisibles.map((alerte, index) => {
          const IconeComponent = alerte.icone;
          const couleurs = {
            urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', subtext: 'text-red-600' },
            warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', subtext: 'text-orange-600' },
            info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', subtext: 'text-blue-600' }
          };
          
          const style = couleurs[alerte.type];
          
          return (
            <div key={index} className={`flex items-center justify-between p-4 ${style.bg} ${style.border} border rounded-lg`}>
              <div className="flex items-center flex-1">
                <IconeComponent className={`w-5 h-5 mr-3 ${style.subtext}`} />
                <div>
                  <h4 className={`font-medium ${style.text}`}>{alerte.titre}</h4>
                  <p className={`text-sm ${style.subtext}`}>{alerte.description}</p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.href = alerte.actionUrl}
              >
                {alerte.action}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AlertesFinancieres;