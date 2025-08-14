import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Play, 
  Settings, 
  Clock, 
  User, 
  Gamepad2,
  AlertCircle,
  CheckCircle,
  Star,
  PauseCircle,
  Wrench,
  Euro,
  Timer,
  DollarSign
} from 'lucide-react';

const PosteCard = ({ 
  poste, 
  session,
  onStartSession, 
  onSessionAction,
  formatCurrency,
  formatDuration,
  canManage = false,
  isDarkMode = false
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // ✅ CORRECTION: Timer pour les sessions actives
  useEffect(() => {
    if (session && (session.statut === 'EN_COURS' || session.statut === 'EN_PAUSE')) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session]);

  // ✅ NOUVEAU: Fonction pour déterminer le statut réel du poste
  const getPosteStatus = () => {
    // Si une session est active
    if (session) {
      if (session.statut === 'EN_PAUSE') {
        const pauseStart = new Date(session.pauseActuelleDebut || session.dateHeureDebut);
        const pauseDuration = Math.floor((currentTime - pauseStart) / (1000 * 60));
        
        return {
          status: `En Pause (${pauseDuration}min)`,
          color: 'yellow',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-300 dark:border-yellow-600',
          available: false,
          session: session,
          icon: '⏸️'
        };
      }
      
      if (session.statut === 'EN_COURS') {
        const startTime = new Date(session.dateHeureDebut);
        const plannedMinutes = session.dureeEstimeeMinutes || 60;
        const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
        
        const elapsedMs = Math.max(0, currentTime - startTime - pauseTimeMs);
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        const isExpired = elapsedMinutes >= plannedMinutes;
        
        return {
          status: isExpired ? 'Dépassé' : 'En Cours',
          color: isExpired ? 'red' : 'green',
          bgColor: isExpired ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
          textColor: isExpired ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300',
          borderColor: isExpired ? 'border-red-300 dark:border-red-600' : 'border-green-300 dark:border-green-600',
          available: false,
          session: session,
          elapsedMinutes,
          plannedMinutes,
          isExpired,
          icon: isExpired ? '⚠️' : '▶️'
        };
      }
    }

    // Statut du poste sans session
    switch (poste.etat) {
      case 'Maintenance':
        return {
          status: 'En Maintenance',
          color: 'orange',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-300 dark:border-orange-600',
          available: false,
          icon: '🔧'
        };
      case 'Hors_Service':
        return {
          status: 'Hors Service',
          color: 'gray',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-300 dark:border-gray-600',
          available: false,
          icon: '❌'
        };
      default:
        return {
          status: 'Disponible',
          color: 'blue',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-300 dark:border-blue-600',
          available: true,
          icon: '🎮'
        };
    }
  };

  // ✅ NOUVEAU: Calcul du prix actuel pour les sessions en cours
  const getCurrentPrice = () => {
    if (!session || session.statut !== 'EN_COURS') return 0;
    
    const tarifHoraire = poste.typePoste?.tarifHoraireBase || 25;
    const startTime = new Date(session.dateHeureDebut);
    const pauseTimeMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    
    const elapsedMs = Math.max(0, currentTime - startTime - pauseTimeMs);
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    
    return (elapsedMinutes / 60) * tarifHoraire;
  };

  const statusInfo = getPosteStatus();
  const currentPrice = getCurrentPrice();

  const cardClasses = `
    p-4 rounded-xl border-2 transition-all duration-200 
    ${statusInfo.bgColor} 
    ${statusInfo.borderColor}
    ${statusInfo.available ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''}
  `;

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={cardClasses}>
      {/* Header avec nom et statut */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`font-semibold text-lg ${textPrimary}`}>
            {poste.nom}
          </h3>
          <p className={`text-sm ${textSecondary}`}>
            {poste.typePoste?.nom || 'Type non défini'}
          </p>
          {poste.position && (
            <p className={`text-xs ${textSecondary}`}>
              Position: {poste.position}
            </p>
          )}
        </div>
        
        <div className={`
          flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
          ${statusInfo.bgColor} ${statusInfo.textColor}
        `}>
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.status}</span>
        </div>
      </div>

      {/* Informations de session ou tarif */}
      {statusInfo.session ? (
        <div className="space-y-3 mb-4">
          {/* Informations client */}
          {statusInfo.session.client && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className={textPrimary}>
                {statusInfo.session.client.prenom} {statusInfo.session.client.nom}
              </span>
            </div>
          )}

          {/* Durée et prix pour sessions en cours */}
          {statusInfo.session.statut === 'EN_COURS' && (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={textSecondary}>Temps écoulé</p>
                  <p className={`font-medium ${textPrimary}`}>
                    {formatDuration ? formatDuration(statusInfo.elapsedMinutes) : `${statusInfo.elapsedMinutes}min`}
                  </p>
                </div>
                <div>
                  <p className={textSecondary}>Durée prévue</p>
                  <p className={`font-medium ${textPrimary}`}>
                    {formatDuration ? formatDuration(statusInfo.plannedMinutes) : `${statusInfo.plannedMinutes}min`}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className={textSecondary}>Prix actuel</p>
                  <p className={`font-semibold text-green-600`}>
                    {formatCurrency ? formatCurrency(currentPrice) : `${currentPrice.toFixed(2)} MAD`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={textSecondary}>Session</p>
                  <p className={`font-medium ${textPrimary}`}>
                    #{statusInfo.session.numeroSession || statusInfo.session.id}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    statusInfo.isExpired ? 'bg-red-500 animate-pulse' : 
                    statusInfo.elapsedMinutes / statusInfo.plannedMinutes > 0.8 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (statusInfo.elapsedMinutes / statusInfo.plannedMinutes) * 100)}%` 
                  }}
                />
              </div>
            </>
          )}

          {/* Informations pour sessions en pause */}
          {statusInfo.session.statut === 'EN_PAUSE' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Session en pause
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Durée avant pause: {formatDuration ? formatDuration(statusInfo.elapsedMinutes || 0) : '0min'}
              </p>
            </div>
          )}

          {/* Jeu principal */}
          {statusInfo.session.jeuPrincipal && (
            <div className="flex items-center space-x-2 text-sm">
              <Gamepad2 className="w-4 h-4 text-gray-400" />
              <span className={textPrimary}>{statusInfo.session.jeuPrincipal}</span>
            </div>
          )}
        </div>
      ) : (
        // Affichage tarif pour postes disponibles
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className={textSecondary}>Tarif horaire</span>
            <span className={`font-semibold ${textPrimary}`}>
              {poste.typePoste?.tarifHoraireBase || 'N/A'} {poste.typePoste?.devise || 'MAD'}/h
            </span>
          </div>
          
          {/* Plans tarifaires disponibles */}
          {poste.typePoste?.plansTarifaires?.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs ${textSecondary} mb-1`}>
                {poste.typePoste.plansTarifaires.length} plan(s) disponible(s)
              </p>
              <div className="text-xs space-y-1">
                {poste.typePoste.plansTarifaires.slice(0, 2).map((plan, index) => (
                  <div key={index} className="flex justify-between">
                    <span className={textSecondary}>{plan.nom}</span>
                    <span className={textPrimary}>{plan.prix} {poste.typePoste.devise}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {statusInfo.available ? (
          <div className="space-y-2">
            <button
              onClick={() => onStartSession && onStartSession(poste)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Démarrer Session</span>
            </button>
          </div>
        ) : statusInfo.session ? (
          <button
            onClick={() => onSessionAction && onSessionAction(statusInfo.session)}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-white flex items-center justify-center space-x-2 ${
              statusInfo.session.statut === 'EN_PAUSE'
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>
              {statusInfo.session.statut === 'EN_PAUSE' ? 'Reprendre' : 'Gérer Session'}
            </span>
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed"
          >
            {statusInfo.status}
          </button>
        )}
      </div>
    </div>
  );
};

export default PosteCard;