import React, { useState, useEffect } from 'react';
import { XCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';

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

// Durée d'affichage par défaut (en millisecondes)
const DEFAULT_DURATION = 10000;

const Toast = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  duration = DEFAULT_DURATION,
  isVisible = true 
}) => {
  const [visible, setVisible] = useState(isVisible);
  
  // Configuration du type de toast
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const IconComponent = toastConfig.icon;
  
  // Effet pour gérer la disparition automatique
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Attendre que l'animation de sortie soit terminée
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Si le toast n'est pas visible, ne rien rendre
  if (!visible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      max-w-md w-full md:w-96
      transform transition-all duration-300 ease-in-out
      ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
    `}>
      <div className={`
        rounded-lg shadow-lg border-l-4 
        ${toastConfig.bgClass} ${toastConfig.borderClass}
        text-white p-4 flex items-start
      `}>
        <div className="flex-shrink-0 mr-3 pt-0.5">
          <IconComponent size={20} />
        </div>
        <div className="flex-grow">
          {title && <h3 className="font-bold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }} 
          className="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
          aria-label="Fermer"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;