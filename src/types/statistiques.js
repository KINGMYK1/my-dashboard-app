/**
 * @typedef {Object} MetriquesTemporelles
 * @property {number} nombreSessions
 * @property {number} tempsTotalUtiliseHeures
 * @property {number} dureeSessionMoyenne
 * @property {number} tauxOccupation
 * @property {number} tauxReussite
 */

/**
 * @typedef {Object} MetriquesFinancieres
 * @property {number} revenus
 * @property {number} revenuMoyenParHeure
 * @property {number} revenuMoyenParSession
 * @property {number} revenusEnAttente
 */

/**
 * @typedef {Object} AnalyseCreneaux
 * @property {Object} parCreneau
 * @property {Object} parJour
 * @property {string} creneauLePlusActif
 * @property {string} jourLePlusActif
 */

/**
 * @typedef {Object} ClientAnalyse
 * @property {number} id
 * @property {string} nom
 * @property {number} sessions
 * @property {number} tempsTotal
 * @property {number} revenus
 * @property {Date} dernierVisite
 */

/**
 * @typedef {Object} Alerte
 * @property {'WARNING'|'INFO'|'ERROR'} type
 * @property {string} titre
 * @property {string} message
 * @property {'HAUTE'|'MOYENNE'|'FAIBLE'|'CRITIQUE'} priorite
 */

/**
 * @typedef {Object} StatistiquesPosteDetaillees
 * @property {Object} poste
 * @property {Object} periode
 * @property {Object} statistiquesGlobales
 * @property {Object} statistiquesPeriode
 * @property {Object} comparaison
 * @property {Object} predictions
 * @property {Alerte[]} alertes
 * @property {Array} sessionsDetaillees
 * @property {Date} dateCalcul
 */

// Énumérations
export const StatutSession = {
  EN_COURS: 'EN_COURS',
  EN_PAUSE: 'EN_PAUSE',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE'
};

export const PerformancePoste = {
  EXCELLENTE: 'EXCELLENTE',
  BONNE: 'BONNE',
  MOYENNE: 'MOYENNE',
  FAIBLE: 'FAIBLE'
};

export const TypeAlerte = {
  WARNING: 'WARNING',
  INFO: 'INFO',
  ERROR: 'ERROR'
};

export const PrioriteAlerte = {
  HAUTE: 'HAUTE',
  MOYENNE: 'MOYENNE',
  FAIBLE: 'FAIBLE',
  CRITIQUE: 'CRITIQUE'
};