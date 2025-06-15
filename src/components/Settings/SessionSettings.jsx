import React, { useState, useEffect } from 'react';
import { Clock, Bell, DollarSign, Settings as SettingsIcon, Save } from 'lucide-react';

const SessionSettings = ({ isDarkMode }) => {
  const [settings, setSettings] = useState({
    autoTerminate: false,
    warningMinutes: 5,
    graceMinutes: 2,
    defaultPaymentMode: 'ESPECES',
    showNotifications: true,
    playWarningSound: true,
    autoSuspendOnExpire: true,
    allowExtension: true
  });

  const [saved, setSaved] = useState(false);

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const savedSettings = localStorage.getItem('sessionNotificationPreferences');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Sauvegarder les paramètres
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('sessionNotificationPreferences', JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SettingsIcon size={20} />
          <h3 className={`text-lg font-semibold ${textClass}`}>
            Paramètres des sessions
          </h3>
        </div>
        {saved && (
          <div className="flex items-center text-green-500 text-sm">
            <Save size={16} className="mr-1" />
            Sauvegardé
          </div>
        )}
      </div>

      {/* Terminaison automatique */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Terminaison automatique</h4>
            <p className={`text-sm ${subtextClass}`}>
              Terminer automatiquement les sessions expirées
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoTerminate}
              onChange={(e) => handleChange('autoTerminate', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Suspension automatique */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Suspension automatique</h4>
            <p className={`text-sm ${subtextClass}`}>
              Suspendre automatiquement les sessions expirées
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSuspendOnExpire}
              onChange={(e) => handleChange('autoSuspendOnExpire', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Avertissement */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Avertissement avant expiration</h4>
            <p className={`text-sm ${subtextClass}`}>
              Minutes avant la fin pour afficher l'avertissement
            </p>
          </div>
          <select
            value={settings.warningMinutes}
            onChange={(e) => handleChange('warningMinutes', parseInt(e.target.value))}
            className={`p-2 border rounded ${inputClass}`}
          >
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={3}>3 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Afficher les notifications</h4>
            <p className={`text-sm ${subtextClass}`}>
              Afficher les alertes visuelles
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showNotifications}
              onChange={(e) => handleChange('showNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Son d'avertissement */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Son d'avertissement</h4>
            <p className={`text-sm ${subtextClass}`}>
              Jouer un son lors des alertes
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.playWarningSound}
              onChange={(e) => handleChange('playWarningSound', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Extension autorisée */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Autoriser les prolongations</h4>
            <p className={`text-sm ${subtextClass}`}>
              Permettre la prolongation des sessions expirées
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowExtension}
              onChange={(e) => handleChange('allowExtension', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Mode de paiement par défaut */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${textClass}`}>Mode de paiement par défaut</h4>
            <p className={`text-sm ${subtextClass}`}>
              Mode utilisé pour la terminaison automatique
            </p>
          </div>
          <select
            value={settings.defaultPaymentMode}
            onChange={(e) => handleChange('defaultPaymentMode', e.target.value)}
            className={`p-2 border rounded ${inputClass}`}
          >
            <option value="ESPECES">Espèces</option>
            <option value="CARTE_BANCAIRE">Carte bancaire</option>
            <option value="MOBILE">Paiement mobile</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>
      </div>

      {/* Test du son */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            // Test du son de notification
            if (settings.playWarningSound) {
              const audio = new Audio();
              audio.volume = 0.5;
              audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuFz+/3dSYELYHO8tiJNwgZZ7zr55hNEAxPqOLvtmUcBjiR1/LNeSsFJnbH8N2PQAUTWLTB66hUFAlGm+TyvWwhBTuEz+/3dSUELYPO8tiJNwgZZ7zs55lPEAxPpOLyt2YdBjiS1/LNeSsFJnbH8N2PQAUTWbXB66hUFAlGn+DyvmshCzuEz/D3dSIELYPP8tiINwgZZ7vw55lNEwxPpOPzt2YdBjiR2PLNdysFJnbH8t+PQAUSWrTB66hUEwlHm+PzvmvBCzuFz/D3dSIELYPP8tiINwgZZ7vs55lNEwxPpOPztmYdCTuR2PLNdysFJnbH89+PQAUSWrTB66hUEwpGn+TyvmrBCzuEz/D3dSIELYPP89iINwgYZ7vw55lNGAxPoeP0t2ceBy6S2PLNdSwGDXfH89+OPwUSWbTB66hUGwpGnu7yvmrBDTuEz/H3dSMGLYPP89iKNwgYZLrs55lNGAxMp+T0t2ceBy6S2PLNdSwGJnfJ896OPgUSWbTD66hUGwpGme3yvmrBDTuEzfH3dSMGLYPP89iKNggYZLry55hMGg1Mp+T0t2ceB66S2PLNdSwGJnfJ896OPgUSWbTD66hUGgpGmebyvmrBDT';
              audio.play().catch(e => console.log('Son non joué:', e));
            }
          }}
          className={`w-full py-2 px-4 rounded-lg border transition-colors ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900'
          }`}
        >
          <Bell size={16} className="inline mr-2" />
          Tester le son de notification
        </button>
      </div>
    </div>
  );
};

export default SessionSettings;