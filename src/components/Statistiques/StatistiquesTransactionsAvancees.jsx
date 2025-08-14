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
import {
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  FileSpreadsheet,
  DollarSign,
  CreditCard,
  Target,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useTransactionStatisticsAdvanced, useTransactionExport, useAdvancedFinancialMetrics } from '../../hooks/useTransactionStatisticsAdvanced';
import { useNotificationIntegration } from '../../hooks/useNotificationIntegration';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PERIODS = {
  '7j': { label: '7 derniers jours', days: 7 },
  '30j': { label: '30 derniers jours', days: 30 },
  'mois': { label: 'Ce mois', custom: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  'trimestre': { label: 'Ce trimestre', days: 90 },
  'annee': { label: 'Cette année', custom: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const StatistiquesTransactionsAvancees = () => {
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
      includeComparison: true,
      groupBy: periode === '7j' ? 'hour' : periode === 'annee' ? 'month' : 'day'
    };
  }, [periode]);

  // Hooks pour les données
  const { statistiques, chiffreAffaires, tendances, comparaison, isLoading, refetchAll } = useTransactionStatisticsAdvanced(filtres);
  const { data: metriquesFinancieres, isLoading: loadingMetriques } = useAdvancedFinancialMetrics(filtres);
  const { exportToPDF, exportToExcel, exportToCSV, isExporting } = useTransactionExport();

  // Données pour les graphiques
  const donneesEvolution = useMemo(() => {
    if (!chiffreAffaires.data?.evolution) return [];
    
    return chiffreAffaires.data.evolution.map(point => ({
      date: format(new Date(point.date), 'dd/MM', { locale: fr }),
      ca: point.chiffreAffaires || 0,
      transactions: point.nombreTransactions || 0,
      ticketMoyen: point.ticketMoyen || 0
    }));
  }, [chiffreAffaires.data]);

  const donneesRepartition = useMemo(() => {
    if (!statistiques.data?.repartitionParType) return [];
    
    return Object.entries(statistiques.data.repartitionParType).map(([type, data], index) => ({
      name: type,
      value: data.montant,
      count: data.count,
      color: COLORS[index % COLORS.length]
    }));
  }, [statistiques.data]);

  // Handlers
  const handleExport = async (format) => {
    try {
      const exportData = {
        resume: {
          totalTransactions: statistiques.data?.totalTransactions || 0,
          caHT: metriquesFinancieres?.chiffreAffaires?.brut || 0,
          caTTC: metriquesFinancieres?.chiffreAffaires?.net || 0,
          tva: metriquesFinancieres?.chiffreAffaires?.tva || 0,
          ticketMoyen: metriquesFinancieres?.kpi?.ticketMoyen || 0,
          margeBrute: metriquesFinancieres?.marges?.margeBrute || 0
        },
        transactions: statistiques.data?.transactions || [],
        analyses: {
          evolution: donneesEvolution,
          repartition: donneesRepartition,
          tendances: tendances.data
        },
        tops: {
          clients: statistiques.data?.topClients || [],
          produits: statistiques.data?.topProduits || []
        }
      };

      const options = {
        titre: `Rapport Transactions - ${PERIODS[periode].label}`,
        periode: `${filtres.dateDebut} au ${filtres.dateFin}`,
        includeGraphiques: true,
        includeDetails: true
      };

      switch (format) {
        case 'pdf':
          await exportToPDF({ data: exportData, options });
          break;
        case 'excel':
          await exportToExcel({ data: exportData, options });
          break;
        case 'csv':
          await exportToCSV({ data: exportData, options });
          break;
      }

      setShowExportMenu(false);
      notifySuccess(`Export ${format.toUpperCase()} terminé avec succès`);
    } catch (error) {
      notifyError('Export', 'transactions', error);
    }
  };

  if (isLoading || loadingMetriques) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement des statistiques...</span>
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
              <BarChart3 className="w-5 h-5" />
              Statistiques Avancées des Transactions
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
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-2 space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
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
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CSV
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
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold">
                  {(metriquesFinancieres?.chiffreAffaires?.net || 0).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
                {metriquesFinancieres?.chiffreAffaires?.evolution && (
                  <p className={`text-sm flex items-center ${
                    metriquesFinancieres.chiffreAffaires.evolution >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metriquesFinancieres.chiffreAffaires.evolution >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(metriquesFinancieres.chiffreAffaires.evolution).toFixed(1)}%
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">{statistiques.data?.totalTransactions || 0}</p>
                <p className="text-sm text-gray-500">
                  {metriquesFinancieres?.kpi?.frequenceAchat ? (
                    `${metriquesFinancieres.kpi.frequenceAchat.toFixed(1)}/jour en moyenne`
                  ) : (
                    'Fréquence non disponible'
                  )}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Moyen</p>
                <p className="text-2xl font-bold">
                  {(metriquesFinancieres?.kpi?.ticketMoyen || 0).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  Objectif: {(50).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Marge Brute</p>
                <p className="text-2xl font-bold">
                  {(metriquesFinancieres?.marges?.margeBrute || 0).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
                <Badge variant={metriquesFinancieres?.marges?.tauxMargeBrute >= 30 ? 'default' : 'destructive'}>
                  {(metriquesFinancieres?.marges?.tauxMargeBrute || 0).toFixed(1)}%
                </Badge>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du CA */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={donneesEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'ca' ? `${value.toLocaleString('fr-FR')} €` : value,
                    name === 'ca' ? 'Chiffre d\'Affaires' : name === 'transactions' ? 'Transactions' : 'Ticket Moyen'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ca"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type de Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donneesRepartition}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {donneesRepartition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toLocaleString('fr-FR')} €`, 'Montant']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {metriquesFinancieres?.kpi?.ticketMoyen < 30 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-800">
                Attention: Le ticket moyen est en dessous de l'objectif (30€)
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
