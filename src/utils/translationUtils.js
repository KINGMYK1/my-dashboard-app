// src/utils/translationUtils.js

/**
 * Extraire toutes les clés d'un objet de traduction, y compris les clés imbriquées
 * @param {Object} obj - L'objet de traduction
 * @param {string} prefix - Préfixe pour les clés imbriquées
 * @returns {Array} - Liste des clés
 */
export const extractAllKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = [...keys, ...extractAllKeys(obj[key], newKey)];
    } else {
      keys.push(newKey);
    }
  }
  return keys;
};

/**
 * Vérifier les traductions manquantes entre les différents fichiers de langues
 * @returns {Object} - Les clés manquantes par langue
 */
export const checkMissingTranslations = async () => {
  try {
    // Utiliser import dynamique au lieu de require
    const [frModule, enModule, arModule] = await Promise.all([
      import('../locales/fr.json'),
      import('../locales/en.json'),
      import('../locales/ar.json')
    ]);
    
    const fr = frModule.default;
    const en = enModule.default;
    const ar = arModule.default;
    // Extraire les clés de chaque fichier
    const frKeys = extractAllKeys(fr);
    const enKeys = extractAllKeys(en);
    const arKeys = extractAllKeys(ar);
    
    // Trouver les clés manquantes
    const missingInEn = frKeys.filter(k => !enKeys.includes(k));
    const missingInAr = frKeys.filter(k => !arKeys.includes(k));
    const missingInFr = [...enKeys, ...arKeys]
      .filter((k, i, arr) => arr.indexOf(k) === i) // Dédupliqué
      .filter(k => !frKeys.includes(k));
    
    console.group('Traductions manquantes');
    console.log('Clés manquantes en anglais:', missingInEn);
    console.log('Clés manquantes en arabe:', missingInAr);
    console.log('Clés manquantes en français:', missingInFr);
    console.groupEnd();
    
    return {
      missingInEn,
      missingInAr,
      missingInFr
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des traductions:", error);
    return { error: true };
  }
};

/**
 * Vérifier les clés non utilisées dans le code source
 * Cette fonction nécessiterait un outil d'analyse statique du code
 * comme eslint-plugin-react-i18n ou une analyse personnalisée
 */
export const checkUnusedTranslations = () => {
  // À implémenter selon vos besoins et outils
  console.warn('La vérification des traductions non utilisées n\'est pas encore implémentée');
};