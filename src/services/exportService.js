/**
 * ✅ Service d'export pour PDF, Excel et CSV
 * Gère l'export des données de transactions et statistiques
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

class ExportService {
  constructor() {
    this.defaultOptions = {
      author: 'Gaming Center Management',
      creator: 'Gaming Center App',
      title: 'Rapport',
      subject: 'Statistiques et Données'
    };
  }

  /**
   * ✅ Export des transactions en PDF
   */
  async exportTransactionsToPDF(data, options = {}) {
    try {
      const doc = new jsPDF();
      const opt = { ...this.defaultOptions, ...options };
      
      // Configuration du document
      doc.setProperties({
        title: opt.title || 'Rapport des Transactions',
        subject: opt.subject,
        author: opt.author,
        creator: opt.creator
      });

      // En-tête
      this._addPDFHeader(doc, opt.title || 'Rapport des Transactions', opt.periode);
      
      // Résumé des statistiques
      if (data.resume) {
        this._addTransactionSummary(doc, data.resume);
      }
      
      // Tableau des transactions
      if (data.transactions && data.transactions.length > 0) {
        this._addTransactionTable(doc, data.transactions);
      }
      
      // Graphiques et analyses
      if (data.analyses) {
        this._addAnalysisSection(doc, data.analyses);
      }
      
      // Pied de page
      this._addPDFFooter(doc);
      
      // Génération et téléchargement
      const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      doc.save(fileName);
      
      return {
        success: true,
        fileName,
        downloadUrl: URL.createObjectURL(doc.output('blob'))
      };
      
    } catch (error) {
      console.error('❌ [EXPORT_PDF] Erreur:', error);
      throw new Error('Erreur lors de la génération du PDF: ' + error.message);
    }
  }

  /**
   * ✅ Export des transactions en Excel
   */
  async exportTransactionsToExcel(data, options = {}) {
    try {
      const opt = { ...this.defaultOptions, ...options };
      const wb = XLSX.utils.book_new();
      
      // Feuille 1: Résumé
      if (data.resume) {
        const resumeData = this._prepareResumeForExcel(data.resume);
        const resumeWS = XLSX.utils.json_to_sheet(resumeData);
        XLSX.utils.book_append_sheet(wb, resumeWS, 'Résumé');
      }
      
      // Feuille 2: Transactions détaillées
      if (data.transactions && data.transactions.length > 0) {
        const transactionsData = this._prepareTransactionsForExcel(data.transactions);
        const transactionsWS = XLSX.utils.json_to_sheet(transactionsData);
        
        // Formatage des colonnes
        const range = XLSX.utils.decode_range(transactionsWS['!ref']);
        transactionsWS['!cols'] = [
          { width: 15 }, // ID
          { width: 20 }, // Date
          { width: 25 }, // Client
          { width: 20 }, // Montant
          { width: 15 }, // Type
          { width: 30 }  // Description
        ];
        
        XLSX.utils.book_append_sheet(wb, transactionsWS, 'Transactions');
      }
      
      // Feuille 3: Analyses par période
      if (data.analyses && data.analyses.parPeriode) {
        const analyseData = this._prepareAnalysesForExcel(data.analyses);
        const analyseWS = XLSX.utils.json_to_sheet(analyseData);
        XLSX.utils.book_append_sheet(wb, analyseWS, 'Analyses');
      }
      
      // Feuille 4: Top clients/produits
      if (data.tops) {
        const topsData = this._prepareTopsForExcel(data.tops);
        const topsWS = XLSX.utils.json_to_sheet(topsData);
        XLSX.utils.book_append_sheet(wb, topsWS, 'Tops');
      }
      
      // Génération et téléchargement
      const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return {
        success: true,
        fileName,
        downloadUrl: null // Excel se télécharge directement
      };
      
    } catch (error) {
      console.error('❌ [EXPORT_EXCEL] Erreur:', error);
      throw new Error('Erreur lors de la génération du fichier Excel: ' + error.message);
    }
  }

  /**
   * ✅ Export des transactions en CSV
   */
  async exportTransactionsToCSV(data, options = {}) {
    try {
      const opt = { ...this.defaultOptions, ...options };
      
      if (!data.transactions || data.transactions.length === 0) {
        throw new Error('Aucune transaction à exporter');
      }
      
      // Préparation des données
      const csvData = data.transactions.map(transaction => ({
        'ID Transaction': transaction.id,
        'Date': format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: fr }),
        'Client': transaction.client_nom || 'Client anonyme',
        'Montant HT': transaction.montant_ht || 0,
        'Montant TTC': transaction.montant_ttc || 0,
        'TVA': transaction.tva || 0,
        'Mode Paiement': transaction.mode_paiement,
        'Statut': transaction.statut,
        'Type': transaction.type,
        'Description': transaction.description || '',
        'Caissier': transaction.caissier_nom || '',
        'Poste': transaction.poste_nom || ''
      }));
      
      // Conversion en CSV
      const ws = XLSX.utils.json_to_sheet(csvData);
      const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' });
      
      // Ajout de l'UTF-8 BOM pour Excel
      const csvWithBOM = '\uFEFF' + csv;
      
      // Téléchargement
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const fileName = `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      saveAs(blob, fileName);
      
      return {
        success: true,
        fileName,
        downloadUrl: URL.createObjectURL(blob)
      };
      
    } catch (error) {
      console.error('❌ [EXPORT_CSV] Erreur:', error);
      throw new Error('Erreur lors de la génération du fichier CSV: ' + error.message);
    }
  }

  /**
   * ✅ Export des statistiques des postes en PDF
   */
  async exportPosteStatisticsToPDF(data, options = {}) {
    try {
      const doc = new jsPDF();
      const opt = { ...this.defaultOptions, ...options };
      
      // Configuration
      doc.setProperties({
        title: opt.title || 'Statistiques des Postes',
        subject: opt.subject,
        author: opt.author,
        creator: opt.creator
      });

      // En-tête
      this._addPDFHeader(doc, opt.title || 'Statistiques des Postes', opt.periode);
      
      // Vue d'ensemble
      if (data.vueEnsemble) {
        this._addPosteOverview(doc, data.vueEnsemble);
      }
      
      // Statistiques par poste
      if (data.statistiquesParPoste) {
        this._addPosteStatisticsTable(doc, data.statistiquesParPoste);
      }
      
      // Analyse de performance
      if (data.performance) {
        this._addPerformanceAnalysis(doc, data.performance);
      }
      
      // Recommandations
      if (data.recommandations) {
        this._addRecommendations(doc, data.recommandations);
      }
      
      // Pied de page
      this._addPDFFooter(doc);
      
      const fileName = `postes_statistiques_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
      doc.save(fileName);
      
      return {
        success: true,
        fileName,
        downloadUrl: URL.createObjectURL(doc.output('blob'))
      };
      
    } catch (error) {
      console.error('❌ [EXPORT_POSTE_PDF] Erreur:', error);
      throw new Error('Erreur lors de la génération du PDF des postes: ' + error.message);
    }
  }

  /**
   * ✅ Export des statistiques des postes en Excel
   */
  async exportPosteStatisticsToExcel(data, options = {}) {
    try {
      const wb = XLSX.utils.book_new();
      
      // Feuille 1: Vue d'ensemble
      if (data.vueEnsemble) {
        const overviewData = this._preparePosteOverviewForExcel(data.vueEnsemble);
        const overviewWS = XLSX.utils.json_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, overviewWS, 'Vue d\'ensemble');
      }
      
      // Feuille 2: Statistiques détaillées par poste
      if (data.statistiquesParPoste) {
        const statsData = this._preparePosteStatsForExcel(data.statistiquesParPoste);
        const statsWS = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, statsWS, 'Statistiques Postes');
      }
      
      // Feuille 3: Taux d'occupation
      if (data.tauxOccupation) {
        const occupationData = this._prepareOccupationForExcel(data.tauxOccupation);
        const occupationWS = XLSX.utils.json_to_sheet(occupationData);
        XLSX.utils.book_append_sheet(wb, occupationWS, 'Taux Occupation');
      }
      
      // Feuille 4: Revenus par poste
      if (data.revenus) {
        const revenusData = this._prepareRevenusForExcel(data.revenus);
        const revenusWS = XLSX.utils.json_to_sheet(revenusData);
        XLSX.utils.book_append_sheet(wb, revenusWS, 'Revenus');
      }
      
      const fileName = `postes_statistiques_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return {
        success: true,
        fileName,
        downloadUrl: null
      };
      
    } catch (error) {
      console.error('❌ [EXPORT_POSTE_EXCEL] Erreur:', error);
      throw new Error('Erreur lors de la génération du fichier Excel des postes: ' + error.message);
    }
  }

  /**
   * ✅ Export d'un rapport détaillé multi-format
   */
  async exportDetailedPosteReport(data, format = 'pdf', options = {}) {
    try {
      switch (format.toLowerCase()) {
        case 'pdf':
          return await this._exportDetailedPDFReport(data, options);
        case 'excel':
        case 'xlsx':
          return await this._exportDetailedExcelReport(data, options);
        case 'csv':
          return await this._exportDetailedCSVReport(data, options);
        default:
          throw new Error('Format non supporté: ' + format);
      }
    } catch (error) {
      console.error('❌ [EXPORT_DETAILED_REPORT] Erreur:', error);
      throw error;
    }
  }

  // ============================================================================
  // MÉTHODES PRIVÉES - Helpers pour PDF
  // ============================================================================

  _addPDFHeader(doc, title, periode) {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 40);
    
    if (periode) {
      doc.text(`Période: ${periode}`, 20, 50);
    }
    
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
  }

  _addPDFFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
      doc.text('Gaming Center Management System', 120, 285);
    }
  }

  _addTransactionSummary(doc, resume) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé des Transactions', 20, 70);
    
    const summaryData = [
      ['Nombre total de transactions', resume.totalTransactions || 0],
      ['Chiffre d\'affaires HT', `${(resume.caHT || 0).toFixed(2)} €`],
      ['Chiffre d\'affaires TTC', `${(resume.caTTC || 0).toFixed(2)} €`],
      ['TVA collectée', `${(resume.tva || 0).toFixed(2)} €`],
      ['Ticket moyen', `${(resume.ticketMoyen || 0).toFixed(2)} €`],
      ['Marge brute', `${(resume.margeBrute || 0).toFixed(2)} €`]
    ];
    
    doc.autoTable({
      startY: 75,
      head: [['Indicateur', 'Valeur']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 20, right: 20 }
    });
  }

  _addTransactionTable(doc, transactions) {
    const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 140;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Transactions', 20, startY);
    
    const tableData = transactions.slice(0, 50).map(t => [ // Limite à 50 transactions
      t.id,
      format(new Date(t.date), 'dd/MM/yyyy HH:mm', { locale: fr }),
      t.client_nom || 'Anonyme',
      `${(t.montant_ttc || 0).toFixed(2)} €`,
      t.mode_paiement || '',
      t.statut || ''
    ]);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['ID', 'Date', 'Client', 'Montant', 'Paiement', 'Statut']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 }
    });
  }

  // ============================================================================
  // MÉTHODES PRIVÉES - Helpers pour Excel
  // ============================================================================

  _prepareResumeForExcel(resume) {
    return [
      { Indicateur: 'Nombre total de transactions', Valeur: resume.totalTransactions || 0 },
      { Indicateur: 'Chiffre d\'affaires HT', Valeur: resume.caHT || 0 },
      { Indicateur: 'Chiffre d\'affaires TTC', Valeur: resume.caTTC || 0 },
      { Indicateur: 'TVA collectée', Valeur: resume.tva || 0 },
      { Indicateur: 'Ticket moyen', Valeur: resume.ticketMoyen || 0 },
      { Indicateur: 'Marge brute', Valeur: resume.margeBrute || 0 }
    ];
  }

  _prepareTransactionsForExcel(transactions) {
    return transactions.map(t => ({
      'ID': t.id,
      'Date': format(new Date(t.date), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Client': t.client_nom || 'Anonyme',
      'Montant HT': t.montant_ht || 0,
      'Montant TTC': t.montant_ttc || 0,
      'TVA': t.tva || 0,
      'Mode Paiement': t.mode_paiement || '',
      'Statut': t.statut || '',
      'Type': t.type || '',
      'Description': t.description || '',
      'Caissier': t.caissier_nom || ''
    }));
  }

  _preparePosteStatsForExcel(stats) {
    return stats.map(poste => ({
      'Nom Poste': poste.nom,
      'Type': poste.type,
      'Sessions Totales': poste.totalSessions || 0,
      'Durée Totale (h)': Math.round((poste.dureeTotale || 0) / 60 * 100) / 100,
      'Taux Occupation (%)': Math.round((poste.tauxOccupation || 0) * 100) / 100,
      'Revenus Total': poste.revenusTotal || 0,
      'Revenus/Heure': poste.revenusParHeure || 0,
      'Statut': poste.statut || 'Actif'
    }));
  }

  // Méthodes additionnelles pour les autres formats...
  // (Continuer avec les autres helpers selon les besoins)
}

// Export de l'instance singleton
export const exportService = new ExportService();
