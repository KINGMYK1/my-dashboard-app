import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { statistiquesService } from '../services/statistiquesService';
import { exportService } from '../services/exportService';

/**
 * ✅ Hook avancé pour les statistiques correctes des postes
 */
export const usePosteStatisticsAdvanced = (filters = {}) => {
  const { showError } = useNotification();

  // Statistiques générales des postes
  const statistiquesGenerales = useQuery({
    queryKey: ['poste-statistics-general', filters],
    queryFn: () => statistiquesService.getCorrectPosteStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('❌ [POSTE_STATS_GENERAL] Erreur:', error);
      showError('Erreur lors du chargement des statistiques des postes');
    }
  });

  // Taux d'occupation par poste
  const tauxOccupation = useQuery({
    queryKey: ['poste-occupation-rate', filters],
    queryFn: () => statistiquesService.getPosteOccupationRates(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [POSTE_OCCUPATION] Erreur:', error);
    }
  });

  // Revenus par poste
  const revenusPostes = useQuery({
    queryKey: ['poste-revenues', filters],
    queryFn: () => statistiquesService.getPosteRevenues(filters),
    staleTime: 2 * 60 * 1000,
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [POSTE_REVENUES] Erreur:', error);
    }
  });

  // Performance comparative
  const performanceComparative = useQuery({
    queryKey: ['poste-performance-comparison', filters],
    queryFn: () => statistiquesService.getPostePerformanceComparison(filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [POSTE_PERFORMANCE] Erreur:', error);
    }
  });

  // Heures de pointe par poste
  const heuresPointe = useQuery({
    queryKey: ['poste-peak-hours', filters],
    queryFn: () => statistiquesService.getPostePeakHours(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!filters.periode,
    onError: (error) => {
      console.error('❌ [POSTE_PEAK_HOURS] Erreur:', error);
    }
  });

  return {
    // Statistiques générales
    statistiquesGenerales: {
      data: statistiquesGenerales.data,
      loading: statistiquesGenerales.isLoading,
      error: statistiquesGenerales.error,
      refetch: statistiquesGenerales.refetch
    },
    
    // Taux d'occupation
    tauxOccupation: {
      data: tauxOccupation.data,
      loading: tauxOccupation.isLoading,
      error: tauxOccupation.error,
      refetch: tauxOccupation.refetch
    },
    
    // Revenus
    revenus: {
      data: revenusPostes.data,
      loading: revenusPostes.isLoading,
      error: revenusPostes.error,
      refetch: revenusPostes.refetch
    },
    
    // Performance
    performance: {
      data: performanceComparative.data,
      loading: performanceComparative.isLoading,
      error: performanceComparative.error,
      refetch: performanceComparative.refetch
    },
    
    // Heures de pointe
    heuresPointe: {
      data: heuresPointe.data,
      loading: heuresPointe.isLoading,
      error: heuresPointe.error,
      refetch: heuresPointe.refetch
    },
    
    // États globaux
    isLoading: statistiquesGenerales.isLoading || tauxOccupation.isLoading,
    hasError: statistiquesGenerales.error || tauxOccupation.error,
    
    // Méthode de rafraîchissement global
    refetchAll: () => {
      statistiquesGenerales.refetch();
      tauxOccupation.refetch();
      revenusPostes.refetch();
      performanceComparative.refetch();
      heuresPointe.refetch();
    }
  };
};

/**
 * ✅ Hook pour l'analyse des sessions par poste
 */
export const useSessionAnalysisByPoste = (posteId, filters = {}) => {
  const { showError } = useNotification();

  return useQuery({
    queryKey: ['session-analysis-by-poste', posteId, filters],
    queryFn: () => statistiquesService.getSessionAnalysisByPoste(posteId, filters),
    enabled: !!posteId,
    staleTime: 3 * 60 * 1000,
    onError: (error) => {
      console.error('❌ [SESSION_ANALYSIS_POSTE] Erreur:', error);
      showError('Erreur lors de l\'analyse des sessions');
    },
    select: (data) => ({
      // Métriques de base
      totalSessions: data.total_sessions || 0,
      dureeTotal: data.duree_total_minutes || 0,
      dureeMoyenne: data.duree_moyenne_minutes || 0,
      revenusTotal: data.revenus_total || 0,
      revenuMoyen: data.revenu_moyen || 0,
      
      // Taux d'occupation correct
      tauxOccupation: {
        pourcentage: data.taux_occupation_pourcentage || 0,
        heuresOccupe: data.heures_occupe || 0,
        heuresDisponible: data.heures_disponible || 0,
        heuresTotal: data.heures_total || 0
      },
      
      // Analyse temporelle
      analyseTemporelle: {
        parHeure: data.sessions_par_heure || [],
        parJour: data.sessions_par_jour || [],
        parSemaine: data.sessions_par_semaine || [],
        tendance: data.tendance || 'stable'
      },
      
      // Rentabilité
      rentabilite: {
        revenusParHeure: data.revenus_par_heure || 0,
        coutExploitation: data.cout_exploitation || 0,
        beneficeNet: data.benefice_net || 0,
        roiPourcentage: data.roi_pourcentage || 0
      },
      
      // Comparaison avec autres postes
      comparaison: data.comparaison || {},
      
      // Données brutes
      raw: data
    })
  });
};

