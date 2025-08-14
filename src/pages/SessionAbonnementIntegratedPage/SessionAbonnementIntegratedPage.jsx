import React, { useState, useCallback } from 'react';
import { 
  Users, 
  Star, 
  Clock, 
  Monitor, 
  TrendingUp, 
  Settings,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Gift
} from 'lucide-react';

import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSessionClientAbonnementIntegration } from '../../hooks/useSessionClientAbonnementIntegration';

import ComprehensiveSessionManager from './ComprehensiveSessionManager';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

/**
 * Page principale intégrée pour la gestion des sessions avec abonnements
 * Relie Sessions + Clients + Abonnements + Postes
 */
const SessionAbonnementIntegratedPage = () => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'sessions' | 'clients' | 'stats'
  
  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Hook principal pour toutes les données intégrées
  const {
    sessions,
    clients,
    statistiques,
    isLoading,
    startSessionWithIntelligentSubscription,
    endSessionWithSubscriptionHandling,
    getClientSessions,
    getClientStats,
    canClientUseSubscriptionBenefits,
    refreshData
  } = useSessionClientAbonnementIntegration();

  // ✅ Gestionnaires d'événements
  const handleStartIntelligentSession = useCallback(async (sessionData) => {
    try {
      await startSessionWithIntelligentSubscription.mutateAsync(sessionData);
      showSuccess('Session démarrée avec intelligence d\'abonnement !');
    } catch (error) {
      showError('Erreur lors du démarrage intelligent de session');
    }
  }, [startSessionWithIntelligentSubscription, showSuccess, showError]);

  const handleEndSessionWithSubscription = useCallback(async (sessionId) => {
    try {
      await endSessionWithSubscriptionHandling.mutateAsync(sessionId);
      showSuccess('Session terminée et abonnement mis à jour !');
    } catch (error) {
      showError('Erreur lors de la fin de session');
    }
  }, [endSessionWithSubscriptionHandling, showSuccess, showError]);

  // ✅ Composant de tableau de bord intégré
  const IntegratedDashboard = () => (
    <div className="space-y-6">
      {/* Statistiques globales enrichies */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`
          p-4 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-sm">Sessions actives</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statistiques.sessionsActives}
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Durée moy: {Math.round(statistiques.dureeeMoyenneSession)}min
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
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Taux: {Math.round((statistiques.sessionsAvecAbonnement / Math.max(statistiques.sessionsActives, 1)) * 100)}%
          </div>
        </div>

        <div className={`
          p-4 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="font-medium text-sm">Clients abonnés</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statistiques.clientsAvecAbonnementActif}
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Taux: {Math.round(statistiques.tauxUtilisationAbonnements)}%
          </div>
        </div>

        <div className={`
          p-4 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-sm">En cours de jeu</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {statistiques.clientsActuellementEnJeu}
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Clients actifs
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
            {statistiques.revenusEstimes.toFixed(2)}€
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            En cours
          </div>
        </div>

        <div className={`
          p-4 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-sm">Économies abonnements</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {statistiques.economiesAbonnements.toFixed(2)}€
          </div>
          <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Économisées aujourd'hui
          </div>
        </div>
      </div>

      {/* Vue rapide des sessions actives avec abonnements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions avec abonnements actifs */}
        <div className={`
          p-6 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Sessions avec abonnements actifs
          </h3>
          
          {sessions.filter(s => s.hasActiveSubscription).length === 0 ? (
            <div className="text-center py-8">
              <Star className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucune session avec abonnement active
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter(s => s.hasActiveSubscription)
                .slice(0, 5)
                .map(session => (
                  <div key={session.id} className={`
                    p-3 rounded-lg border-l-4 border-l-yellow-500
                    ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}
                  `}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {session.Client?.prenom} {session.Client?.nom}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {session.Poste?.nom} • {Math.round(session.dureeEnMinutes || 0)}min
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">
                            {session.coutEstime?.toFixed(2)}€
                          </span>
                          {session.economieRealisee > 0 && (
                            <span className="text-xs text-orange-600">
                              (-{session.economieRealisee.toFixed(2)}€)
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {session.subscriptionStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Clients avec abonnements */}
        <div className={`
          p-6 rounded-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Clients avec abonnements actifs
          </h3>
          
          {clients.filter(c => c.abonnementActif).length === 0 ? (
            <div className="text-center py-8">
              <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucun client avec abonnement actif
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients
                .filter(c => c.abonnementActif)
                .slice(0, 5)
                .map(client => (
                  <div key={client.id} className={`
                    p-3 rounded-lg
                    ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}
                  `}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {client.prenom} {client.nom}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {client.abonnementActif?.TypeAbonnement?.nom}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {client.isCurrentlyPlaying && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            canClientUseSubscriptionBenefits(client.id)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {canClientUseSubscriptionBenefits(client.id) ? 'Actif' : 'Expiré'}
                          </span>
                        </div>
                        {client.abonnementActif?.heuresRestantes > 0 && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {client.abonnementActif.heuresRestantes}h restantes
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            Centre de Gestion Intégré - Sessions & Abonnements
          </h1>
          
          <div className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'sessions', label: 'Gestionnaire sessions', icon: Monitor },
              { id: 'stats', label: 'Statistiques avancées', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                  ${activeView === id
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeView === 'dashboard' && <IntegratedDashboard />}
        {activeView === 'sessions' && (
          <ComprehensiveSessionManager 
            onStartSession={handleStartIntelligentSession}
            onEndSession={handleEndSessionWithSubscription}
          />
        )}
        {activeView === 'stats' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Statistiques avancées</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Module de statistiques détaillées en développement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionAbonnementIntegratedPage;
