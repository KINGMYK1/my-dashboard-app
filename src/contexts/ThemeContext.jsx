import React, { createContext, useContext, useState, useEffect } from 'react';

// Créer le Contexte
const ThemeContext = createContext();

// Thèmes disponibles
const availableThemes = [
  {
    value: 'dark',
    label: 'Mode sombre',
    description: 'Thème sombre pour un confort visuel',
    icon: '🌙'
  },
  {
    value: 'light',
    label: 'Mode clair',
    description: 'Thème clair classique',
    icon: '☀️'
  },
  {
    value: 'auto',
    label: 'Automatique',
    description: 'Suit les préférences du système',
    icon: '🔄'
  }
];

// Provider du contexte
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [effectiveTheme, setEffectiveTheme] = useState('dark'); // Le thème réellement appliqué

  // Charger le thème depuis le localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme && availableThemes.find(t => t.value === savedTheme)) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Définir 'dark' comme thème par défaut si rien n'est trouvé
      setThemeState('dark');
      localStorage.setItem('preferredTheme', 'dark');
      applyTheme('dark');
    }
  }, []);

  // Écouter les changements de préférences système pour le mode auto
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };
    
    // Utilisation de addEventListener et removeEventListener pour les media queries
    // C'est la méthode moderne et recommandée.
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Fonction pour appliquer le thème
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Nettoyer les classes existantes
    root.classList.remove('dark', 'light');
    body.classList.remove('dark', 'light');
    
    let appliedTheme = 'dark';
    
    switch (themeValue) {
      case 'light':
        root.classList.add('light');
        body.classList.add('light');
        appliedTheme = 'light';
        break;
      case 'dark':
        root.classList.add('dark');
        body.classList.add('dark');
        appliedTheme = 'dark';
        break;
      case 'auto':
        // Détecter la préférence système
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
          body.classList.add('dark');
          appliedTheme = 'dark';
        } else {
          root.classList.add('light');
          body.classList.add('light');
          appliedTheme = 'light';
        }
        break;
      default:
        root.classList.add('dark');
        body.classList.add('dark');
        appliedTheme = 'dark';
    }
    
    setEffectiveTheme(appliedTheme);
    
    // Mettre à jour les variables CSS personnalisées
    updateCSSVariables(appliedTheme);
    
    // Déclencher un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeValue, effectiveTheme: appliedTheme } 
    }));
    
    console.log(`🎨 Thème appliqué: ${themeValue} (effectif: ${appliedTheme})`);
  };

  // Mettre à jour les variables CSS personnalisées
  const updateCSSVariables = (appliedTheme) => {
    const root = document.documentElement;
    
    // Couleurs pour le thème sombre (existantes)
    if (appliedTheme === 'dark') {
      root.style.setProperty('--background-primary', 'rgba(15, 23, 42, 0.95)'); // Presque noir
      root.style.setProperty('--background-secondary', 'rgba(30, 41, 59, 0.8)'); // Gris foncé
      root.style.setProperty('--background-card', 'rgba(30, 41, 59, 0.6)'); // Fond des cartes
      root.style.setProperty('--background-input', 'rgba(30, 41, 59, 0.5)'); // Fond des inputs
      root.style.setProperty('--text-primary', '#ffffff'); // Texte principal blanc
      root.style.setProperty('--text-secondary', '#94a3b8'); // Texte secondaire gris bleu
      root.style.setProperty('--border-color', 'rgba(168, 85, 247, 0.2)'); // Bordure violette légère
      root.style.setProperty('--accent-color-primary', '#8b5cf6'); // Violet (pour les icônes, boutons)
      root.style.setProperty('--accent-color-secondary', '#3b82f6'); // Bleu (pour les icônes, boutons)
      root.style.setProperty('--success-color', '#22c55e'); // Vert
      root.style.setProperty('--error-color', '#ef4444'); // Rouge
      root.style.setProperty('--warning-color', '#f59e0b'); // Jaune
      // Nouvelle variable pour les fonds de modales (sombre)
      root.style.setProperty('--background-modal-card', 'rgba(30, 41, 59, 0.95)'); 
    } 
    // Nouvelles couleurs pour le thème clair (frais et doux)
    else {
      root.style.setProperty('--background-primary', 'rgba(240, 248, 255, 0.95)'); // Bleu très clair, presque blanc (AliceBlue)
      root.style.setProperty('--background-secondary', 'rgba(224, 236, 255, 0.8)'); // Bleu plus doux
      root.style.setProperty('--background-card', 'rgba(240, 255, 255, 0.95)'); // Fond des cartes blanc translucide
      root.style.setProperty('--background-input', 'rgba(240, 255, 255, 0.95)'); // Fond des inputs blanc
      root.style.setProperty('--text-primary', '#1a202c'); // Texte principal gris très foncé
      root.style.setProperty('--text-secondary', '#4a5568'); // Texte secondaire gris moyen
      root.style.setProperty('--border-color', 'rgba(59, 130, 246, 0.3)'); // Bordure bleue légère
      root.style.setProperty('--accent-color-primary', '#3b82f6'); // Bleu (pour les icônes, boutons)
      root.style.setProperty('--accent-color-secondary', '#6366f1'); // Indigo (pour les icônes, boutons)
      root.style.setProperty('--success-color', '#10b981'); // Vert émeraude
      root.style.setProperty('--error-color', '#dc2626'); // Rouge
      root.style.setProperty('--warning-color', '#d97706'); // Orange
      // Nouvelle variable pour les fonds de modales (blanc pur)
      root.style.setProperty('--background-modal-card', 'rgba(255, 255, 255, 1)'); 
    }
  };

  // Fonction pour changer de thème
  const setTheme = (themeValue) => {
    console.log(`🔄 Changement de thème vers: ${themeValue}`);
    
    if (availableThemes.find(t => t.value === themeValue)) {
      setThemeState(themeValue);
      localStorage.setItem('preferredTheme', themeValue);
      applyTheme(themeValue);
    } else {
      console.error(`❌ Thème non supporté: ${themeValue}`);
    }
  };

  const contextValue = {
    theme,
    effectiveTheme,
    setTheme,
    availableThemes
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
