import { PerformancePoste, TypeAlerte, PrioriteAlerte } from '../types/statistiques';

/**
 * Formater une durée en minutes vers un format lisible
 */
export const formatDuree = (minutes) => {
  if (!minutes || minutes < 0) return '0min';
  
  const heures = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (heures === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${heures}h`;
  } else {
    return `${heures}h${mins.toString().padStart(2, '0')}min`;
  }
};

/**
 * Formater un montant en devise locale
 */
export const formatMontant = (montant, devise = 'MAD') => {
  if (montant === null || montant === undefined) return '0 MAD';
  
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(montant);
};

/**
 * Formater un pourcentage
 */
export const formatPourcentage = (valeur, decimales = 1) => {
  if (valeur === null || valeur === undefined) return '0%';
  return `${Number(valeur).toFixed(decimales)}%`;
};

/**
 * Obtenir les couleurs selon la performance
 */
export const getCouleursPerformance = (performance) => {
  const couleurs = {
    [PerformancePoste.EXCELLENTE]: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-200 dark:border-green-700',
      icon: 'text-green-600 dark:text-green-400'
    },
    [PerformancePoste.BONNE]: {
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    [PerformancePoste.MOYENNE]: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-700',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    [PerformancePoste.FAIBLE]: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-200 dark:border-red-700',
      icon: 'text-red-600 dark:text-red-400'
    }
  };
  
  return couleurs[performance] || couleurs[PerformancePoste.MOYENNE];
};

/**
 * Obtenir les couleurs selon le type d'alerte
 */
export const getCouleursAlerte = (type, priorite) => {
  const couleurs = {
    [TypeAlerte.ERROR]: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-200 dark:border-red-700',
      icon: 'text-red-600 dark:text-red-400'
    },
    [TypeAlerte.WARNING]: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-700',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    [TypeAlerte.INFO]: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700',
      icon: 'text-blue-600 dark:text-blue-400'
    }
  };
  
  let styles = couleurs[type] || couleurs[TypeAlerte.INFO];
  
  // Intensifier les couleurs pour les priorités critiques
  if (priorite === PrioriteAlerte.CRITIQUE) {
    styles = {
      ...styles,
      bg: styles.bg.replace('/20', '/40'),
      border: styles.border.replace('-200', '-300').replace('-700', '-600')
    };
  }
  
  return styles;
};

/**
 * Calculer le taux de croissance entre deux valeurs
 */
export const calculerTauxCroissance = (valeurActuelle, valeurPrecedente) => {
  if (!valeurPrecedente || valeurPrecedente === 0) return 0;
  return ((valeurActuelle - valeurPrecedente) / valeurPrecedente) * 100;
};

/**
 * Obtenir l'icône selon la tendance
 */
export const getIconeTendance = (tendance) => {
  switch (tendance) {
    case 'croissante':
      return '📈';
    case 'decroissante':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return '📊';
  }
};

/**
 * Formater les créneaux horaires
 */
export const formatCreneauHoraire = (creneau) => {
  const creneaux = {
    matin: 'Matin (06h-12h)',
    apresMidi: 'Après-midi (12h-18h)',
    soiree: 'Soirée (18h-00h)',
    nuit: 'Nuit (00h-06h)'
  };
  
  return creneaux[creneau] || creneau;
};

/**
 * Formater les jours de la semaine
 */
export const formatJourSemaine = (jour) => {
  const jours = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  };
  
  return jours[jour] || jour;
};

/**
 * Calculer la performance relative
 */
export const calculerPerformanceRelative = (valeur, moyenne) => {
  if (!moyenne || moyenne === 0) return 0;
  return ((valeur - moyenne) / moyenne) * 100;
};

/**
 * Générer des couleurs pour les graphiques
 */
export const genererCouleursGraphique = (nombre) => {
  const couleursPrincipales = [
    '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#6366f1', '#ec4899', '#84cc16', '#f97316', '#14b8a6'
  ];
  
  const couleurs = [];
  for (let i = 0; i < nombre; i++) {
    couleurs.push(couleursPrincipales[i % couleursPrincipales.length]);
  }
  
  return couleurs;
};