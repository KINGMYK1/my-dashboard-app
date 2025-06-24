import React, { useState, useMemo } from 'react';
import { useSessionsHistory } from '../../hooks/useSessions';
import { Card, Button, Input, Select, DatePicker, Pagination, Badge, Spinner } from '../../components/ui';
import { Search, Filter, Download, Eye, Receipt, Wrench } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SessionDetailsModal from './SessionDetailsModal';
import SessionCorrectionModal from './SessionCorrectionModal';

const HistoriqueSessions = () => {
  const { translations } = useLanguage();
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
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  // ✅ CORRECTION: Utilisation du hook avec filtres
  const { 
    data: sessionsData, 
    isLoading, 
    error,
    refetch 
  } = useSessionsHistory(filters);

  // ✅ CORRECTION: Extraction des données avec vérification
  const sessions = useMemo(() => {
    if (!sessionsData?.data) return [];
    return Array.isArray(sessionsData.data) ? sessionsData.data : [];
  }, [sessionsData]);

  const pagination = useMemo(() => {
    return sessionsData?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
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

  // ✅ CORRECTION: Fonction pour formater la durée
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim();
    }
    return `${mins} min`;
  };

  // ✅ CORRECTION: Fonction pour formater les montants
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0,00 DH';
    return `${parseFloat(amount).toFixed(2)} DH`;
  };

  // ✅ CORRECTION: Fonction pour obtenir le badge d'état de session
  const getSessionStatusBadge = (session) => {
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

    const config = statusConfig[session.etatSession] || statusConfig['TERMINEE'];
    
    return (
      <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  // ✅ CORRECTION: Fonction pour obtenir le badge de paiement avec calculs corrects
  const getPaymentStatusBadge = (session) => {
    if (!session.transaction) {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
          Pas de transaction
        </Badge>
      );
    }

    const { transaction } = session;
    const montantTotal = parseFloat(transaction.montantTotal) || 0;
    const montantPaye = parseFloat(transaction.montantPaye) || 0;
    const resteAPayer = parseFloat(transaction.resteAPayer) || 0;

    // ✅ CORRECTION CRITIQUE: Vérifier la cohérence des montants
    let actualResteAPayer = resteAPayer;
    if (montantTotal > 0 && Math.abs(resteAPayer - (montantTotal - montantPaye)) > 0.01) {
      actualResteAPayer = Math.max(0, montantTotal - montantPaye);
      console.warn('⚠️ [HISTORIQUE] Recalcul du reste à payer:', {
        sessionId: session.id,
        montantTotal,
        montantPaye,
        resteAPayer,
        actualResteAPayer
      });
    }

    if (actualResteAPayer <= 0.01) {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Payée intégralement
        </Badge>
      );
    } else if (montantPaye > 0) {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
          Paiement partiel
        </Badge>
      );
    } else {
      return (
        <Badge className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Non payée
        </Badge>
      );
    }
  };

  // ✅ CORRECTION: Fonction pour ouvrir les détails d'une session
  const handleOpenDetails = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  // ✅ CORRECTION: Fonction pour ouvrir la correction d'une session
  const handleOpenCorrection = (session) => {
    setSelectedSession(session);
    setShowCorrectionModal(true);
  };

  // ✅ CORRECTION: Export des données
  const handleExport = () => {
    // TODO: Implémenter l'export CSV/Excel
    console.log('🎯 [HISTORIQUE] Export des sessions:', sessions);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Chargement de l'historique...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement: {error.message}</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historique des Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pagination.totalItems} session(s) trouvée(s)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Exporter</span>
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* ✅ CORRECTION: Filtres améliorés */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher (poste, client...)"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* État des sessions */}
          <Select
            placeholder="État de session"
            value={filters.etats}
            onChange={(value) => handleFilterChange('etats', value)}
            multiple
            options={[
              { value: 'EN_COURS', label: 'En cours' },
              { value: 'TERMINEE', label: 'Terminée' },
              { value: 'ANNULEE', label: 'Annulée' },
              { value: 'EN_PAUSE', label: 'En pause' }
            ]}
          />

          {/* Date de début */}
          <DatePicker
            placeholder="Date de début"
            value={filters.dateDebut}
            onChange={(date) => handleFilterChange('dateDebut', date)}
          />

          {/* Date de fin */}
          <DatePicker
            placeholder="Date de fin"
            value={filters.dateFin}
            onChange={(date) => handleFilterChange('dateFin', date)}
          />
        </div>

        {/* Tri */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Trier par:</span>
          <Select
            value={filters.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
            options={[
              { value: 'dateHeureDebut', label: 'Date de début' },
              { value: 'dureeEffectiveMinutes', label: 'Durée' },
              { value: 'coutCalculeFinal', label: 'Coût' }
            ]}
            className="w-40"
          />
          <Select
            value={filters.sortOrder}
            onChange={(value) => handleFilterChange('sortOrder', value)}
            options={[
              { value: 'desc', label: 'Décroissant' },
              { value: 'asc', label: 'Croissant' }
            ]}
            className="w-32"
          />
        </div>
      </Card>

      {/* ✅ CORRECTION: Tableau des sessions avec calculs corrects */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Montants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => {
                // ✅ CORRECTION: Calculs de montants corrects
                const transaction = session.transaction;
                const montantTotal = transaction ? parseFloat(transaction.montantTotal) || 0 : 0;
                const montantPaye = transaction ? parseFloat(transaction.montantPaye) || 0 : 0;
                const resteAPayer = transaction ? Math.max(0, montantTotal - montantPaye) : 0;

                return (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.poste?.nomPoste || 'Poste inconnu'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(session.dateHeureDebut).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {session.client ? 
                          `${session.client.prenom} ${session.client.nom}` : 
                          'Client anonyme'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(session.dureeEffectiveMinutes)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSessionStatusBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Total: {formatCurrency(montantTotal)}
                        </div>
                        {transaction && (
                          <>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Payé: {formatCurrency(montantPaye)}
                            </div>
                            {resteAPayer > 0 && (
                              <div className="text-xs text-red-600 dark:text-red-400">
                                Reste: {formatCurrency(resteAPayer)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(session)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleOpenDetails(session)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </Button>
                      {transaction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                        >
                          <Receipt size={16} />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleOpenCorrection(session)}
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Wrench size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ✅ CORRECTION: Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={pagination.totalItems}
            />
          </div>
        )}
      </Card>

      {/* ✅ CORRECTION: Modales */}
      {showDetailsModal && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSession(null);
          }}
        />
      )}

      {showCorrectionModal && selectedSession && (
        <SessionCorrectionModal
          session={selectedSession}
          isOpen={showCorrectionModal}
          onClose={() => {
            setShowCorrectionModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            refetch();
            setShowCorrectionModal(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};

export default HistoriqueSessions;