import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Star, 
  Settings, 
  Users, 
  Filter,
  Grid,
  List,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSessions } from '../../hooks/useSessions';
import { usePostes } from '../../hooks/usePostes';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';

// Import des nouveaux composants
import StartSessionWithSubscription from './StartSessionWithSubscription';
import SessionWithSubscriptionModal from './SessionWithSubscriptionModal';
import SessionCardWithSubscription from './SessionCardWithSubscription';
import ClientSubscriptionManager from './ClientSubscriptionManager';

const SessionsWithSubscriptionManager = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  // États du composant
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'with_subscription'
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const isDarkMode = effectiveTheme === 'dark';

  // Hooks de données
  const { data: sessionsData, isLoading: loadingSessions, refetch: refetchSessions } = useSessions({
    enabled: true,
    refetchInterval: 5000 // Actualisation auto toutes les 5s
  });

  const { data: postesData, isLoading: loadingPostes } = usePostes();
  const { data: clientsData } = useClients();
  const { data: abonnementsData } = useAbonnements();

  // ✅ Données filtrées et organisées
  const sessionsActives = sessionsData?.filter(s => s.statut === 'EN_COURS') || [];
  const postesLibres = postesData?.filter(p => 
    p.statut === 'DISPONIBLE' && 
    !sessionsActives.some(s => s.posteId === p.id)
  ) || [];

  // Filtrer les sessions selon le filtre actif
  const sessionsFiltrees = sessionsActives.filter(session => {
    switch (filterStatus) {
      case 'active':
        return !session.estEnPause;
      case 'with_subscription':
        return session.abonnement;
      default:
        return true;
    }
  });

  // ✅ Statistiques en temps réel
  const statistiques = {
    sessionsActives: sessionsActives.length,
    sessionsAvecAbonnement: sessionsActives.filter(s => s.abonnement).length,
    sessionsPausees: sessionsActives.filter(s => s.estEnPause).length,
    postesLibres: postesLibres.length,
    clientsConnectes: new Set(sessionsActives.filter(s => s.clientId).map(s => s.clientId)).size
  };

  // ✅ Gérer le démarrage d'une session
  const handleStartSession = (poste) => {
    setSelectedPoste(poste);
    setShowStartModal(true);
  };

  // ✅ Gérer les mises à jour de session
  const handleSessionUpdated = () => {
    refetchSessions();
    queryClient.invalidateQueries(['postes']);
    queryClient.invalidateQueries(['abonnements']);
  };

  // ✅ Gérer la terminaison de session
  const handleSessionTerminated = (sessionData) => {
    showSuccess('Session terminée avec succès');
    handleSessionUpdated();
  };

  // ✅ Ouvrir la gestion des abonnements d'un client
  const handleOpenSubscriptionManager = (clientId) => {
    setSelectedClientId(clientId);
    setShowSubscriptionManager(true);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header avec statistiques */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sessions & Abonnements</h1>
            <p className="text-lg opacity-75">
              Gestion avancée des sessions avec support des abonnements
            </p>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowSubscriptionManager(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Gérer Abonnements
            </button>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-green-500" />
              <span className="font-medium">Sessions actives</span>
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
              <span className="font-medium">Avec abonnement</span>
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
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="font-medium">En pause</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {statistiques.sessionsPausees}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Postes libres</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {statistiques.postesLibres}
            </div>
          </div>

          <div className={`
            p-4 rounded-lg border
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Clients connectés</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {statistiques.clientsConnectes}
            </div>
          </div>
        </div>

        {/* Filtres et options d'affichage */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`
                px-3 py-2 rounded-lg font-medium transition-colors
                ${filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              Toutes ({sessionsActives.length})
            </button>
            
            <button
              onClick={() => setFilterStatus('active')}
              className={`
                px-3 py-2 rounded-lg font-medium transition-colors
                ${filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              Actives ({sessionsActives.filter(s => !s.estEnPause).length})
            </button>
            
            <button
              onClick={() => setFilterStatus('with_subscription')}
              className={`
                px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1
                ${filterStatus === 'with_subscription'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              <Star className="w-4 h-4" />
              Abonnements ({statistiques.sessionsAvecAbonnement})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                p-2 rounded-lg transition-colors
                ${viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              <Grid className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`
                p-2 rounded-lg transition-colors
                ${viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Postes libres - démarrage rapide */}
      {postesLibres.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Postes disponibles - Démarrage rapide
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {postesLibres.map(poste => (
              <button
                key={poste.id}
                onClick={() => handleStartSession(poste)}
                className={`
                  p-4 rounded-lg border-2 border-dashed transition-all hover:scale-105
                  ${isDarkMode 
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50'
                  }
                `}
              >
                <div className="text-center">
                  <Play className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-bold">{poste.nom}</div>
                  <div className="text-xs opacity-75">{poste.typePoste?.nom}</div>
                  <div className="text-sm font-medium text-green-600 mt-1">
                    {poste.typePoste?.tarifHoraireBase} MAD/h
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sessions actives */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Sessions en cours ({sessionsFiltrees.length})
        </h2>

        {loadingSessions ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm opacity-75">Chargement des sessions...</p>
          </div>
        ) : sessionsFiltrees.length > 0 ? (
          <div className={`
            grid gap-4
            ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
            }
          `}>
            {sessionsFiltrees.map(session => (
              <SessionCardWithSubscription
                key={session.id}
                session={session}
                onSessionUpdated={handleSessionUpdated}
                onSessionTerminated={handleSessionTerminated}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 opacity-75">
            <Play className="w-12 h-12 mx-auto opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune session active</h3>
            <p className="text-sm">
              {filterStatus === 'with_subscription' 
                ? 'Aucune session avec abonnement en cours'
                : 'Aucune session en cours pour le moment'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de démarrage de session */}
      <StartSessionWithSubscription
        poste={selectedPoste}
        show={showStartModal}
        onSessionStarted={(sessionData) => {
          setShowStartModal(false);
          setSelectedPoste(null);
          handleSessionUpdated();
        }}
        onCancel={() => {
          setShowStartModal(false);
          setSelectedPoste(null);
        }}
      />

      {/* Modal de gestion des abonnements */}
      <ClientSubscriptionManager
        clientId={selectedClientId}
        show={showSubscriptionManager}
        onSubscriptionUpdated={() => {
          queryClient.invalidateQueries(['abonnements']);
          queryClient.invalidateQueries(['sessions']);
        }}
        onClose={() => {
          setShowSubscriptionManager(false);
          setSelectedClientId(null);
        }}
      />
    </div>
  );
};

export default SessionsWithSubscriptionManager;
