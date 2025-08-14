import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { statistiquesService } from '../services/statistiquesService';
import { exportService } from '../services/exportService';

/**
 * ✅ Hook avancé pour les statistiques de transactions avec calculs corrects
 */
export const useTransactionStatisticsAdvanced = (filters = {}) => {
  const { showError, showSuccess } = useNotification();
  const { translations } = useLanguage();

  // Récupération des statistiques complètes
  const statistiques = useQuery({
    queryKey: ['transaction-statistics-advanced', filters],
    queryFn: () => statistiquesService.getAdvancedTransactionStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('❌ [TRANSACTION_STATS_ADVANCED] Erreur:', error);
      showError(error.message || 'Erreur lors du chargement des statistiques');
    }
  });

  // Récupération du chiffre d'affaires détaillé
  const chiffreAffaires = useQuery({
    queryKey: ['chiffre-affaires-detailed', filters],
    queryFn: () => statistiquesService.getDetailedChiffreAffaires(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [CA_DETAILED] Erreur:', error);
      showError('Erreur lors du calcul du chiffre d\'affaires');
    }
  });

  // Analyse des tendances
  const tendances = useQuery({
    queryKey: ['transaction-trends', filters],
    queryFn: () => statistiquesService.getTransactionTrends(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [TRANSACTION_TRENDS] Erreur:', error);
    }
  });

  // Comparaison périodes
  const comparaison = useQuery({
    queryKey: ['transaction-comparison', filters],
    queryFn: () => statistiquesService.getTransactionComparison(filters),
    enabled: !!filters.periodeComparaison,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('❌ [TRANSACTION_COMPARISON] Erreur:', error);
    }
  });

  return {
    // Données principales
    statistiques: {
      data: statistiques.data,
      loading: statistiques.isLoading,
      error: statistiques.error,
      refetch: statistiques.refetch
    },
    
    // Chiffre d'affaires détaillé
    chiffreAffaires: {
      data: chiffreAffaires.data,
      loading: chiffreAffaires.isLoading,
      error: chiffreAffaires.error,
      refetch: chiffreAffaires.refetch
    },
    
    // Tendances
    tendances: {
      data: tendances.data,
      loading: tendances.isLoading,
      error: tendances.error,
      refetch: tendances.refetch
    },
    
    // Comparaison
    comparaison: {
      data: comparaison.data,
      loading: comparaison.isLoading,
      error: comparaison.error,
      refetch: comparaison.refetch
    },
    
    // États globaux
    isLoading: statistiques.isLoading || chiffreAffaires.isLoading,
    hasError: statistiques.error || chiffreAffaires.error,
    
    // Méthode de rafraîchissement global
    refetchAll: () => {
      statistiques.refetch();
      chiffreAffaires.refetch();
      tendances.refetch();
      comparaison.refetch();
    }
  };
};

/**
 * ✅ Hook pour l'export des données de transactions
 */
export const useTransactionExport = () => {
  const { showError, showSuccess, showInfo } = useNotification();
  const { translations } = useLanguage();
  const queryClient = useQueryClient();

  // Export PDF
  const exportPDF = useMutation({
    mutationFn: async ({ data, options = {} }) => {
      showInfo('Génération du PDF en cours...');
      return await exportService.exportTransactionsToPDF(data, options);
    },
    onSuccess: (result) => {
      showSuccess('Rapport PDF généré avec succès');
      // Déclencher le téléchargement
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_PDF] Erreur:', error);
      showError('Erreur lors de la génération du PDF: ' + error.message);
    }
  });

  // Export Excel
  const exportExcel = useMutation({
    mutationFn: async ({ data, options = {} }) => {
      showInfo('Génération du fichier Excel en cours...');
      return await exportService.exportTransactionsToExcel(data, options);
    },
    onSuccess: (result) => {
      showSuccess('Fichier Excel généré avec succès');
      // Déclencher le téléchargement
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_EXCEL] Erreur:', error);
      showError('Erreur lors de la génération du fichier Excel: ' + error.message);
    }
  });

  // Export CSV
  const exportCSV = useMutation({
    mutationFn: async ({ data, options = {} }) => {
      showInfo('Génération du fichier CSV en cours...');
      return await exportService.exportTransactionsToCSV(data, options);
    },
    onSuccess: (result) => {
      showSuccess('Fichier CSV généré avec succès');
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_CSV] Erreur:', error);
      showError('Erreur lors de la génération du fichier CSV: ' + error.message);
    }
  });

  return {
    // Méthodes d'export
    exportToPDF: exportPDF.mutate,
    exportToExcel: exportExcel.mutate,
    exportToCSV: exportCSV.mutate,
    
    // États
    isExportingPDF: exportPDF.isLoading,
    isExportingExcel: exportExcel.isLoading,
    isExportingCSV: exportCSV.isLoading,
    isExporting: exportPDF.isLoading || exportExcel.isLoading || exportCSV.isLoading,
    
    // Erreurs
    exportPDFError: exportPDF.error,
    exportExcelError: exportExcel.error,
    exportCSVError: exportCSV.error
  };
};

/**
 * ✅ Hook pour les métriques financières avancées
 */
export const useAdvancedFinancialMetrics = (filters = {}) => {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['advanced-financial-metrics', filters],
    queryFn: () => statistiquesService.getAdvancedFinancialMetrics(filters),
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('❌ [ADVANCED_METRICS] Erreur:', error);
      showError('Erreur lors du calcul des métriques financières');
    },
    select: (data) => ({
      // Calculs corrects du chiffre d'affaires
      chiffreAffaires: {
        brut: data.ca_brut || 0,
        net: data.ca_net || 0,
        tva: data.tva || 0,
        evolution: data.evolution_ca || 0
      },
      
      // Marges et bénéfices
      marges: {
        margeBrute: data.marge_brute || 0,
        margeNette: data.marge_nette || 0,
        tauxMargeBrute: data.taux_marge_brute || 0,
        tauxMargeNette: data.taux_marge_nette || 0
      },
      
      // Indicateurs de performance
      kpi: {
        ticketMoyen: data.ticket_moyen || 0,
        frequenceAchat: data.frequence_achat || 0,
        tauxConversion: data.taux_conversion || 0,
        croissance: data.croissance || 0
      },
      
      // Répartition par catégorie
      repartition: data.repartition || [],
      
      // Prévisions
      previsions: data.previsions || {},
      
      // Données brutes pour exports
      raw: data
    })
  });
};

/**
 * ✅ Hook pour les alertes financières
 */
export const useFinancialAlerts = (seuils = {}) => {
  const { showWarning, showError, showInfo } = useNotification();

  return useQuery({
    queryKey: ['financial-alerts', seuils],
    queryFn: () => statistiquesService.getFinancialAlerts(seuils),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Vérification toutes les 2 minutes
    onSuccess: (alerts) => {
      alerts.forEach(alert => {
        switch (alert.severity) {
          case 'critical':
            showError(alert.message, { duration: 0 }); // Persistant
            break;
          case 'warning':
            showWarning(alert.message, { duration: 8000 });
            break;
          case 'info':
            showInfo(alert.message, { duration: 5000 });
            break;
        }
      });
    },
    onError: (error) => {
      console.error('❌ [FINANCIAL_ALERTS] Erreur:', error);
    }
  });
};
