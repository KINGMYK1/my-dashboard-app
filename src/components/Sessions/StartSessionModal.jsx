import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionActions, useStartSessionWithSubscription } from '../../hooks/useSessions';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { useNotification } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import { useTheme } from '../../contexts/ThemeContext';
import PricingService from '../../services/pricingService';
import { Star, Clock, CreditCard, DollarSign, Check, AlertCircle, User, X, Calendar, Calculator, Play, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StartSessionModal = ({ isOpen, onClose, poste, onSessionStarted }) => {
  const [duration, setDuration] = useState(60); // Durée par défaut en minutes
  const [startTime, setStartTime] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionType, setSessionType] = useState('standard'); // standard ou subscription
  const [prixCalcule, setPrixCalcule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [paiementAnticipe, setPaiementAnticipe] = useState(false);
  const [montantPaye, setMontantPaye] = useState('');
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const [marquerCommePayee, setMarquerCommePayee] = useState(false);
  
  const { startSession } = useSessionActions();
  const { startSessionWithSubscription } = useStartSessionWithSubscription();
  const { showSuccess, showError } = useNotification();
  const { marquerSessionPayee } = usePayment();
  const { data: clientsData } = useClients();
  const { data: abonnementsData } = useAbonnements();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // Options de durée prédéfinies
  const durationOptions = [30, 60, 90, 120, 180, 240];
  
  // Classes CSS dynamiques
  const cardClass = `bg-${isDarkMode ? 'gray-800' : 'white'} p-4 rounded-lg shadow-sm border ${
    isDarkMode ? 'border-gray-700' : 'border-gray-200'
  } transition-all duration-200`;

  const inputClass = `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;

  const selectClass = `w-full px-3 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;

  const buttonClass = `px-4 py-2 rounded-md transition-all duration-200 ${
    isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }`;

  const activeButtonClass = `px-4 py-2 rounded-md transition-all duration-200 ${
    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
  } shadow-md`;

  const paymentInputClass = `w-full px-3 py-2 border rounded-md text-lg font-semibold focus:ring-2 focus:ring-green-500 transition ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'
  }`;

  // Traitement des données clients
  const clients = useMemo(() => {
    if (!clientsData) return [];
    return Array.isArray(clientsData) ? clientsData : clientsData.clients || [];
  }, [clientsData]);
  
  // Traitement des données abonnements
  const abonnements = useMemo(() => {
    if (!abonnementsData) return [];
    return Array.isArray(abonnementsData) ? abonnementsData : abonnementsData.abonnements || [];
  }, [abonnementsData]);

  // Formatage de l'heure de début pour affichage
  const formattedStartTime = useMemo(() => {
    return format(startTime, "dd MMMM yyyy à HH:mm", { locale: fr });
  }, [startTime]);
  
  // Vérifier si le client sélectionné a des abonnements actifs
  const activeAbonnements = useMemo(() => {
    if (!selectedClient || !abonnements || !Array.isArray(abonnements)) return [];
    
    return abonnements.filter(abo => 
      abo && abo.client_id === selectedClient.id && 
      new Date(abo.date_fin_validite) >= new Date() &&
      abo.est_actif
    );
  }, [selectedClient, abonnements]);
  
  // Calcul du prix via l'API PricingService
  const calculerPrix = useCallback(async () => {
    if (!poste || !poste.id) {
      console.log('❌ [START_SESSION_MODAL] Poste invalide:', poste);
      return;
    }
    
    try {
      setCalculEnCours(true);
      console.log('💰 [START_SESSION_MODAL] Calcul prix via API:', {
        posteId: poste.id,
        dureeMinutes: duration
      });
      
      // Vérification des paramètres avant appel API
      if (!Number.isInteger(parseInt(poste.id)) || !Number.isInteger(parseInt(duration))) {
        console.error('❌ [START_SESSION_MODAL] Paramètres invalides:', { posteId: poste.id, dureeMinutes: duration });
        setPrixCalcule(null);
        showError('Paramètres invalides pour le calcul du prix');
        setCalculEnCours(false);
        return;
      }
      
      // Appel à l'API avec les bons paramètres
      const result = await PricingService.calculerPrixEstime(
        parseInt(poste.id),
        parseInt(duration)
      );
      
      console.log('✅ [START_SESSION_MODAL] Prix calculé par API:', result);
      
      if (result && result.data) {
        setPrixCalcule(result.data);
        
        // Mettre à jour le montant payé pour le paiement anticipé
        if (paiementAnticipe) {
          setMontantPaye(result.data.montantTotal.toString());
        }
      } else {
        console.error('❌ [START_SESSION_MODAL] Format de réponse invalide:', result);
        setPrixCalcule(null);
      }
    } catch (error) {
      console.error('❌ [START_SESSION_MODAL] Erreur calcul prix:', error);
      setPrixCalcule(null);
      showError('Erreur lors du calcul du prix: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setCalculEnCours(false);
    }
  }, [poste, duration, paiementAnticipe, showError]);
  
  // Calcul automatique du prix quand poste ou durée change
  useEffect(() => {
    if (poste && poste.id && duration > 0) {
      const timeoutId = setTimeout(() => {
        calculerPrix();
      }, 500); // Délai pour éviter trop d'appels API
      
      return () => clearTimeout(timeoutId);
    } else {
      setPrixCalcule(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poste, duration]); // Suppression intentionnelle de calculerPrix des dépendances pour éviter les boucles
  
  // Mise à jour du montant payé quand le paiement anticipé est activé/désactivé
  useEffect(() => {
    if (paiementAnticipe && prixCalcule) {
      setMontantPaye(prixCalcule.montantTotal.toString());
    } else if (!paiementAnticipe) {
      setMontantPaye('');
      setMarquerCommePayee(false);
    }
  }, [paiementAnticipe, prixCalcule]);
  
  // Gestion du changement de client
  const handleClientChange = (client) => {
    if (!client) {
      setSelectedClient(null);
      setSearchTerm('');
      return;
    }
    
    setSelectedClient(client);
    setSearchTerm(`${client.nom} ${client.prenom}`);
    
    // Si le client a des abonnements, propose automatiquement de les utiliser
    if (client && Array.isArray(abonnements) && abonnements.some(abo => 
      abo && abo.client_id === client.id && 
      new Date(abo.date_fin_validite) >= new Date() &&
      abo.est_actif)) {
      console.log('⭐ [START_SESSION_MODAL] Le client a des abonnements actifs, passage en mode abonnement');
      setSessionType('subscription');
    } else {
      // Si le client n'a pas d'abonnements actifs, revenir en mode standard
      setSessionType('standard');
    }
  };
  
  // Soumission du formulaire pour démarrer une session
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!poste || !poste.id) {
      showError('Poste invalide');
      return;
    }

    if (!duration || duration <= 0) {
      showError('Veuillez saisir une durée valide');
      return;
    }

    if (!prixCalcule) {
      showError('Impossible de calculer le prix. Veuillez réessayer.');
      return;
    }
    
    // Validation du paiement anticipé
    if (paiementAnticipe) {
      const montantPayeFloat = parseFloat(montantPaye || 0);
      if (montantPayeFloat <= 0) {
        showError('Veuillez saisir un montant payé valide');
        return;
      }
      if (montantPayeFloat > prixCalcule.montantTotal * 1.5) {
        showError('Le montant payé semble trop élevé');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      let sessionData = {
        posteId: poste.id,
        dureeMinutes: parseInt(duration),
        clientId: selectedClient?.id || null,
        // Paramètres de paiement anticipé
        paiementAnticipe: paiementAnticipe,
        montantPaye: paiementAnticipe ? parseFloat(montantPaye || 0) : 0,
        marquerCommePayee: paiementAnticipe && marquerCommePayee,
        modePaiement: paiementAnticipe ? modePaiement : null,
      };
      
      console.log('📤 [START_SESSION_MODAL] Envoi données:', sessionData);
      console.log('💰 [START_SESSION_MODAL] Prix calculé:', prixCalcule);
      
      let result;
      
      if (sessionType === 'subscription' && activeAbonnements.length > 0) {
        // Démarrer une session avec abonnement
        sessionData.abonnementId = activeAbonnements[0].id;
        result = await startSessionWithSubscription(sessionData);
      } else {
        // Démarrer une session standard
        result = await startSession(sessionData);
      }
      
      // Si paiement anticipé, marquer la session comme payée dans le contexte
      if (paiementAnticipe && result) {
        // Essayer différentes structures de réponse possibles
        const sessionId = result.sessionId || result.data?.sessionId || result.data?.id || result.id;
        
        if (sessionId) {
          console.log('💳 [START_SESSION_MODAL] Marquage paiement anticipé session:', sessionId);
          marquerSessionPayee(sessionId, {
            montantPaye: parseFloat(montantPaye),
            modePaiement: modePaiement,
            marquerCommePayee: marquerCommePayee
          });
        } else {
          console.warn('⚠️ [START_SESSION_MODAL] Impossible de récupérer ID session:', result);
        }
      }
      
      showSuccess('Session démarrée avec succès');
      if (onSessionStarted) onSessionStarted(result);
      onClose();
    } catch (error) {
      console.error('Erreur lors du démarrage de la session:', error);
      showError(`Erreur: ${error.message || 'Problème lors du démarrage de la session'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialisation du formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setDuration(60);
      setStartTime(new Date());
      setSelectedClient(null);
      setSearchTerm('');
      setSessionType('standard');
      setPrixCalcule(null);
      setPaiementAnticipe(false);
      setMontantPaye('');
      setModePaiement('ESPECES');
      setMarquerCommePayee(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-500" />
              Démarrer une session
            </h2>
            <p className="mt-1 text-sm opacity-75">
              {poste?.nom} - {poste?.type_poste?.nom || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-${isDarkMode ? 'gray-700' : 'gray-100'} transition-colors`}
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations client et durée */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <User className="w-5 h-5" />
                Informations client
              </h3>

              {/* Sélection du client */}
              <div className={cardClass}>
                <label className="flex items-center text-sm font-medium mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Client (optionnel)
                </label>
                <div className="relative">
                  <select 
                    className={`${selectClass} pr-10`}
                    value={selectedClient?.id || ""}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      if (!clientId) {
                        setSelectedClient(null);
                        setSessionType('standard');
                        return;
                      }
                      
                      const client = Array.isArray(clients) ? 
                        clients.find(c => c.id === parseInt(clientId)) : null;
                      if (client) {
                        handleClientChange(client);
                      }
                    }}
                  >
                    <option value="">-- Sélectionner un client --</option>
                    
                    {/* Abonnés en premier avec groupe visuel */}
                    {Array.isArray(clients) && clients.length > 0 && (
                      <>
                        <optgroup label="🌟 Clients avec abonnements">
                          {clients.filter(client => 
                            client && client.id && Array.isArray(abonnements) && abonnements.some(abo => 
                              abo && parseInt(abo.clientId) === parseInt(client.id) && 
                              new Date(abo.dateExpiration || abo.date_fin_validite) >= new Date() &&
                              (abo.estActif || abo.est_actif || abo.statut === 'ACTIF'))
                          ).map(client => (
                            <option key={`sub-${client.id}`} value={client.id} className="font-semibold">
                              {client.nom} {client.prenom} 🌟
                            </option>
                          ))}
                        </optgroup>
                        
                        <optgroup label="Clients sans abonnement">
                          {clients.filter(client => 
                            client && client.id && !(Array.isArray(abonnements) && abonnements.some(abo => 
                              abo && parseInt(abo.clientId) === parseInt(client.id) && 
                              new Date(abo.dateExpiration || abo.date_fin_validite) >= new Date() &&
                              (abo.estActif || abo.est_actif || abo.statut === 'ACTIF')))
                          ).map(client => (
                            <option key={`std-${client.id}`} value={client.id}>
                              {client.nom} {client.prenom}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Affichage du client sélectionné */}
                {selectedClient && (
                  <div className={`mt-3 p-3 rounded-md flex justify-between items-center ${
                    isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {selectedClient.nom} {selectedClient.prenom}
                      </span>
                      
                      {/* Affichage des informations d'abonnement */}
                      {Array.isArray(activeAbonnements) && activeAbonnements.length > 0 ? (
                        <span className={`text-xs flex items-center mt-1 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          <Star size={12} className="mr-1" />
                          {activeAbonnements.length > 1 
                            ? `${activeAbonnements.length} abonnements actifs`
                            : `Abonnement actif jusqu'au ${
                                new Date(activeAbonnements[0].dateExpiration || activeAbonnements[0].date_fin_validite).toLocaleDateString('fr-FR')
                              }`
                          }
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Pas d'abonnement actif
                        </span>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setSessionType('standard');
                      }}
                      className={`text-red-500 hover:text-red-700 p-1 rounded-full ${
                        isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Type de session */}
              <div className={cardClass}>
                <label className="flex items-center text-sm font-medium mb-2">
                  <Star className="w-4 h-4 mr-2 text-blue-500" />
                  Type de session
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSessionType('standard')}
                    className={sessionType === 'standard' ? activeButtonClass : buttonClass}
                  >
                    <Clock size={18} className="mr-2 inline-block" />
                    Standard
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedClient && Array.isArray(activeAbonnements) && activeAbonnements.length > 0) {
                        setSessionType('subscription');
                      } else if (selectedClient) {
                        showError(`${selectedClient.prenom} n'a pas d'abonnement actif`);
                      } else {
                        showError("Veuillez d'abord sélectionner un client");
                      }
                    }}
                    disabled={!selectedClient || !Array.isArray(activeAbonnements) || activeAbonnements.length === 0}
                    className={`${sessionType === 'subscription' && Array.isArray(activeAbonnements) && activeAbonnements.length > 0
                      ? activeButtonClass
                      : buttonClass} ${!selectedClient || !Array.isArray(activeAbonnements) || activeAbonnements.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Star size={18} className="mr-2 inline-block" />
                    Abonnement
                    {Array.isArray(activeAbonnements) && activeAbonnements.length > 0 ? (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        isDarkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {activeAbonnements.length}
                      </span>
                    ) : null}
                  </button>
                </div>
                
                {/* Message explicatif pour mode abonnement */}
                {selectedClient && Array.isArray(activeAbonnements) && activeAbonnements.length > 0 && (
                  <div className={`mt-3 p-2 rounded-md ${
                    isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm flex items-start ${
                      isDarkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      <Star size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedClient.prenom} dispose {activeAbonnements.length > 1 ? 
                          `de ${activeAbonnements.length} abonnements actifs` : 
                          `d'un abonnement actif jusqu'au ${new Date(activeAbonnements[0].dateExpiration || activeAbonnements[0].date_fin_validite).toLocaleDateString('fr-FR')}`
                        }
                      </span>
                    </p>
                    {sessionType === 'subscription' && (
                      <p className={`text-xs mt-1 pl-6 ${
                        isDarkMode ? 'text-green-500' : 'text-green-600'
                      }`}>
                        La session sera démarrée avec l'abonnement
                      </p>
                    )}
                  </div>
                )}
                
                {selectedClient && (!Array.isArray(activeAbonnements) || activeAbonnements.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <AlertCircle size={14} className="mr-2 text-amber-500" />
                    Ce client ne dispose d'aucun abonnement actif
                  </p>
                )}
              </div>

              {/* Configuration de la durée */}
              <div className={cardClass}>
                <h3 className={`text-sm font-medium flex items-center mb-2 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Durée et heure de début
                </h3>
                
                <label className="block text-sm font-medium mb-2">
                  Durée (minutes)
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {durationOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDuration(option)}
                      className={duration === option 
                        ? `${activeButtonClass} text-sm py-1.5` 
                        : `${buttonClass} text-sm py-1.5`}
                    >
                      {option}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className={`${inputClass} w-24`}
                  />
                </div>
                
                {/* Heure de début */}
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500 inline-block" />
                  Heure de début
                </label>
                <input
                  type="datetime-local"
                  value={format(startTime, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setStartTime(new Date(e.target.value))}
                  className={inputClass}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pl-1">
                  {formattedStartTime}
                </p>
              </div>
            </div>
            
            {/* Colonne droite - Tarification et paiement */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <Calculator className="w-5 h-5" />
                Tarification et paiement
              </h3>

              {/* Résumé et prix */}
              <div className={cardClass}>
                <h3 className="font-medium mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2 text-blue-500" />
                  Estimation du coût
                </h3>
                
                {calculEnCours ? (
                  <div className="flex items-center justify-center p-6 my-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-500">Calcul en cours...</span>
                  </div>
                ) : prixCalcule ? (
                  <div className={`p-4 rounded-lg border-2 ${
                    isDarkMode ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Calculator className="w-5 h-5 text-green-600 mr-2" />
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'
                        }`}>
                          Plan tarifaire: {prixCalcule.planUtilise?.nom || 'Standard'}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300">Poste:</span>
                        <span className="font-medium">{poste?.nom || ''}</span>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300">Type:</span>
                        <span className="font-medium">{poste?.type_poste?.nom || ''}</span>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300">Tarif horaire:</span>
                        <span className="font-medium">
                          {poste?.type_poste?.tarif_horaire?.toFixed(2) || '0.00'} DH/h
                        </span>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300">Durée:</span>
                        <span className="font-medium">
                          {Math.floor(duration / 60)}h {duration % 60}min ({duration} min)
                        </span>
                      </li>
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300">Mode:</span>
                        <span className="font-medium">
                          {sessionType === 'subscription' ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center ${
                              isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                            }`}>
                              <Star size={12} className="mr-1" />
                              Abonnement
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}>Standard</span>
                          )}
                        </span>
                      </li>
                      <li className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-2 flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                          Prix total:
                        </span>
                        <span className={`text-lg font-bold ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          {prixCalcule.montantTotal?.toFixed(2) || '0.00'} DH
                        </span>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-6 my-2">
                    <Calculator className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">Calcul du prix en cours...</p>
                  </div>
                )}
              </div>

              {/* Paiement anticipé */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                    Options de paiement
                  </h3>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paiementAnticipe"
                      checked={paiementAnticipe}
                      onChange={(e) => setPaiementAnticipe(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="paiementAnticipe" className="ml-2 flex items-center space-x-2 cursor-pointer text-sm font-medium">
                      <span>
                        Paiement anticipé
                      </span>
                    </label>
                  </div>
                </div>

                {paiementAnticipe && prixCalcule ? (
                  <div className={`space-y-4 p-4 rounded-lg border ${
                    isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                  }`}>
                    {/* Mode de paiement */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-green-200' : 'text-green-800'
                      } flex items-center`}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Mode de paiement
                      </label>
                      <select
                        value={modePaiement}
                        onChange={(e) => setModePaiement(e.target.value)}
                        className={paymentInputClass}
                      >
                        <option value="ESPECES">💵 Espèces</option>
                        <option value="CARTE">💳 Carte</option>
                        <option value="VIREMENT">🏦 Virement</option>
                        <option value="CHEQUE">📄 Chèque</option>
                      </select>
                    </div>

                    {/* Montant à payer */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-green-200' : 'text-green-800'
                      } flex items-center`}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Montant à payer (DH)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={prixCalcule.montantTotal * 1.5}
                        value={montantPaye}
                        onChange={(e) => setMontantPaye(e.target.value)}
                        className={paymentInputClass}
                      />
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        Montant estimé: {prixCalcule.montantTotal.toFixed(2)} DH
                      </p>
                    </div>

                    {/* Marquer comme payée */}
                    <div className="flex items-center space-x-2 p-1">
                      <input
                        type="checkbox"
                        id="marquerCommePayee"
                        checked={marquerCommePayee}
                        onChange={(e) => setMarquerCommePayee(e.target.checked)}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="marquerCommePayee" className={`text-sm ${
                        isDarkMode ? 'text-green-200' : 'text-green-800'
                      }`}>
                        Marquer la session comme entièrement payée
                      </label>
                    </div>

                    {/* Résumé du paiement */}
                    <div className={`p-3 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">
                            Montant total:
                          </span>
                          <span className="font-medium">{prixCalcule.montantTotal.toFixed(2)} DH</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">
                            Montant payé:
                          </span>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {parseFloat(montantPaye || 0).toFixed(2)} DH
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-semibold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                          <span>
                            Reste à payer:
                          </span>
                          <span className={
                            (prixCalcule.montantTotal - parseFloat(montantPaye || 0)) <= 0 
                              ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                              : (isDarkMode ? 'text-red-400' : 'text-red-600')
                          }>
                            {Math.max(0, prixCalcule.montantTotal - parseFloat(montantPaye || 0)).toFixed(2)} DH
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : prixCalcule ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
                    <div className={`p-3 rounded-full mb-3 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-10 h-10 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Activez le paiement anticipé pour encaisser le montant avant le démarrage de la session
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      La session sera démarrée sans paiement enregistré
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
                    <div className={`p-3 rounded-full mb-3 animate-pulse ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-10 h-10 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Les options de paiement seront disponibles après le calcul du prix
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className={`sticky bottom-0 z-10 flex justify-end mt-8 pt-5 border-t px-6 pb-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-6 py-2.5 mr-4 border rounded-md hover:bg-opacity-80 transition-colors duration-200 flex items-center ${
                isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || calculEnCours || !prixCalcule}
              className={`px-6 py-2.5 rounded-md hover:bg-opacity-80 flex items-center justify-center min-w-[180px] transition-all duration-200 shadow-sm ${
                paiementAnticipe 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  {paiementAnticipe ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payer et démarrer
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Démarrer la session
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartSessionModal;
