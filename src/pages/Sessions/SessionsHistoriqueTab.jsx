import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Download, Eye, Receipt, Wrench, 
  Calendar, Clock, User, Monitor, DollarSign,
  ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHistoriqueSessions } from '../../hooks/useSessions';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const SessionsHistoriqueTab = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    dateDebut: '',
    dateFin: '',
    etats: [],
    search: '',
    sortBy: 'dateHeureDebut',
    sortOrder: 'desc'
  });

  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ CORRECTION: Utilisation du hook avec filtres
  const { 
    data: sessionsData, 
    isLoading, 
    error,
    refetch 
  } = useHistoriqueSessions(filters);

  // ✅ AJOUT: Logs pour diagnostiquer les données reçues
  React.useEffect(() => {
    if (sessionsData && sessionsData.sessions) {
      console.log('📋 [HISTORIQUE] Sessions reçues:', sessionsData.sessions.length);
      console.log('📋 [HISTORIQUE] Première session exemple:', sessionsData.sessions[0]);
      console.log('📋 [HISTORIQUE] Toutes les sessions avec montants:', 
        sessionsData.sessions.map(s => ({
          id: s.id,
          numeroSession: s.numeroSession,
          montantTotal: s.montantTotal,
          montantPaye: s.montantPaye,
          estPayee: s.estPayee,
          statutPaiement: s.statutPaiement
        }))
      );
    }
  }, [sessionsData]);

  // ✅ CORRECTION: Fonctions helper pour les classes CSS
  const getTextColorClass = (isPrimary = false) => {
    return isDarkMode
      ? (isPrimary ? 'text-white' : 'text-gray-300')
      : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  };

  const getBgColorClass = () => {
    return isDarkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColorClass = () => {
    return isDarkMode ? 'border-gray-700' : 'border-gray-200';
  };

  const getCardHoverClass = () => {
    return isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50';
  };

  // ✅ CORRECTION: Extraction des données avec vérification
  const sessions = useMemo(() => {
    if (!sessionsData?.sessions) return [];
    return Array.isArray(sessionsData.sessions) ? sessionsData.sessions : [];
  }, [sessionsData]);

  const pagination = useMemo(() => {
    return sessionsData?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1
    };
  }, [sessionsData]);

  // ✅ CORRECTION: Gestion des filtres
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 }) // Reset page sauf si on change de page
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // ✅ CORRECTION: Reset des filtres
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      dateDebut: '',
      dateFin: '',
      etats: [],
      search: '',
      sortBy: 'dateHeureDebut',
      sortOrder: 'desc'
    });
  };

  // ✅ CORRECTION: Fonctions de formatage
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim();
    }
    return `${mins} min`;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0,00 MAD';
    return `${parseFloat(amount).toFixed(2)} MAD`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ CORRECTION: Badge d'état de session
  const getSessionStatusBadge = (statut) => {
    const statusConfig = {
      'EN_COURS': { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
        label: 'En cours' 
      },
      'TERMINEE': { 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', 
        label: 'Terminée' 
      },
      'ANNULEE': { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
        label: 'Annulée' 
      },
      'EN_PAUSE': { 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
        label: 'En pause' 
      }
    };

    const config = statusConfig[statut] || statusConfig['TERMINEE'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ✅ CORRECTION: Badge de paiement
  const getPaymentStatusBadge = (session) => {
    const montantTotal = parseFloat(session.montantTotal) || 0;
    const montantPaye = parseFloat(session.montantPaye) || 0;
    const resteAPayer = Math.max(0, montantTotal - montantPaye);

    // ✅ AJOUT: Logs pour diagnostiquer
    console.log('💰 [HISTORIQUE] Calcul statut paiement pour session:', {
      sessionId: session.id,
      numeroSession: session.numeroSession,
      montantTotal: session.montantTotal,
      montantPaye: session.montantPaye,
      estPayee: session.estPayee,
      montantTotalParsed: montantTotal,
      montantPayeParsed: montantPaye,
      resteAPayer,
      statutPaiement: session.statutPaiement
    });

    if (resteAPayer <= 0.01 && montantTotal > 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Payée
        </span>
      );
    } else if (montantPaye > 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
          Partiel
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Non payée
        </span>
      );
    }
  };

  // ✅ CORRECTION: Export des données
  const handleExport = () => {
    console.log('🎯 [HISTORIQUE] Export des sessions:', sessions);
    // TODO: Implémenter l'export CSV/Excel
  };

  // ✅ CORRECTION: Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Chargement de l'historique...</span>
      </div>
    );
  }

  // ✅ CORRECTION: Affichage des erreurs
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ CORRECTION: En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${getTextColorClass(true)}`}>
            Historique des Sessions
          </h2>
          <p className={`${getTextColorClass(false)} mt-1`}>
            {pagination.total} session(s) trouvée(s)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Exporter</span>
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ✅ CORRECTION: Filtres */}
      <div className={`p-4 rounded-lg border ${getBgColorClass()} ${getBorderColorClass()}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (poste, client...)"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* État des sessions */}
          <select
            value={filters.etats.join(',')}
            onChange={(e) => handleFilterChange('etats', e.target.value ? e.target.value.split(',') : [])}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Tous les états</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminées</option>
            <option value="ANNULEE">Annulées</option>
            <option value="EN_PAUSE">En pause</option>
          </select>

          {/* Date de début */}
          <input
            type="date"
            placeholder="Date de début"
            value={filters.dateDebut}
            onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />

          {/* Date de fin */}
          <input
            type="date"
            placeholder="Date de fin"
            value={filters.dateFin}
            onChange={(e) => handleFilterChange('dateFin', e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* ✅ Tri */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-sm ${getTextColorClass(false)}`}>Trier par:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={`px-3 py-1 border rounded ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="dateHeureDebut">Date de début</option>
            <option value="dureeReelleMinutes">Durée</option>
            <option value="montantTotal">Coût</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className={`px-3 py-1 border rounded ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>

      {/* ✅ CORRECTION: Tableau des sessions */}
      <div className={`rounded-lg border ${getBgColorClass()} ${getBorderColorClass()}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Session
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Client
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Durée
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  État
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Montants
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Paiement
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${getTextColorClass(false)} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${getBgColorClass()} divide-y divide-gray-200 dark:divide-gray-700`}>
              {sessions.map((session) => {
                const montantTotal = parseFloat(session.montantTotal) || 0;
                const montantPaye = parseFloat(session.montantPaye) || 0;
                const resteAPayer = Math.max(0, montantTotal - montantPaye);

                return (
                  <tr key={session.id} className={getCardHoverClass()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${getTextColorClass(true)}`}>
                          {session.poste?.nom || 'Poste inconnu'}
                        </div>
                        <div className={`text-sm ${getTextColorClass(false)}`}>
                          {formatDate(session.dateHeureDebut)}
                        </div>
                        <div className={`text-xs ${getTextColorClass(false)}`}>
                          #{session.numeroSession || session.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${getTextColorClass(true)}`}>
                        {session.client ? 
                          `${session.client.prenom} ${session.client.nom}` : 
                          'Client anonyme'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${getTextColorClass(true)}`}>
                        {formatDuration(session.dureeReelleMinutes || session.dureeEffectiveMinutes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSessionStatusBadge(session.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${getTextColorClass(true)}`}>
                          Total: {formatCurrency(montantTotal)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Payé: {formatCurrency(montantPaye)}
                        </div>
                        {resteAPayer > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            Reste: {formatCurrency(resteAPayer)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Générer reçu"
                      >
                        <Receipt size={16} />
                      </button>
                      <button
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Corriger session"
                      >
                        <Wrench size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ CORRECTION: Pagination */}
        {pagination.totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${getBorderColorClass()} flex items-center justify-between`}>
            <div className={`text-sm ${getTextColorClass(false)}`}>
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={`px-3 py-1 rounded ${
                  pagination.page <= 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <span className={`px-3 py-1 ${getTextColorClass(true)}`}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className={`px-3 py-1 rounded ${
                  pagination.page >= pagination.totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Message si aucune session */}
      {sessions.length === 0 && !isLoading && (
        <div className={`text-center py-8 ${getTextColorClass()}`}>
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Aucune session trouvée</p>
          <p className="text-sm text-gray-500">
            Essayez de modifier vos filtres ou critères de recherche
          </p>
        </div>
      )}

      {/* ✅ TODO: Modal de détails (à implémenter) */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full mx-4 p-6 rounded-lg ${getBgColorClass()}`}>
            <h3 className={`text-lg font-semibold mb-4 ${getTextColorClass(true)}`}>
              Détails de la session #{selectedSession.numeroSession || selectedSession.id}
            </h3>
            {/* Contenu des détails */}
            <div className="space-y-4">
              <p>Poste: {selectedSession.poste?.nom}</p>
              <p>Date: {formatDate(selectedSession.dateHeureDebut)}</p>
              <p>Durée: {formatDuration(selectedSession.dureeReelleMinutes)}</p>
              <p>Montant: {formatCurrency(selectedSession.montantTotal)}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsHistoriqueTab;
