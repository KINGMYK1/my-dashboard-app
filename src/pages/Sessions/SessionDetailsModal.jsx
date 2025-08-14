import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Monitor, 
  DollarSign, 
  FileText,
  AlertCircle,
  CheckCircle,
  Edit3,
  Download,
  Activity
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSessionDetails } from '../../hooks/useSessionsHistorique';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

const SessionDetailsModal = ({ session, onClose }) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  const [activeTab, setActiveTab] = useState('general');

  // Récupération des détails complets
  const { data: detailsData, isLoading } = useSessionDetails(session.id);
  const details = detailsData?.data || session;

  // Styles
  const getTextColorClass = (isPrimary) => 
    isDarkMode ? (isPrimary ? 'text-white' : 'text-gray-300') : (isPrimary ? 'text-gray-900' : 'text-gray-600');
  
  const getBgColorClass = () => 
    isDarkMode ? 'bg-gray-800' : 'bg-white';

  const getBorderColorClass = () => 
    isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-MA', { 
      style: 'currency', 
      currency: 'MAD' 
    }).format(price || 0);
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'TERMINEE': { variant: 'success', label: 'Terminée' },
      'ANNULEE': { variant: 'destructive', label: 'Annulée' },
      'CLOTUREE': { variant: 'secondary', label: 'Clôturée' }
    };

    const badge = badges[statut] || { variant: 'secondary', label: statut };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  // Onglets
  const tabs = [
    { id: 'general', label: 'Informations générales', icon: <FileText size={16} /> },
    { id: 'financier', label: 'Détails financiers', icon: <DollarSign size={16} /> },
    { id: 'technique', label: 'Informations techniques', icon: <Monitor size={16} /> },
    { id: 'historique', label: 'Historique des actions', icon: <Clock size={16} /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${getBgColorClass()} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${getBorderColorClass()}`}>
          <div>
            <h2 className={`text-xl font-bold ${getTextColorClass(true)}`}>
              Détails de la session #{details.numeroSession || details.id}
            </h2>
            <div className="flex items-center space-x-4 mt-2">
              {getStatutBadge(details.statut)}
              <span className={`text-sm ${getTextColorClass(false)}`}>
                {formatDate(details.dateHeureDebut)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${getTextColorClass(false)}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation des onglets */}
        <div className={`border-b ${getBorderColorClass()}`}>
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : `border-transparent ${getTextColorClass(false)} hover:text-gray-700 hover:border-gray-300`
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className={`ml-3 ${getTextColorClass(false)}`}>
                Chargement des détails...
              </span>
            </div>
          ) : (
            <>
              {activeTab === 'general' && (
                <GeneralTab details={details} getTextColorClass={getTextColorClass} formatDate={formatDate} formatDuration={formatDuration} />
              )}
              
              {activeTab === 'financier' && (
                <FinancierTab details={details} getTextColorClass={getTextColorClass} formatPrice={formatPrice} />
              )}
              
              {activeTab === 'technique' && (
                <TechniqueTab details={details} getTextColorClass={getTextColorClass} formatDate={formatDate} />
              )}
              
              {activeTab === 'historique' && (
                <HistoriqueTab details={details} getTextColorClass={getTextColorClass} formatDate={formatDate} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-6 border-t ${getBorderColorClass()}`}>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button className="flex items-center">
            <Download size={16} className="mr-2" />
            Exporter
          </Button>
        </div>
      </div>
    </div>
  );
};

