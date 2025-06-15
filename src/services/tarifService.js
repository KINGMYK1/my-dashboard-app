/**
 * Service de calcul des tarifs côté frontend
 * Optimisé pour des calculs rapides et une interface réactive
 */
class TarifService {
  /**
   * Calculer le prix d'une session en temps réel
   */
  static calculerPrixSession(typePoste, dureeMinutes, options = {}) {
    if (!typePoste || !dureeMinutes || dureeMinutes <= 0) {
      return {
        prix: 0,
        dureeFacturee: 0,
        typeTarif: 'AUCUN',
        erreur: 'Paramètres invalides'
      };
    }

    const { 
      planTarifaireId = null, 
      appliquerPromo = false,
      tauxReduction = 0 
    } = options;

    // Si un plan tarifaire spécifique est demandé
    if (planTarifaireId && typePoste.plansTarifaires) {
      const plan = typePoste.plansTarifaires.find(p => p.id === planTarifaireId);
      if (plan && plan.estActif) {
        const prixAvecReduction = appliquerPromo ? 
          plan.prix * (1 - tauxReduction / 100) : plan.prix;

        return {
          prix: parseFloat(prixAvecReduction.toFixed(2)),
          dureeFacturee: plan.dureeMinutes,
          typeTarif: 'FORFAIT',
          planUtilise: plan,
          economie: appliquerPromo ? plan.prix - prixAvecReduction : 0,
          devise: typePoste.devise || 'MAD'
        };
      }
    }

    // Calcul horaire avec intervalle de facturation
    const intervalle = typePoste.intervalleFacturation || 15;
    const dureeFacturee = Math.ceil(dureeMinutes / intervalle) * intervalle;
    const tarifHoraire = parseFloat(typePoste.tarifHoraireBase) || 0;
    const prixParMinute = tarifHoraire / 60;
    const prixCalcule = prixParMinute * dureeFacturee;
    const prixAvecReduction = appliquerPromo ? 
      prixCalcule * (1 - tauxReduction / 100) : prixCalcule;

    return {
      prix: parseFloat(prixAvecReduction.toFixed(2)),
      dureeFacturee,
      typeTarif: 'HORAIRE',
      tarifHoraire,
      intervalleFacturation: intervalle,
      economie: appliquerPromo ? prixCalcule - prixAvecReduction : 0,
      devise: typePoste.devise || 'MAD'
    };
  }

  /**
   * Calculer le meilleur plan pour une durée donnée
   */
  static obtenirMeilleurPlan(typePoste, dureeMinutes) {
    if (!typePoste?.plansTarifaires || dureeMinutes <= 0) {
      return this.calculerPrixSession(typePoste, dureeMinutes);
    }

    const calculHoraire = this.calculerPrixSession(typePoste, dureeMinutes);
    const plansApplicables = typePoste.plansTarifaires
      .filter(plan => plan.estActif && plan.dureeMinutes >= dureeMinutes)
      .sort((a, b) => a.prix - b.prix);

    if (plansApplicables.length === 0) {
      return calculHoraire;
    }

    const meilleurPlan = plansApplicables[0];
    const calculPlan = this.calculerPrixSession(typePoste, dureeMinutes, {
      planTarifaireId: meilleurPlan.id
    });

    return calculPlan.prix < calculHoraire.prix ? calculPlan : calculHoraire;
  }

  /**
   * Simuler différents scénarios tarifaires
   */
  static simulerScenarios(typePoste, dureeMinutes) {
    const scenarios = [];

    // Scénario horaire
    scenarios.push({
      type: 'HORAIRE',
      ...this.calculerPrixSession(typePoste, dureeMinutes)
    });

    // Scénarios plans tarifaires
    if (typePoste?.plansTarifaires) {
      typePoste.plansTarifaires
        .filter(plan => plan.estActif)
        .forEach(plan => {
          scenarios.push({
            type: 'FORFAIT',
            nom: plan.nom,
            ...this.calculerPrixSession(typePoste, dureeMinutes, {
              planTarifaireId: plan.id
            })
          });
        });
    }

    // Trier par prix croissant
    return scenarios.sort((a, b) => a.prix - b.prix);
  }

  /**
   * Calculer les statistiques de rentabilité
   */
  static calculerRentabilite(typePoste, sessions = []) {
    if (!sessions.length) {
      return {
        chiffreAffaire: 0,
        nombreSessions: 0,
        dureeMoyenne: 0,
        prixMoyen: 0,
        tauxOccupation: 0
      };
    }

    const chiffreAffaire = sessions.reduce((total, session) => 
      total + (parseFloat(session.prix) || 0), 0);
    
    const dureeTotale = sessions.reduce((total, session) => 
      total + (parseInt(session.dureeMinutes) || 0), 0);

    return {
      chiffreAffaire: parseFloat(chiffreAffaire.toFixed(2)),
      nombreSessions: sessions.length,
      dureeMoyenne: Math.round(dureeTotale / sessions.length),
      prixMoyen: parseFloat((chiffreAffaire / sessions.length).toFixed(2)),
      tauxOccupation: this.calculerTauxOccupation(dureeTotale, typePoste)
    };
  }

  /**
   * Calculer le taux d'occupation théorique
   */
  static calculerTauxOccupation(dureeTotaleMinutes, typePoste, periodeJours = 30) {
    const heuresOuvertureParJour = 12; // Configurable
    const minutesDisponiblesParPeriode = periodeJours * heuresOuvertureParJour * 60;
    const nombrePostes = typePoste.nombrePostes || 1;
    const capaciteTotale = minutesDisponiblesParPeriode * nombrePostes;
    
    return Math.min(100, parseFloat(((dureeTotaleMinutes / capaciteTotale) * 100).toFixed(2)));
  }

  /**
   * Formater un prix avec devise
   */
  static formaterPrix(prix, devise = 'MAD') {
    const formatters = {
      'EUR': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
      'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      'MAD': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' })
    };

    const formatter = formatters[devise] || formatters['MAD'];
    return formatter.format(prix || 0);
  }

  /**
   * Formater une durée
   */
  static formaterDuree(minutes) {
    if (!minutes || minutes < 0) return '0 min';
    
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (heures === 0) return `${mins} min`;
    if (mins === 0) return `${heures}h`;
    return `${heures}h ${mins}min`;
  }
}

export default TarifService;