import React from 'react';
import { Search, Filter, Calendar, User, Monitor, Clock, Euro, Eye, XCircle, Pause, Play } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'; // Assuming this component exists

const SessionsHistoriqueTab = ({
  sessions,
  loading,
  filters,
  setFilters,
  pagination,
  onPageChange,
  getTextColorClass,
  getBgColorClass,
  getBorderColorClass,
  getEtatColor, // Function to get status color based on status string
  getEtatIcon,  // Function to get status icon based on status string
  translations, // Translations object
  allPostes, // List of all postes for filtering
  allClients // List of all clients for filtering
}) => {
  // Helper to format date and time
  const formatDate = (dateString) => {
    if (!dateString) return translations?.notApplicable || 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to format duration from start to end, considering pauses
  const formatDuration = (debut, fin, tempsPause = 0) => {
    if (!fin) return translations?.inProgress || 'En cours';

    const start = new Date(debut);
    const end = new Date(fin);
    let diffMinutes = Math.floor((end - start) / (1000 * 60)); // Total minutes
    
    // Subtract pause time if recorded (assuming tempsPause is in hours for consistency with backend hook)
    const pauseMinutes = parseFloat(tempsPause || 0) * 60;
    diffMinutes = Math.max(0, diffMinutes - pauseMinutes);

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Helper to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(price || 0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // Reset to first page on filter change
  };

  // Get status color and icon for session status
  const getSessionStatusDisplay = (status) => {
    let colorClass = '';
    let icon = null;
    let label = '';

    switch (status) {
      case 'EN_COURS':
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        icon = <Play className="w-4 h-4" />;
        label = translations?.inProgress || 'En cours';
        break;
      case 'TERMINEE':
        colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        icon = <CheckCircle className="w-4 h-4" />;
        label = translations?.finished || 'Terminée';
        break;
      case 'ANNULEE':
        colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        icon = <XCircle className="w-4 h-4" />;
        label = translations?.cancelled || 'Annulée';
        break;
      case 'EN_PAUSE':
        colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        icon = <Pause className="w-4 h-4" />;
        label = translations?.paused || 'En pause';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        icon = <Eye className="w-4 h-4" />;
        label = translations?.unknown || 'Inconnu';
    }
    return { colorClass, icon, label };
  };

  return (
    <div className="p-4">
      {/* Filters and Search */}
      <div className={`mb-6 p-4 rounded-lg border ${getBorderColorClass()} ${getBgColorClass()}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Term */}
          <div>
            <label htmlFor="search" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <Search size={16} className="inline-block mr-1" /> {translations?.search || 'Rechercher'}
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={translations?.searchBySessionNumberClientPoste || 'N° session, client, poste...'}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statut" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <Filter size={16} className="inline-block mr-1" /> {translations?.status || 'Statut'}
            </label>
            <select
              id="statut"
              name="statut"
              value={filters.statut || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">{translations?.all || 'Tous'}</option>
              <option value="EN_COURS">{translations?.inProgress || 'En cours'}</option>
              <option value="TERMINEE">{translations?.finished || 'Terminée'}</option>
              <option value="ANNULEE">{translations?.cancelled || 'Annulée'}</option>
              <option value="EN_PAUSE">{translations?.paused || 'En pause'}</option>
            </select>
          </div>

          {/* Poste Filter */}
          <div>
            <label htmlFor="posteId" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <Monitor size={16} className="inline-block mr-1" /> {translations?.poste || 'Poste'}
            </label>
            <select
              id="posteId"
              name="posteId"
              value={filters.posteId || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">{translations?.all || 'Tous'}</option>
              {allPostes?.map(poste => (
                <option key={poste.id} value={poste.id}>{poste.nom}</option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <label htmlFor="clientId" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <User size={16} className="inline-block mr-1" /> {translations?.client || 'Client'}
            </label>
            <select
              id="clientId"
              name="clientId"
              value={filters.clientId || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">{translations?.all || 'Tous'}</option>
              {allClients?.map(client => (
                <option key={client.id} value={client.id}>{client.prenom} {client.nom} ({client.numeroClient})</option>
              ))}
            </select>
          </div>

          {/* Date Range (Optional) */}
          <div>
            <label htmlFor="dateDebut" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <Calendar size={16} className="inline-block mr-1" /> {translations?.startDate || 'Date de début'}
            </label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={filters.dateDebut || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <div>
            <label htmlFor="dateFin" className={`block text-sm font-medium mb-1 ${getTextColorClass(false)}`}>
              <Calendar size={16} className="inline-block mr-1" /> {translations?.endDate || 'Date de fin'}
            </label>
            <input
              type="date"
              id="dateFin"
              name="dateFin"
              value={filters.dateFin || ''}
              onChange={handleFilterChange}
              className={`w-full px-3 py-2 border rounded-lg ${getBorderColorClass()} ${getBgColorClass()} ${getTextColorClass(true)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text={translations?.loadingSessions || "Chargement des sessions..."} />
      ) : sessions.length === 0 ? (
        <div className={`text-center py-12 ${getTextColorClass(false)}`}>
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">
            {translations?.noSessionsFound || 'Aucune session trouvée avec ces filtres.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const { colorClass, icon: statusIcon, label: statusLabel } = getSessionStatusDisplay(session.statut);
            return (
              <div
                key={session.id}
                className={`p-5 rounded-lg border ${getBorderColorClass()} shadow-md ${getBgColorClass()} transition-all duration-300 hover:shadow-lg`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`font-bold ${getTextColorClass(true)} text-lg flex items-center`}>
                    <Monitor size={18} className="mr-2" />
                    {session.poste?.nom || session.Poste?.nom || translations?.unknownPoste || 'Poste inconnu'}
                    <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center ${colorClass}`}>
                      {statusIcon}
                      <span className="ml-1">{statusLabel}</span>
                    </span>
                  </h3>
                  <span className={`text-sm ${getTextColorClass(false)}`}>
                    {translations?.sessionNumber || 'N° Session'}: {session.numeroSession}
                  </span>
                </div>

                {/* Client Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <User size={16} className={`${getTextColorClass(false)}`} />
                  <p className={`text-base ${getTextColorClass(true)}`}>
                    {session.client?.prenom} {session.client?.nom} ({session.clientId === 1 ? (translations?.anonymous || 'Anonyme') : session.client?.numeroClient})
                  </p>
                </div>

                {/* Dates & Duration */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <div className={`font-semibold ${getTextColorClass(false)}`}>{translations?.startTime || 'Début'}</div>
                    <div className={`${getTextColorClass(true)}`}>{formatDate(session.dateHeureDebut)}</div>
                  </div>
                  <div>
                    <div className={`font-semibold ${getTextColorClass(false)}`}>{translations?.endTime || 'Fin'}</div>
                    <div className={`${getTextColorClass(true)}`}>
                      {session.dateHeureFin ? formatDate(session.dateHeureFin) : translations?.inProgress || 'En cours'}
                    </div>
                  </div>
                  <div>
                    <div className={`font-semibold ${getTextColorClass(false)}`}>{translations?.estimatedDuration || 'Durée estimée'}</div>
                    <div className={`${getTextColorClass(true)}`}>{session.dureeEstimee} {translations?.hoursShort || 'h'}</div>
                  </div>
                  <div>
                    <div className={`font-semibold ${getTextColorClass(false)}`}>{translations?.effectiveDuration || 'Durée effective'}</div>
                    <div className={`${getTextColorClass(true)}`}>
                      {formatDuration(session.dateHeureDebut, session.dateHeureFin, session.tempsPause)}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-300 dark:border-gray-700">
                  <div className={`font-semibold ${getTextColorClass(false)} flex items-center`}>
                    <Euro size={18} className="mr-1" />
                    {translations?.finalAmount || 'Montant final'}
                  </div>
                  <div className={`font-bold text-xl ${getTextColorClass(true)}`}>
                    {formatPrice(session.montantFinal)}
                  </div>
                </div>

                {/* Additional Info (Game, Notes, Payment, Subscription) */}
                {(session.jeuPrincipal || session.notes || session.modePaiement || session.abonnement) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                    {session.jeuPrincipal && (
                      <p className={`${getTextColorClass(false)}`}>
                        <strong>{translations?.game || 'Jeu'}:</strong> {session.jeuPrincipal}
                      </p>
                    )}
                    {session.modePaiement && (
                      <p className={`${getTextColorClass(false)}`}>
                        <strong>{translations?.paymentMode || 'Mode de paiement'}:</strong> {translations?.[session.modePaiement.toLowerCase()] || session.modePaiement}
                      </p>
                    )}
                    {session.abonnement && (
                      <p className={`${getTextColorClass(false)}`}>
                        <strong>{translations?.subscription || 'Abonnement'}:</strong> {session.abonnement.numeroAbonnement} ({session.abonnement.typeAbonnement?.nom})
                      </p>
                    )}
                    {session.notes && (
                      <p className={`${getTextColorClass(false)}`}>
                        <strong>{translations?.notes || 'Notes'}:</strong> {session.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.total > 0 && (
        <div className={`flex justify-center items-center space-x-4 mt-6 p-4 rounded-lg border ${getBorderColorClass()} ${getBgColorClass()}`}>
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={`px-4 py-2 text-sm border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(false)} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {translations?.previous || 'Précédent'}
          </button>
          <span className={`${getTextColorClass(true)} text-lg font-semibold`}>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className={`px-4 py-2 text-sm border ${getBorderColorClass()} rounded-lg ${getBgColorClass()} ${getTextColorClass(false)} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {translations?.next || 'Suivant'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionsHistoriqueTab;