/**
 * ✅ Hook pour l'export des statistiques des postes
 */
export const usePosteStatisticsExport = () => {
  const { showError, showSuccess, showInfo } = useNotification();
  const { translations } = useLanguage();

  // Export PDF des statistiques postes
  const exportPDF = useMutation({
    mutationFn: async ({ data, options = {} }) => {
      showInfo('Génération du rapport PDF des postes...');
      return await exportService.exportPosteStatisticsToPDF(data, options);
    },
    onSuccess: (result) => {
      showSuccess('Rapport PDF des postes généré avec succès');
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_POSTE_PDF] Erreur:', error);
      showError('Erreur lors de la génération du PDF: ' + error.message);
    }
  });

  // Export Excel des statistiques postes
  const exportExcel = useMutation({
    mutationFn: async ({ data, options = {} }) => {
      showInfo('Génération du fichier Excel des postes...');
      return await exportService.exportPosteStatisticsToExcel(data, options);
    },
    onSuccess: (result) => {
      showSuccess('Fichier Excel des postes généré avec succès');
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_POSTE_EXCEL] Erreur:', error);
      showError('Erreur lors de la génération du fichier Excel: ' + error.message);
    }
  });

  // Export rapport détaillé multi-format
  const exportRapportDetaille = useMutation({
    mutationFn: async ({ data, format = 'pdf', options = {} }) => {
      showInfo(`Génération du rapport détaillé en ${format.toUpperCase()}...`);
      return await exportService.exportDetailedPosteReport(data, format, options);
    },
    onSuccess: (result, variables) => {
      showSuccess(`Rapport détaillé ${variables.format.toUpperCase()} généré avec succès`);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      console.error('❌ [EXPORT_DETAILED_REPORT] Erreur:', error);
      showError('Erreur lors de la génération du rapport: ' + error.message);
    }
  });

  return {
    // Méthodes d'export
    exportToPDF: exportPDF.mutate,
    exportToExcel: exportExcel.mutate,
    exportRapportDetaille: exportRapportDetaille.mutate,
    
    // États
    isExportingPDF: exportPDF.isLoading,
    isExportingExcel: exportExcel.isLoading,
    isExportingRapport: exportRapportDetaille.isLoading,
    isExporting: exportPDF.isLoading || exportExcel.isLoading || exportRapportDetaille.isLoading,
    
    // Erreurs
    exportPDFError: exportPDF.error,
    exportExcelError: exportExcel.error,
    exportRapportError: exportRapportDetaille.error
  };
};

/**
 * ✅ Hook pour la maintenance et optimisation des postes
 */
export const usePosteMaintenanceAnalysis = (filters = {}) => {
  const { showError, showWarning } = useNotification();

  return useQuery({
    queryKey: ['poste-maintenance-analysis', filters],
    queryFn: () => statistiquesService.getPosteMaintenanceAnalysis(filters),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Vérification toutes les 10 minutes
    onSuccess: (data) => {
      // Alertes automatiques pour maintenance
      if (data.alertes && data.alertes.length > 0) {
        data.alertes.forEach(alerte => {
          if (alerte.niveau === 'urgent') {
            showWarning(`Poste ${alerte.nom_poste}: ${alerte.message}`, { duration: 0 });
          }
        });
      }
    },
    onError: (error) => {
      console.error('❌ [POSTE_MAINTENANCE] Erreur:', error);
      showError('Erreur lors de l\'analyse de maintenance');
    },
    select: (data) => ({
      // Postes nécessitant une maintenance
      maintenanceRequise: data.maintenance_requise || [],
      
      // Performance dégradée
      performanceDegradee: data.performance_degradee || [],
      
      // Recommandations d'optimisation
      recommandations: data.recommandations || [],
      
      // Planification maintenance
      planificationMaintenance: data.planification || [],
      
      // Coûts de maintenance
      coutsMaintenance: data.couts_maintenance || {},
      
      // Alertes actives
      alertes: data.alertes || []
    })
  });
};
