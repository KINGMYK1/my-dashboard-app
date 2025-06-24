class PricingService {
  /**
   * Calculer le prix basé sur les plans tarifaires
   */
  static calculateSessionPrice(typePoste, dureeEstimeeMinutes) {
    if (!typePoste || !dureeEstimeeMinutes) {
      return {
        prix: 0,
        planUtilise: null,
        typeTarif: 'AUCUN',
        dureeFacturee: dureeEstimeeMinutes
      };
    }

    // Récupérer les plans tarifaires actifs du type de poste
    const plansActifs = typePoste.plansTarifaires?.filter(plan => plan.estActif) || [];
    
    if (plansActifs.length === 0) {
      // Fallback sur le tarif horaire de base
      const prixHoraire = parseFloat(typePoste.tarifHoraireBase) || 0;
      const heures = dureeEstimeeMinutes / 60;
      return {
        prix: parseFloat((prixHoraire * heures).toFixed(2)),
        planUtilise: null,
        typeTarif: 'HORAIRE',
        dureeFacturee: dureeEstimeeMinutes
      };
    }

    // Trouver le meilleur plan pour la durée estimée
    const planOptimal = this.findOptimalPlan(plansActifs, dureeEstimeeMinutes);
    
    return {
      prix: parseFloat(planOptimal.prix),
      planUtilise: planOptimal,
      typeTarif: 'FORFAIT',
      dureeFacturee: planOptimal.dureeMinutes
    };
  }

  /**
   * Trouver le plan optimal pour une durée donnée
   */
  static findOptimalPlan(plans, dureeMinutes) {
    // Trier les plans par durée croissante
    const plansTries = plans.sort((a, b) => a.dureeMinutes - b.dureeMinutes);
    
    // Trouver le plan qui couvre exactement ou dépasse légèrement la durée
    let planOptimal = plansTries.find(plan => plan.dureeMinutes >= dureeMinutes);
    
    // Si aucun plan ne couvre la durée, prendre le plus grand
    if (!planOptimal) {
      planOptimal = plansTries[plansTries.length - 1];
    }
    
    return planOptimal;
  }

  /**
   * Calculer les options de paiement disponibles
   */
  static getPaymentOptions(typePoste, dureeEstimeeMinutes) {
    const plansActifs = typePoste.plansTarifaires?.filter(plan => plan.estActif) || [];
    
    const options = plansActifs.map(plan => ({
      id: plan.id,
      nom: plan.nom,
      dureeMinutes: plan.dureeMinutes,
      prix: plan.prix,
      description: plan.description,
      prixParMinute: (plan.prix / plan.dureeMinutes).toFixed(3),
      recommande: plan.dureeMinutes >= dureeEstimeeMinutes && 
                  plan.dureeMinutes <= dureeEstimeeMinutes * 1.5
    }));

    // Ajouter l'option tarif horaire si disponible
    if (typePoste.tarifHoraireBase > 0) {
      const prixHoraire = parseFloat(typePoste.tarifHoraireBase);
      const heures = dureeEstimeeMinutes / 60;
      options.push({
        id: 'horaire',
        nom: 'Tarif horaire',
        dureeMinutes: dureeEstimeeMinutes,
        prix: parseFloat((prixHoraire * heures).toFixed(2)),
        description: `${prixHoraire} MAD/heure`,
        prixParMinute: (prixHoraire / 60).toFixed(3),
        recommande: false
      });
    }

    return options.sort((a, b) => b.recommande - a.recommande || a.prix - b.prix);
  }
}

export default PricingService;