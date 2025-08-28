import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useStatistiquesCompletes } from '../../hooks/useStatistiques';
import { Card, CardHeader, CardContent } from '../../components/ui';

const StatistiquesTransactions = () => {
  const { effectiveTheme } = useTheme();
  const getAnneeActuelleFiltres = () => {
    const anneeActuelle = new Date().getFullYear();
    const dateDebut = new Date(anneeActuelle, 0, 1).toISOString().split('T')[0];
    const dateFin = new Date(anneeActuelle, 11, 31).toISOString().split('T')[0];
    return { dateDebut, dateFin };
  };

  const [filtres, setFiltres] = useState({
    dateDebut: getAnneeActuelleFiltres().dateDebut,
    dateFin: getAnneeActuelleFiltres().dateFin,
    groupBy: 'day'
  });

  const {
    data: statistiquesData,
    isLoading,
    error,
    refetch
  } = useStatistiquesCompletes(filtres);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ CORRECTION: Extraire les données correctement
  const statistiques = statistiquesData?.data || statistiquesData;

  console.log('📊 [STATS_TRANSACTIONS] Données reçues:', statistiquesData);
  console.log('📊 [STATS_TRANSACTIONS] Statistiques extraites:', statistiques);

  const handleFiltreChange = (nouveauxFiltres) => {
    setFiltres(prev => ({ ...prev, ...nouveauxFiltres }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  if (error) {
    console.error('Erreur statistiques:', error);
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Erreur lors du chargement des statistiques</p>
              <button 
                onClick={() => refetch()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Statistiques des Transactions
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Filtres</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <input
                type="date"
                value={filtres.dateDebut}
                onChange={(e) => handleFiltreChange({ dateDebut: e.target.value })}
                className={`w-full p-2 border rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <input
                type="date"
                value={filtres.dateFin}
                onChange={(e) => handleFiltreChange({ dateFin: e.target.value })}
                className={`w-full p-2 border rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Groupement</label>
              <select
                value={filtres.groupBy}
                onChange={(e) => handleFiltreChange({ groupBy: e.target.value })}
                className={`w-full p-2 border rounded ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="hour">Par heure</option>
                <option value="day">Par jour</option>
                <option value="week">Par semaine</option>
                <option value="month">Par mois</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ CORRECTION: Métriques simplifiées si pas de composant dédié */}
      {statistiques?.resume && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Résumé de la période</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(statistiques.resume.totalTransactions)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(statistiques.resume.chiffreAffaireBrut)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CA Brut</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statistiques.resume.chiffreAffaireEncaisse)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CA Encaissé</div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(statistiques.resume.panierMoyen)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Panier Moyen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ CORRECTION: Table simple des données d'évolution */}
      {statistiques?.evolutionTemporelle && statistiques.evolutionTemporelle.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Évolution Temporelle</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-2">Période</th>
                    <th className="text-right p-2">Transactions</th>
                    <th className="text-right p-2">Chiffre d'Affaires</th>
                    <th className="text-right p-2">Montant Encaissé</th>
                    <th className="text-right p-2">Panier Moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {statistiques.evolutionTemporelle.map((periode, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="p-2">{periode.periode}</td>
                      <td className="text-right p-2">{formatNumber(periode.nombreTransactions)}</td>
                      <td className="text-right p-2">{formatCurrency(periode.chiffreAffaire)}</td>
                      <td className="text-right p-2">{formatCurrency(periode.montantEncaisse)}</td>
                      <td className="text-right p-2">{formatCurrency(periode.panierMoyen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message si pas de données */}
      {!statistiques || (!statistiques.resume && !statistiques.evolutionTemporelle) && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <p>Aucune donnée disponible pour la période sélectionnée</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatistiquesTransactions;