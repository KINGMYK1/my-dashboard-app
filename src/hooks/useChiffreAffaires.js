import { useState, useEffect, useCallback } from 'react';
import { statistiquesService } from '../services/statistiquesService';
import { useNotification } from '../contexts/NotificationContext';

export const useChiffreAffaires = (periode = 'mois') => {
  const { showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [donnees, setDonnees] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [error, setError] = useState(null);

  const chargerEvolution = useCallback(async (nouvellePeriode = periode) => {
    setLoading(true);
    setError(null);
    
    try {
      let groupBy = 'day';
      switch (nouvellePeriode) {
        case 'semaine':
          groupBy = 'hour';
          break;
        case 'mois':
          groupBy = 'day';
          break;
        case 'trimestre':
          groupBy = 'week';
          break;
        case 'annee':
          groupBy = 'month';
          break;
        default:
          groupBy = 'day';
      }

      const response = await statistiquesService.obtenirEvolutionChiffreAffaires({
        periode: nouvellePeriode,
        groupBy
      });
      
      setDonnees(response.data);
      setEvolution(response.data.evolution);
      return response.data;
    } catch (err) {
      setError(err);
      showError('Erreur lors du chargement du chiffre d\'affaires');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [periode, showError]);

  const changerPeriode = useCallback((nouvellePeriode) => {
    return chargerEvolution(nouvellePeriode);
  }, [chargerEvolution]);

  useEffect(() => {
    chargerEvolution();
  }, [chargerEvolution]);

  return {
    loading,
    donnees,
    evolution,
    error,
    changerPeriode,
    actualiser: () => chargerEvolution()
  };
};

export const useObjectifsCA = () => {
  const [objectifs, setObjectifs] = useState({
    journalier: 5000,
    mensuel: 150000,
    annuel: 1800000
  });

  const calculerProgression = useCallback((actuel, objectif) => {
    if (!objectif || objectif === 0) return 0;
    return Math.min((actuel / objectif) * 100, 100);
  }, []);

  const obtenirStatutObjectif = useCallback((progression) => {
    if (progression >= 100) return 'atteint';
    if (progression >= 80) return 'proche';
    if (progression >= 50) return 'moyen';
    return 'faible';
  }, []);

  const mettreAJourObjectif = useCallback((type, valeur) => {
    setObjectifs(prev => ({
      ...prev,
      [type]: valeur
    }));
  }, []);

  return {
    objectifs,
    calculerProgression,
    obtenirStatutObjectif,
    mettreAJourObjectif
  };
};