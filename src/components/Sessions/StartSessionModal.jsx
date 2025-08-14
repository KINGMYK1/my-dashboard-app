import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionActions, useStartSessionWithSubscription } from '../../hooks/useSessions';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { useNotification } from '../../contexts/NotificationContext';
import { usePayment } from '../../contexts/PaymentContext';
import PricingService from '../../services/pricingService';
import { Star, Clock, CreditCard, DollarSign, Check, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StartSessionModal = ({ isOpen, onClose, poste, onSessionStarted }) => {
  const [duration, setDuration] = useState(60); // Durée par défaut en minutes
  const [startTime, setStartTime] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState(null);
  // Variable non utilisée avec le dropdown
  const [_, setSearchTerm] = useState('');
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
  
  // Options de durée prédéfinies
  const durationOptions = [30, 60, 90, 120, 180, 240];
  
  // Formatage de l'heure de début pour affichage
  const formattedStartTime = useMemo(() => {
    return format(startTime, "dd MMMM yyyy à HH:mm", { locale: fr });
  }, [startTime]);
  
  // Suppression de la variable filteredClients qui n'est plus nécessaire
  
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
        notes: '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500"><path d="M15 5v14"></path><path d="M5 10h14"></path><path d="M5 18h14"></path></svg>
          Démarrer une session - {poste?.nom || ''}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Sélection du client - Colonne gauche */}
              <div className="bg-white dark:bg-gray-750 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <label className="flex items-center text-sm font-medium mb-2 dark:text-gray-200">
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                  Client (optionnel)
                </label>
                <div className="relative">
                  {/* Liste déroulante améliorée avec indication d'abonnement */}
                  <div className="relative">
                    <select 
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Affichage du client sélectionné */}
                  {selectedClient && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex justify-between items-center border border-blue-200 dark:border-blue-800">
                      <div className="flex flex-col">
                        <span className="font-medium dark:text-gray-200">
                          {selectedClient.nom} {selectedClient.prenom}
                        </span>
                        
                        {/* Affichage des informations d'abonnement */}
                        {Array.isArray(activeAbonnements) && activeAbonnements.length > 0 ? (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
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
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Type de session - Colonne gauche */}
              <div className="bg-white dark:bg-gray-750 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <label className="flex items-center text-sm font-medium mb-2 dark:text-gray-200">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Type de session
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSessionType('standard')}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                      sessionType === 'standard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Clock size={18} className="mr-2" />
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
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                      sessionType === 'subscription' && Array.isArray(activeAbonnements) && activeAbonnements.length > 0
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } ${!selectedClient || !Array.isArray(activeAbonnements) || activeAbonnements.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Star size={18} className="mr-2" />
                    Abonnement
                    {Array.isArray(activeAbonnements) && activeAbonnements.length > 0 ? (
                      <span className="ml-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeAbonnements.length}
                      </span>
                    ) : null}
                  </button>
                </div>
                
                {/* Message explicatif pour mode abonnement avec détails améliorés */}
                {selectedClient && Array.isArray(activeAbonnements) && activeAbonnements.length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-start">
                      <Star size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedClient.prenom} dispose {activeAbonnements.length > 1 ? 
                          `de ${activeAbonnements.length} abonnements actifs` : 
                          `d'un abonnement actif jusqu'au ${new Date(activeAbonnements[0].dateExpiration || activeAbonnements[0].date_fin_validite).toLocaleDateString('fr-FR')}`
                        }
                      </span>
                    </p>
                    {sessionType === 'subscription' && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-1 pl-6">
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
            </div>
            
            <div className="space-y-6">
              {/* Configuration de la session - Colonne droite */}
              <div className="bg-white dark:bg-gray-750 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Durée */}
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium mb-2 dark:text-gray-200">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Durée (minutes)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDuration(option)}
                        className={`px-3 py-1 rounded-md ${
                          duration === option
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
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
                      className="w-20 px-3 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Heure de début */}
                <div>
                  <label className="flex items-center text-sm font-medium mb-2 dark:text-gray-200">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Heure de début
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="datetime-local"
                      value={format(startTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setStartTime(new Date(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pl-1">
                    {formattedStartTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Résumé de la session et options de paiement */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Résumé et prix - Colonne gauche */}
            <div className="bg-white dark:bg-gray-750 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Résumé de la session
              </h3>
              
              {calculEnCours ? (
                <div className="flex items-center justify-center p-6 my-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-500">Calcul en cours...</span>
                </div>
              ) : prixCalcule ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                        </svg>
                        Poste:
                      </span>
                      <span className="font-medium">{poste?.nom || ''}</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Type:
                      </span>
                      <span className="font-medium">{poste?.type_poste?.nom || ''}</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Tarif horaire:
                      </span>
                      <span className="font-medium">
                        {poste?.type_poste?.tarif_horaire?.toFixed(2) || '0.00'} DH/h
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Durée:
                      </span>
                      <span className="font-medium">{duration} minutes</span>
                    </li>
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                        </svg>
                        Mode:
                      </span>
                      <span className="font-medium">
                        {sessionType === 'subscription' ? (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs flex items-center">
                            <Star size={12} className="mr-1" />
                            Abonnement
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">Standard</span>
                        )}
                      </span>
                    </li>
                    {selectedClient && (
                      <li className="flex justify-between items-center py-1">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          Client:
                        </span>
                        <span className="font-medium">{selectedClient.nom} {selectedClient.prenom}</span>
                      </li>
                    )}
                    <li className="flex justify-between items-center py-1">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Plan tarifaire:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {prixCalcule.planUtilise?.nom || 'Standard'}
                      </span>
                    </li>
                    <li className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-2 flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-200 font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Prix total:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {prixCalcule.montantTotal?.toFixed(2) || '0.00'} DH
                      </span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="text-center p-6 my-2">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500">Calcul du prix en cours...</p>
                </div>
              )}
            </div>
            
            {/* Paiement anticipé - Colonne droite */}
            <div className="bg-white dark:bg-gray-750 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
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
                    <span className="text-gray-700 dark:text-gray-200">
                      Paiement anticipé
                    </span>
                  </label>
                </div>
              </div>

              {paiementAnticipe && prixCalcule ? (
                <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800 dark:text-green-200 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Mode de paiement
                    </label>
                    <select
                      value={modePaiement}
                      onChange={(e) => setModePaiement(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="ESPECES">💵 Espèces</option>
                      <option value="CARTE">💳 Carte</option>
                      <option value="VIREMENT">🏦 Virement</option>
                      <option value="CHEQUE">📄 Chèque</option>
                    </select>
                  </div>

                  {/* Montant à payer */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-green-800 dark:text-green-200 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Montant à payer (DH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={prixCalcule.montantTotal * 1.5}
                      value={montantPaye}
                      onChange={(e) => setMontantPaye(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-lg font-semibold focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
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
                    <label htmlFor="marquerCommePayee" className="text-sm text-green-800 dark:text-green-200">
                      Marquer la session comme entièrement payée
                    </label>
                  </div>

                  {/* Résumé du paiement */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                          </svg>
                          Montant total:
                        </span>
                        <span className="font-medium">{prixCalcule.montantTotal.toFixed(2)} DH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Montant payé:
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {parseFloat(montantPaye || 0).toFixed(2)} DH
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-semibold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Reste à payer:
                        </span>
                        <span className={
                          (prixCalcule.montantTotal - parseFloat(montantPaye || 0)) <= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {Math.max(0, prixCalcule.montantTotal - parseFloat(montantPaye || 0)).toFixed(2)} DH
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : prixCalcule ? (
                <div className="flex flex-col items-center justify-center h-52 text-center p-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3">
                    <CreditCard className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Activez le paiement anticipé pour encaisser le montant avant le démarrage de la session
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    La session sera démarrée sans paiement enregistré
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-52 text-center p-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3 animate-pulse">
                    <CreditCard className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Les options de paiement seront disponibles après le calcul du prix
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bouton de soumission */}
          <div className="flex justify-end mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 mr-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || calculEnCours || !prixCalcule}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center min-w-[180px] transition-all duration-200 shadow-sm disabled:bg-gray-400 disabled:shadow-none disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (
                <>
                  {paiementAnticipe ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Payer et démarrer
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
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
