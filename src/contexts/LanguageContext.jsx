import React, { createContext, useState, useContext, useEffect } from 'react'; // MODIFICATION : Import de useEffect

// Créer le Contexte
const LanguageContext = createContext();

// Provider pour envelopper l'application
export const LanguageProvider = ({ children }) => {
  // État pour la langue actuelle, initialisé à 'fr'
  const [language, setLanguage] = useState('fr');
  // MODIFICATION : État pour stocker les traductions chargées
  const [translations, setTranslations] = useState({});
  // MODIFICATION : État pour indiquer si les traductions sont en cours de chargement
  const [loading, setLoading] = useState(true);

  // MODIFICATION : Charger les traductions lorsque la langue change
  useEffect(() => {
    setLoading(true);
    // Utilisation de l'import dynamique pour charger le fichier JSON
    import(`../locales/${language}.json`)
      .then(module => {
        setTranslations(module.default);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Erreur lors du chargement des traductions pour la langue ${language}:`, error);
        // Optionnel: Charger une langue de secours ou afficher un message d'erreur
        setTranslations({}); // Réinitialiser les traductions en cas d'erreur
        setLoading(false);
      });
  }, [language]); // Re-exécuter cet effet lorsque la variable 'language' change

  // Fonction pour changer la langue
  const changeLanguage = (lang) => {
     // Optionnel: Vérifier si la langue existe avant de la changer
     // if (['fr', 'en', 'ar'].includes(lang)) {
       setLanguage(lang);
     // }
  };

  // Fournir la langue actuelle, la fonction de changement et les traductions via le contexte
  // MODIFICATION : Inclure l'état de chargement
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, translations, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de langue
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  // MODIFICATION : Retourner les traductions et l'état de chargement
  return context;
};

export default LanguageContext;
