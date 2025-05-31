import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Globe, 
  Palette, 
  Save,
  Bell,
  Monitor,
  Database,
  Download,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { translations, language, setLanguage, availableLanguages } = useLanguage();
  const { theme, setTheme, availableThemes } = useTheme();

  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    sessionTimeout: 60,
    theme: theme?.mode || theme || 'dark',
    language: language || 'fr'
  });

  // ✅ DIAGNOSTIC pour identifier la structure du thème
  useEffect(() => {
    console.log('🔍 [SETTINGS] Diagnostic thème:', {
      theme,
      themeMode: theme?.mode,
      themeType: typeof theme,
      language,
      availableThemes,
      availableLanguages
    });
  }, [theme, language, availableThemes, availableLanguages]);

  // Mettre à jour l'état local des paramètres si le thème ou la langue globale change
  useEffect(() => {
    const currentTheme = theme?.mode || theme || 'dark';
    const currentLanguage = language || 'fr';
    
    setSettings(prev => ({
      ...prev,
      theme: currentTheme,
      language: currentLanguage
    }));
  }, [theme, language]);

  const handleSettingChange = (key, value) => {
    console.log(`🔧 [SETTINGS] Changement ${key}:`, value);
    
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Appliquer immédiatement pour thème et langue via les contextes
    if (key === 'theme') {
      setTheme(value);
    } else if (key === 'language') {
      setLanguage(value);
    }
  };

  const handleSave = () => {
    console.log('💾 [SETTINGS] Sauvegarde des paramètres:', settings);
  };

  const tabs = [
    { id: 'general', label: translations?.generalTab || 'Général', icon: <SettingsIcon size={16} /> },
    { id: 'appearance', label: translations?.appearanceTab || 'Apparence', icon: <Palette size={16} /> },
    { id: 'language', label: translations?.languageTab || 'Langue', icon: <Globe size={16} /> },
    { id: 'notifications', label: translations?.notificationsTab || 'Notifications', icon: <Bell size={16} /> },
    { id: 'account', label: translations?.accountTab || 'Compte', icon: <User size={16} /> },
    { id: 'system', label: translations?.systemTab || 'Système', icon: <Database size={16} /> }
  ];

  // ✅ CORRECTION: Détection plus robuste du mode sombre
  const currentTheme = theme?.mode || theme || 'dark';
  const isDarkMode = currentTheme === 'dark';

  console.log('🎨 [SETTINGS] Mode actuel:', { currentTheme, isDarkMode });

  // ✅ HARMONISATION: Styles identiques au Dashboard
  const containerBg = isDarkMode 
    ? 'rgba(30, 41, 59, 0.9)' 
    : 'rgba(255, 255, 255, 0.95)';

  const containerBorder = isDarkMode 
    ? 'border-purple-400/30' 
    : 'border-blue-300/50';

  const textColor = isDarkMode 
    ? 'text-white' 
    : 'text-gray-900';

  const secondaryTextColor = isDarkMode 
    ? 'text-gray-400' 
    : 'text-gray-600';

  const inputBg = isDarkMode 
    ? 'bg-gray-700/80' 
    : 'bg-gray-50';

  const inputBorder = isDarkMode 
    ? 'border-gray-600 focus:border-purple-500' 
    : 'border-gray-300 focus:border-blue-500';

  const primaryButtonBg = isDarkMode 
    ? 'bg-purple-600 hover:bg-purple-700' 
    : 'bg-blue-600 hover:bg-blue-700';

  const tabButtonActiveBg = isDarkMode 
    ? 'bg-purple-600/90 text-white shadow-lg' 
    : 'bg-blue-600 text-white shadow-lg';

  const tabButtonInactiveBg = isDarkMode 
    ? 'text-gray-300 hover:text-white hover:bg-purple-600/30' 
    : 'text-gray-700 hover:text-gray-900 hover:bg-blue-100';

  const iconColor = isDarkMode 
    ? 'text-purple-400' 
    : 'text-blue-600';

  const checkboxColor = isDarkMode 
    ? 'text-purple-600 focus:ring-purple-500' 
    : 'text-blue-600 focus:ring-blue-500';

  // ✅ CORRECTION: Styles de sélection beaucoup plus contrastés
  const optionSelectedStyle = (value, type) => {
    const isSelected = (type === 'theme' && settings.theme === value) || (type === 'language' && settings.language === value);
    
    if (isDarkMode) {
      return isSelected 
        ? 'border-purple-400 bg-purple-600/30 shadow-lg ring-2 ring-purple-400/50' 
        : 'border-gray-600 bg-gray-700/60 hover:border-gray-500 hover:bg-gray-700/80';
    } else {
      return isSelected 
        ? 'border-blue-500 bg-blue-100 shadow-lg ring-2 ring-blue-400/30' 
        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 shadow-sm';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.generalSettingsTitle || 'Paramètres généraux'}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)' }}>
                <div>
                  <label className={`${textColor} font-medium transition-colors duration-300`}>
                    {translations?.autoSaveLabel || 'Sauvegarde automatique'}
                  </label>
                  <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                    {translations?.autoSaveDescription || 'Sauvegarder automatiquement les modifications'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className={`w-5 h-5 rounded ${checkboxColor} transition-colors duration-300`}
                />
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)' }}>
                <label className={`block ${textColor} font-medium mb-3 transition-colors duration-300`}>
                  {translations?.sessionTimeoutLabel || 'Délai d\'expiration de session'}
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg ${inputBg} ${textColor} border ${inputBorder} focus:outline-none transition-all duration-300`}
                >
                  <option value={30}>30 {translations?.minutes || 'minutes'}</option>
                  <option value={60}>1 {translations?.hour || 'heure'}</option>
                  <option value={120}>2 {translations?.hours || 'heures'}</option>
                  <option value={240}>4 {translations?.hours || 'heures'}</option>
                  <option value={480}>8 {translations?.hours || 'heures'}</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.appearanceTitle || 'Apparence'}
            </h3>
            
            <div>
              <label className={`block ${textColor} font-medium mb-4 transition-colors duration-300`}>
                {translations?.themeLabel || 'Thème'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(availableThemes || [
                  { value: 'light', label: 'Clair', description: 'Interface claire' },
                  { value: 'dark', label: 'Sombre', description: 'Interface sombre' },
                  { value: 'auto', label: 'Auto', description: 'Selon le système' }
                ]).map((themeOption) => {
                  const isSelected = settings.theme === themeOption.value;
                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => handleSettingChange('theme', themeOption.value)}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${optionSelectedStyle(themeOption.value, 'theme')}`}
                    >
                      {isSelected && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-500' : 'bg-blue-500'}`}>
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <Palette size={20} className={`${iconColor} transition-colors duration-300`} />
                        <div className="text-left">
                          <p className={`${textColor} font-medium transition-colors duration-300`}>
                            {themeOption.label}
                          </p>
                          <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                            {themeOption.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 rounded-lg border-2 border-dashed" style={{ 
                borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
              }}>
                <p className={`${textColor} text-sm font-medium mb-2`}>
                  Aperçu du thème actuel : <span className={`${iconColor} font-semibold`}>
                    {isDarkMode ? '🌙 Sombre' : '☀️ Clair'}
                  </span>
                </p>
                <p className={`${secondaryTextColor} text-xs`}>
                  Cette prévisualisation reflète le thème actuellement appliqué
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'language':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.languageTab || 'Langue'}
            </h3>
            
            <div>
              <label className={`block ${textColor} font-medium mb-4 transition-colors duration-300`}>
                {translations?.languageInterfaceLabel || 'Langue de l\'interface'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(availableLanguages || [
                  { code: 'fr', name: 'Français', nativeName: 'Français' },
                  { code: 'en', name: 'English', nativeName: 'English' },
                  { code: 'ar', name: 'العربية', nativeName: 'العربية' }
                ]).map((lang) => {
                  const isSelected = settings.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSettingChange('language', lang.code)}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${optionSelectedStyle(lang.code, 'language')}`}
                    >
                      {isSelected && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-500' : 'bg-blue-500'}`}>
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <Globe size={20} className={`${iconColor} transition-colors duration-300`} />
                        <div className="text-left">
                          <p className={`${textColor} font-medium transition-colors duration-300`}>
                            {lang.name}
                          </p>
                          <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                            {lang.nativeName}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 rounded-lg border-2 border-dashed" style={{ 
                borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)',
                backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)'
              }}>
                <p className={`${textColor} text-sm font-medium mb-2`}>
                  Langue actuelle : <span className={`${iconColor} font-semibold`}>
                    {settings.language?.toUpperCase()}
                  </span>
                </p>
                <p className={`${secondaryTextColor} text-xs`}>
                  Les modifications de langue sont appliquées immédiatement
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.notificationsTitle || 'Notifications'}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)' }}>
                <div>
                  <label className={`${textColor} font-medium transition-colors duration-300`}>
                    {translations?.notificationsEnabledLabel || 'Notifications activées'}
                  </label>
                  <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                    {translations?.notificationsEnabledDescription || 'Recevoir des notifications dans l\'application'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className={`w-5 h-5 rounded ${checkboxColor} transition-colors duration-300`}
                />
              </div>
            </div>
          </div>
        );
        
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.accountInfoTitle || 'Informations du compte'}
            </h3>
            
            <div className={`${inputBg} rounded-lg p-6 space-y-4 transition-colors duration-300 border`} style={{ borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)' }}>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className={`${textColor} font-semibold text-lg transition-colors duration-300`}>
                    {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
                  </p>
                  <p className={`${secondaryTextColor} transition-colors duration-300`}>
                    {user?.email || 'email@exemple.com'}
                  </p>
                  <p className={`${iconColor} text-sm font-medium transition-colors duration-300`}>
                    {user?.role?.name || 'Utilisateur'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'system':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${textColor} mb-4 transition-colors duration-300`}>
              {translations?.systemInfoTitle || 'Informations système'}
            </h3>
            
            <div className="space-y-4">
              <div className={`${inputBg} rounded-lg p-4 transition-colors duration-300 border`} style={{ borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Database size={16} className={`${iconColor}`} />
                  <span className={`${textColor} font-medium transition-colors duration-300`}>
                    {translations?.databaseLabel || 'Base de données'}
                  </span>
                </div>
                <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                  {translations?.databaseDescription || 'SQLite - Stockage local'}
                </p>
              </div>
              
              <div className={`${inputBg} rounded-lg p-4 transition-colors duration-300 border`} style={{ borderColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Monitor size={16} className={`${iconColor}`} />
                  <span className={`${textColor} font-medium transition-colors duration-300`}>
                    {translations?.appVersionLabel || 'Version de l\'application'}
                  </span>
                </div>
                <p className={`${secondaryTextColor} text-sm transition-colors duration-300`}>
                  {translations?.appVersionValue || 'v1.0.0 - Gaming Center Management'}
                </p>
              </div>
              
              <button className={`flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${primaryButtonBg}`}>
                <Download size={16} />
                <span>{translations?.exportDataButton || 'Exporter les données'}</span>
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full h-full space-y-6 p-6 min-h-full flex flex-col transition-all duration-500"
      style={{
        background: 'transparent', // ✅ Hérite du fond du Dashboard
        padding: '0', // ✅ Pas de padding externe
      }}
    >
      {/* ✅ NOUVEAU: Container interne avec padding minimal */}
      <div className="flex-1 w-full p-4">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${textColor} transition-colors duration-300`}>
              {translations?.settingsTitle || 'Paramètres'}
            </h1>
            <p className={`${secondaryTextColor} mt-1 transition-colors duration-300`}>
              Personnalisez votre expérience Gaming Center
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${primaryButtonBg}`}
          >
            <Save size={16} />
            <span>{translations?.saveButton || 'Sauvegarder'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <div 
              className={`rounded-lg border ${containerBorder} p-4 transition-all duration-300 shadow-lg`}
              style={{
                background: containerBg,
                backdropFilter: 'blur(10px)'
              }}
            >
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      activeTab === tab.id
                        ? tabButtonActiveBg
                        : tabButtonInactiveBg
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu de l'onglet */}
          <div className="lg:col-span-3">
            <div 
              className={`rounded-lg border ${containerBorder} p-8 transition-all duration-300 shadow-lg`}
              style={{
                background: containerBg,
                backdropFilter: 'blur(10px)'
              }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;