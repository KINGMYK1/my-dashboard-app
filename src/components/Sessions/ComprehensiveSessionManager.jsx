import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Star, 
  Users, 
  Monitor,
  Grid,
  List,
  Filter,
  Clock,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Gift,
  CreditCard
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

// Hooks de données
import { 
  useSessionsActives,
  useStartSessionWithSubscription,
  useTerminerSession,
  usePauseSession,
  useResumeSession
} from '../../hooks/useSessions';
import { usePostes } from '../../hooks/usePostes';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';

// Composants spécialisés
import SessionWithSubscriptionModal from './SessionWithSubscriptionModal';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ComprehensiveSessionManager = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // États du composant
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState(null);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Hooks de données avec gestion d'erreurs
  const { 
    data: sessionsActivesData, 
    isLoading: loadingSessions, 
    refetch: refetchSessions 
  } = useSessionsActives();

  const { 
    data: postesData, 
    isLoading: loadingPostes, 
    refetch: refetchPostes 
  } = usePostes();

  const { 
    data: clientsData, 
    isLoading: loadingClients 
  } = useClients();

  // ✅ Mutations pour les actions
  const startSessionWithSubscriptionMutation = useStartSessionWithSubscription();
  const terminerSessionMutation = useTerminerSession();
  const pauseSessionMutation = usePauseSession();
  const resumeSessionMutation = useResumeSession();

  // ✅ Données normalisées
  const sessionsActives = useMemo(() => {
    return sessionsActivesData?.data || [];
  }, [sessionsActivesData]);

  const postesDisponibles = useMemo(() => {
    return postesData?.data?.filter(poste => 
      poste.etat === 'DISPONIBLE' || poste.etat === 'Disponible'
    ) || [];
  }, [postesData]);

  const clients = useMemo(() => {
    if (!clientsData?.clients) return [];
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return clientsData.clients.filter(client => 
        `${client.prenom} ${client.nom}`.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.telephone?.includes(searchTerm)
      );
    }
    
    return clientsData.clients;
  }, [clientsData, searchTerm]);

  // ✅ Sessions filtrées selon le statut
  const sessionsFiltrees = useMemo(() => {
    if (!sessionsActives) return [];

    switch (filterStatus) {
      case 'with_subscription':
        return sessionsActives.filter(session => 
          session.Client?.AbonnementClients?.some(ab => ab.estActif)
        );
      case 'without_subscription':
        return sessionsActives.filter(session => 
          !session.Client?.AbonnementClients?.some(ab => ab.estActif)
        );
      case 'paused':
        return sessionsActives.filter(session => session.estEnPause);
      default:
        return sessionsActives;
    }
  }, [sessionsActives, filterStatus]);

  // ✅ Statistiques en temps réel
  const statistiques = useMemo(() => {
    const sessionsAvecAbonnement = sessionsActives.filter(session => 
      session.Client?.AbonnementClients?.some(ab => ab.estActif)
    ).length;

    const revenusEstimes = sessionsActives.reduce((total, session) => {
      return total + (session.coutEstime || 0);
    }, 0);

    return {
      sessionsActives: sessionsActives.length,
      sessionsAvecAbonnement,
      sessionsSansAbonnement: sessionsActives.length - sessionsAvecAbonnement,
      postesDisponibles: postesDisponibles.length,
      revenusEstimes: revenusEstimes.toFixed(2)
    };
  }, [sessionsActives, postesDisponibles]);

  // ✅ Gestionnaires d'événements
  const handleStartSession = useCallback((poste) => {
    setSelectedPoste(poste);
    setShowSubscriptionModal(true);
  }, []);

  const handleSessionCreated = useCallback(async (sessionData) => {
    try {
      await startSessionWithSubscriptionMutation.mutateAsync(sessionData);
      setShowSubscriptionModal(false);
      setSelectedPoste(null);
      showSuccess('Session démarrée avec succès !');
      
      // Actualiser les données
      refetchSessions();
      refetchPostes();
    } catch (error) {
      showError('Erreur lors du démarrage de la session');
      console.error('Erreur session:', error);
    }
  }, [startSessionWithSubscriptionMutation, showSuccess, showError, refetchSessions, refetchPostes]);

  const handleTerminerSession = useCallback(async (sessionId) => {
    try {
      await terminerSessionMutation.mutateAsync(sessionId);
      showSuccess('Session terminée avec succès !');
      refetchSessions();
      refetchPostes();
    } catch (error) {
      showError('Erreur lors de la fin de session');
    }
  }, [terminerSessionMutation, showSuccess, showError, refetchSessions, refetchPostes]);

  const handlePauseSession = useCallback(async (sessionId) => {
    try {
      await pauseSessionMutation.mutateAsync(sessionId);
      showSuccess('Session mise en pause');
      refetchSessions();
    } catch (error) {
      showError('Erreur lors de la pause');
    }
  }, [pauseSessionMutation, showSuccess, showError, refetchSessions]);

  const handleResumeSession = useCallback(async (sessionId) => {
    try {
      await resumeSessionMutation.mutateAsync(sessionId);
      showSuccess('Session reprise');
      refetchSessions();
    } catch (error) {
      showError('Erreur lors de la reprise');
    }
  }, [resumeSessionMutation, showSuccess, showError, refetchSessions]);

  // ✅ Composant de carte de poste
  const PosteCard = ({ poste }) => (
    <div className={`
      p-6 rounded-lg border transition-all hover:shadow-lg
      ${isDarkMode 
        ? 'bg-gray-800 border-gray-700 hover:border-blue-500' 
        : 'bg-white border-gray-200 hover:border-blue-400'
      }
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Monitor className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <h3 className="font-semibold text-lg">{poste.nom}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {poste.TypePoste?.nom} - {poste.TypePoste?.tarifHoraire}€/h
            </p>
          </div>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${poste.etat === 'DISPONIBLE' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }
        `}>
          {poste.etat === 'DISPONIBLE' ? 'Disponible' : 'Occupé'}
        </div>
      </div>

      {poste.etat === 'DISPONIBLE' ? (
        <button
          onClick={() => handleStartSession(poste)}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Démarrer session
        </button>
      ) : (
        <div className="text-center py-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Poste occupé
          </span>
        </div>
      )}
    </div>
  );

  // ✅ Composant de carte de session active
  const SessionActiveCard = ({ session }) => {
    const hasSubscription = session.Client?.AbonnementClients?.some(ab => ab.estActif);
    const dureeEnMinutes = session.dureeEnMinutes || 0;
    const heures = Math.floor(dureeEnMinutes / 60);
    const minutes = dureeEnMinutes % 60;

    return (
      <div className={`
        p-6 rounded-lg border transition-all
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
        }
        ${hasSubscription ? 'border-l-4 border-l-yellow-500' : ''}
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Monitor className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <h3 className="font-semibold">{session.Poste?.nom}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {session.Client ? `${session.Client.prenom} ${session.Client.nom}` : 'Client anonyme'}
              </p>
            </div>
          </div>
          
          {hasSubscription && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                Abonnement
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Durée
            </p>
            <p className="font-semibold">
              {heures}h {minutes}m
            </p>
          </div>
          <div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coût estimé
            </p>
            <p className="font-semibold text-green-600">
              {session.coutEstime?.toFixed(2) || '0.00'}€
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {session.estEnPause ? (
            <button
              onClick={() => handleResumeSession(session.id)}
              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reprendre
            </button>
          ) : (
            <button
              onClick={() => handlePauseSession(session.id)}
              className="flex-1 py-2 px-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={() => handleTerminerSession(session.id)}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  };

  if (loadingSessions || loadingPostes || loadingClients) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* ✅ Header avec statistiques */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Gestionnaire de Sessions & Abonnements
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Interface unifiée pour la gestion des sessions avec support des abonnements clients
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ✅ Statistiques en temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-green-500" />
              <span className="font-medium text-sm">Sessions actives</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {statistiques.sessionsActives}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-sm">Avec abonnement</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {statistiques.sessionsAvecAbonnement}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-sm">Sans abonnement</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {statistiques.sessionsSansAbonnement}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-sm">Postes libres</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {statistiques.postesDisponibles}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-sm">Revenus estimés</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {statistiques.revenusEstimes}€
            </div>
          </div>
        </div>

        {/* ✅ Filtres */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'with_subscription', 'without_subscription', 'paused'].map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterStatus(filter)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${filterStatus === filter
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {filter === 'all' && 'Toutes les sessions'}
              {filter === 'with_subscription' && 'Avec abonnement'}
              {filter === 'without_subscription' && 'Sans abonnement'}
              {filter === 'paused' && 'En pause'}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions actives */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Sessions actives ({sessionsFiltrees.length})
          </h2>
          
          {sessionsFiltrees.length === 0 ? (
            <div className={`
              p-8 rounded-lg border border-dashed text-center
              ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}
            `}>
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Aucune session active</p>
              <p className="text-sm">
                {filterStatus === 'all' 
                  ? 'Démarrez une nouvelle session sur un poste disponible'
                  : 'Aucune session ne correspond aux filtres sélectionnés'
                }
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {sessionsFiltrees.map((session) => (
                <SessionActiveCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>

        {/* Postes disponibles */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Postes disponibles ({postesDisponibles.length})
          </h2>
          
          {postesDisponibles.length === 0 ? (
            <div className={`
              p-6 rounded-lg border text-center
              ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}
            `}>
              <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium mb-1">Aucun poste disponible</p>
              <p className="text-sm">Tous les postes sont actuellement occupés</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postesDisponibles.map((poste) => (
                <PosteCard key={poste.id} poste={poste} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal de création de session avec abonnement */}
      <SessionWithSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setSelectedPoste(null);
        }}
        poste={selectedPoste}
        onStartSession={handleSessionCreated}
        isLoading={startSessionWithSubscriptionMutation.isPending}
      />
    </div>
  );
};

export default ComprehensiveSessionManager;
