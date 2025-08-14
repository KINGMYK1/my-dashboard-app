import React, { useState, useMemo } from 'react';
import { Search, Filter, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import PosteCard from '../../components/Sessions/PosteCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const PostesOverviewTab = ({ 
  postes = [], 
  onStartSession, 
  onStartSessionWithSubscription,
  onOpenSessionActions,
  getSessionProgress,
  formatCurrency,
  formatDuration,
  canManage = false
}) => {
  const { effectiveTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const isDarkMode = effectiveTheme === 'dark';

  // ✅ Helper pour déterminer le statut du poste avec session associée
  const getPosteStatus = (poste) => {
    if (poste.sessionActive) {
      if (poste.sessionActive.statut === 'EN_PAUSE') {
        return 'paused-session';
      } else {
        return 'active-session';
      }
    }

    switch (poste.etat) {
      case 'Disponible':
        return 'available';
      case 'Maintenance':
        return 'maintenance';
      case 'Hors_Service':
        return 'offline';
      default:
        return 'unknown';
    }
  };

  // ✅ Filtrer et rechercher les postes
  const filteredPostes = useMemo(() => {
    let filtered = postes;

    // Recherche par nom
    if (searchTerm) {
      filtered = filtered.filter(poste =>
        poste.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poste.typePoste?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(poste => {
        const status = getPosteStatus(poste);
        return status === filterStatus;
      });
    }

    return filtered;
  }, [postes, searchTerm, filterStatus]);

  const getBgColorClass = () => {
    return isDarkMode ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColorClass = () => {
    return isDarkMode ? 'border-gray-700' : 'border-gray-200';
  };

  const getTextColorClass = (isPrimary = false) => {
    return isDarkMode
      ? (isPrimary ? 'text-white' : 'text-gray-300')
      : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  };

  return (
    <div className="space-y-6">
      {/* ✅ Barre de recherche et filtres */}
      <div className={`p-4 rounded-lg ${getBgColorClass()} ${getBorderColorClass()} border`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Filtre par statut */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Tous les postes</option>
              <option value="available">Disponibles</option>
              <option value="active-session">Sessions actives</option>
              <option value="paused-session">Sessions en pause</option>
              <option value="maintenance">En maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ CORRECTION: Grille des postes avec PosteCard corrigé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPostes.map((poste) => (
          <PosteCard
            key={poste.id}
            poste={poste}
            session={poste.sessionActive} // ✅ CORRECTION: Passer la session
            onStartSession={() => onStartSession && onStartSession(poste)}
            onStartSessionWithSubscription={() => onStartSessionWithSubscription && onStartSessionWithSubscription(poste)}
            onSessionAction={(session) => onOpenSessionActions && onOpenSessionActions(session)} // ✅ CORRECTION
            formatCurrency={formatCurrency}
            formatDuration={formatDuration}
            canManage={canManage}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* ✅ Message si aucun poste */}
      {filteredPostes.length === 0 && (
        <div className={`text-center py-8 ${getTextColorClass()}`}>
          <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Aucun poste trouvé</p>
          <p className="text-sm text-gray-500">
            {searchTerm 
              ? 'Essayez de modifier votre recherche ou vos filtres' 
              : 'Aucun poste configuré pour le moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PostesOverviewTab;