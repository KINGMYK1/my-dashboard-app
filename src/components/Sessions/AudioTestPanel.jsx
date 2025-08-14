import React, { useState } from 'react';
import { Volume2, Play, Settings } from 'lucide-react';
import audioNotificationService from '../../services/audioNotificationService';

const AudioTestPanel = ({ onClose }) => {
  const [volume, setVolume] = useState(0.7);
  const [isEnabled, setIsEnabled] = useState(true);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioNotificationService.setVolume(newVolume);
  };

  const handleToggleEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    audioNotificationService.setEnabled(newState);
  };

  const testSounds = [
    { 
      type: 'warning_5min', 
      label: '⏰ Alerte 5 minutes', 
      description: 'Son doux pour avertir que la session se termine dans 5 minutes' 
    },
    { 
      type: 'warning_1min', 
      label: '🚨 Alerte 1 minute', 
      description: 'Son urgent pour avertir que la session se termine dans 1 minute' 
    },
    { 
      type: 'session_expired', 
      label: '🔥 Session expirée', 
      description: 'Séquence sonore très urgente pour signaler une session expirée' 
    },
    { 
      type: 'success', 
      label: '✅ Succès', 
      description: 'Son positif pour confirmer une action réussie' 
    },
    { 
      type: 'error', 
      label: '❌ Erreur', 
      description: 'Son pour signaler une erreur' 
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              🔊 Test des Sons de Notification
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Contrôles */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="audio-enabled"
                checked={isEnabled}
                onChange={handleToggleEnabled}
                className="rounded"
              />
              <label htmlFor="audio-enabled" className="text-sm text-gray-700 dark:text-gray-300">
                Sons activés
              </label>
            </div>
          </div>

          {/* Tests des sons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tester les sons
            </h3>
            
            {testSounds.map((sound) => (
              <div key={sound.type} className="border rounded-lg p-3 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {sound.label}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {sound.description}
                    </p>
                  </div>
                  <button
                    onClick={() => audioNotificationService.testSound(sound.type)}
                    disabled={!isEnabled}
                    className="ml-3 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Play size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info système */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Settings size={16} className="text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">
                État audio: {audioNotificationService.isAudioEnabled() ? '✅ Actif' : '❌ Désactivé'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioTestPanel;
