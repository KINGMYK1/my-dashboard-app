import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Monitor,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  FileSpreadsheet,
  DollarSign,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Calendar,
  Zap,
  Target
} from 'lucide-react';
import { usePosteStatisticsAdvanced, usePosteStatisticsExport } from '../../hooks/usePosteStatisticsAdvanced';
import { useNotificationIntegration } from '../../hooks/useNotificationIntegration';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PERIODS = {
  '7j': { label: '7 derniers jours', days: 7 },
  '30j': { label: '30 derniers jours', days: 30 },
  'mois': { label: 'Ce mois', custom: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  'trimestre': { label: 'Ce trimestre', days: 90 }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

export const StatistiquesPostesAvancees = () => {
  const [periode, setPeriode] = useState('30j');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { notifyError, notifySuccess } = useNotificationIntegration();

  // Calcul des filtres de date
  const filtres = useMemo(() => {
    const periodConfig = PERIODS[periode];
    let dateDebut, dateFin;

    if (periodConfig.custom) {
      const { start, end } = periodConfig.custom();
      dateDebut = start;
      dateFin = end;
    } else {
      dateFin = new Date();
      dateDebut = subDays(dateFin, periodConfig.days);
    }

    return {
      periode,
      dateDebut: format(dateDebut, 'yyyy-MM-dd'),
      dateFin: format(dateFin, 'yyyy-MM-dd'),
      includeInactifs: false,
      groupByType: true
    };
  }, [periode]);

  // Hooks pour les données
  const {
    statistiquesGenerales,
    tauxOccupation,
    revenus,
    performance,
    heuresPointe,
    isLoading,
    refetchAll
  } = usePosteStatisticsAdvanced(filtres);

  const { exportToPDF, exportToExcel, exportRapportDetaille, isExporting } = usePosteStatisticsExport();

  // Données transformées pour les graphiques
  const donneesOccupation = useMemo(() => {
    if (!tauxOccupation.data?.parPoste) return [];
    
    return tauxOccupation.data.parPoste.map((poste, index) => ({
      nom: poste.nom,
      taux: poste.tauxOccupation || 0,
      heuresOccupe: poste.heuresOccupe || 0,
      heuresTotal: poste.heuresTotal || 0,
      couleur: COLORS[index % COLORS.length],
      status: getTauxOccupationStatus(poste.tauxOccupation || 0)
    }));
  }, [tauxOccupation.data]);

  const donneesRevenus = useMemo(() => {
    if (!revenus.data?.parPoste) return [];
    
    return revenus.data.parPoste.map((poste, index) => ({
      nom: poste.nom,
      revenus: poste.revenusTotal || 0,
      revenusParHeure: poste.revenusParHeure || 0,
      couts: poste.coutsExploitation || 0,
      benefice: (poste.revenusTotal || 0) - (poste.coutsExploitation || 0),
      roi: poste.roiPourcentage || 0,
      couleur: COLORS[index % COLORS.length]
    }));
  }, [revenus.data]);

  const donneesPerformance = useMemo(() => {
    if (!performance.data?.ranking) return [];
    
    return performance.data.ranking.map((poste, index) => ({
      nom: poste.nom,
      score: poste.scorePerformance || 0,
      position: index + 1,
      metriques: {
        occupation: poste.tauxOccupation || 0,
        revenus: poste.revenusTotal || 0,
        efficacite: poste.efficacite || 0
      }
    }));
  }, [performance.data]);

  // Fonctions utilitaires
  const getTauxOccupationStatus = (taux) => {
    if (taux >= 80) return 'excellent';
    if (taux >= 60) return 'bon';
    if (taux >= 40) return 'moyen';
    return 'faible';
  };

  const calculerMoyenneOccupation = () => {
    if (!donneesOccupation.length) return 0;
    return donneesOccupation.reduce((sum, poste) => sum + poste.taux, 0) / donneesOccupation.length;
  };

  const calculerRevenuTotal = () => {
    if (!donneesRevenus.length) return 0;
    return donneesRevenus.reduce((sum, poste) => sum + poste.revenus, 0);
  };

  // Handlers
  const handleExport = async (format) => {
    try {
      const exportData = {
        vueEnsemble: {
          totalPostes: statistiquesGenerales.data?.totalPostes || 0,
          postesActifs: statistiquesGenerales.data?.postesActifs || 0,
          moyenneOccupation: calculerMoyenneOccupation(),
          revenuTotal: calculerRevenuTotal()
        },
        statistiquesParPoste: donneesOccupation.map(poste => ({
          nom: poste.nom,
          tauxOccupation: poste.taux,
          heuresOccupe: poste.heuresOccupe,
          heuresTotal: poste.heuresTotal,
          status: poste.status
        })),
        tauxOccupation: tauxOccupation.data,
        revenus: revenus.data,
        performance: performance.data,
        heuresPointe: heuresPointe.data
      };

      const options = {
        titre: `Rapport Postes - ${PERIODS[periode].label}`,
        periode: `${filtres.dateDebut} au ${filtres.dateFin}`,
        includeGraphiques: true,
        includeRecommendations: true
      };

      if (format === 'rapport') {
        await exportRapportDetaille({ data: exportData, format: 'pdf', options });
      } else {
        switch (format) {
          case 'pdf':
            await exportToPDF({ data: exportData, options });
            break;
          case 'excel':
            await exportToExcel({ data: exportData, options });
            break;
        }
      }

      setShowExportMenu(false);
      notifySuccess(`Export ${format.toUpperCase()} terminé avec succès`);
    } catch (error) {
      notifyError('Export', 'statistiques postes', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement des statistiques des postes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Statistiques Avancées des Postes
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger className="w-48">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODS).map(([key, period]) => (
                    <SelectItem key={key} value={key}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-2 space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        PDF Simple
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('rapport')}
                        disabled={isExporting}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Rapport Détaillé
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refetchAll}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Postes Actifs</p>
                <p className="text-2xl font-bold">
                  {statistiquesGenerales.data?.postesActifs || 0} / {statistiquesGenerales.data?.totalPostes || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {((statistiquesGenerales.data?.postesActifs || 0) / (statistiquesGenerales.data?.totalPostes || 1) * 100).toFixed(0)}% en service
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'Occupation Moyen</p>
                <p className="text-2xl font-bold">{calculerMoyenneOccupation().toFixed(1)}%</p>
                <Badge variant={getTauxOccupationStatus(calculerMoyenneOccupation()) === 'excellent' ? 'default' : 'outline'}>
                  {getTauxOccupationStatus(calculerMoyenneOccupation())}
                </Badge>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-2xl font-bold">
                  {calculerRevenuTotal().toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {donneesRevenus.length > 0 ? (calculerRevenuTotal() / donneesRevenus.length).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }) : '0 €'} / poste
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Globale</p>
                <p className="text-2xl font-bold">
                  {performance.data?.scoreGlobal?.toFixed(1) || '0.0'}/10
                </p>
                <Badge variant={performance.data?.scoreGlobal >= 7 ? 'default' : 'outline'}>
                  {performance.data?.scoreGlobal >= 8 ? 'Excellent' :
                   performance.data?.scoreGlobal >= 6 ? 'Bon' :
                   performance.data?.scoreGlobal >= 4 ? 'Moyen' : 'À améliorer'}
                </Badge>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taux d'occupation par poste */}
        <Card>
          <CardHeader>
            <CardTitle>Taux d'Occupation par Poste</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donneesOccupation} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value) => [
                    `${value.toFixed(1)}%`,
                    'Taux d\'occupation'
                  ]}
                  labelFormatter={(label) => `Poste: ${label}`}
                />
                <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="5 5" label="Objectif (60%)" />
                <Bar dataKey="taux" fill="#3B82F6">
                  {donneesOccupation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.taux >= 60 ? '#10B981' : entry.taux >= 40 ? '#F59E0B' : '#EF4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenus par poste */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus par Poste</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donneesRevenus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toLocaleString('fr-FR')} €`,
                    name === 'revenus' ? 'Revenus' : name === 'couts' ? 'Coûts' : 'Bénéfice'
                  ]}
                />
                <Bar dataKey="revenus" fill="#3B82F6" name="revenus" />
                <Bar dataKey="couts" fill="#EF4444" name="couts" />
                <Bar dataKey="benefice" fill="#10B981" name="benefice" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Classement des performances */}
      <Card>
        <CardHeader>
          <CardTitle>Classement des Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donneesPerformance.slice(0, 10).map((poste, index) => (
              <div key={poste.nom} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                  }`}>
                    {poste.position}
                  </div>
                  <div>
                    <h4 className="font-medium">{poste.nom}</h4>
                    <p className="text-sm text-gray-500">Score: {poste.score.toFixed(1)}/10</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">{poste.metriques.occupation.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Revenus</p>
                    <p className="font-medium">{poste.metriques.revenus.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Efficacité</p>
                    <p className="font-medium">{poste.metriques.efficacite.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et recommandations */}
      {donneesOccupation.some(p => p.taux < 30) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-800">
                Attention: {donneesOccupation.filter(p => p.taux < 30).length} poste(s) avec un taux d'occupation très faible (&lt; 30%)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
