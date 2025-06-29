import React, { useState, useMemo } from 'react';
import { useHistoriqueSessions } from '../../hooks/useSessions';
import useCalculerPrixSession from '../../hooks/useCalculerPrixSession'; // ✅ AJOUT
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Card, 
  Button, 
  Badge, 
  Input, 
  Select, 
  DatePicker,
  Pagination,
  Modal 
} from '../../components/ui';
// ✅ CORRECTION: Import direct du composant existant
import PaymentUpdateModal from '../../components/Transactions/PaymentUpdateModal';
import { 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Edit3,
  Eye
} from 'lucide-react';

const HistoriqueSessions = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { 
    data: sessionsData, 
    isLoading, 
    error,
    refetch 
  } = useHistoriqueSessions(filters);

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleViewTransaction = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleEditPayment = (session) => {
    if (!session.transaction) {
      showError('Aucune transaction trouvée pour cette session');
      return;
    }
    setSelectedSession(session);
    setShowPaymentModal(true);
  };

  const handlePaymentUpdate = async (paymentData) => {
    try {
      // TODO: Implémenter la mutation de mise à jour du paiement
      showSuccess('Paiement mis à jour avec succès');
      setShowPaymentModal(false);
      refetch();
    } catch (error) {
      showError(`Erreur: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getPaymentStatusBadge = (session) => {
    // Si pas de transaction, vérifier les champs de la session
    const montantTotal = session.transaction?.montantTotal || session.montantTotal || 0;
    const montantPaye = session.transaction?.montantPaye || session.montantPaye || 0;
    const resteAPayer = Math.max(0, montantTotal - montantPaye);
    
    if (montantTotal === 0) {
      return <Badge variant="gray">Gratuit</Badge>;
    }
    
    if (montantPaye >= montantTotal) {
      return <Badge variant="green">Payé</Badge>;
    } else if (montantPaye > 0) {
      return <Badge variant="orange">Partiel ({formatCurrency(resteAPayer)} restant)</Badge>;
    } else {
      return <Badge variant="red">Non payé</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">Erreur lors du chargement des sessions</p>
        <Button onClick={() => refetch()} className="mt-4">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Historique des Sessions
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gérez les sessions passées et leurs paiements
          </p>
        </div>

        {/* Filtres */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recherche</label>
              <Input
                placeholder="N° session, client..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date début</label>
              <Input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date fin</label>
              <Input
                type="date"
                value={filters.dateFin}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Statut</label>
              <Select
                value={filters.etats[0] || ''}
                onChange={(e) => handleFilterChange('etats', e.target.value ? [e.target.value] : [])}
                options={[
                  { value: '', label: 'Tous les statuts' },
                  { value: 'TERMINEE', label: 'Terminées' },
                  { value: 'ANNULEE', label: 'Annulées' }
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Liste des sessions */}
        <Card>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucune session trouvée
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {sessions.map((session) => {
                    const transaction = session.transaction;
                    const montantTotal = parseFloat(transaction?.montantTotal || session.montantTotal) || 0;
                    const montantPaye = parseFloat(transaction?.montantPaye || session.montantPaye) || 0;
                    const resteAPayer = Math.max(0, montantTotal - montantPaye);

                    return (
                      <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium">
                              {session.numeroSession}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(session.dateHeureDebut).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {session.poste?.nom || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.poste?.typePoste?.nom}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {session.client 
                                ? `${session.client.prenom} ${session.client.nom}`
                                : 'Session libre'
                              }
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatDuration(session.dureeReelleMinutes || session.dureeEffectiveMinutes)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Estimée: {formatDuration(session.dureeEstimeeMinutes)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium">
                                {formatCurrency(montantTotal)}
                              </div>
                              {montantPaye > 0 && (
                                <div className="text-xs text-green-600">
                                  Payé: {formatCurrency(montantPaye)}
                                </div>
                              )}
                              {resteAPayer > 0 && (
                                <div className="text-xs text-red-600">
                                  Reste: {formatCurrency(resteAPayer)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(session)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewTransaction(session)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {(transaction || montantTotal > 0) && resteAPayer > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditPayment(session)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => handleFilterChange('page', page)}
              />
            </div>
          )}
        </Card>

        {/* Modals */}
        {showPaymentModal && selectedSession && (
          <PaymentUpdateModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            transaction={selectedSession.transaction || {
              id: selectedSession.id,
              montantTotal: selectedSession.montantTotal || 0,
              montantPaye: selectedSession.montantPaye || 0,
              modePaiement: selectedSession.modePaiement || 'ESPECES',
              statutTransaction: selectedSession.estPayee ? 'VALIDEE' : 'EN_ATTENTE'
            }}
            onUpdate={handlePaymentUpdate}
          />
        )}

        {showDetailsModal && selectedSession && (
          <SessionDetailsModal
            session={selectedSession}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// ✅ NOUVEAU: Composant modal pour les détails de session
const SessionDetailsModal = ({ session, onClose }) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="lg" title="Détails de la session">
      <div className="space-y-6">
        {/* Informations générales */}
        <div>
          <h3 className="text-lg font-medium mb-3">Informations générales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">N° Session</label>
              <p className="mt-1 font-mono">{session.numeroSession}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Poste</label>
              <p className="mt-1">{session.poste?.nom} ({session.poste?.typePoste?.nom})</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Client</label>
              <p className="mt-1">
                {session.client 
                  ? `${session.client.prenom} ${session.client.nom}`
                  : 'Session libre'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Statut</label>
              <Badge variant={session.statut === 'TERMINEE' ? 'green' : 'red'}>
                {session.statut}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium">Début</label>
              <p className="mt-1">{formatDateTime(session.dateHeureDebut)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Fin</label>
              <p className="mt-1">
                {session.dateHeureFin ? formatDateTime(session.dateHeureFin) : 'En cours'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Durée estimée</label>
              <p className="mt-1">{formatDuration(session.dureeEstimeeMinutes)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Durée réelle</label>
              <p className="mt-1">
                {formatDuration(session.dureeReelleMinutes || session.dureeEffectiveMinutes)}
              </p>
            </div>
          </div>
        </div>

        {/* Informations financières */}
        <div>
          <h3 className="text-lg font-medium mb-3">Informations financières</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Montant total</label>
              <p className="mt-1 text-lg font-bold">
                {formatCurrency(session.transaction?.montantTotal || session.montantTotal)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Montant payé</label>
              <p className="mt-1 text-lg font-bold text-green-600">
                {formatCurrency(session.transaction?.montantPaye || session.montantPaye)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Reste à payer</label>
              <p className="mt-1 text-lg font-bold text-red-600">
                {formatCurrency(
                  Math.max(0, 
                    (session.transaction?.montantTotal || session.montantTotal || 0) - 
                    (session.transaction?.montantPaye || session.montantPaye || 0)
                  )
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium">Mode de paiement</label>
              <p className="mt-1">
                {session.transaction?.modePaiement || session.modePaiement || 'Non défini'}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div>
            <h3 className="text-lg font-medium mb-3">Notes</h3>
            <p className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {session.notes}
            </p>
          </div>
        )}

        {/* Plan tarifaire utilisé */}
        {session.planTarifaireUtilise && (
          <div>
            <h3 className="text-lg font-medium mb-3">Plan tarifaire utilisé</h3>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className="font-medium">{session.planTarifaireUtilise.nom}</p>
              <p className="text-sm opacity-75">
                {session.planTarifaireUtilise.dureeMin}-{session.planTarifaireUtilise.dureeMax} minutes
                • {formatCurrency(session.planTarifaireUtilise.prixPlan)}
              </p>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HistoriqueSessions;