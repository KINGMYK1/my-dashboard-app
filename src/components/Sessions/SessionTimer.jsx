import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Hourglass } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SessionTimer = ({ 
  session, 
  onTimeExpired, 
  onWarning5Min, 
  onWarning1Min,
  className = '' 
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [warningsTriggered, setWarningsTriggered] = useState({
    fiveMin: false,
    oneMin: false,
    expired: false
  });

  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Mettre à jour le temps toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculer les informations de temps
  const getTimeInfo = () => {
    if (!session) return null;

    const startTime = new Date(session.dateHeureDebut);
    const now = new Date(currentTime);
    
    // Temps écoulé en millisecondes (en excluant les pauses)
    const elapsedMs = now - startTime - (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
    
    // Durée prévue en minutes
    const plannedMinutes = session.dureeEstimeeMinutes || 60;
    
    // Temps restant
    const remainingMinutes = Math.max(0, plannedMinutes - elapsedMinutes);
    
    // Heure de fin prévue
    const plannedEndTime = new Date(startTime.getTime() + plannedMinutes * 60 * 1000);
    
    // Statut
    const isExpired = elapsedMinutes >= plannedMinutes;
    const isWarning5Min = remainingMinutes <= 5 && remainingMinutes > 1;
    const isWarning1Min = remainingMinutes <= 1 && remainingMinutes > 0;
    
    // Pourcentage de progression
    const progressPercent = Math.min(100, (elapsedMinutes / plannedMinutes) * 100);

    return {
      elapsedMinutes,
      plannedMinutes,
      remainingMinutes,
      plannedEndTime,
      isExpired,
      isWarning5Min,
      isWarning1Min,
      progressPercent,
      elapsedDisplay: formatDuration(elapsedMinutes),
      plannedDisplay: formatDuration(plannedMinutes),
      remainingDisplay: formatDuration(remainingMinutes),
      plannedEndDisplay: plannedEndTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const timeInfo = getTimeInfo();

  // Déclencher les avertissements
  useEffect(() => {
    if (!timeInfo) return;

    // Avertissement 5 minutes
    if (timeInfo.isWarning5Min && !warningsTriggered.fiveMin) {
      setWarningsTriggered(prev => ({ ...prev, fiveMin: true }));
      onWarning5Min?.(session, timeInfo);
    }

    // Avertissement 1 minute
    if (timeInfo.isWarning1Min && !warningsTriggered.oneMin) {
      setWarningsTriggered(prev => ({ ...prev, oneMin: true }));
      onWarning1Min?.(session, timeInfo);
    }

    // Session expirée
    if (timeInfo.isExpired && !warningsTriggered.expired) {
      setWarningsTriggered(prev => ({ ...prev, expired: true }));
      onTimeExpired?.(session, timeInfo);
    }
  }, [timeInfo, warningsTriggered, session, onTimeExpired, onWarning5Min, onWarning1Min]);

  if (!timeInfo) return null;

  // Classes de style selon l'état
  const getTimerClasses = () => {
    if (timeInfo.isExpired) {
      return {
        container: 'border-red-500 bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-500',
        progress: 'bg-red-500'
      };
    }
    
    if (timeInfo.isWarning1Min) {
      return {
        container: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 animate-pulse',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-500',
        progress: 'bg-orange-500'
      };
    }
    
    if (timeInfo.isWarning5Min) {
      return {
        container: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: 'text-yellow-500',
        progress: 'bg-yellow-500'
      };
    }
    
    return {
      container: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    };
  };

  const classes = getTimerClasses();

  const getStatusIcon = () => {
    if (timeInfo.isExpired) return <AlertTriangle className={classes.icon} size={16} />;
    if (timeInfo.isWarning1Min || timeInfo.isWarning5Min) return <Clock className={classes.icon} size={16} />;
    return <CheckCircle className={classes.icon} size={16} />;
  };

  return (
    <div className={`${classes.container} border-2 rounded-lg p-3 ${className}`}>
      {/* En-tête avec statut */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${classes.text}`}>
            {timeInfo.isExpired ? 'Temps écoulé' : 
             timeInfo.isWarning1Min ? 'Fin imminente' :
             timeInfo.isWarning5Min ? 'Bientôt terminé' : 'En cours'}
          </span>
        </div>
        <Hourglass className={`${classes.icon} ${timeInfo.isWarning1Min ? 'animate-bounce' : ''}`} size={16} />
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className={`${classes.progress} h-2 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${Math.min(100, timeInfo.progressPercent)}%` }}
        />
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`${classes.text}`}>
          <div className="font-medium">Temps écoulé</div>
          <div className="font-mono">{timeInfo.elapsedDisplay}</div>
        </div>
        <div className={`${classes.text}`}>
          <div className="font-medium">
            {timeInfo.isExpired ? 'Dépassement' : 'Temps restant'}
          </div>
          <div className="font-mono">
            {timeInfo.isExpired ? 
              `+${formatDuration(timeInfo.elapsedMinutes - timeInfo.plannedMinutes)}` :
              timeInfo.remainingDisplay
            }
          </div>
        </div>
        <div className={`${classes.text}`}>
          <div className="font-medium">Durée prévue</div>
          <div className="font-mono">{timeInfo.plannedDisplay}</div>
        </div>
        <div className={`${classes.text}`}>
          <div className="font-medium">Fin prévue</div>
          <div className="font-mono">{timeInfo.plannedEndDisplay}</div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimer;