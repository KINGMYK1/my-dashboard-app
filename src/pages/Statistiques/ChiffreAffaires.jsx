import React, { useState } from 'react';
import { 
  TrendingUp, Target, Calendar, Download, 
  BarChart3, PieChart, DollarSign, Award 
} from 'lucide-react';
import { Card, Button, Select, DatePicker } from '../../components/ui';
import { useChiffreAffaires, useObjectifsCA } from '../../hooks/useChiffreAffaires';
import { useStatistiques } from '../../hooks/useStatistiques';
import StatistiquesChart from './components/StatistiquesChart';
import ObjectifsProgressBar from './components/ObjectifsProgressBar';
import { statistiquesService } from '../../services/statistiquesService';

const ChiffreAffaires = () => {
  const [periode, setPeriode] = useState('mois');
  const [vueType, setVueType] = useState('evolution'); // evolution, repartition, objectifs
  
  const { 
    loading: loadingCA, 
    donnees, 
    evolution, 
    changerPeriode 
  } = useChiffreAffaires(periode);
  
  const { objectifs, calculerProgression, obtenirStatutObjectif } = useObjectifsCA();
  
  const { statistiques, loading: loadingStats } = useStatistiques({
    dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateFin: new Date()
  });

  const loading = loadingCA || loadingStats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const handleExport = async () => {
    try {
      await statistiquesService.exporterDonnees('chiffre-affaires', {
        periode,
        dateDebut: donnees?.periode?.dateDebut,
        dateFin: donnees?.periode?.dateFin
      });
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const periodeOptions = [
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'trimestre', label: 'Ce trimestre' },
    { value: 'annee', label: 'Cette année' }
  ];

  const vueOptions = [
    { value: 'evolution', label: 'Évolution', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'repartition', label: 'Répartition', icon: <PieChart className="w-4 h-4" /> },
    { value: 'objectifs', label: 'Objectifs', icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Chiffre d'Affaires
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyse détaillée du chiffre d'affaires et performance commerciale
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={periode}
            onChange={(value) => {
              setPeriode(value);
              changerPeriode(value);
            }}
            options={periodeOptions}
          />
          
          <Select
            value={vueType}
            onChange={setVueType}
            options={vueOptions}
          />

          <Button
            onClick={handleExport}
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {donnees && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA Actuel ({periode})
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(donnees.resume.chiffreAffaireBrut)}
                </p>
                <p className="text-sm text-gray-500">
                  Objectif: {formatCurrency(objectifs[periode === 'mois' ? 'mensuel' : 'journalier'])}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <ObjectifsProgressBar
                actuel={donnees.resume.chiffreAffaireBrut}
                objectif={objectifs[periode === 'mois' ? 'mensuel' : 'journalier']}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA Encaissé
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(donnees.resume.chiffreAffaireEncaisse)}
                </p>
                <p className="text-sm text-gray-500">
                  Taux: {formatPercentage((donnees.resume.chiffreAffaireEncaisse / donnees.resume.chiffreAffaireBrut) * 100)}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {donnees.resume.totalTransactions}
                </p>
                <p className="text-sm text-gray-500">
                  Panier: {formatCurrency(donnees.resume.panierMoyen)}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Croissance
                </p>
                <p className={`text-2xl font-bold ${
                  donnees.croissance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {donnees.croissance >= 0 ? '+' : ''}{formatPercentage(donnees.croissance)}
                </p>
                <p className="text-sm text-gray-500">
                  vs période précédente
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${
                donnees.croissance >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </Card>
        </div>
      )}

      {/* Contenu principal selon la vue */}
      {vueType === 'evolution' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Graphique d'évolution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Évolution du Chiffre d'Affaires</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Période: {periode}</span>
              </div>
            </div>
            {evolution.length > 0 ? (
              <StatistiquesChart 
                data={evolution}
                type="area"
                dataKey="chiffreAffaire"
                xAxisKey="periode"
                height={400}
                formatValue={(value) => formatCurrency(value)}
              />
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune donnée d'évolution disponible</p>
                </div>
              </div>
            )}
          </Card>

          {/* Évolution détaillée */}
          {evolution.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tendance par Période</h3>
                <StatistiquesChart 
                  data={evolution}
                  type="bar"
                  dataKey="nombreTransactions"
                  xAxisKey="periode"
                  height={300}
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Panier Moyen</h3>
                <StatistiquesChart 
                  data={evolution}
                  type="line"
                  dataKey="panierMoyen"
                  xAxisKey="periode"
                  height={300}
                  formatValue={(value) => formatCurrency(value)}
                />
              </Card>
            </div>
          )}
        </div>
      )}

      {vueType === 'repartition' && statistiques && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par mode de paiement */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">CA par Mode de Paiement</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parModePaiement}
              type="pie"
              dataKey="montantTotal"
              nameKey="mode"
              height={300}
            />
          </Card>

          {/* Répartition par type de transaction */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">CA par Type de Transaction</h3>
            <StatistiquesChart 
              data={statistiques.repartitions.parType}
              type="bar"
              dataKey="montantTotal"
              xAxisKey="type"
              height={300}
            />
          </Card>

          {/* Top postes */}
          {statistiques.topPostes.length > 0 && (
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Top Postes - Contribution au CA</h3>
              <StatistiquesChart 
                data={statistiques.topPostes.slice(0, 10)}
                type="bar"
                dataKey="chiffreAffaire"
                xAxisKey="nomPoste"
                height={300}
                formatValue={(value) => formatCurrency(value)}
              />
            </Card>
          )}
        </div>
      )}

      {vueType === 'objectifs' && (
        <div className="space-y-6">
          {/* Objectifs de performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Suivi des Objectifs
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Objectif journalier */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Objectif Journalier</h4>
                  <span className="text-sm text-gray-500">{formatCurrency(objectifs.journalier)}</span>
                </div>
                <ObjectifsProgressBar
                  actuel={donnees?.resume?.chiffreAffaireJour || 0}
                  objectif={objectifs.journalier}
                  showPercentage={true}
                />
                <p className="text-sm text-gray-600">
                  Réalisé: {formatCurrency(donnees?.resume?.chiffreAffaireJour || 0)}
                </p>
              </div>

              {/* Objectif mensuel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Objectif Mensuel</h4>
                  <span className="text-sm text-gray-500">{formatCurrency(objectifs.mensuel)}</span>
                </div>
                <ObjectifsProgressBar
                  actuel={donnees?.resume?.chiffreAffaireBrut || 0}
                  objectif={objectifs.mensuel}
                  showPercentage={true}
                />
                <p className="text-sm text-gray-600">
                  Réalisé: {formatCurrency(donnees?.resume?.chiffreAffaireBrut || 0)}
                </p>
              </div>

              {/* Objectif annuel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Objectif Annuel</h4>
                  <span className="text-sm text-gray-500">{formatCurrency(objectifs.annuel)}</span>
                </div>
                <ObjectifsProgressBar
                  actuel={donnees?.resume?.chiffreAffaireAnnuel || 0}
                  objectif={objectifs.annuel}
                  showPercentage={true}
                />
                <p className="text-sm text-gray-600">
                  Réalisé: {formatCurrency(donnees?.resume?.chiffreAffaireAnnuel || 0)}
                </p>
              </div>
            </div>
          </Card>

          {/* Prévisions et tendances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Prévisions</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">CA prévu fin de mois</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency((donnees?.resume?.chiffreAffaireBrut || 0) * 1.15)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Objectif atteignable</span>
                  <span className="font-bold text-green-600">
                    {calculerProgression(donnees?.resume?.chiffreAffaireBrut || 0, objectifs.mensuel) > 80 ? 'Oui' : 'Difficile'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Croissance recommandée</span>
                  <span className="font-bold text-purple-600">+12%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analyse de Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Atteinte objectifs</span>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      calculerProgression(donnees?.resume?.chiffreAffaireBrut || 0, objectifs.mensuel) > 80 
                        ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-sm">
                      {obtenirStatutObjectif(calculerProgression(donnees?.resume?.chiffreAffaireBrut || 0, objectifs.mensuel))}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Tendance générale</span>
                  <div className="flex items-center">
                    <TrendingUp className={`w-4 h-4 mr-2 ${
                      (donnees?.croissance || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className="text-sm">
                      {(donnees?.croissance || 0) >= 0 ? 'Positive' : 'Négative'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Saisonnalité</span>
                  <span className="text-sm">Normale</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-center">Chargement des données...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiffreAffaires;