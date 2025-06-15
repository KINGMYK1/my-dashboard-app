import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Gamepad2, 
  FileText, 
  Activity, 
  Clock, 
  DollarSign,
  TrendingUp,
  MessageSquare,
  Plus,
  Shield,
  ShieldCheck,
  Badge,
  Star,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  useClient,
  useClientStatistiques,
  useAddClientNote, // ✅ CORRIGÉ: Import correct
  useClientNotes
} from '../../hooks/useClients';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Portal from '../../components/Portal/Portal';

const ClientDetails = ({ clientId, onClose, onEdit }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // États locaux
  const [activeTab, setActiveTab] = useState('general');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Hooks de données
  const { data: clientData, isLoading: isLoadingClient, error: clientError } = useClient(clientId);
  const { data: statsData, isLoading: isLoadingStats } = useClientStatistiques(clientId);
  const { data: notesData, isLoading: isLoadingNotes, refetch: refetchNotes } = useClientNotes(clientId, { 
    page: 1, 
    limit: 10 
  });

  // Mutations
  const addNoteMutation = useAddClientNote();

  const client = clientData?.data;
  const stats = statsData?.data;
  const notes = notesData?.data || [];

  // Styles dynamiques
  const getTextColorClass = (isPrimary) => isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]');
  const getBgClass = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getBorderClass = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getCardBgClass = () => isDarkMode ? 'bg-gray-750' : 'bg-gray-50';
  const getInputBgClass = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const getInputTextClass = () => isDarkMode ? 'text-white' : 'text-gray-800';
  const getPlaceholderClass = () => isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const getFocusRingClass = () => isDarkMode ? 'focus:ring-purple-500' : 'focus:ring-blue-500';
  const getTabActiveClass = () => isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white';
  const getTabInactiveClass = () => isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';

  // Fonction pour formater la devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  // Fonction pour formater la durée
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // ✅ MODIFIÉ: Fonction pour obtenir le badge du type de client
  const getClientTypeBadge = (client) => {
    if (!client) return null;
    
    if (client.isSystemClient) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Client Système
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <User className="w-3 h-3 mr-1" />
        Client Normal
      </span>
    );
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (isActive) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    if (isActive) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Actif
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          Inactif
        </span>
      );
    }
  };

  // Gestion de l'ajout de note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      await addNoteMutation.mutateAsync({
        clientId: clientId,
        noteData: {
          contenu: newNote.trim(),
          type: 'MANUELLE'
        }
      });
      
      setNewNote('');
      setShowAddNote(false);
      refetchNotes();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Gestion du chargement
  if (isLoadingClient) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${getBgClass()} rounded-lg p-8`}>
            <LoadingSpinner />
          </div>
        </div>
      </Portal>
    );
  }

  // Gestion d'erreur
  if (clientError || !client) {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${getBgClass()} rounded-lg p-8 max-w-md w-full`}>
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-2`}>
                {translations?.errorLoadingClient || 'Erreur de chargement'}
              </h3>
              <p className={`${getTextColorClass(false)} mb-4`}>
                {clientError?.message || translations?.clientNotFound || 'Client introuvable'}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                {translations?.close || 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  const tabs = [
    { id: 'general', label: translations?.generalInfo || 'Informations Générales', icon: User },
    { id: 'stats', label: translations?.statistics || 'Statistiques', icon: TrendingUp },
    { id: 'notes', label: translations?.notes || 'Notes', icon: MessageSquare }
  ];

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${getBgClass()} rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 ${getBorderClass()} border-b`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${client.isSystemClient ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                {client.isSystemClient ? (
                  <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                ) : (
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${getTextColorClass(true)}`}>
                  {client.prenom} {client.nom}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {getClientTypeBadge(client)}
                  {getStatusBadge(client.estActif)}
                  <span className={`text-sm ${getTextColorClass(false)}`}>
                    #{client.numeroClient}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!client.isSystemClient && onEdit && (
                <button
                  onClick={() => onEdit(client)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  {translations?.edit || 'Modifier'}
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${getBorderClass()}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id ? getTabActiveClass() : getTabInactiveClass()
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            {/* Onglet Informations Générales */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* ✅ NOUVEAU: Message d'information pour les clients système */}
                {client.isSystemClient && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          <strong>Client Système:</strong> Ce client est utilisé automatiquement pour les sessions anonymes et les opérations système.
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                          Les informations de ce client ne peuvent pas être modifiées.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-4 flex items-center`}>
                      <User className="mr-2" size={20} />
                      {translations?.personalInfo || 'Informations Personnelles'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className={`${getTextColorClass(false)}`} size={16} />
                        <div>
                          <p className={`text-sm ${getTextColorClass(false)}`}>
                            {translations?.fullName || 'Nom complet'}
                          </p>
                          <p className={`font-medium ${getTextColorClass(true)}`}>
                            {client.prenom} {client.nom}
                          </p>
                        </div>
                      </div>

                      {client.dateNaissance && (
                        <div className="flex items-center space-x-3">
                          <Calendar className={`${getTextColorClass(false)}`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.birthDate || 'Date de naissance'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {new Date(client.dateNaissance).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      )}

                      {client.pseudoPrefere && (
                        <div className="flex items-center space-x-3">
                          <Gamepad2 className={`${getTextColorClass(false)}`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.preferredPseudo || 'Pseudo préféré'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {client.pseudoPrefere}
                            </p>
                          </div>
                        </div>
                      )}

                      {client.sourceAcquisition && (
                        <div className="flex items-center space-x-3">
                          <Star className={`${getTextColorClass(false)}`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.acquisitionSource || 'Source d\'acquisition'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {client.sourceAcquisition}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <Calendar className={`${getTextColorClass(false)}`} size={16} />
                        <div>
                          <p className={`text-sm ${getTextColorClass(false)}`}>
                            {translations?.memberSince || 'Membre depuis'}
                          </p>
                          <p className={`font-medium ${getTextColorClass(true)}`}>
                            {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-4 flex items-center`}>
                      <Mail className="mr-2" size={20} />
                      {translations?.contactInfo || 'Informations de Contact'}
                    </h3>
                    <div className="space-y-3">
                      {client.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className={`${getTextColorClass(false)}`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.email || 'Email'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {client.email}
                            </p>
                          </div>
                        </div>
                      )}

                      {client.telephone && (
                        <div className="flex items-center space-x-3">
                          <Phone className={`${getTextColorClass(false)}`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.phone || 'Téléphone'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {client.telephone}
                            </p>
                          </div>
                        </div>
                      )}

                      {client.adresse && (
                        <div className="flex items-start space-x-3">
                          <MapPin className={`${getTextColorClass(false)} mt-1`} size={16} />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.address || 'Adresse'}
                            </p>
                            <p className={`font-medium ${getTextColorClass(true)}`}>
                              {client.adresse}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Jeux préférés */}
                {client.jeuxPreferes && client.jeuxPreferes.length > 0 && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-4 flex items-center`}>
                      <Gamepad2 className="mr-2" size={20} />
                      {translations?.preferredGames || 'Jeux Préférés'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {client.jeuxPreferes.map((jeu, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {jeu}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {client.notes && (
                  <div className={`${getCardBgClass()} rounded-lg p-6`}>
                    <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-4 flex items-center`}>
                      <FileText className="mr-2" size={20} />
                      {translations?.notes || 'Notes'}
                    </h3>
                    <p className={`${getTextColorClass(false)} whitespace-pre-wrap`}>
                      {client.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {isLoadingStats ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : stats ? (
                  <>
                    {/* Statistiques générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`${getCardBgClass()} rounded-lg p-4`}>
                        <div className="flex items-center">
                          <Activity className="h-8 w-8 text-blue-500 mr-3" />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.totalSessions || 'Sessions totales'}
                            </p>
                            <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                              {stats.nombreSessionsTotales || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`${getCardBgClass()} rounded-lg p-4`}>
                        <div className="flex items-center">
                          <Clock className="h-8 w-8 text-green-500 mr-3" />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.totalPlayTime || 'Temps de jeu total'}
                            </p>
                            <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                              {formatDuration(stats.tempsJeuTotal || 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`${getCardBgClass()} rounded-lg p-4`}>
                        <div className="flex items-center">
                          <DollarSign className="h-8 w-8 text-yellow-500 mr-3" />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.totalSpent || 'Total dépensé'}
                            </p>
                            <p className={`text-2xl font-bold ${getTextColorClass(true)}`}>
                              {formatCurrency(stats.montantDepenseTotal || 0)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className={`${getCardBgClass()} rounded-lg p-4`}>
                        <div className="flex items-center">
                          <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.lastVisit || 'Dernière visite'}
                            </p>
                            <p className={`text-lg font-bold ${getTextColorClass(true)}`}>
                              {stats.derniereVisite ? 
                                new Date(stats.derniereVisite).toLocaleDateString('fr-FR') : 
                                'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ✅ NOUVEAU: Statistiques avancées si disponibles */}
                    {stats.abonnementsActifs && (
                      <div className={`${getCardBgClass()} rounded-lg p-6`}>
                        <h3 className={`text-lg font-medium ${getTextColorClass(true)} mb-4`}>
                          {translations?.subscriptions || 'Abonnements'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.activeSubscriptions || 'Abonnements actifs'}
                            </p>
                            <p className={`text-xl font-bold ${getTextColorClass(true)}`}>
                              {stats.abonnementsActifs}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.expiredSubscriptions || 'Abonnements expirés'}
                            </p>
                            <p className={`text-xl font-bold ${getTextColorClass(true)}`}>
                              {stats.abonnementsExpires || 0}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${getTextColorClass(false)}`}>
                              {translations?.totalSubscriptions || 'Total abonnements'}
                            </p>
                            <p className={`text-xl font-bold ${getTextColorClass(true)}`}>
                              {stats.totalAbonnements || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className={`${getTextColorClass(false)}`}>
                      {translations?.noStatsAvailable || 'Aucune statistique disponible'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Bouton d'ajout de note (sauf pour le client système) */}
                {!client.isSystemClient && (
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-medium ${getTextColorClass(true)}`}>
                      {translations?.clientNotes || 'Notes du client'}
                    </h3>
                    <button
                      onClick={() => setShowAddNote(!showAddNote)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                    >
                      <Plus size={16} />
                      <span>{translations?.addNote || 'Ajouter une note'}</span>
                    </button>
                  </div>
                )}

                {/* Formulaire d'ajout de note */}
                {showAddNote && (
                  <div className={`${getCardBgClass()} rounded-lg p-4`}>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={translations?.noteContent || 'Contenu de la note...'}
                      className={`w-full p-3 rounded-md ${getInputBgClass()} ${getInputTextClass()} ${getBorderClass()} border ${getPlaceholderClass()} focus:outline-none focus:ring-2 ${getFocusRingClass()} resize-vertical`}
                      rows="3"
                      maxLength={1000}
                      disabled={isAddingNote}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs ${getTextColorClass(false)}`}>
                        {newNote.length}/1000
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setShowAddNote(false);
                            setNewNote('');
                          }}
                          className={`px-3 py-1 text-sm ${getTextColorClass(false)} hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors`}
                          disabled={isAddingNote}
                        >
                          {translations?.cancel || 'Annuler'}
                        </button>
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || isAddingNote}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingNote ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Save size={14} />
                          )}
                          <span>{translations?.save || 'Sauvegarder'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liste des notes */}
                {isLoadingNotes ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className={`${getCardBgClass()} rounded-lg p-4`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className={`${getTextColorClass(false)}`} size={16} />
                            <span className={`text-sm font-medium ${getTextColorClass(true)}`}>
                              {note.type === 'AUTOMATIQUE' ? 'Note automatique' : 'Note manuelle'}
                            </span>
                          </div>
                          <span className={`text-xs ${getTextColorClass(false)}`}>
                            {new Date(note.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className={`${getTextColorClass(false)} whitespace-pre-wrap`}>
                          {note.contenu}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className={`${getTextColorClass(false)}`}>
                      {translations?.noNotesYet || 'Aucune note pour ce client'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ClientDetails;