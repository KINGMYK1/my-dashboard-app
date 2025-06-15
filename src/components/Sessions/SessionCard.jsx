import React from 'react';
import { Play, Pause, Square, Clock, User, Monitor, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SessionTimer from './SessionTimer';
import { useSessionNotifications } from '../../hooks/useSessionNotifications';

const SessionCard = ({ 
  session, 
  onOpenActions, 
  showTimer = true,
  className = '' 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';
  
  const { 
    handleWarning5Min, 
    handleWarning1Min, 
    handleTimeExpired 
  } = useSessionNotifications();

  // Calculer si la session est expirée
  const isSessionExpired = () => {
    if (session.statut !== 'EN_COURS') return false;
    
    const startTime = new Date(session.dateHeureDebut);
    const now = new Date();
    const elapsedMs = now - startTime - (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    const plannedMinutes = session.dureeEstimeeMinutes || 60;
    
    return elapsedMinutes >= plannedMinutes;
  };

  // Styles de base avec logique d'expiration
  const expired = isSessionExpired();
  const cardBg = isDarkMode 
    ? `${expired ? 'bg-red-900/30 border-red-500/50' : 'bg-gray-800/90 border-gray-700/50'} hover:bg-gray-800` 
    : `${expired ? 'bg-red-50 border-red-200' : 'bg-white/90 border-gray-200'} hover:bg-white`;

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price || 0);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      'EN_COURS': { 
        color: expired 
          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        label: expired ? 'Temps écoulé' : 'En cours',
        icon: expired ? AlertTriangle : Play
      },
      'EN_PAUSE': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
        label: 'En pause',
        icon: Pause
      },
      'TERMINEE': { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
        label: 'Terminée',
        icon: Square
      },
      'ANNULEE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        label: 'Annulée',
        icon: Square
      }
    };

    const config = statusConfig[session.statut] || statusConfig['EN_COURS'];
    const IconComponent = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        <IconComponent size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  const getActionButton = () => {
    if (session.statut === 'EN_COURS') {
      return (
        <button
          onClick={() => onOpenActions(session)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded transition-colors text-sm ${
            expired 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Square size={16} />
          <span>{expired ? 'Action requise' : 'Actions'}</span>
        </button>
      );
    }

    if (session.statut === 'EN_PAUSE') {
      return (
        <button
          onClick={() => onOpenActions(session)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
        >
          <Play size={16} />
          <span>Reprendre</span>
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`${cardBg} border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${className} ${expired ? 'animate-pulse' : ''}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Monitor className={`w-5 h-5 ${textSecondary}`} />
          <span className={`font-semibold ${textPrimary}`}>
            {session.poste?.nom || `Poste #${session.posteId}`}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Alertes d'expiration */}
      {expired && session.statut === 'EN_COURS' && (
        <div className="mb-3 p-2 bg-red-600 text-white rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} />
            <span className="font-medium">Temps de session dépassé</span>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Action requise : terminer ou prolonger la session
          </p>
        </div>
      )}

      {/* Informations de session */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className={textSecondary}>Session:</span>
          <span className={`font-mono ${textPrimary}`}>{session.numeroSession}</span>
        </div>

        {session.client && !session.client.isSystemClient && (
          <div className="flex justify-between text-sm">
            <span className={textSecondary}>Client:</span>
            <span className={textPrimary}>
              {session.client.prenom} {session.client.nom}
            </span>
          </div>
        )}

        {session.typeSession && (
          <div className="flex justify-between text-sm">
            <span className={textSecondary}>Type:</span>
            <span className={textPrimary}>{session.typeSession}</span>
          </div>
        )}

        {session.montantTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className={textSecondary}>Coût:</span>
            <span className={`font-semibold ${textPrimary}`}>
              {formatPrice(session.montantTotal)}
            </span>
          </div>
        )}

        {session.jeuPrincipal && (
          <div className="flex justify-between text-sm">
            <span className={textSecondary}>Jeu:</span>
            <span className={textPrimary}>{session.jeuPrincipal}</span>
          </div>
        )}
      </div>

      {/* Timer de session */}
      {showTimer && session.statut === 'EN_COURS' && (
        <SessionTimer
          session={session}
          onTimeExpired={handleTimeExpired}
          onWarning5Min={handleWarning5Min}
          onWarning1Min={handleWarning1Min}
          className="mb-3"
        />
      )}

      {/* Notes */}
      {session.notes && (
        <div className={`text-xs ${textMuted} mb-3 italic`}>
          "{session.notes}"
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className={`text-xs ${textMuted}`}>
          Démarrée: {new Date(session.dateHeureDebut).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        {getActionButton()}
      </div>
    </div>
  );
};

export default SessionCard;