// Desktop\my-dashboard-app\src\components\Toast\Toast.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Types de notifications avec leurs configurations
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-500 dark:bg-green-600',
    borderClass: 'border-green-600 dark:border-green-700'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-red-500 dark:bg-red-600',
    borderClass: 'border-red-600 dark:border-red-700'
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-yellow-500 dark:bg-yellow-600',
    borderClass: 'border-yellow-600 dark:border-yellow-700'
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-500 dark:bg-blue-600',
    borderClass: 'border-blue-600 dark:border-blue-700'
  }
};

const DEFAULT_DURATION = 8000;

const Toast = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  duration = DEFAULT_DURATION,
  isVisible = true,
  onAction = null,
  actionText = null
}) => {
  const [visible, setVisible] = useState(isVisible);
  
  // Configuration du type de toast
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const IconComponent = toastConfig.icon;
  
  // Effet pour gérer la disparition automatique
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

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

  // Si le toast n'est pas visible, ne rien rendre
  if (!visible) return null;

  return (
    <div 
      className="fixed top-4 right-4 max-w-md w-full md:w-96 transform transition-all duration-300 ease-in-out"
      style={{ 
        zIndex: 99999,
        transform: visible ? 'translateY(0) translateX(0)' : 'translateY(16px) translateX(0)',
        opacity: visible ? 1 : 0
      }}
    >
      <div 
        className={`
          rounded-lg shadow-xl border-l-4 
          ${toastConfig.bgClass} ${toastConfig.borderClass}
          text-white p-4
        `}
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 pt-0.5">
            <IconComponent size={20} className={
              type === 'success' ? 'text-green-400' :
              type === 'error' ? 'text-red-400' :
              type === 'warning' ? 'text-yellow-400' :
              'text-blue-400'
            } />
          </div>
          
          <div className="flex-grow">
            {title && <h3 className="font-bold mb-1 text-white">{title}</h3>}
            <p className="text-sm text-gray-200">{message}</p>
            
            {/* Bouton d'action si présent */}
            {onAction && actionText && (
              <button
                onClick={handleAction}
                className="mt-3 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm rounded transition-colors"
              >
                {actionText}
              </button>
            )}
          </div>
          
          <button 
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;