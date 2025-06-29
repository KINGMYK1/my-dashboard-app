import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Monitor, Users, Clock, DollarSign, Settings, 
  RefreshCw, AlertTriangle, Plus, BarChart3 
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

import { 
  useSessionsActives,
  useSessionsEnPause,
  useTerminerSession,
  usePauseSession,
  useResumeSession,
  useProlongerSession,
  useAnnulerSession
} from '../../hooks/useSessions';

import { usePostes } from '../../hooks/usePostes';
import { useSessionTimerAdvanced } from '../../hooks/useSessionTimerAdvanced';

import PostesOverviewTab from './PostesOverviewTab';
import SessionsHistoriqueTab from './SessionsHistoriqueTab';
import SessionStartForm from './SessionStartForm';
import SessionActionsModal from './SessionActionsModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import SessionSettings from '../../components/Settings/SessionSettings';

import StartSessionModal from '../../components/Sessions/StartSessionModal';
import SimpleEndSessionModal from '../../components/Sessions/SimpleEndSessionModal';
import SessionPaymentModal from '../../components/Sessions/SessionPaymentModal';

const Sessions = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError, showInfo } = useNotification();
  const location = useLocation();

  // ✅ États avec gestion de démontage
  const [activeTab, setActiveTab] = useState('postes');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionForActions, setSelectedSessionForActions] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Mutations pour les actions de session (déclarées avant utilisation)
  const terminerSessionMutation = useTerminerSession();
  const pauseSessionMutation = usePauseSession();
  const resumeSessionMutation = useResumeSession();
  const prolongerSessionMutation = useProlongerSession();
  const annulerSessionMutation = useAnnulerSession();

  // ✅ CORRECTION PRINCIPALE: Effet de montage/démontage propre
  useEffect(() => {
    console.log('🎮 [SESSIONS] Composant Sessions monté');
    setIsMounted(true);

    // ✅ Fonction de nettoyage au démontage
    return () => {
      console.log('🧹 [SESSIONS] Composant Sessions démonté');
      setIsMounted(false);
      setShowStartForm(false);
      setSelectedPoste(null);
      setSelectedSessionForActions(null);
      setShowSettings(false);
      setActiveTab('postes');
    };
  }, []);

  // ✅ CORRECTION: Effet de surveillance de route avec la bonne URL
  useEffect(() => {
    const currentPath = location.pathname;
    // ✅ CORRECTION PRINCIPALE: Inclure /dashboard/sessions dans la vérification
    const isOnSessionsPage = currentPath === '/sessions' || 
                             currentPath === '/dashboard/sessions' || 
                             currentPath.startsWith('/sessions') || 
                             currentPath.startsWith('/dashboard/sessions');
    
    console.log('🔗 [SESSIONS] Changement de route détecté:', currentPath, 'Sur sessions:', isOnSessionsPage);
    
    if (!isOnSessionsPage && isMounted) {
      console.log('🚪 [SESSIONS] Navigation hors sessions détectée, nettoyage...');
      
      // ✅ Nettoyage immédiat sans délai
      setShowStartForm(false);
      setSelectedPoste(null);
      setSelectedSessionForActions(null);
      setShowSettings(false);
      setIsMounted(false);
    } else if (isOnSessionsPage && !isMounted) {
      // ✅ NOUVEAU: Remonter le composant si on arrive sur la bonne page
      console.log('🔄 [SESSIONS] Remontage du composant pour la page sessions');
      setIsMounted(true);
    }
  }, [location.pathname, isMounted]);

  // ✅ Hooks de données avec condition de montage
  const { 
    data: sessionsActivesData, 
    isLoading: loadingActives, 
    isError: errorActives,
    error: errorActivesMessage,
    refetch: refetchActives 
  } = useSessionsActives({
    enabled: isMounted
  });

  const { 
    data: sessionsPauseData, 
    isLoading: loadingPause, 
    isError: errorPause,
    refetch: refetchPause 
  } = useSessionsEnPause({
    enabled: isMounted
  });

  const { 
    data: postesData, 
    isLoading: loadingPostes, 
    isError: errorPostes,
    refetch: refetchPostes 
  } = usePostes({
    enabled: isMounted
  });

  // ✅ Hook timer avec condition de montage
  const {
    timers,
    startSessionTracking,
    stopSessionTracking,
    updateActiveSessions,
    getSessionProgress,
    clearAllTimers
  } = useSessionTimerAdvanced({
    enabled: isMounted,
    onSessionExpired: (sessionId) => {
      if (!isMounted) return;
      console.log('⏰ [SESSIONS] Session expirée:', sessionId);
      showInfo(`La session ${sessionId} a atteint sa durée prévue`, {
        title: 'Session expirée',
        duration: 8000
      });
    },
    onSessionWarning: (sessionId, minutesLeft) => {
      if (!isMounted) return;
      console.log('⚠️ [SESSIONS] Alerte session:', sessionId, minutesLeft);
    },
    enableNotifications: true,
    warningMinutes: [5, 1],
    updateInterval: 1000
  });

  // ✅ Effet de nettoyage du timer avec condition
  useEffect(() => {
    if (!isMounted) {
      console.log('🛑 [SESSIONS] Arrêt des timers car composant démonté');
      clearAllTimers();
    }
  }, [isMounted, clearAllTimers]);

  // ✅ Normalisation des données avec vérification de montage
  const processedActiveSessionsData = useMemo(() => {
    if (!isMounted || !sessionsActivesData) return [];
    
    const rawSessions = sessionsActivesData.data || sessionsActivesData;
    
    if (!Array.isArray(rawSessions)) {
      console.warn('❌ [SESSIONS] Sessions actives ne sont pas un array:', rawSessions);
      return [];
    }

    return rawSessions.map(session => ({
      ...session,
      id: session.id,
      posteId: session.posteId || session.Poste?.id,
      statut: session.statut || 'EN_COURS',
      dateHeureDebut: session.dateHeureDebut || session.dateDebut,
      dureeEstimeeMinutes: session.dureeEstimeeMinutes || session.dureeMinutes || 60,
      tempsPauseTotalMinutes: session.tempsPauseTotalMinutes || 0,
      montantTotal: session.montantTotal || session.coutCalculeFinal || 0,
      planTarifaireUtilise: session.planTarifaireUtilise || null,
      poste: session.poste || session.Poste || null,
      client: session.client || session.Client || null,
      numeroSession: session.numeroSession || `SESS-${session.id}`
    })).filter(session => session.id && session.dateHeureDebut);
  }, [isMounted, sessionsActivesData]);

  const processedPausedSessionsData = useMemo(() => {
    if (!isMounted || !sessionsPauseData) return [];
    
    const rawSessions = sessionsPauseData.data || sessionsPauseData;
    
    if (!Array.isArray(rawSessions)) {
      console.warn('❌ [SESSIONS] Sessions en pause ne sont pas un array:', rawSessions);
      return [];
    }

    return rawSessions.map(session => ({
      ...session,
      id: session.id,
      posteId: session.posteId || session.Poste?.id,
      statut: 'EN_PAUSE',
      dateHeureDebut: session.dateHeureDebut || session.dateDebut,
      dureeEstimeeMinutes: session.dureeEstimeeMinutes || session.dureeMinutes || 60,
      tempsPauseTotalMinutes: session.tempsPauseTotalMinutes || 0,
      pauseActuelleDebut: session.pauseActuelleDebut || session.datePause,
      montantTotal: session.montantTotal || session.coutCalculeFinal || 0,
      poste: session.poste || session.Poste || null,
      client: session.client || session.Client || null,
      numeroSession: session.numeroSession || `SESS-${session.id}`
    })).filter(session => session.id && session.dateHeureDebut);
  }, [isMounted, sessionsPauseData]);
  

  const processedPostesData = useMemo(() => {
    if (!isMounted || !postesData) return [];
    
    const rawPostes = postesData.data || postesData;
    
    if (!Array.isArray(rawPostes)) {
      console.warn('❌ [SESSIONS] Postes ne sont pas un array:', rawPostes);
      return [];
    }

    return rawPostes.map(poste => ({
      ...poste,
      id: poste.id,
      nom: poste.nom,
      etat: poste.etat || 'DISPONIBLE',
      typePoste: poste.typePoste || poste.TypePoste || null,
      sessionActive: null
    }));
  }, [isMounted, postesData]);

  // ✅ Autres memos et calculs avec vérification de montage
  const allActiveSessions = useMemo(() => {
    if (!isMounted) return [];
    return [...processedActiveSessionsData, ...processedPausedSessionsData];
  }, [isMounted, processedActiveSessionsData, processedPausedSessionsData]);

  const postesWithSessions = useMemo(() => {
    if (!isMounted) return [];
    
    return processedPostesData.map(poste => {
      let sessionActive = processedActiveSessionsData.find(s => s.posteId === poste.id);
      
      if (!sessionActive) {
        sessionActive = processedPausedSessionsData.find(s => s.posteId === poste.id);
      }

      return {
        ...poste,
        sessionActive,
        estOccupe: !!sessionActive,
        statutSession: sessionActive?.statut || null
      };
    });
  }, [isMounted, processedPostesData, processedActiveSessionsData, processedPausedSessionsData]);

  const sessionStats = useMemo(() => {
    if (!isMounted) {
      return {
        totalActives: 0,
        totalPausees: 0,
        totalPostes: 0,
        postesLibres: 0,
        tauxOccupation: 0,
        chiffreAffaireEstime: 0
      };
    }

    const totalActives = processedActiveSessionsData.length;
    const totalPausees = processedPausedSessionsData.length;
    const totalPostes = processedPostesData.length;
    const postesLibres = totalPostes - totalActives - totalPausees;
    
    const chiffreAffaireEstime = processedActiveSessionsData.reduce((sum, session) => {
      return sum + (session.montantTotal || 0);
    }, 0);

    return {
      totalActives,
      totalPausees,
      totalPostes,
      postesLibres,
      tauxOccupation: totalPostes > 0 ? Math.round(((totalActives + totalPausees) / totalPostes) * 100) : 0,
      chiffreAffaireEstime
    };
  }, [isMounted, processedActiveSessionsData, processedPausedSessionsData, processedPostesData]);

  // ✅ Gestionnaires d'événements avec vérification de montage
  const handleStartSession = useCallback((poste) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }
    console.log('🚀 [SESSIONS] Démarrage session pour poste:', poste);
    setSelectedPoste(poste);
    setShowStartForm(true);
  }, [isMounted]);

  const handleOpenSessionActions = useCallback((session) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }
    console.log('⚙️ [SESSIONS] Ouverture actions pour session:', session);
    setSelectedSessionForActions(session);
  }, [isMounted]);

  const handleEndSession = useCallback((session) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }
    console.log('🛑 [SESSIONS] Fin de session:', session);
    setSelectedSession(session);
    setShowEndModal(true);
  }, [isMounted]);

  const handlePaySession = useCallback((session) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }
    console.log('💰 [SESSIONS] Paiement de session:', session);
    setSelectedSession(session);
    setShowPaymentModal(true);
  }, [isMounted]);

  // ✅ Gestionnaire de démarrage de session
  const handleSessionStarted = useCallback(async (sessionData, poste) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }

    console.log('✅ [SESSIONS] Session démarrée avec succès:', sessionData, poste);
    
    try {
      // La session a déjà été créée par SessionStartForm, on met juste à jour l'UI
      if (isMounted) {
        showSuccess(`Session démarrée sur ${poste?.nom || 'poste'}`, {
          title: 'Session créée',
          duration: 3000
        });
        
        // Actualiser les données
        refetchActives();
        refetchPostes();
      }
      
    } catch (error) {
      console.error('❌ [SESSIONS] Erreur post-démarrage:', error);
      if (isMounted) {
        showError(error.message || 'Erreur lors de la mise à jour');
      }
    }
  }, [isMounted, showSuccess, showError, refetchActives, refetchPostes]);

  // ✅ Gestionnaire d'actions de session
  const handleSessionAction = useCallback(async (action, sessionId, additionalData = {}) => {
    if (!isMounted) {
      console.warn('⚠️ [SESSIONS] Tentative d\'action sur composant démonté');
      return;
    }

    const validSessionId = parseInt(sessionId);

    try {
      let result;
      
      switch (action) {
        case 'pause': {
          console.log('⏸️ [SESSIONS] Exécution pause session:', validSessionId);
             
          // ✅ CORRECTION: Utiliser le hook de mutation pour pause
          result = await pauseSessionMutation.mutateAsync({
            sessionId: validSessionId,
            raison: additionalData.raison,
            notes: additionalData.notes
          });
          showSuccess('Session mise en pause');
          break;
        }

        case 'reprendre': {
          console.log('▶️ [SESSIONS] Exécution reprise session:', validSessionId);
          result = await resumeSessionMutation.mutateAsync(validSessionId);
          showSuccess('Session reprise');
          break;
        }

        case 'prolonger': {
          console.log('⏰ [SESSIONS] Exécution prolongation session:', validSessionId, additionalData);
          
  const dureeSupplementaire = additionalData?.dureeSupplementaireMinutes;
            if (!dureeSupplementaire || dureeSupplementaire <= 0) {
            throw new Error('Durée supplémentaire invalide');
          }
          
          result = await prolongerSessionMutation.mutateAsync({
            sessionId: validSessionId,
            dureeSupplementaireMinutes: dureeSupplementaire
          });
          showSuccess(`Session prolongée de ${dureeSupplementaire} minutes`);
          break;
        }

        case 'terminer': {
          console.log('🛑 [SESSIONS] Exécution terminaison session:', validSessionId, additionalData);
          
          const terminaisonData = {
            modePaiement: additionalData.modePaiement || 'ESPECES',
            montantPaye: parseFloat(additionalData.montantPaye) || 0,
            marquerCommePayee: Boolean(additionalData.marquerCommePayee),
            notes: additionalData.notes || ''
          };
          
          console.log('📤 [SESSIONS] Données formatées pour l\'API:', terminaisonData);
          
          result = await terminerSessionMutation.mutateAsync({
            sessionId,
            data: terminaisonData
          });
          showSuccess('Session terminée avec succès');
          break;
        }

        case 'annuler': {
          console.log('❌ [SESSIONS] Exécution annulation session:', validSessionId, additionalData);
          
          const raison = additionalData.raison || 'Session annulée';
          result = await annulerSessionMutation.mutateAsync({
            sessionId: validSessionId,
            raison
          });
          showSuccess('Session annulée avec succès');
          break;
        }
        
        default:
          throw new Error(`Action inconnue: ${action}`);
      }
      
      // Actualiser les données
      await Promise.all([
        refetchActives(),
        refetchPause(),
        refetchPostes()
      ]);
      
      return result;
      
    } catch (error) {
      console.error(`❌ [SESSIONS] Erreur action ${action}:`, error);
      showError(error.message || `Erreur lors de l'action ${action}`);
      throw error;
    }
  }, [
    isMounted,
    pauseSessionMutation,
    resumeSessionMutation,
    prolongerSessionMutation,
    terminerSessionMutation,
    annulerSessionMutation,
    showSuccess,
    showError,
    refetchActives,
    refetchPause,
    refetchPostes
  ]);

  const handleRefresh = useCallback(() => {
    if (!isMounted) return;
    console.log('🔄 [SESSIONS] Actualisation manuelle');
    refetchActives();
    refetchPause();
    refetchPostes();
  }, [isMounted, refetchActives, refetchPause, refetchPostes]);

  // ✅ Fonctions utilitaires
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  }, []);

  const formatDuration = useCallback((minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  }, []);

  // ✅ CORRECTION CRITIQUE: Rendu conditionnel basé sur la route ET le montage
  const isOnSessionsPage = location.pathname === '/sessions' || 
                          location.pathname === '/dashboard/sessions' || 
                          location.pathname.startsWith('/sessions') || 
                          location.pathname.startsWith('/dashboard/sessions');
  
  if (!isOnSessionsPage || !isMounted) {
    console.log('🚫 [SESSIONS] Composant masqué - Route:', location.pathname, 'Monté:', isMounted);
    return null;
  }

  // ✅ Le reste du code reste identique...
  const hasErrors = errorActives || errorPause || errorPostes;
  const isLoadingAny = loadingActives || loadingPause || loadingPostes;

  // ✅ Rendu conditionnel pour les erreurs
  if (hasErrors) {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Erreur de chargement
              </h3>
              <p className="text-red-600 dark:text-red-300">
                {errorActivesMessage?.message || 'Impossible de charger les données des sessions'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const themeClasses = {
    container: `min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`,
    header: `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`,
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    card: `${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`,
  };

  return (
    <div className={themeClasses.container}>
      {/* Header avec statistiques */}
      <div className={`p-6 border-b ${themeClasses.header}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
              🎮 Gestion des Sessions
            </h1>
            <p className={themeClasses.textSecondary}>
              Gérez les sessions de jeu en temps réel
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoadingAny}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingAny ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Sessions actives</p>
                <p className="text-2xl font-bold text-green-600">{sessionStats.totalActives}</p>
              </div>
              <Monitor className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>En pause</p>
                <p className="text-2xl font-bold text-orange-600">{sessionStats.totalPausees}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Postes libres</p>
                <p className="text-2xl font-bold text-blue-600">{sessionStats.postesLibres}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Taux occupation</p>
                <p className="text-2xl font-bold text-purple-600">{sessionStats.tauxOccupation}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>CA estimé</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(sessionStats.chiffreAffaireEstime)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${themeClasses.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Total postes</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{sessionStats.totalPostes}</p>
              </div>
              <Monitor className={`w-8 h-8 ${themeClasses.textSecondary}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="px-6 pt-6">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('postes')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'postes'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Vue d'ensemble des postes
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'historique'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Historique des sessions
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {isLoadingAny ? (
          <LoadingSpinner text="Chargement des sessions..." />
        ) : (
          <>
            {activeTab === 'postes' && (
              <PostesOverviewTab
                postes={postesWithSessions}
                onStartSession={handleStartSession}
                onOpenSessionActions={handleOpenSessionActions}
                getSessionProgress={getSessionProgress}
                formatCurrency={formatCurrency}
                formatDuration={formatDuration}
                canManage={true}
              />
            )}
            
            {activeTab === 'historique' && (
              <SessionsHistoriqueTab />
            )}
          </>
        )}
      </div>

      {/* ✅ Modales avec vérification de montage */}
      {isMounted && showStartForm && selectedPoste && (
        <SessionStartForm
          open={showStartForm}
          preselectedPoste={selectedPoste}
          onClose={() => {
            if (isMounted) {
              setShowStartForm(false);
              setSelectedPoste(null);
            }
          }}
          onSessionStarted={handleSessionStarted}
        />
      )}

      {isMounted && selectedSessionForActions && (
        <SessionActionsModal
          session={selectedSessionForActions}
          isOpen={!!selectedSessionForActions}
          onClose={() => {
            if (isMounted) {
              setSelectedSessionForActions(null);
            }
          }}
          onAction={handleSessionAction}
        />
      )}

      {isMounted && showSettings && (
        <SessionSettings
          isOpen={showSettings}
          onClose={() => {
            if (isMounted) {
              setShowSettings(false);
            }
          }}
        />
      )}

      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false);
          setSelectedPoste(null);
        }}
        poste={selectedPoste}
        onSessionStarted={() => {
          setShowStartModal(false);
          setSelectedPoste(null);
          // Rafraîchir les données
        }}
      />

      <SimpleEndSessionModal
        isOpen={showEndModal}
        onClose={() => {
          setShowEndModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSessionEnded={() => {
          setShowEndModal(false);
          setSelectedSession(null);
          // Rafraîchir les données
        }}
      />

      <SessionPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onPaymentComplete={() => {
          setShowPaymentModal(false);
          setSelectedSession(null);
          // Rafraîchir les données
        }}
      />
    </div>
  );
};

export default Sessions;