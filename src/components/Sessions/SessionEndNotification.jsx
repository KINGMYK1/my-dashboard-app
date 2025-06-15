import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, DollarSign, Play, Pause, Plus, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Portal from '../Portal/Portal';

const SessionEndNotification = ({
  notification,
  onExtend,
  onTerminate,
  onSuspend,
  onResume,
  onDismiss
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExtensionForm, setShowExtensionForm] = useState(false);

  const { type, session, minutesLeft } = notification;

  const getNotificationContent = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <Clock className="text-orange-500" size={24} />,
          title: 'Session bientôt terminée',
          message: `La session ${session.numeroSession} se terminera dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
          bgColor: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
          borderColor: 'border-orange-500',
          actions: ['extend', 'terminate', 'suspend']
        };
      
      case 'expired':
        return {
          icon: <AlertTriangle className="text-red-500" size={24} />,
          title: 'Session expirée !',
          message: `La session ${session.numeroSession} a atteint sa durée limite`,
          bgColor: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
          borderColor: 'border-red-500',
          actions: ['extend', 'terminate']
        };
      
      case 'suspended':
        return {
          icon: <Pause className="text-blue-500" size={24} />,
          title: 'Session suspendue',
          message: `La session ${session.numeroSession} est en pause (temps écoulé)`,
          bgColor: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          borderColor: 'border-blue-500',
          actions: ['extend', 'terminate', 'resume']
        };
      
      case 'extension_offered':
        return {
          icon: <Plus className="text-indigo-500" size={24} />,
          title: 'Prolongation suggérée',
          message: `Voulez-vous prolonger la session ${session.numeroSession} ?`,
          bgColor: isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50',
          borderColor: 'border-indigo-500',
          actions: ['extend', 'terminate']
        };
      
      default:
        return null;
    }
  };

  const content = getNotificationContent();
  if (!content) return null;

  const handleAction = (action) => {
    switch (action) {
      case 'extend':
        setShowExtensionForm(true);
        break;
      case 'terminate':
        setShowPaymentForm(true);
        break;
      case 'suspend':
        onSuspend(session, 'Session suspendue par l\'utilisateur');
        break;
      case 'resume':
        onResume(session);
        break;
    }
  };

  const overlayClass = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
  const cardClass = `
    max-w-md w-full rounded-lg border-2 ${content.borderColor} ${content.bgColor}
    ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl transform transition-all animate-pulse-slow
  `;

  return (
    <Portal>
      <div className={overlayClass}>
        <div className={cardClass}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              {content.icon}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {content.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {content.message}
                </p>
              </div>
              <button
                onClick={() => onDismiss(session.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Session Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Poste:</span>
                <div className="font-medium">{session.Poste?.nom}</div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Durée prévue:</span>
                <div className="font-medium">{session.dureeEstimeeMinutes} min</div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Début:</span>
                <div className="font-medium">
                  {new Date(session.dateHeureDebut).toLocaleTimeString()}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Coût estimé:</span>
                <div className="font-medium text-green-600">
                  {session.montantTotal?.toFixed(2) || '0.00'} MAD
                </div>
              </div>
            </div>
          </div>

          {/* Extension Form */}
          {showExtensionForm && (
            <ExtensionForm
              session={session}
              onConfirm={(minutes) => {
                onExtend(session, minutes);
                setShowExtensionForm(false);
              }}
              onCancel={() => setShowExtensionForm(false)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Payment Form */}
          {showPaymentForm && (
            <PaymentForm
              session={session}
              onConfirm={(paymentData) => {
                onTerminate(session, paymentData);
                setShowPaymentForm(false);
              }}
              onCancel={() => setShowPaymentForm(false)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Actions */}
          {!showExtensionForm && !showPaymentForm && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                {content.actions.includes('extend') && (
                  <button
                    onClick={() => handleAction('extend')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Prolonger
                  </button>
                )}
                
                {content.actions.includes('terminate') && (
                  <button
                    onClick={() => handleAction('terminate')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Terminer
                  </button>
                )}
                
                {content.actions.includes('suspend') && (
                  <button
                    onClick={() => handleAction('suspend')}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center"
                  >
                    <Pause size={16} className="mr-1" />
                    Suspendre
                  </button>
                )}
                
                {content.actions.includes('resume') && (
                  <button
                    onClick={() => handleAction('resume')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <Play size={16} className="mr-1" />
                    Reprendre
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

// Formulaire d'extension
const ExtensionForm = ({ session, onConfirm, onCancel, isDarkMode }) => {
  const [minutes, setMinutes] = useState(15);

  const presetTimes = [5, 10, 15, 30, 60];

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
      <h4 className="font-medium mb-3">Prolonger la session</h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {presetTimes.map(time => (
            <button
              key={time}
              onClick={() => setMinutes(time)}
              className={`p-2 text-sm rounded ${
                minutes === time 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {time}min
            </button>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Durée personnalisée (minutes)</label>
          <input
            type="number"
            min="1"
            max="240"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 1)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(minutes)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Prolonger de {minutes} min
          </button>
        </div>
      </div>
    </div>
  );
};

// Formulaire de paiement (inchangé)
const PaymentForm = ({ session, onConfirm, onCancel, isDarkMode }) => {
  const [paymentData, setPaymentData] = useState({
    modePaiement: 'ESPECES',
    montantPaye: session.montantTotal || 0,
    marquerCommePayee: true,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(paymentData);
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mode de paiement</label>
          <select
            value={paymentData.modePaiement}
            onChange={(e) => setPaymentData(prev => ({ ...prev, modePaiement: e.target.value }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="ESPECES">Espèces</option>
            <option value="CARTE_BANCAIRE">Carte bancaire</option>
            <option value="MOBILE">Paiement mobile</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Montant payé</label>
          <input
            type="number"
            step="0.01"
            value={paymentData.montantPaye}
            onChange={(e) => setPaymentData(prev => ({ ...prev, montantPaye: parseFloat(e.target.value) }))}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="marquerCommePayee"
            checked={paymentData.marquerCommePayee}
            onChange={(e) => setPaymentData(prev => ({ ...prev, marquerCommePayee: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="marquerCommePayee" className="text-sm">Marquer comme payée</label>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Terminer session
          </button>
        </div>
      </form>
    </div>
  );
};

export default SessionEndNotification;