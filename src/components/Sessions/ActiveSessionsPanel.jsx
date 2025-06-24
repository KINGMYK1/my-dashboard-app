import React, { useState, useEffect } from 'react';
import { Clock, User, Monitor, Pause, Play, Square, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
// ✅ CORRIGÉ: Import du bon hook
import { useSessionsActives } from '../../hooks/useSessions';
import SessionCard from './SessionCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ActiveSessionsPanel = ({ 
  onSessionAction, 
  compact = false,
  maxSessions = null 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ CORRIGÉ: Utilisation du hook corrigé
  const { 
    data: sessionsData, 
    isLoading, 
    isError, 
    error 
  } = useSessionsActives();

  const isDarkMode = effectiveTheme === 'dark';

  const getTextColorClass = (isPrimary = false) => {
    return isDarkMode
      ? (isPrimary ? 'text-white' : 'text-gray-300')
      : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  };

  const getBgColorClass = () => {
    return isDarkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColorClass = () => {
    return isDarkMode ? 'border-gray-700' : 'border-gray-200';
  };

  const getCardBgClass = (statut) => {
    if (statut === 'EN_PAUSE') {
      return isDarkMode ? 'bg-orange-900/10' : 'bg-orange-50';
    }
    return isDarkMode ? 'bg-gray-750' : 'bg-gray-50';
  };

  const getCardBorderClass = (statut) => {
    if (statut === 'EN_PAUSE') {
      return isDarkMode ? 'border-orange-700' : 'border-orange-300';
    }
    return getBorderColorClass();
  };

  const getHoverClass = () => {
    return isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  };

  // Helper to format duration from start to current time, considering pauses
  const formatLiveDuration = (dateHeureDebut, tempsPauseTotalMinutes = 0, isPaused = false) => {
    const start = new Date(dateHeureDebut);
    const now = new Date();
    let diffMs = now.getTime() - start.getTime();

    // Only subtract total pause time if the session is currently active (not paused)
    if (!isPaused) {
        diffMs -= (tempsPauseTotalMinutes || 0) * 60 * 1000;
    }

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 0) return '0 min'; // Avoid negative duration

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(price || 0);
  };

  // Effect to continuously update live durations (e.g., every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      <div className={`p-6 rounded-xl shadow-md ${getBgColorClass()} ${getTextColorClass()}`}>
        <h2 className={`text-2xl font-bold mb-4 ${getTextColorClass(true)}`}>
          {translations?.activeSessions || 'Sessions Actives'}
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
            <span className="ml-2">
              {translations?.loadingActiveSessions || 'Chargement des sessions actives...'}
            </span>
          </div>
        ) : sessionsData.length === 0 ? (
          <div className={`p-4 text-center ${getTextColorClass(false)}`}>
            <p>{translations?.noActiveSessions || 'Aucune session active.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessionsData.slice(0, maxSessions).map((session) => (
              <div
                key={session.id}
                className={`
                  p-4 rounded-lg border-2 flex flex-col
                  ${getCardBgClass(session.statut)}
                  ${getCardBorderClass(session.statut)}
                  ${getHoverClass()}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`text-lg font-semibold ${getTextColorClass(true)}`}>
                      <Monitor size={18} className="inline-block mr-2 text-blue-500" />
                      {session.poste?.nom || 'Poste Inconnu'}
                    </h3>
                    <p className={`text-sm ${getTextColorClass(false)}`}>
                      {translations?.sessionNum || 'Session N°'}: {session.numeroSession}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.statut === 'EN_PAUSE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    {session.statut === 'EN_PAUSE' ? translations?.paused || 'En pause' : translations?.active || 'Active'}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <p className={`${getTextColorClass(false)} flex items-center`}>
                    <User size={14} className="inline-block mr-2 text-blue-400" />
                    {translations?.client || 'Client'}: {session.client?.isSystemClient ? translations?.anonymous || 'Anonyme' : `${session.client?.prenom} ${session.client?.nom}`}
                  </p>
                  <p className={`${getTextColorClass(false)} flex items-center`}>
                    <Clock size={14} className="inline-block mr-2 text-indigo-400" />
                    {translations?.startedAt || 'Début'}: {new Date(session.dateHeureDebut).toLocaleTimeString()}
                  </p>

                  {session.statut === 'EN_COURS' && (
                    <>
                      <p className={`${getTextColorClass(false)} flex items-center`}>
                        <Clock size={14} className="inline-block mr-2 text-purple-400" />
                        {translations?.elapsedTime || 'Temps écoulé'}: {formatLiveDuration(session.dateHeureDebut, session.tempsPauseTotalMinutes, false)}
                      </p>
                      {session.dureeEstimeeMinutes && (
                        <p className={`${getTextColorClass(false)} flex items-center`}>
                          <Clock size={14} className="inline-block mr-2 text-teal-400" />
                          {translations?.estimatedRemaining || 'Temps restant estimé'}: {Math.max(0, session.dureeEstimeeMinutes - (Math.floor((currentTime - new Date(session.dateHeureDebut).getTime()) / (1000 * 60)) - (session.tempsPauseTotalMinutes || 0)))} min
                        </p>
                      )}
                    </>
                  )}

                  {session.statut === 'EN_PAUSE' && (
                    <p className={`${getTextColorClass(false)} flex items-center`}>
                      <Clock size={14} className="inline-block mr-2 text-orange-400" />
                      {translations?.totalPause || 'Temps de pause total'}: {session.tempsPauseTotalMinutes} min
                    </p>
                  )}

                  {session.montantTotal > 0 && (
                    <p className={`${getTextColorClass(false)} flex items-center`}>
                      <Euro size={14} className="inline-block mr-2 text-yellow-400" />
                      {translations?.currentCost || 'Coût actuel'}: {formatPrice(session.montantTotal)}
                    </p>
                  )}
                  {session.resteAPayer > 0 && (
                    <p className={`text-xs flex items-center ${isDarkMode ? 'text-red-400' : 'text-red-600'} font-semibold`}>
                        <AlertCircle size={14} className="inline-block mr-1" />
                        {translations?.remainingToPay || 'Reste à payer'} : {formatPrice(session.resteAPayer)}
                    </p>
                  )}
                   {session.estPayee && session.montantTotal > 0 && (
                    <p className={`text-xs flex items-center ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                        <CheckCircle size={14} className="inline-block mr-1" />
                        {translations?.paid || 'Payé'}
                    </p>
                  )}

                  {session.jeuPrincipal && (
                    <p className={`mt-2 text-xs ${getTextColorClass(false)} flex items-center`}>
                      <Gamepad2 className="inline-block w-3 h-3 mr-1 align-middle" />
                      {translations?.game || 'Jeu'} : {session.jeuPrincipal}
                    </p>
                  )}

                  {session.notes && (
                    <p className={`mt-2 text-xs ${getTextColorClass(false)} italic flex items-center`}>
                      <Info className="inline-block w-3 h-3 mr-1 align-middle" />
                      {translations?.notes || 'Notes'} : {session.notes}
                    </p>
                  )}
                </div>

                {/* Actions for active/paused sessions */}
                <div className="flex justify-end mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 space-x-2">
                  {(session.statut === 'EN_COURS' || session.statut === 'EN_PAUSE') && (
                    <button
                      onClick={() => onSessionAction(session)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                        ${isDarkMode
                          ? 'bg-blue-700 hover:bg-blue-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      <Settings size={16} className="inline-block mr-1" />
                      {translations?.manage || 'Gérer'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveSessionsPanel;
