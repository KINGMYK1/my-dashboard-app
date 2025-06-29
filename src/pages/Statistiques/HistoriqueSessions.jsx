import React, { useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Download, 
  Search, 
  Clock,
  User,
  Monitor,
  DollarSign
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, Button, Input, Select, DatePicker } from '../../components/ui';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const HistoriqueSessions = () => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  // États pour les filtres
  const [filters, setFilters] = useState({
    dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dateFin: new Date(),
    posteId: '',
    clientId: '',
    statut: '',
    search: '',
    page: 1,
    limit: 20
  });

  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({});

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'TERMINEE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'ANNULEE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'EN_PAUSE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    console.log('Export historique sessions');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Historique des Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consultez l'historique complet des sessions gaming
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <DatePicker
            value={filters.dateDebut}
            onChange={(date) => handleFilterChange('dateDebut', date)}
            placeholder="Date de début"
          />

          <DatePicker
            value={filters.dateFin}
            onChange={(date) => handleFilterChange('dateFin', date)}
            placeholder="Date de fin"
          />

          <Select
            value={filters.statut}
            onChange={(value) => handleFilterChange('statut', value)}
            placeholder="Statut"
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'EN_COURS', label: 'En cours' },
              { value: 'TERMINEE', label: 'Terminée' },
              { value: 'ANNULEE', label: 'Annulée' },
              { value: 'EN_PAUSE', label: 'En pause' }
            ]}
          />
        </div>
      </Card>

      {/* Tableau des sessions */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{session.numeroSession}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(session.dateHeureDebut).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {session.client ? 
                            `${session.client.prenom} ${session.client.nom}` : 
                            'Session anonyme'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Monitor className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {session.poste?.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDuration(session.dureeReelleMinutes || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(session.montantTotal)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.statut)}`}>
                        {session.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune session trouvée pour cette période</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            >
              Précédent
            </Button>
            
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Page {filters.page} sur {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueSessions;