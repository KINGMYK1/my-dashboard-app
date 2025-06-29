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
  PauseCircle,
  Wrench,
  Euro,
  Timer
} from 'lucide-react';

const PosteCard = ({ poste, activeSession, onStartSession, onOpenSessionActions, isDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // ✅ AJOUT: Fonctions utilitaires pour l'affichage des montants et statuts
  const formatMontant = (montant) => {
    if (montant === null || montant === undefined) return '0.00';
    return parseFloat(montant).toFixed(2);
  };

  const getStatutPaiementBadge = (statutPaiement) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    switch (statutPaiement) {
      case 'PAYEE':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
            ✅ Payée
          </span>
        );
      case 'PARTIELLE':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
            ⚠️ Partielle
          </span>
        );
      case 'IMPAYEE':
      default:
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
            ❌ Impayée
          </span>
        );
    }
  };

  // ✅ CORRECTION: Timer seulement pour les sessions EN_COURS
  useEffect(() => {
    if (activeSession && activeSession.statut === 'EN_COURS') {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSession]);

  const getStatusInfo = () => {
    if (poste.etat === 'Maintenance') {
      return {
        status: 'En Maintenance',
        color: 'orange',
        available: false,
        icon: '🔧'
      };
    }

    // ✅ CORRECTION: Vérifier d'abord s'il y a une session (active OU en pause)
    if (activeSession) {
      const startTime = new Date(activeSession.dateHeureDebut);
      const plannedMinutes = activeSession.dureeEstimeeMinutes || 60;
      
      // ✅ UTILISER LE MONTANT ESTIMÉ DE LA SESSION AU LIEU DU CALCUL LOCAL
      const montantEstime = activeSession.montantTotal || activeSession.coutCalculeFinal || 0;

      // ✅ CORRECTION: Gestion spéciale des sessions en pause
      if (activeSession.statut === 'EN_PAUSE') {
        // Pour les sessions en pause, calculer jusqu'au moment de la pause
        const pauseStart = new Date(activeSession.pauseActuelleDebut);
        const pauseTimeMs = (activeSession.tempsPauseTotalMinutes || 0) * 60 * 1000;
        
        // Temps écoulé jusqu'à la pause (sans inclure les pauses)
        const elapsedMsBeforePause = pauseStart - startTime - pauseTimeMs;
        const elapsedMinutesBeforePause = Math.max(0, Math.floor(elapsedMsBeforePause / (1000 * 60)));
        
        // Temps de pause actuel
        const currentPauseMs = Date.now() - pauseStart;
        const currentPauseMinutes = Math.floor(currentPauseMs / (1000 * 60));
        
        return {
          status: `En Pause (${currentPauseMinutes}min)`,
          color: 'yellow',
          available: false,
          session: {
            ...activeSession,
            montantEstime: montantEstime,
            montantPaye: activeSession.montantPaye || 0,
            montantDu: Math.max(0, montantEstime - (activeSession.montantPaye || 0)),
            statutPaiement: activeSession.statutPaiement || 'IMPAYEE'
          },
          elapsedMinutes: elapsedMinutesBeforePause,
          plannedMinutes: plannedMinutes,
          currentPrice: montantEstime, // Utiliser le montant estimé au lieu du calcul local
          isExpired: elapsedMinutesBeforePause >= plannedMinutes,
          isPaused: true,
          currentPauseMinutes: currentPauseMinutes,
          icon: '⏸️'
        };
      }

      // ✅ CORRECTION: Pour les sessions EN_COURS
      if (activeSession.statut === 'EN_COURS') {
        const now = new Date(currentTime);
        const pauseTimeMs = (activeSession.tempsPauseTotalMinutes || 0) * 60 * 1000;
        
        // ✅ CORRECTION: Soustraire le temps de pause du temps écoulé
        const elapsedMs = Math.max(0, now - startTime - pauseTimeMs);
        const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        
        const isExpired = elapsedMinutes >= plannedMinutes;
        
        return {
          status: isExpired ? 'Dépassé' : 'En Cours',
          color: isExpired ? 'red' : 'green',
          available: false,
          session: {
            ...activeSession,
            montantEstime: montantEstime,
            montantPaye: activeSession.montantPaye || 0,
            montantDu: Math.max(0, montantEstime - (activeSession.montantPaye || 0)),
            statutPaiement: activeSession.statutPaiement || 'IMPAYEE'
          },
          elapsedMinutes: elapsedMinutes,
          plannedMinutes: plannedMinutes,
          currentPrice: montantEstime, // Utiliser le montant estimé au lieu du calcul local
          isExpired: isExpired,
          isPaused: false,
          icon: isExpired ? '⚠️' : '▶️'
        };
      }
    }

    // ✅ CORRECTION: Poste vraiment disponible seulement s'il n'y a pas de session
    return {
      status: 'Disponible',
      color: 'green',
      available: true,
      icon: '🎮'
    };
  };

  const statusInfo = getStatusInfo();
  
  const cardBg = isDarkMode 
    ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80' 
    : 'bg-white/80 border-gray-200 hover:bg-white';

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  const getStatusClasses = (color) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1';
    switch (color) {
      case 'green':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse`;
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'orange':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatPrice = (price) => {
    return `${formatMontant(price)} MAD`; // ✅ CORRECTION: Utiliser formatMontant
  };

  const getTarifDisplay = () => {
    const tarif = poste.typePoste?.tarifHoraireBase;
    if (!tarif) return 'Tarif non défini';
    return `${formatMontant(tarif)} MAD/h`; // ✅ CORRECTION: Utiliser formatMontant
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${cardBg} ${
      statusInfo.available ? 'hover:shadow-lg hover:scale-105' : ''
    }`}>
      {/* Header avec nom du poste et statut */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-semibold text-lg ${textPrimary}`}>
            {poste.nom}
          </h3>
          <p className={`text-sm ${textSecondary}`}>
            {poste.typePoste?.nom || 'Type non défini'}
          </p>
        </div>
        <span className={getStatusClasses(statusInfo.color)}>
          <span>{statusInfo.icon}</span>
          {statusInfo.status}
        </span>
      </div>

      {/* ✅ CORRECTION: Informations spéciales pour les sessions */}
      {statusInfo.session ? (
        <div className="space-y-2 mb-3">
          {statusInfo.isPaused && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-400">
                Session en pause depuis {statusInfo.currentPauseMinutes} minute{statusInfo.currentPauseMinutes > 1 ? 's' : ''}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className={textMuted}>
                {statusInfo.isPaused ? 'Temps écoulé (avant pause)' : 'Temps écoulé'}
              </p>
              <p className={`font-medium ${textPrimary}`}>
                {formatDuration(statusInfo.elapsedMinutes)}
              </p>
            </div>
            <div>
              <p className={textMuted}>Durée prévue</p>
              <p className={`font-medium ${textPrimary}`}>
                {formatDuration(statusInfo.plannedMinutes)}
              </p>
            </div>
          </div>
          
          {/* ✅ AJOUT: Affichage des informations de paiement */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-sm space-y-1">
            <div className="flex justify-between">
              <span className={textMuted}>Montant estimé:</span>
              <span className={`font-medium ${textPrimary}`}>
                {formatMontant(statusInfo.session.montantEstime)} MAD
              </span>
            </div>
            <div className="flex justify-between">
              <span className={textMuted}>Montant payé:</span>
              <span className={`font-medium ${textPrimary}`}>
                {formatMontant(statusInfo.session.montantPaye)} MAD
              </span>
            </div>
            <div className="flex justify-between">
              <span className={textMuted}>Montant dû:</span>
              <span className={`font-medium ${textPrimary}`}>
                {formatMontant(statusInfo.session.montantDu)} MAD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={textMuted}>Statut paiement:</span>
              {getStatutPaiementBadge(
                statusInfo.session.statutPaiement
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className={textMuted}>Prix actuel</p>
              <p className={`font-semibold text-lg ${textPrimary}`}>
                {formatPrice(statusInfo.currentPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className={textMuted}>Session</p>
              <p className={`font-medium ${textPrimary}`}>
                {statusInfo.session.referenceSession || statusInfo.session.numeroSession}
              </p>
            </div>
          </div>

          {/* ✅ CORRECTION: Barre de progression adaptée */}
          {!statusInfo.isPaused && (
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
          )}
        </div>
      ) : (
        <div className="mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className={textMuted}>Tarif horaire</span>
            <span className={`font-semibold ${textPrimary}`}>
              {getTarifDisplay()}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {statusInfo.available ? (
          <button
            onClick={() => onStartSession(poste)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Démarrer Session
          </button>
        ) : (
          <button
            onClick={() => onOpenSessionActions(statusInfo.session)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-white ${
              statusInfo.isPaused 
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {statusInfo.isPaused ? 'Reprendre Session' : 'Gérer Session'}
          </button>
        )}
      </div>

      {/* Position du poste */}
      {poste.position && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-xs ${textMuted}`}>
            Position: {poste.position}
          </p>
        </div>
      )}
    </div>
  );
};

export default PosteCard;