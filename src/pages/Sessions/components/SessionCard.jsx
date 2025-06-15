import React, { useMemo } from 'react';
import { Play, Pause, Square, Clock, User, Monitor, AlertTriangle } from 'lucide-react';
import { useSessionTimer } from '../../../hooks/useSessionTimer'; // Hook personnalisé

const SessionCard = ({ session, onOpenActions, isDarkMode, type = 'active' }) => {
  // ✅ Hook personnalisé qui gère intelligemment les timers
  const currentTime = useSessionTimer(session?.statut === 'EN_COURS');

  // ✅ Calculs mémorisés - plus performant
  const timeInfo = useMemo(() => {
    if (!session) return null;

    const startTime = new Date(session.dateHeureDebut);
    const plannedMinutes = session.dureeEstimeeMinutes || 60;

    // ✅ CORRECTION PRINCIPALE: Gestion spécifique des sessions en pause
    if (session.statut === 'EN_PAUSE') {
      // Pour les sessions en pause, calculer jusqu'au moment de la pause
      const pauseStart = new Date(session.pauseActuelleDebut);
      const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
      
      // Temps écoulé jusqu'à la pause (sans inclure la pause actuelle)
      const elapsedMsBeforePause = pauseStart - startTime - pauseTimeMs;
      const elapsedMinutesBeforePause = Math.max(0, Math.floor(elapsedMsBeforePause / (1000 * 60)));
      
      // Temps de pause actuel
      const currentPauseMs = Date.now() - pauseStart;
      const currentPauseMinutes = Math.floor(currentPauseMs / (1000 * 60));
      
      const remainingMinutes = Math.max(0, plannedMinutes - elapsedMinutesBeforePause);
      const progressPercent = Math.min(100, (elapsedMinutesBeforePause / plannedMinutes) * 100);
      const plannedEndTime = new Date(startTime.getTime() + plannedMinutes * 60 * 1000);

      return {
        elapsedMinutes: elapsedMinutesBeforePause,
        elapsedSeconds: 0,
        plannedMinutes,
        remainingMinutes,
        remainingSeconds: 0,
        currentPauseMinutes,
        plannedEndTime,
        isExpired: elapsedMinutesBeforePause >= plannedMinutes,
        isWarning5Min: remainingMinutes <= 5 && remainingMinutes > 1,
        isWarning1Min: remainingMinutes <= 1 && remainingMinutes > 0,
        isOvertime: elapsedMinutesBeforePause >= plannedMinutes,
        overtimeMinutes: Math.max(0, elapsedMinutesBeforePause - plannedMinutes),
        progressPercent,
        isPaused: true
      };
    }

    // ✅ Pour les sessions actives
    if (session.statut === 'EN_COURS') {
      const now = new Date(currentTime);
      const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
      const elapsedMs = Math.max(0, now - startTime - pauseTimeMs);
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
      const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
      
      const remainingMinutes = Math.max(0, plannedMinutes - elapsedMinutes);
      const remainingSeconds = remainingMinutes > 0 && elapsedSeconds > 0 ? 60 - elapsedSeconds : 0;
      const plannedEndTime = new Date(startTime.getTime() + plannedMinutes * 60 * 1000);
      
      const isExpired = elapsedMinutes >= plannedMinutes;
      const isWarning5Min = remainingMinutes <= 5 && remainingMinutes > 1;
      const isWarning1Min = remainingMinutes <= 1 && remainingMinutes > 0;
      const isOvertime = isExpired;
      const overtimeMinutes = isOvertime ? elapsedMinutes - plannedMinutes : 0;
      const progressPercent = Math.min(150, (elapsedMinutes / plannedMinutes) * 100);

      return {
        elapsedMinutes,
        elapsedSeconds,
        plannedMinutes,
        remainingMinutes,
        remainingSeconds,
        plannedEndTime,
        isExpired,
        isWarning5Min,
        isWarning1Min,
        isOvertime,
        overtimeMinutes,
        progressPercent,
        isPaused: false
      };
    }

    return null;
  }, [session, currentTime]);

  // ✅ Prix calculé de manière optimisée
  const currentPrice = useMemo(() => {
    if (!session?.poste?.typePoste?.tarifHoraireBase || !timeInfo) {
      return session?.montantTotal || 0;
    }
    
    const tarifHoraire = session.poste.typePoste.tarifHoraireBase;
    return Math.max(0, (timeInfo.elapsedMinutes / 60) * tarifHoraire);
  }, [session, timeInfo]);

  // ✅ Fonctions helper
  const formatDuration = (minutes, seconds = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (minutes < 60) {
      if (seconds !== undefined && minutes < 10) {
        return `${mins}m ${seconds}s`;
      }
      return `${mins}min`;
    }
    
    return `${hours}h ${mins}min`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(2)} MAD`;
  };

  // ✅ Style basé sur l'état
  const getCardStyle = () => {
    if (timeInfo?.isPaused) {
      return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    }
    
    if (timeInfo?.isOvertime) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
    
    if (timeInfo?.isWarning1Min) {
      return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    }
    
    if (timeInfo?.isWarning5Min) {
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
    
    return isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  };

  // ✅ État de chargement si pas de données
  if (!timeInfo) {
    return (
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Données indisponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${getCardStyle()}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {session.numeroSession}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {session.poste?.nom || 'Poste inconnu'}
          </p>
        </div>
        
        {/* ✅ Badge de statut amélioré */}
        <div className="flex items-center gap-2">
          {timeInfo.isPaused && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1">
              <Pause size={12} />
              EN PAUSE
            </span>
          )}
          <button
            onClick={() => onOpenActions(session)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeInfo.isPaused 
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {timeInfo.isPaused ? 'Reprendre' : 'Actions'}
          </button>
        </div>
      </div>

      {/* ✅ Contenu spécial pour les sessions en pause */}
      {timeInfo.isPaused ? (
        <div className="space-y-3">
          {/* Alerte de pause */}
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
              <Pause size={16} />
              <span className="font-medium">Session en pause depuis {timeInfo.currentPauseMinutes} minute{timeInfo.currentPauseMinutes > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Informations de temps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Temps écoulé (avant pause)
              </p>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(timeInfo.elapsedMinutes)}
              </p>
            </div>
            <div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Temps restant
              </p>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(timeInfo.remainingMinutes)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // ✅ Contenu pour les sessions actives (code existant)
        <>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Temps écoulé
              </p>
              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(timeInfo.elapsedMinutes, timeInfo.elapsedSeconds)}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {timeInfo.isOvertime ? 'Dépassement' : 'Temps restant'}
              </p>
              <p className={`font-semibold ${
                timeInfo.isOvertime ? 'text-red-500' : 
                timeInfo.isWarning1Min ? 'text-orange-500' :
                timeInfo.isWarning5Min ? 'text-yellow-500' :
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {timeInfo.isOvertime 
                  ? `+${formatDuration(timeInfo.overtimeMinutes)}`
                  : formatDuration(timeInfo.remainingMinutes, timeInfo.remainingSeconds)
                }
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                timeInfo.isOvertime ? 'bg-red-600 animate-pulse' :
                timeInfo.isWarning1Min ? 'bg-orange-500' :
                timeInfo.isWarning5Min ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min(100, Math.max(0, timeInfo.progressPercent))}%`
              }}
            />
          </div>
        </>
      )}

      {/* Prix et informations finales */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Prix actuel
          </p>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatPrice(currentPrice)}
          </p>
        </div>
        <div className="text-right">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Fin prévue
          </p>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(timeInfo.plannedEndTime)}
          </p>
        </div>
      </div>

      {/* Client info */}
      {session.client && !session.client.isSystemClient && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Client: {session.client.nom}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionCard;