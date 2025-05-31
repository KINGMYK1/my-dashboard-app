// src/components/monitoring/ActivityDetails.jsx
import React from 'react';
import { X, User, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const ActivityDetails = ({ log, isOpen, onClose }) => {
  const { translations } = useLanguage();
  
  if (!isOpen || !log) return null;
  
  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'WARNING':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'ERROR':
      case 'FAILURE':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 
                className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" 
                id="modal-title"
              >
                {translations?.activityDetails || "Détails de l'activité"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {/* Statut */}
              <div className="flex items-center">
                {getStatusIcon(log.status)}
                <span className="ml-2 font-semibold text-lg">{log.action}</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                  log.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                  log.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                  'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {log.status}
                </span>
              </div>
              
              {/* Utilisateur */}
              <div className="flex items-start">
                <User size={20} className="text-gray-400 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.user || "Utilisateur"}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {log.user 
                      ? `${log.user.firstName} ${log.user.lastName} (${log.user.username || log.user.email})` 
                      : translations?.system || "Système"}
                  </p>
                </div>
              </div>
              
              {/* Date et heure */}
              <div className="flex items-start">
                <Calendar size={20} className="text-gray-400 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.date || "Date"}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={20} className="text-gray-400 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.time || "Heure"}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.description || "Description"}</p>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {log.description}
                </p>
              </div>
              
              {/* Autres détails si disponibles */}
              {log.resourceType && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.resourceType || "Type de ressource"}</p>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {log.resourceType}
                  </p>
                </div>
              )}
              
              {log.resourceId && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.resourceId || "ID de ressource"}</p>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {log.resourceId}
                  </p>
                </div>
              )}
              
              {/* Données supplémentaires (si format JSON) */}
              {log.metadata && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translations?.additionalData || "Données supplémentaires"}</p>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-xs overflow-auto max-h-40">
                    {typeof log.metadata === 'object' 
                      ? JSON.stringify(log.metadata, null, 2) 
                      : log.metadata}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {translations?.close || "Fermer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;