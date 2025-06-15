import React, { useState, useEffect } from 'react';
import { 
  Settings,
  MonitorPlay, 
  PauseCircle, 
  History, 
  Clock, 
  Users, 
  Timer,
  Activity
} from 'lucide-react';

import { usePostes } from '../../hooks/usePostes';
import {
  useActiveSessions,
  usePausedSessions,
  useEndSession,
  usePauseSession,
  useResumeSession,
  useExtendSession,
  useCancelSession
} from '../../hooks/useSessions';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

// ✅ CORRECTION: Import corrigé avec alias pour éviter les conflits
import { 
  useSessionNotificationsManager as useSessionNotifications,
  useSessionTimerStatus 
} from '../../hooks/useSessionNotifications';

import SessionEndNotification from '../../components/Sessions/SessionEndNotification';
import SessionSettings from '../../components/Settings/SessionSettings';

import SessionStartForm from './SessionStartForm';
import SessionActionsModal from '../../components/Sessions/SessionActionsModal';
import PosteCard from './components/PosteCard';
import SessionCard from './components/SessionCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ExpiredSessionsAlert from '../../components/Sessions/ExpiredSessionsAlert';

const Sessions = () => {
  // États
  const [activeSessionsData, setActiveSessionsData] = useState([]);
  const [pausedSessionsData, setPausedSessionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSessionForActions, setSelectedSessionForActions] = useState(null);
  const [preselectedPoste, setPreselectedPoste] = useState(null);

  // Hooks contextes
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const isDarkMode = effectiveTheme === 'dark';

  // Hooks données
  const { data: postes = [], isLoading: loadingPostes } = usePostes();
  const { 
    data: activeSessions = [], 
    isLoading: activeLoading, 
    error: activeError,
    refetch: refetchActive 
  } = useActiveSessions();
  const { 
    data: pausedSessions = [], 
    isLoading: pausedLoading, 
    error: pausedError,
    refetch: refetchPaused 
  } = usePausedSessions();

  // Hooks mutations
  const endSessionMutation = useEndSession();
  const pauseSessionMutation = usePauseSession();
  const resumeSessionMutation = useResumeSession();
  const extendSessionMutation = useExtendSession();
  const cancelSessionMutation = useCancelSession();

  // ✅ CORRECTION: Hook notifications avec le bon nom
  const {
    activeNotifications,
    expiredSessions,
    startSessionTracking,
    stopSessionTracking,
    handleExtendSession,
    handleTerminateSession,
    handleSuspendSession,
    handleResumeSession,
    forceTerminateExpiredSession
  } = useSessionNotifications();

  // Hook timer status
  const activeSessionIds = Array.isArray(activeSessionsData) 
    ? activeSessionsData.map(s => s?.id).filter(id => id != null)
    : [];
  const timerStatuses = useSessionTimerStatus(activeSessionIds);

  // ✅ Gestionnaire d'actions simplifié et unifié
  const handleSessionAction = async (actionType, formData) => {
    if (!selectedSessionForActions?.id) {
      console.error('❌ [SESSIONS] Aucune session sélectionnée');
      showError('Erreur: Aucune session sélectionnée');
      return;
    }

    const sessionId = parseInt(selectedSessionForActions.id);
    
    try {
      console.log('🎯 [SESSIONS] Exécution action:', actionType, 'SessionID:', sessionId, 'FormData:', formData);
      
      switch (actionType) {
        case 'pause':
          await pauseSessionMutation.mutateAsync({
            sessionId,
            raison: formData?.raison || 'Session mise en pause'
          });
          showSuccess('Session mise en pause avec succès');
          break;
          
        case 'reprendre':
          await resumeSessionMutation.mutateAsync({ sessionId });
          showSuccess('Session reprise avec succès');
          break;
          
        case 'prolonger':
          const additionalMinutes = parseInt(formData?.dureeSupplementaireMinutes || 30);
          await extendSessionMutation.mutateAsync({
            sessionId,
            additionalMinutes
          });
          showSuccess(`Session prolongée de ${additionalMinutes} minutes`);
          break;
          
        case 'terminer':
          await endSessionMutation.mutateAsync({
            sessionId,
            sessionEndData: {
              modePaiement: formData?.modePaiement || 'ESPECES',
              montantPaye: parseFloat(formData?.montantPaye || 0),
              marquerCommePayee: formData?.marquerCommePayee || false,
              notes: formData?.notes || ''
            }
          });
          showSuccess('Session terminée avec succès');
          break;
          
        case 'annuler':
          await cancelSessionMutation.mutateAsync({
            sessionId,
            raison: formData?.raison || 'Session annulée'
          });
          showSuccess('Session annulée avec succès');
          break;
          
        default:
          console.error('❌ [SESSIONS] Action non reconnue:', actionType);
          showError('Action non reconnue');
          return;
      }
      
      // Fermer le modal et actualiser les données
      setSelectedSessionForActions(null);
      refetchActive();
      refetchPaused();
      
    } catch (error) {
      console.error('❌ [SESSIONS] Erreur action:', error);
      showError(error?.message || `Erreur lors de l'action ${actionType}`);
    }
  };

  // ✅ CORRECTION: Traitement des données avec validation stricte
  useEffect(() => {
    try {
      console.log('📊 [SESSIONS] Traitement des données reçues');
      console.log('activeSessions:', activeSessions);
      console.log('pausedSessions:', pausedSessions);

      // Traitement des sessions actives avec validation
      let processedActiveSessions = [];
      if (activeSessions) {
        if (Array.isArray(activeSessions)) {
          processedActiveSessions = activeSessions.filter(s => s && s.id);
        } else if (activeSessions?.data && Array.isArray(activeSessions.data)) {
          processedActiveSessions = activeSessions.data.filter(s => s && s.id);
        } else if (activeSessions?.sessions && Array.isArray(activeSessions.sessions)) {
          processedActiveSessions = activeSessions.sessions.filter(s => s && s.id);
        }
      }

      // ✅ DEBUG: Vérifier les durées estimées des sessions
      processedActiveSessions.forEach(session => {
        console.log(`🕐 [SESSIONS] Session ${session.id}:`, {
          numeroSession: session.numeroSession,
          dureeEstimeeMinutes: session.dureeEstimeeMinutes,
          dateHeureDebut: session.dateHeureDebut,
          statut: session.statut,
          poste: session.poste?.nom
        });
      });

      console.log('✅ [SESSIONS] Sessions actives traitées:', processedActiveSessions.length);

      setActiveSessionsData(processedActiveSessions);

      // Traitement des sessions en pause avec validation
      let processedPausedSessions = [];
      if (pausedSessions) {
        if (Array.isArray(pausedSessions)) {
          processedPausedSessions = pausedSessions.filter(s => s && s.id);
        } else if (pausedSessions?.data && Array.isArray(pausedSessions.data)) {
          processedPausedSessions = pausedSessions.data.filter(s => s && s.id);
        } else if (pausedSessions?.sessions && Array.isArray(pausedSessions.sessions)) {
          processedPausedSessions = pausedSessions.sessions.filter(s => s && s.id);
        }
      }

      console.log('✅ [SESSIONS] Sessions en pause traitées:', processedPausedSessions.length);

      setPausedSessionsData(processedPausedSessions);

    } catch (error) {
      console.error('❌ [SESSIONS] Erreur traitement données:', error);
      setError(error.message);
      setActiveSessionsData([]);
      setPausedSessionsData([]);
    } finally {
      setLoading(false);
    }
  }, [activeSessions, pausedSessions]);

  // Gestion des erreurs
  useEffect(() => {
    if (activeError || pausedError) {
      setError(activeError?.message || pausedError?.message || 'Erreur de connexion au serveur');
    }
  }, [activeError, pausedError]);

  // Suivi des sessions
  useEffect(() => {
    if (!activeSessionsData || activeSessionsData.length === 0) return;

    console.log('🎯 [SESSIONS] Démarrage suivi pour', activeSessionsData.length, 'sessions');

    activeSessionsData.forEach(session => {
      if (session?.dureeEstimeeMinutes && session?.statut === 'EN_COURS' && !session?.estEnPause) {
        try {
          startSessionTracking(session);
        } catch (error) {
          console.error('❌ [SESSIONS] Erreur démarrage suivi:', error);
        }
      }
    });

    // ✅ CORRECTION: Cleanup uniquement sur unmount
    return () => {
      console.log('🧹 [SESSIONS] Nettoyage du suivi des sessions');
    };
  }, [activeSessionsData.length]); // ✅ Utiliser seulement la longueur comme dépendance

  // ✅ CORRECTION: Nettoyage séparé et simplifié
  useEffect(() => {
    return () => {
      console.log('🧹 [SESSIONS] Nettoyage final du composant');
      // Nettoyage final uniquement
    };
  }, []); // ✅ Dépendance vide pour le cleanup final

  // Loading et erreurs
  if (loading || activeLoading || pausedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Erreur de connexion</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              refetchActive();
              refetchPaused();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Styles
  const containerBg = isDarkMode 
    ? 'from-gray-900 via-gray-800 to-purple-900/10' 
    : 'from-white via-gray-50 to-purple-50/30';

  const cardBg = isDarkMode 
    ? 'bg-gray-800/60 border-purple-500/20' 
    : 'bg-white/80 border-purple-200';

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  // Statistiques
  const stats = {
    totalPostes: postes?.length || 0,
    postesDisponibles: postes?.filter(p => p?.etat === 'Disponible' && p?.estActif)?.length || 0,
    sessionActiveCount: activeSessionsData?.length || 0,
    sessionPausedCount: pausedSessionsData?.length || 0
  };

  // Gestionnaires d'événements
  const handleStartSession = (poste = null) => {
    setPreselectedPoste(poste);
    setShowStartForm(true);
  };

  const handleCloseStartForm = () => {
    setShowStartForm(false);
    setPreselectedPoste(null);
  };

  const handleOpenSessionActions = (session) => {
    console.log('🎯 [SESSIONS] Ouverture actions pour session:', session);
    setSelectedSessionForActions(session);
  };

  const handleCloseSessionActions = () => {
    setSelectedSessionForActions(null);
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Configuration des onglets
  const tabs = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: <MonitorPlay size={20} />,
      count: stats.totalPostes
    },
    {
      id: 'active',
      label: 'Sessions Actives',
      icon: <Activity size={20} />,
      count: stats.sessionActiveCount
    },
    {
      id: 'paused',
      label: 'En Pause',
      icon: <PauseCircle size={20} />,
      count: stats.sessionPausedCount
    },
    {
      id: 'history',
      label: 'Historique',
      icon: <History size={20} />,
      count: 0
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${containerBg}`}>
      {/* Alerte sessions expirées */}
      <ExpiredSessionsAlert
        expiredSessions={expiredSessions}
        onForceTerminate={forceTerminateExpiredSession}
        onDismiss={() => {}}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary} flex items-center`}>
                <Timer className="mr-3 text-purple-500" size={32} />
                Gestion des Sessions
              </h1>
              <p className={`${textSecondary} mt-2`}>
                Gérez les sessions de jeu, suivez l'utilisation des postes en temps réel
              </p>
            </div>
            
            <button
              onClick={handleToggleSettings}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Settings className="mr-2" size={20} />
              Paramètres Sessions
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Postes"
              value={stats.totalPostes}
              icon={<MonitorPlay size={24} />}
              color="blue"
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Postes Disponibles"
              value={stats.postesDisponibles}
              icon={<Clock size={24} />}
              color="green"
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Sessions Actives"
              value={stats.sessionActiveCount}
              icon={<Activity size={24} />}
              color="orange"
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Sessions en Pause"
              value={stats.sessionPausedCount}
              icon={<PauseCircle size={24} />}
              color="purple"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Modal paramètres */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`max-w-md w-full rounded-lg ${cardBg} border backdrop-blur-sm`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${textPrimary}`}>
                    Paramètres des Sessions
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`${textSecondary} hover:${textPrimary}`}
                  >
                    ✕
                  </button>
                </div>
                <SessionSettings isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation tabs */}
        <div className={`${cardBg} rounded-xl border backdrop-blur-sm mb-6`}>
          <div className="p-1">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${isDarkMode 
                          ? 'from-purple-600 to-blue-600 text-white' 
                          : 'from-purple-500 to-blue-500 text-white'
                        } shadow-md`
                      : `${textSecondary} hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des tabs */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <PostesOverview 
              postes={postes}
              activeSessions={activeSessionsData}
              onStartSession={handleStartSession}
              onOpenSessionActions={handleOpenSessionActions}
              isLoading={loadingPostes}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'active' && (
            <ActiveSessionsView
              sessions={activeSessionsData}
              onOpenSessionActions={handleOpenSessionActions}
              isLoading={activeLoading}
              isDarkMode={isDarkMode}
              timerStatuses={timerStatuses}
            />
          )}

          {activeTab === 'paused' && (
            <PausedSessionsView
              sessions={pausedSessionsData}
              onOpenSessionActions={handleOpenSessionActions}
              isLoading={pausedLoading}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'history' && (
            <SessionHistoryView isDarkMode={isDarkMode} />
          )}
        </div>
      </div>

      {/* Modals */}
      <SessionStartForm
        open={showStartForm}
        onClose={handleCloseStartForm}
        preselectedPoste={preselectedPoste}
      />

      <SessionActionsModal
        isOpen={!!selectedSessionForActions}
        onClose={handleCloseSessionActions}
        session={selectedSessionForActions}
        onAction={handleSessionAction}
      />

      {/* Notifications de fin de session */}
      {Array.isArray(activeNotifications) && activeNotifications.map((notification) => (
        <SessionEndNotification
          key={notification?.session?.id || Math.random()}
          notification={notification}
          onExtend={(session, minutes) => handleExtendSession(session, minutes)}
          onTerminate={(session, paymentData) => handleTerminateSession(session, paymentData)}
          onSuspend={(session, reason) => handleSuspendSession(session, reason)}
          onResume={(session) => handleResumeSession(session)}
          onDismiss={(sessionId) => {}}
        />
      ))}
    </div>
  );
};

// Composants auxiliaires inchangés
const StatCard = ({ title, value, icon, color, isDarkMode }) => {
  const colorClasses = {
    blue: isDarkMode ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDarkMode ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    orange: isDarkMode ? 'from-orange-600 to-orange-700' : 'from-orange-500 to-orange-600',
    purple: isDarkMode ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600'
  };

  const bgClass = isDarkMode 
    ? 'bg-gray-800/60 border-gray-700/50' 
    : 'bg-white/80 border-gray-200';

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`${bgClass} border rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${textSecondary} mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${textPrimary}`}>{value || 0}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ✅ CORRECTION: ActiveSessionsView avec gestion d'erreurs
const ActiveSessionsView = ({ sessions, onOpenSessionActions, isLoading, isDarkMode, timerStatuses }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
        <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Aucune session active
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        // ✅ CORRECTION: Validation stricte des données
        if (!session || !session.id || typeof session.id === 'undefined') {
          console.warn('⚠️ Session invalide détectée:', session);
          return null;
        }
        
        const timerStatus = timerStatuses?.get?.(session.id);
        
        return (
          <div key={`session-${session.id}`} className="relative">
            <SessionCard
              session={session}
              onOpenActions={onOpenSessionActions}
              isDarkMode={isDarkMode}
              type="active"
            />
            
            {/* ✅ CORRECTION: Barre de progression conditionnelle */}
            {timerStatus && typeof timerStatus === 'object' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{Math.floor(timerStatus.elapsedMinutes || 0)} min écoulées</span>
                  <span>{Math.floor(timerStatus.remainingMinutes || 0)} min restantes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      timerStatus.isExpired ? 'bg-red-500' :
                      (timerStatus.remainingMinutes || 0) <= 5 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, timerStatus.progressPercent || 0))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PostesOverview = ({ postes, activeSessions, onStartSession, onOpenSessionActions, isLoading, isDarkMode }) => {
  // ✅ CORRECTION: Inclure également les sessions en pause via un hook dédié
  const { data: pausedSessions = [] } = usePausedSessions();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!postes || postes.length === 0) {
    return (
      <div className="text-center py-12">
        <MonitorPlay size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
        <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Aucun poste disponible
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {postes.map((poste) => {
        if (!poste?.id) return null;
        
        // ✅ CORRECTION: Chercher dans les sessions actives ET en pause
        const activeSession = activeSessions?.find?.(s => s?.posteId === poste.id) ||
                             pausedSessions?.find?.(s => s?.posteId === poste.id);
        
        return (
          <PosteCard
            key={poste.id}
            poste={poste}
            activeSession={activeSession}
            onStartSession={onStartSession}
            onOpenSessionActions={onOpenSessionActions}
            isDarkMode={isDarkMode}
          />
        );
      })}
    </div>
  );
};

const PausedSessionsView = ({ sessions, onOpenSessionActions, isLoading, isDarkMode }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <PauseCircle size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
        <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Aucune session en pause
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        if (!session?.id) return null;
        
        return (
          <SessionCard
            key={session.id}
            session={session}
            onOpenActions={onOpenSessionActions}
            isDarkMode={isDarkMode}
            type="paused"
          />
        );
      })}
    </div>
  );
};

const SessionHistoryView = ({ isDarkMode }) => {
  return (
    <div className="text-center py-12">
      <History size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
      <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Historique des sessions (à implémenter)
      </p>
    </div>
  );
};

export default Sessions;