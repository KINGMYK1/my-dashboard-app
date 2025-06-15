import React from 'react';
import { Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ExpiredSessionsAlert = ({ 
  expiredSessions, 
  onForceTerminate, 
  onDismiss 
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  if (!expiredSessions || expiredSessions.length === 0) {
    return null;
  }

  const alertBg = isDarkMode 
    ? 'bg-orange-900/20 border-orange-500/30' 
    : 'bg-orange-50 border-orange-200';

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-orange-300' : 'text-orange-700';

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full`}>
      <div className={`${alertBg} border rounded-lg p-4 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold ${textPrimary} mb-2`}>
              Sessions expirées en pause
            </h3>
            
            <p className={`text-sm ${textSecondary} mb-3`}>
              {expiredSessions.length} session(s) expirée(s) en attente de terminaison automatique
            </p>

            <div className="space-y-2 mb-4">
              {expiredSessions.slice(0, 3).map((sessionId) => (
                <div key={sessionId} className="flex items-center justify-between">
                  <span className={`text-sm ${textPrimary}`}>
                    Session #{sessionId}
                  </span>
                  <button
                    onClick={() => onForceTerminate(sessionId)}
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                  >
                    Terminer maintenant
                  </button>
                </div>
              ))}
              
              {expiredSessions.length > 3 && (
                <p className={`text-xs ${textSecondary}`}>
                  ... et {expiredSessions.length - 3} autre(s)
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Clock size={14} className="text-orange-500" />
              <span className={textSecondary}>
                Terminaison automatique en cours...
              </span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${textSecondary} hover:${textPrimary}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredSessionsAlert;