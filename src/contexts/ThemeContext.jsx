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
      applyTheme('dark'); // Thème par défaut
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
    
    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
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
    
    if (appliedTheme === 'dark') {
      root.style.setProperty('--background-primary', 'rgba(15, 23, 42, 0.95)');
      root.style.setProperty('--background-secondary', 'rgba(30, 41, 59, 0.8)');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-color', 'rgba(168, 85, 247, 0.2)');
    } else {
      root.style.setProperty('--background-primary', 'rgba(255, 255, 255, 0.95)');
      root.style.setProperty('--background-secondary', 'rgba(248, 250, 252, 0.8)');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--border-color', 'rgba(168, 85, 247, 0.3)');
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

export default ThemeContext;