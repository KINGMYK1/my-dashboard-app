import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({
  type = 'info',
  message,
  title,
  duration = 5000,
  isVisible = true,
  onClose,
  onAction,
  actionText,
  priority = 'normal',
  category = 'general',
  theme = 'dark',
  onMarkAsRead,
  isRead = false,
  canDismiss = true // ✅ NOUVEAU: Contrôler si on peut masquer
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (duration > 0 && show) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, show]);

  const handleClose = () => {
    if (canDismiss && onClose) { // ✅ Vérifier canDismiss
      setShow(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'error':
        return <XCircle className="text-red-400" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400" size={20} />;
      default:
        return <Info className="text-blue-400" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    if (theme === 'dark') {
      switch (type) {
        case 'success':
          return 'bg-green-900/90 border-green-400/30';
        case 'error':
          return 'bg-red-900/90 border-red-400/30';
        case 'warning':
          return 'bg-yellow-900/90 border-yellow-400/30';
        default:
          return 'bg-blue-900/90 border-blue-400/30';
      }
    } else {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        default:
          return 'bg-blue-50 border-blue-200';
      }
    }
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  if (!show) return null;

  return (
    <div
      className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${priority === 'critical' ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
      style={{
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor} ${!isRead ? 'font-bold' : ''}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${secondaryTextColor} ${title ? 'mt-1' : ''}`}>
            {message}
          </p>
          
          {actionText && onAction && (
            <button
              onClick={onAction}
              className={`mt-2 text-sm font-medium ${
                theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
              } transition-colors`}
            >
              {actionText}
            </button>
          )}
        </div>
        
        {/* ✅ CORRECTION: Bouton de fermeture seulement si canDismiss */}
        {canDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${secondaryTextColor} hover:${textColor} transition-colors`}
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* ✅ Indicateur de priorité critique */}
        {priority === 'critical' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
      
      {/* ✅ Barre de progression pour les notifications temporaires */}
      {duration > 0 && show && canDismiss && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-current h-1 rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear`
              }}
            ></div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;