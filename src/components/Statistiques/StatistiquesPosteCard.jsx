import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  Info,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStatistiquesPosteDetaillees } from '../../hooks/useStatistiques';
import { 
  formatDuree, 
  formatMontant, 
  formatPourcentage, 
  getCouleursPerformance,
  getCouleursAlerte,
  calculerTauxCroissance
} from '../../utils/statistiquesUtils';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const StatistiquesPosteCard = ({ 
  posteId, 
  dateDebut = null, 
  dateFin = null,
  periodeComparaison = null,
  showDetails = true 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  const [expandedSection, setExpandedSection] = useState(null);

  const { 
    data: statistiques, 
    isLoading, 
    error 
  } = useStatistiquesPosteDetaillees(posteId, {
    dateDebut,
    dateFin,
    periodeComparaison
  });

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertTriangle size={20} />
          <span>{error.message || 'Erreur lors du chargement des statistiques'}</span>
        </div>
      </div>
    );
  }

  if (!statistiques?.data) {
    return null;
  }

  const { poste, statistiquesGlobales, statistiquesPeriode, comparaison, predictions, alertes } = statistiques.data;

  // Styles dynamiques
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`${cardBg} ${borderColor} border rounded-lg shadow-lg overflow-hidden`}>
      {/* En-tête du poste */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-bold ${textPrimary}`}>{poste.nom}</h3>
            <p className={`text-sm ${textSecondary}`}>
              {poste.typePoste} • Position: {poste.position}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${textPrimary}`}>
              {formatMontant(poste.tarifHoraire)}/h
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              poste.etat === 'Disponible' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : poste.etat === 'Occupé'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            }`}>
              {poste.etat}
            </span>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetriqueCard
            icon={Clock}
            title="Heures d'utilisation"
            value={formatDuree(statistiquesPeriode.tempsTotalUtiliseMinutes)}
            comparison={comparaison ? calculerTauxCroissance(
              statistiquesPeriode.tempsTotalUtiliseMinutes,
              comparaison.statistiques.tempsTotalUtiliseMinutes
            ) : null}
            isDarkMode={isDarkMode}
          />
          
          <MetriqueCard
            icon={DollarSign}
            title="Revenus"
            value={formatMontant(statistiquesPeriode.revenus)}
            comparison={comparaison ? calculerTauxCroissance(
              statistiquesPeriode.revenus,
              comparaison.statistiques.revenus
            ) : null}
            isDarkMode={isDarkMode}
          />
          
          <MetriqueCard
            icon={Users}
            title="Sessions"
            value={statistiquesPeriode.nombreSessions}
            comparison={comparaison ? calculerTauxCroissance(
              statistiquesPeriode.nombreSessions,
              comparaison.statistiques.nombreSessions
            ) : null}
            isDarkMode={isDarkMode}
          />
          
          <MetriqueCard
            icon={Activity}
            title="Taux d'occupation"
            value={formatPourcentage(statistiquesPeriode.tauxOccupation)}
            comparison={comparaison ? (
              statistiquesPeriode.tauxOccupation - comparaison.statistiques.tauxOccupation
            ) : null}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Alertes */}
      {alertes && alertes.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Alertes</h4>
          <div className="space-y-2">
            {alertes.slice(0, 3).map((alerte, index) => (
              <AlerteItem key={index} alerte={alerte} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      )}

      {/* Sections détaillées */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <SectionDetaillee
            title="Analyse temporelle"
            isExpanded={expandedSection === 'temps'}
            onToggle={() => toggleSection('temps')}
            isDarkMode={isDarkMode}
          >
            <AnalyseTemporelle 
              creneauxHoraires={statistiquesPeriode.creneauxHoraires}
              isDarkMode={isDarkMode}
            />
          </SectionDetaillee>

          <SectionDetaillee
            title="Analyse clients"
            isExpanded={expandedSection === 'clients'}
            onToggle={() => toggleSection('clients')}
            isDarkMode={isDarkMode}
          >
            <AnalyseClients 
              analyseClients={statistiquesPeriode.analyseClients}
              isDarkMode={isDarkMode}
            />
          </SectionDetaillee>

          {predictions && (
            <SectionDetaillee
              title="Prédictions"
              isExpanded={expandedSection === 'predictions'}
              onToggle={() => toggleSection('predictions')}
              isDarkMode={isDarkMode}
            >
              <Predictions predictions={predictions} isDarkMode={isDarkMode} />
            </SectionDetaillee>
          )}
        </div>
      )}
    </div>
  );
};

// Composant pour une métrique
const MetriqueCard = ({ icon: Icon, title, value, comparison, isDarkMode }) => {
  const cardBg = isDarkMode ? 'bg-gray-750' : 'bg-gray-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${cardBg} p-4 rounded-lg`}>
      <div className="flex items-center space-x-3">
        <Icon size={20} className={`${textSecondary}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs ${textSecondary} truncate`}>{title}</p>
          <p className={`text-lg font-semibold ${textPrimary}`}>{value}</p>
          {comparison !== null && (
            <div className="flex items-center space-x-1">
              {comparison > 0 ? (
                <TrendingUp size={12} className="text-green-500" />
              ) : comparison < 0 ? (
                <TrendingDown size={12} className="text-red-500" />
              ) : null}
              <span className={`text-xs ${
                comparison > 0 ? 'text-green-500' : 
                comparison < 0 ? 'text-red-500' : 
                textSecondary
              }`}>
                {comparison > 0 ? '+' : ''}{formatPourcentage(comparison, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour les alertes
const AlerteItem = ({ alerte, isDarkMode }) => {
  const couleurs = getCouleursAlerte(alerte.type, alerte.priorite);
  
  return (
    <div className={`p-3 rounded-lg ${couleurs.bg} ${couleurs.border} border`}>
      <div className="flex items-start space-x-2">
        <AlertTriangle size={16} className={couleurs.icon} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${couleurs.text}`}>{alerte.titre}</p>
          <p className={`text-xs ${couleurs.text} opacity-80`}>{alerte.message}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${couleurs.bg} ${couleurs.text}`}>
          {alerte.priorite}
        </span>
      </div>
    </div>
  );
};

// Composant pour les sections détaillées
const SectionDetaillee = ({ title, isExpanded, onToggle, children, isDarkMode }) => {
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const hoverBg = isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50';

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 text-left ${hoverBg} transition-colors`}
      >
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium ${textPrimary}`}>{title}</h4>
          <BarChart3 
            size={16} 
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="px-6 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Composant pour l'analyse temporelle
const AnalyseTemporelle = ({ creneauxHoraires, isDarkMode }) => {
  if (!creneauxHoraires) return null;

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-4">
      <div>
        <h5 className={`text-sm font-medium ${textPrimary} mb-2`}>Créneaux les plus actifs</h5>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(creneauxHoraires.parCreneau).map(([creneau, data]) => (
            <div key={creneau} className="flex justify-between">
              <span className={textSecondary}>{creneau}</span>
              <span className={textPrimary}>{data.sessions} sessions</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <p className={`text-sm ${textSecondary}`}>
          📅 Jour le plus actif: <span className={textPrimary}>{creneauxHoraires.jourLePlusActif}</span>
        </p>
        <p className={`text-sm ${textSecondary}`}>
          ⏰ Créneau le plus actif: <span className={textPrimary}>{creneauxHoraires.creneauLePlusActif}</span>
        </p>
      </div>
    </div>
  );
};

// Composant pour l'analyse des clients
const AnalyseClients = ({ analyseClients, isDarkMode }) => {
  if (!analyseClients) return null;

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-xs ${textSecondary}`}>Clients uniques</p>
          <p className={`text-lg font-semibold ${textPrimary}`}>{analyseClients.clientsUniques}</p>
        </div>
        <div>
          <p className={`text-xs ${textSecondary}`}>Taux fidélité</p>
          <p className={`text-lg font-semibold ${textPrimary}`}>
            {formatPourcentage(analyseClients.tauxClienteleFidele)}
          </p>
        </div>
      </div>

      {analyseClients.clientLePlusFidele && (
        <div>
          <h6 className={`text-sm font-medium ${textPrimary} mb-2`}>Client le plus fidèle</h6>
          <div className={`p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
            <p className={`text-sm font-medium ${textPrimary}`}>
              {analyseClients.clientLePlusFidele.nom}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {analyseClients.clientLePlusFidele.sessions} sessions • {formatMontant(analyseClients.clientLePlusFidele.revenus)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les prédictions
const Predictions = ({ predictions, isDarkMode }) => {
  if (!predictions) return null;

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className={`text-xs ${textSecondary}`}>Revenus estimés</p>
          <p className={`text-lg font-semibold ${textPrimary}`}>
            {formatMontant(predictions.prochaineSemaine.revenusEstimes)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${textSecondary}`}>Sessions estimées</p>
          <p className={`text-lg font-semibold ${textPrimary}`}>
            {predictions.prochaineSemaine.sessionsEstimees}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${textSecondary}`}>Tendance:</span>
        <span className={`text-sm font-medium ${textPrimary} flex items-center space-x-1`}>
          <span>{predictions.prochaineSemaine.tendance}</span>
          <span>{predictions.prochaineSemaine.tendance === 'croissante' ? '📈' : 
                 predictions.prochaineSemaine.tendance === 'decroissante' ? '📉' : '➡️'}</span>
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-sm ${textSecondary}`}>Fiabilité:</span>
        <span className={`text-sm px-2 py-1 rounded ${
          predictions.fiabilite === 'Élevée' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : predictions.fiabilite === 'Moyenne'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {predictions.fiabilite}
        </span>
      </div>
    </div>
  );
};

export default StatistiquesPosteCard;