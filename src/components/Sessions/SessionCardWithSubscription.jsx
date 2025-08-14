import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  User, 
  Star, 
  DollarSign, 
  Pause, 
  Play, 
  Square, 
  Plus, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { sessionService } from '../../services/sessionService';

const SessionCardWithSubscription = ({ 
  session, 
  onSessionUpdated, 
  onSessionTerminated 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [coutActuel, setCoutActuel] = useState(null);

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Calculer la durée écoulée en temps réel
  const [dureeEcoulee, setDureeEcoulee] = useState(0);

  useEffect(() => {
    if (session.statut !== 'EN_COURS' || session.estEnPause) return;

    const updateDuree = () => {
      const maintenant = new Date();
      const debut = new Date(session.heureDebut);
      const dureeMs = maintenant - debut;
      const dureeMinutes = Math.floor(dureeMs / (1000 * 60));
      setDureeEcoulee(dureeMinutes);
    };

    updateDuree();
    const interval = setInterval(updateDuree, 1000);

    return () => clearInterval(interval);
  }, [session.heureDebut, session.statut, session.estEnPause]);

  // ✅ Calculer le coût en temps réel
  useEffect(() => {
    if (!session || session.statut !== 'EN_COURS') return;

    const calculateCost = async () => {
      try {
        const response = await sessionService.calculerCoutSession(session.id);
        setCoutActuel(response.data);
      } catch (error) {
        console.error('❌ [SESSION_CARD] Erreur calcul coût:', error);
      }
    };

    calculateCost();
    const interval = setInterval(calculateCost, 30000); // Recalculer toutes les 30s

    return () => clearInterval(interval);
  }, [session.id, session.statut, dureeEcoulee]);

  // ✅ Informations calculées
  const sessionInfo = useMemo(() => {
    const heuresEcoulees = dureeEcoulee / 60;
    const minutesRestantes = dureeEcoulee % 60;
    
    return {
      dureeFormatee: `${Math.floor(heuresEcoulees)}h ${minutesRestantes.toString().padStart(2, '0')}m`,
      estEnRetard: session.dureePrevueMinutes && dureeEcoulee > session.dureePrevueMinutes,
      progressPercent: session.dureePrevueMinutes 
        ? Math.min((dureeEcoulee / session.dureePrevueMinutes) * 100, 100)
        : null
    };
  }, [dureeEcoulee, session.dureePrevueMinutes]);

  // ✅ Gérer pause/reprise
  const handleTogglePause = async () => {
    setLoading(true);
    try {
      if (session.estEnPause) {
        await sessionService.reprendreSession(session.id);
        showSuccess('Session reprise');
      } else {
        await sessionService.pauserSession(session.id);
        showSuccess('Session mise en pause');
      }
      onSessionUpdated?.();
    } catch (error) {
      showError('Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gérer prolongation
  const handleExtend = async (minutesSupplementaires) => {
    setLoading(true);
    try {
      await sessionService.prolongerSession(session.id, minutesSupplementaires);
      showSuccess(`Session prolongée de ${minutesSupplementaires} minutes`);
      setShowExtendModal(false);
      onSessionUpdated?.();
    } catch (error) {
      showError('Erreur lors de la prolongation');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Couleur de la carte selon le statut
  const getCardStyle = () => {
    if (session.estEnPause) {
      return 'border-orange-400 bg-orange-50';
    }
    if (sessionInfo.estEnRetard) {
      return 'border-red-400 bg-red-50';
    }
    if (session.abonnement) {
      return 'border-yellow-400 bg-yellow-50';
    }
    return 'border-green-400 bg-green-50';
  };

  return (
    <>
      <div className={`
        rounded-lg border-2 p-4 transition-all duration-300
        ${isDarkMode ? 'bg-gray-800 border-gray-600' : getCardStyle()}
        ${session.estEnPause ? 'opacity-75' : ''}
      `}>
        {/* Header avec poste et statut */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{session.poste?.nom}</h3>
            <p className="text-sm opacity-75">
              {session.poste?.typePoste?.nom} • {session.poste?.typePoste?.tarifHoraireBase} MAD/h
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {session.estEnPause && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                EN PAUSE
              </span>
            )}
            
            {session.abonnement && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                ABONNEMENT
              </span>
            )}

            {sessionInfo.estEnRetard && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                RETARD
              </span>
            )}
          </div>
        </div>

        {/* Client et abonnement */}
        {session.client && (
          <div className="mb-3 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {session.client.prenom} {session.client.nom}
              </span>
              {session.client.numeroClient && (
                <span className="text-xs opacity-75">#{session.client.numeroClient}</span>
              )}
            </div>
            
            {session.abonnement && (
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{session.abonnement.typeAbonnement?.nom}</span>
                </div>
                <div className="text-xs opacity-75">
                  {session.abonnement.heuresRestantes}h restantes • 
                  Expire le {new Date(session.abonnement.dateExpiration).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Durée et progression */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-mono font-bold text-lg">
                {sessionInfo.dureeFormatee}
              </span>
            </div>
            
            {session.dureePrevueMinutes && (
              <span className="text-sm opacity-75">
                / {Math.floor(session.dureePrevueMinutes / 60)}h{(session.dureePrevueMinutes % 60).toString().padStart(2, '0')}m
              </span>
            )}
          </div>

          {/* Barre de progression */}
          {sessionInfo.progressPercent !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  sessionInfo.progressPercent > 100 
                    ? 'bg-red-500' 
                    : sessionInfo.progressPercent > 80 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(sessionInfo.progressPercent, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Coût actuel */}
        {coutActuel && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Coût actuel:</span>
              <span className="text-lg font-bold text-green-600">
                {coutActuel.montantTotal} MAD
              </span>
            </div>
            
            {coutActuel.abonnementUtilise && (
              <div className="text-xs text-yellow-600 mt-1">
                {coutActuel.heuresConsommees}h consommées de l'abonnement
              </div>
            )}
            
            {session.paiementAnticipe && (
              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Paiement anticipé: {session.montantPaye} MAD
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleTogglePause}
            disabled={loading}
            className={`
              flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
              ${session.estEnPause
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
              }
              disabled:opacity-50
            `}
          >
            {session.estEnPause ? (
              <>
                <Play className="w-4 h-4" />
                Reprendre
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </button>

          <button
            onClick={() => setShowExtendModal(true)}
            disabled={loading}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Prolonger
          </button>

          <button
            onClick={() => setShowTerminateModal(true)}
            disabled={loading}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4" />
            Terminer
          </button>
        </div>

        {/* Heure de début */}
        <div className="mt-3 text-xs opacity-60 text-center">
          Démarrée à {new Date(session.heureDebut).toLocaleTimeString()}
        </div>
      </div>

      {/* Modal de prolongation */}
      {showExtendModal && (
        <ExtendSessionModal
          session={session}
          onExtend={handleExtend}
          onCancel={() => setShowExtendModal(false)}
          loading={loading}
        />
      )}

      {/* Modal de terminaison */}
      {showTerminateModal && (
        <TerminateSessionModal
          session={session}
          coutActuel={coutActuel}
          onTerminate={onSessionTerminated}
          onCancel={() => setShowTerminateModal(false)}
        />
      )}
    </>
  );
};

// ✅ Modal de prolongation
const ExtendSessionModal = ({ session, onExtend, onCancel, loading }) => {
  const { effectiveTheme } = useTheme();
  const [minutesSupplementaires, setMinutesSupplementaires] = useState(30);

  const isDarkMode = effectiveTheme === 'dark';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-md rounded-xl shadow-2xl p-6
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        <h3 className="text-xl font-bold mb-4">Prolonger la session</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Durée supplémentaire</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[15, 30, 60].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => setMinutesSupplementaires(minutes)}
                  className={`
                    py-2 rounded-lg font-medium transition-colors
                    ${minutesSupplementaires === minutes
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                    ${isDarkMode && minutesSupplementaires !== minutes ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''}
                  `}
                >
                  {minutes}min
                </button>
              ))}
            </div>
            
            <input
              type="number"
              min="5"
              max="240"
              value={minutesSupplementaires}
              onChange={(e) => setMinutesSupplementaires(parseInt(e.target.value) || 0)}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              Annuler
            </button>
            <button
              onClick={() => onExtend(minutesSupplementaires)}
              disabled={loading || minutesSupplementaires < 5}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Prolongation...' : 'Prolonger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Modal de terminaison
const TerminateSessionModal = ({ session, coutActuel, onTerminate, onCancel }) => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    modePaiement: 'ESPECES',
    montantPaye: 0,
    notes: ''
  });

  const isDarkMode = effectiveTheme === 'dark';

  const montantRestant = coutActuel 
    ? Math.max(0, coutActuel.montantTotal - (session.montantPaye || 0))
    : 0;

  const handleTerminate = async () => {
    setLoading(true);
    try {
      const terminationData = {
        sessionId: session.id,
        modePaiement: paymentData.modePaiement,
        montantPaye: paymentData.montantPaye,
        notes: paymentData.notes,
        forceTerminer: true
      };

      const response = await sessionService.terminerSession(terminationData);
      
      if (response.success) {
        showSuccess('Session terminée avec succès');
        onTerminate?.(response.data);
      } else {
        showError(response.message || 'Erreur lors de la terminaison');
      }
    } catch (error) {
      console.error('❌ [TERMINATE_SESSION] Erreur:', error);
      showError('Erreur lors de la terminaison de la session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-md rounded-xl shadow-2xl p-6
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        <h3 className="text-xl font-bold mb-4">Terminer la session</h3>
        
        <div className="space-y-4">
          {/* Résumé financier */}
          {coutActuel && (
            <div className={`
              p-4 rounded-lg
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
            `}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Coût total:</span>
                  <span className="font-bold">{coutActuel.montantTotal} MAD</span>
                </div>
                
                {session.montantPaye > 0 && (
                  <div className="flex justify-between">
                    <span>Déjà payé:</span>
                    <span className="text-green-600">{session.montantPaye} MAD</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">Montant restant:</span>
                  <span className="font-bold text-lg">
                    {montantRestant} MAD
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Paiement du montant restant */}
          {montantRestant > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Paiement du solde</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mode de paiement</label>
                <select
                  value={paymentData.modePaiement}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, modePaiement: e.target.value }))}
                  className={`
                    w-full px-3 py-2 border rounded-lg
                    ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                  `}
                >
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE">Carte</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Montant payé</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentData.montantPaye}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    montantPaye: parseFloat(e.target.value) || 0 
                  }))}
                  className={`
                    w-full px-3 py-2 border rounded-lg
                    ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                  `}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg resize-none
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              placeholder="Notes sur la terminaison..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              Annuler
            </button>
            <button
              onClick={handleTerminate}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Terminaison...' : 'Terminer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCardWithSubscription;
