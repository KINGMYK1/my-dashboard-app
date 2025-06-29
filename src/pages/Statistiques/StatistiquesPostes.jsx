import React, { useState } from 'react';
import { Monitor, TrendingUp, BarChart, Filter, Download } from 'lucide-react';
import { Card, Button, Select, DatePicker, Input } from '../../components/ui';
import { useStatistiquesPostes } from '../../hooks/useStatistiques';
import StatistiquesChart from './components/StatistiquesChart';
import PostePerformanceTable from './components/PostePerformanceTable';

const StatistiquesPostes = () => {
  const [filtres, setFiltres] = useState({
    dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateFin: new Date(),
    top: 20,
    triePar: 'chiffreAffaire'
  });

  const { statsPostes, loading, refresh } = useStatistiquesPostes(filtres);

  const handleFiltreChange = (key, value) => {
    setFiltres(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Monitor className="w-6 h-6 mr-2" />
            Statistiques par Poste
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyse détaillée des performances de chaque poste de jeu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <DatePicker
            value={filtres.dateDebut}
            onChange={(date) => handleFiltreChange('dateDebut', date)}
            label="Du"
          />
          
          <DatePicker
            value={filtres.dateFin}
            onChange={(date) => handleFiltreChange('dateFin', date)}
            label="Au"
          />

          <Select
            value={filtres.triePar}
            onChange={(value) => handleFiltreChange('triePar', value)}
            options={[
              { value: 'chiffreAffaire', label: 'Chiffre d\'affaires' },
              { value: 'nombreTransactions', label: 'Nombre de transactions' },
              { value: 'panierMoyen', label: 'Panier moyen' },
              { value: 'tempsUtilisation', label: 'Temps d\'utilisation' }
            ]}
          />

          <Input
            type="number"
            value={filtres.top}
            onChange={(e) => handleFiltreChange('top', parseInt(e.target.value))}
            placeholder="Top"
            min="5"
            max="50"
            className="w-20"
          />

          <Button
            onClick={refresh}
            disabled={loading}
            icon={<TrendingUp className="w-4 h-4" />}
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      {statsPostes && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Postes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsPostes.topPostes?.length || 0}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CA Total Postes</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(statsPostes.resume?.chiffreAffaireBrut)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statsPostes.resume?.panierMoyen)}
                </p>
              </div>
              <BarChart className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'Occupation</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((statsPostes.resume?.tauxOccupation || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <Monitor className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statsPostes?.topPostes && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 - Chiffre d'Affaires</h3>
            <StatistiquesChart 
              data={statsPostes.topPostes.slice(0, 10)}
              type="bar"
              dataKey="chiffreAffaire"
              xAxisKey="nomPoste"
              height={300}
            />
          </Card>
        )}

        {statsPostes?.topPostes && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Répartition des Transactions</h3>
            <StatistiquesChart 
              data={statsPostes.topPostes.slice(0, 8)}
              type="pie"
              dataKey="nombreTransactions"
              nameKey="nomPoste"
              height={300}
            />
          </Card>
        )}
      </div>

      {/* Tableau détaillé */}
      {statsPostes?.topPostes && (
        <Card>
          <PostePerformanceTable 
            postes={statsPostes.topPostes}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
};

export default StatistiquesPostes;