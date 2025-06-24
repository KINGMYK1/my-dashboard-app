import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Square, Clock, User, Monitor, 
  DollarSign, MoreVertical, AlertTriangle,
  CreditCard, Receipt, Edit, Trash2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const SessionCard = ({ 
  session, 
  onTerminate, 
  onPause, 
  onResume, 
  onCancel,
  onExtend,
  onPayment,
  showActions = true,
  compact = false,
  sessionProgress = null // ✅ CORRECTION: Recevoir les données de progression calculées
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Mise à jour du temps en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ CORRECTION: Utiliser sessionProgress si disponible, sinon calculer manuellement
  const calculatedProgress = useMemo(() => {
    if (sessionProgress) {
      return sessionProgress;
    }

    // Fallback si pas de données de progression
    if (!session.dateHeureDebut) {
      return {
        elapsedMinutes: 0,
        remainingMinutes: 0,
        progressPercent: 0,
        isExpired: false
      };
    }

    const debut = new Date(session.dateHeureDebut);
    let tempsEcouleMs;

    if (session.statut === 'EN_PAUSE') {
      const pauseDebut = new Date(session.pauseActuelleDebut || currentTime);
      tempsEcouleMs = pauseDebut.getTime() - debut.getTime();
    } else {
      tempsEcouleMs = currentTime.getTime() - debut.getTime();
    }

    const tempsPauseMs = (session.tempsPauseTotalMinutes || 0) * 60 * 1000;
    const tempsEffectifMs = Math.max(0, tempsEcouleMs - tempsPauseMs);

    const totalMinutes = Math.floor(tempsEffectifMs / (1000 * 60));
    const dureeEstimee = session.dureeEstimeeMinutes || 60;
    const progression = dureeEstimee > 0 ? (totalMinutes / dureeEstimee) * 100 : 0;

    return {
      elapsedMinutes: totalMinutes,
      remainingMinutes: Math.max(0, dureeEstimee - totalMinutes),
      progressPercent: Math.min(150, progression),
      isExpired: totalMinutes >= dureeEstimee
    };
  }, [sessionProgress, session, currentTime]);

  // ✅ CORRECTION: Calcul du coût en temps réel avec plan tarifaire
  const calculerCoutActuel = useMemo(() => {
    if (session.planTarifaireUtilise) {
      return {
        montant: parseFloat(session.planTarifaireUtilise.prix || 0),
        type: 'FORFAIT',
        details: `Plan: ${session.planTarifaireUtilise.nom}`
      };
    } else {
      const tarifHoraire = session.poste?.typePoste?.tarifHoraireBase || 25;
      const montant = (calculatedProgress.elapsedMinutes / 60) * tarifHoraire;
      
      return {
        montant: parseFloat(montant.toFixed(2)),
        type: 'HORAIRE',
        details: `${tarifHoraire} MAD/h`
      };
    }
  }, [session, calculatedProgress.elapsedMinutes]);

  // Déterminer l'état visuel de la session
  const getSessionStatus = useMemo(() => {
    if (session.statut === 'EN_PAUSE') {
      return {
        label: 'En Pause',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        borderColor: 'border-orange-500',
        icon: Pause,
        progression: Math.min(100, calculatedProgress.progressPercent)
      };
    }

    if (calculatedProgress.isExpired) {
      return {
        label: 'Dépassé',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        borderColor: 'border-red-500',
        icon: AlertTriangle,
        progression: 100
      };
    }

    if (calculatedProgress.progressPercent >= 80) {
      return {
        label: 'Fin proche',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-500',
        icon: Clock,
        progression: calculatedProgress.progressPercent
      };
    }

    return {
      label: 'En cours',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      borderColor: 'border-green-500',
      icon: Play,
      progression: calculatedProgress.progressPercent
    };
  }, [session.statut, calculatedProgress]);

  const status = getSessionStatus;

  const cardClasses = `
    relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg
    ${status.bgColor} ${status.borderColor}
    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
  `;

  if (compact) {
    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <status.icon className={`w-4 h-4 ${status.color}`} />
            <div>
              <div className="font-medium text-sm">
                {session.poste?.nom || 'Poste inconnu'}
              </div>
              <div className="text-xs text-gray-500">
                {Math.floor(calculatedProgress.elapsedMinutes / 60)}h {calculatedProgress.elapsedMinutes % 60}m
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-sm">
              {calculerCoutActuel.montant} MAD
            </div>
            <div className="text-xs text-gray-500">
              {status.label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <status.icon className={`w-5 h-5 ${status.color}`} />
          <div>
            <h3 className="font-semibold text-lg">
              {session.poste?.nom || 'Poste inconnu'}
            </h3>
            <p className="text-sm text-gray-500">
              {session.numeroSession}
            </p>
          </div>
        </div>
        
        {showActions && (
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActionsMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  {session.statut === 'EN_COURS' && (
                    <button
                      onClick={() => {
                        onPause && onPause(session);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Mettre en pause</span>
                    </button>
                  )}
                  
                  {session.statut === 'EN_PAUSE' && (
                    <button
                      onClick={() => {
                        onResume && onResume(session);
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Reprendre</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      onTerminate && onTerminate(session);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Terminer</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onCancel && onCancel(session);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informations de la session */}
      <div className="space-y-3 mb-4">
        {/* Client */}
        {session.client && !session.client.isSystemClient && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span>{session.client.prenom} {session.client.nom}</span>
          </div>
        )}

        {/* Temps écoulé */}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            {Math.floor(calculatedProgress.elapsedMinutes / 60)}h {calculatedProgress.elapsedMinutes % 60}m
          </span>
          {session.dureeEstimeeMinutes && (
            <span className="text-gray-500">
              / {Math.floor(session.dureeEstimeeMinutes / 60)}h {session.dureeEstimeeMinutes % 60}m
            </span>
          )}
        </div>

        {/* Coût actuel */}
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">
            {calculerCoutActuel.montant} MAD
          </span>
          <span className="text-gray-500">
            ({calculerCoutActuel.details})
          </span>
        </div>

        {/* Information sur le plan tarifaire utilisé */}
        {session.planTarifaireUtilise && (
          <div className="flex items-center space-x-2 text-sm">
            <Receipt className="w-4 h-4 text-gray-400" />
            <span className="text-purple-600 dark:text-purple-400">
              Plan: {session.planTarifaireUtilise.nom}
            </span>
          </div>
        )}

        {/* Jeu principal */}
        {session.jeuPrincipal && (
          <div className="flex items-center space-x-2 text-sm">
            <Monitor className="w-4 h-4 text-gray-400" />
            <span>{session.jeuPrincipal}</span>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{status.label}</span>
          <span>{Math.round(status.progression)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              status.progression >= 100 ? 'bg-red-500' :
              status.progression >= 80 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, status.progression)}%` }}
          />
        </div>
      </div>

      {/* Actions rapides */}
      {showActions && (
        <div className="flex space-x-2">
          {session.statut === 'EN_COURS' && (
            <button
              onClick={() => onPause && onPause(session)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </button>
          )}
          
          {session.statut === 'EN_PAUSE' && (
            <button
              onClick={() => onResume && onResume(session)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-1" />
              Reprendre
            </button>
          )}
          
          <button
            onClick={() => onTerminate && onTerminate(session)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Square className="w-4 h-4 mr-1" />
            Terminer
          </button>
        </div>
      )}

      {/* Indicateur de pause si la session est en pause */}
      {session.statut === 'EN_PAUSE' && session.pauseActuelleDebut && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-xs text-orange-800 dark:text-orange-400">
            En pause depuis {Math.floor((currentTime - new Date(session.pauseActuelleDebut)) / (1000 * 60))} minute(s)
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;