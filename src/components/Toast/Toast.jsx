import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// Types de notifications avec leurs configurations
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgClass: {
      dark: 'bg-green-600/90',
      light: 'bg-green-500/90'
    },
    borderClass: {
      dark: 'border-green-500/50',
      light: 'border-green-400/50'
    },
    iconColor: {
      dark: 'text-green-300',
      light: 'text-green-600'
    }
  },
  error: {
    icon: XCircle,
    bgClass: {
      dark: 'bg-red-600/90',
      light: 'bg-red-500/90'
    },
    borderClass: {
      dark: 'border-red-500/50',
      light: 'border-red-400/50'
    },
    iconColor: {
      dark: 'text-red-300',
      light: 'text-red-600'
    }
  },
  warning: {
    icon: AlertCircle,
    bgClass: {
      dark: 'bg-orange-600/90',
      light: 'bg-orange-500/90'
    },
    borderClass: {
      dark: 'border-orange-500/50',
      light: 'border-orange-400/50'
    },
    iconColor: {
      dark: 'text-orange-300',
      light: 'text-orange-600'
    }
  },
  info: {
    icon: Info,
    bgClass: {
      dark: 'bg-blue-600/90',
      light: 'bg-blue-500/90'
    },
    borderClass: {
      dark: 'border-blue-500/50',
      light: 'border-blue-400/50'
    },
    iconColor: {
      dark: 'text-blue-300',
      light: 'text-blue-600'
    }
  }
};

const DEFAULT_DURATION = 5000;

const Toast = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  duration = DEFAULT_DURATION,
  isVisible = true,
  onAction = null,
  actionText = null,
  priority = 'normal',
  category = 'general',
  theme,
  onMarkAsRead,
  isRead = false
}) => {
  const [visible, setVisible] = useState(isVisible);
  const [isHovered, setIsHovered] = useState(false);
  const { effectiveTheme } = useTheme();
  
  const currentTheme = theme || effectiveTheme;
  const isDarkMode = currentTheme === 'dark';
  
  // Configuration du type de toast
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const IconComponent = toastConfig.icon;
  
  // Classes dynamiques basées sur le thème
  const getTextColorClass = (isPrimary) => isDarkMode ? 
    (isPrimary ? 'text-white' : 'text-gray-200') : 
    (isPrimary ? 'text-gray-900' : 'text-gray-700');
  
  const getBackgroundClass = () => {
    if (priority === 'critical') {
      return isDarkMode ? 'bg-red-900/95' : 'bg-red-100/95';
    }
    return isDarkMode ? 
      'bg-gray-800/95' : 
      'bg-white/95';
  };
  
  const getBorderClass = () => {
    if (priority === 'critical') {
      return 'border-red-500';
    }
    return toastConfig.borderClass[currentTheme];
  };
  
  const getPriorityIndicator = () => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  // Effet pour gérer la disparition automatique
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && duration > 0 && !isHovered) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, isHovered]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    handleClose();
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  };

  // Si le toast n'est pas visible, ne rien rendre
  if (!visible) return null;

  return (
    <div 
      className={`max-w-md w-full transform transition-all duration-300 ease-in-out ${getPriorityIndicator()}`}
      style={{ 
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.95)',
        opacity: visible ? 1 : 0
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`
          rounded-lg shadow-xl border 
          ${getBackgroundClass()} 
          ${getBorderClass()}
          p-4 relative
          ${priority === 'critical' ? 'ring-2 ring-red-500' : ''}
        `}
        style={{
          backdropFilter: 'blur(10px)',
          boxShadow: priority === 'critical' ? 
            '0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.1)' :
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Indicateur de lecture */}
        {!isRead && (
          <div className="absolute top-2 right-12 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 pt-0.5">
            <IconComponent 
              size={20} 
              className={toastConfig.iconColor[currentTheme]}
            />
          </div>
          
          <div className="flex-grow">
            {title && (
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-bold ${getTextColorClass(true)}`}>
                  {title}
                </h3>
                {priority === 'critical' && (
                  <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                    CRITIQUE
                  </span>
                )}
              </div>
            )}
            
            <p className={`text-sm ${getTextColorClass(false)}`}>
              {message}
            </p>
            
            {/* Métadonnées */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                {category !== 'general' && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Bouton marquer comme lu */}
                {!isRead && onMarkAsRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
                    } transition-colors`}
                    title="Marquer comme lu"
                  >
                    <Eye size={14} className={getTextColorClass(false)} />
                  </button>
                )}
                
                {isRead && (
                  <EyeOff size={14} className={`${getTextColorClass(false)} opacity-50`} />
                )}
              </div>
            </div>
            
            {/* Bouton d'action si présent */}
            {onAction && actionText && (
              <button
                onClick={handleAction}
                className={`mt-3 px-3 py-1 rounded transition-colors ${
                  isDarkMode 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                    : 'bg-black bg-opacity-10 hover:bg-opacity-20 text-gray-900'
                } text-sm`}
              >
                {actionText}
              </button>
            )}
          </div>
          
          <button 
            onClick={handleClose}
            className={`flex-shrink-0 ml-2 p-1 rounded hover:bg-opacity-20 ${
              isDarkMode ? 'hover:bg-white' : 'hover:bg-black'
            } transition-colors`}
            aria-label="Fermer"
          >
            <X size={18} className={getTextColorClass(false)} />
          </button>
        </div>

        {/* Barre de progression pour le temps restant */}
        {duration > 0 && !isHovered && (
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Toast;