// Composant onglet général
const GeneralTab = ({ details, getTextColorClass, formatDate, formatDuration }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <User className="mr-2" size={20} />
          Informations client
        </CardTitle>
      </CardHeader>
      <CardContent>
        {details.client ? (
          <div className="space-y-2">
            <div>
              <span className={`text-sm ${getTextColorClass(false)}`}>Nom complet:</span>
              <p className={`font-medium ${getTextColorClass(true)}`}>
                {details.client.prenom} {details.client.nom}
              </p>
            </div>
            {details.client.email && (
              <div>
                <span className={`text-sm ${getTextColorClass(false)}`}>Email:</span>
                <p className={`font-medium ${getTextColorClass(true)}`}>
                  {details.client.email}
                </p>
              </div>
            )}
            {details.client.telephone && (
              <div>
                <span className={`text-sm ${getTextColorClass(false)}`}>Téléphone:</span>
                <p className={`font-medium ${getTextColorClass(true)}`}>
                  {details.client.telephone}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className={getTextColorClass(false)}>Client anonyme</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <Monitor className="mr-2" size={20} />
          Informations poste
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Poste:</span>
            <p className={`font-medium ${getTextColorClass(true)}`}>
              {details.poste?.nom}
            </p>
          </div>
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Type:</span>
            <p className={`font-medium ${getTextColorClass(true)}`}>
              {details.poste?.typePoste?.nom}
            </p>
          </div>
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Tarif horaire:</span>
            <p className={`font-medium ${getTextColorClass(true)}`}>
              {details.poste?.typePoste?.tarifHoraireBase} MAD/h
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <Clock className="mr-2" size={20} />
          Durée et temps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Début:</span>
            <p className={`font-medium ${getTextColorClass(true)}`}>
              {formatDate(details.dateHeureDebut)}
            </p>
          </div>
          {details.dateHeureFin && (
            <div>
              <span className={`text-sm ${getTextColorClass(false)}`}>Fin:</span>
              <p className={`font-medium ${getTextColorClass(true)}`}>
                {formatDate(details.dateHeureFin)}
              </p>
            </div>
          )}
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Durée effective:</span>
            <p className={`font-medium ${getTextColorClass(true)}`}>
              {formatDuration(details.dureeEffectiveMinutes)}
            </p>
          </div>
          {details.tempsPauseTotalMinutes > 0 && (
            <div>
              <span className={`text-sm ${getTextColorClass(false)}`}>Temps de pause:</span>
              <p className={`font-medium ${getTextColorClass(true)}`}>
                {formatDuration(details.tempsPauseTotalMinutes)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <FileText className="mr-2" size={20} />
          Notes et commentaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        {details.notes ? (
          <p className={getTextColorClass(true)}>{details.notes}</p>
        ) : (
          <p className={getTextColorClass(false)}>Aucune note</p>
        )}
      </CardContent>
    </Card>
  </div>
);

// Composant onglet financier
const FinancierTab = ({ details, getTextColorClass, formatPrice }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <DollarSign className="mr-2" size={20} />
          Résumé financier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Coût calculé</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatPrice(details.coutCalculeFinal)}
            </p>
          </div>
          
          {details.transaction && (
            <>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Montant payé</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatPrice(details.transaction.montantEncaisse)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Mode de paiement</p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {details.transaction.modePaiement}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>

    {details.transaction && (
      <Card>
        <CardHeader>
          <CardTitle className={getTextColorClass(true)}>
            Détails de la transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={getTextColorClass(false)}>Numéro de transaction:</span>
              <span className={getTextColorClass(true)}>{details.transaction.numeroTransaction}</span>
            </div>
            <div className="flex justify-between">
              <span className={getTextColorClass(false)}>Montant HT:</span>
              <span className={getTextColorClass(true)}>{formatPrice(details.transaction.montantHT)}</span>
            </div>
            <div className="flex justify-between">
              <span className={getTextColorClass(false)}>Montant TTC:</span>
              <span className={getTextColorClass(true)}>{formatPrice(details.transaction.montantTTC)}</span>
            </div>
            <div className="flex justify-between">
              <span className={getTextColorClass(false)}>Statut:</span>
              <Badge variant={details.transaction.statut === 'TERMINEE' ? 'success' : 'secondary'}>
                {details.transaction.statut}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Composant onglet technique
const TechniqueTab = ({ details, getTextColorClass, formatDate }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className={getTextColorClass(true)}>
          Métadonnées techniques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>ID de session:</span>
            <p className={`font-mono ${getTextColorClass(true)}`}>{details.id}</p>
          </div>
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Numéro de session:</span>
            <p className={`font-mono ${getTextColorClass(true)}`}>{details.numeroSession}</p>
          </div>
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Date de création:</span>
            <p className={getTextColorClass(true)}>{formatDate(details.dateCreation)}</p>
          </div>
          <div>
            <span className={`text-sm ${getTextColorClass(false)}`}>Dernière mise à jour:</span>
            <p className={getTextColorClass(true)}>{formatDate(details.dateMiseAJour)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Composant onglet historique
const HistoriqueTab = ({ details, getTextColorClass, formatDate }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className={`${getTextColorClass(true)} flex items-center`}>
          <Activity className="mr-2" size={20} />
          Historique des actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {details.historique && details.historique.length > 0 ? (
          <div className="space-y-3">
            {details.historique.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${getTextColorClass(true)}`}>
                        {action.action}
                      </p>
                      <p className={`text-sm ${getTextColorClass(false)}`}>
                        {action.description}
                      </p>
                    </div>
                    <span className={`text-xs ${getTextColorClass(false)}`}>
                      {formatDate(action.dateAction)}
                    </span>
                  </div>
                  {action.utilisateur && (
                    <p className={`text-xs ${getTextColorClass(false)} mt-1`}>
                      Par: {action.utilisateur.firstName} {action.utilisateur.lastName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-8 ${getTextColorClass(false)}`}>
            Aucun historique d'actions disponible
          </p>
        )}
      </CardContent>
    </Card>
  </div>
);

export default SessionDetailsModal;