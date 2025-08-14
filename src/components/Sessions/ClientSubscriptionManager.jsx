import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  Clock, 
  User, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useClients } from '../../hooks/useClients';
import { useAbonnements } from '../../hooks/useAbonnements';
import { useTypesAbonnements } from '../../hooks/useTypesAbonnements';
import { abonnementService } from '../../services/abonnementService';

const ClientSubscriptionManager = ({ 
  clientId, 
  onSubscriptionUpdated, 
  show = false,
  onClose 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState(null);

  const isDarkMode = effectiveTheme === 'dark';

  // Hooks de données
  const { data: clientsData } = useClients();
  const { data: abonnementsData, isLoading: loadingAbonnements } = useAbonnements({
    enabled: show && clientId
  });
  const { data: typesAbonnementsData } = useTypesAbonnements();

  // Client sélectionné
  const client = clientsData?.find(c => c.id === clientId);

  // Abonnements du client
  const abonnementsClient = abonnementsData?.filter(a => a.clientId === clientId) || [];

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-4xl rounded-xl shadow-2xl
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        max-h-[90vh] overflow-y-auto
      `}>
        {/* Header */}
        <div className={`
          p-6 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Star className="text-yellow-500" />
            Gestion des Abonnements
          </h2>
          {client && (
            <p className="text-sm opacity-75 mt-1">
              Client: {client.prenom} {client.nom} {client.numeroClient && `(${client.numeroClient})`}
            </p>
          )}
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Abonnements actifs et historique</h3>
              <p className="text-sm opacity-75">
                {abonnementsClient.length} abonnement(s) trouvé(s)
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel abonnement
            </button>
          </div>

          {/* Liste des abonnements */}
          {loadingAbonnements ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-sm opacity-75">Chargement des abonnements...</p>
            </div>
          ) : abonnementsClient.length > 0 ? (
            <div className="space-y-4">
              {abonnementsClient.map(abonnement => (
                <AbonnementCard
                  key={abonnement.id}
                  abonnement={abonnement}
                  onEdit={setEditingAbonnement}
                  onUpdated={onSubscriptionUpdated}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-75">
              <Star className="w-12 h-12 mx-auto opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun abonnement</h3>
              <p className="text-sm">Ce client n'a aucun abonnement pour le moment.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Créer le premier abonnement
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`
          p-6 border-t flex justify-end
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Modal de création/édition */}
      {(showCreateForm || editingAbonnement) && (
        <CreateEditAbonnementModal
          clientId={clientId}
          abonnement={editingAbonnement}
          typesAbonnements={typesAbonnementsData}
          onSave={(data) => {
            onSubscriptionUpdated?.();
            setShowCreateForm(false);
            setEditingAbonnement(null);
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingAbonnement(null);
          }}
        />
      )}
    </div>
  );
};

// ✅ Composant pour une carte d'abonnement
const AbonnementCard = ({ abonnement, onEdit, onUpdated }) => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError, showConfirm } = useNotification();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const isDarkMode = effectiveTheme === 'dark';

  // Calculer le statut visuel
  const getStatusInfo = () => {
    const maintenant = new Date();
    const expiration = new Date(abonnement.dateExpiration);
    const joursRestants = Math.ceil((expiration - maintenant) / (1000 * 60 * 60 * 24));

    if (abonnement.statut === 'EXPIRE') {
      return { color: 'red', label: 'Expiré', icon: AlertCircle };
    }
    if (abonnement.statut === 'SUSPENDU') {
      return { color: 'orange', label: 'Suspendu', icon: AlertCircle };
    }
    if (abonnement.heuresRestantes <= 0) {
      return { color: 'gray', label: 'Épuisé', icon: Clock };
    }
    if (joursRestants <= 7) {
      return { color: 'orange', label: 'Expire bientôt', icon: AlertCircle };
    }
    return { color: 'green', label: 'Actif', icon: Check };
  };

  const statusInfo = getStatusInfo();

  // Supprimer l'abonnement
  const handleDelete = async () => {
    const confirmed = await showConfirm(
      'Êtes-vous sûr de vouloir supprimer cet abonnement ?',
      'Cette action est irréversible.'
    );

    if (confirmed) {
      setLoading(true);
      try {
        await abonnementService.supprimerAbonnement(abonnement.id);
        showSuccess('Abonnement supprimé avec succès');
        queryClient.invalidateQueries(['abonnements']);
        onUpdated?.();
      } catch (error) {
        showError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  // Réactiver l'abonnement
  const handleReactivate = async () => {
    setLoading(true);
    try {
      await abonnementService.reactiverAbonnement(abonnement.id);
      showSuccess('Abonnement réactivé');
      queryClient.invalidateQueries(['abonnements']);
      onUpdated?.();
    } catch (error) {
      showError('Erreur lors de la réactivation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`
      rounded-lg border-2 p-4
      ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg">{abonnement.typeAbonnement?.nom}</h4>
          <p className="text-sm opacity-75">{abonnement.typeAbonnement?.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
            ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
            ${statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
            ${statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
            ${statusInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            <statusInfo.icon className="w-3 h-3" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs opacity-75">Heures restantes</div>
          <div className="font-bold text-lg">
            {abonnement.heuresRestantes}h
          </div>
          <div className="text-xs opacity-60">
            / {abonnement.nombreHeuresAchetees}h
          </div>
        </div>

        <div>
          <div className="text-xs opacity-75">Date d'expiration</div>
          <div className="font-medium">
            {new Date(abonnement.dateExpiration).toLocaleDateString()}
          </div>
        </div>

        <div>
          <div className="text-xs opacity-75">Prix payé</div>
          <div className="font-bold text-green-600">
            {abonnement.prixPaye} MAD
          </div>
        </div>

        <div>
          <div className="text-xs opacity-75">Date d'achat</div>
          <div className="font-medium">
            {new Date(abonnement.dateAchat).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-xs opacity-75 mb-1">
          <span>Progression d'utilisation</span>
          <span>
            {((1 - abonnement.heuresRestantes / abonnement.nombreHeuresAchetees) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              abonnement.heuresRestantes > abonnement.nombreHeuresAchetees * 0.3
                ? 'bg-green-500'
                : abonnement.heuresRestantes > 0
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(
                ((abonnement.nombreHeuresAchetees - abonnement.heuresRestantes) / abonnement.nombreHeuresAchetees) * 100, 
                100
              )}%` 
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(abonnement)}
          disabled={loading}
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>

        {abonnement.statut === 'SUSPENDU' && (
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Réactiver
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ✅ Modal de création/édition d'abonnement
const CreateEditAbonnementModal = ({ 
  clientId, 
  abonnement, 
  typesAbonnements, 
  onSave, 
  onCancel 
}) => {
  const { effectiveTheme } = useTheme();
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    typeAbonnementId: abonnement?.typeAbonnementId || '',
    nombreHeuresAchetees: abonnement?.nombreHeuresAchetees || 10,
    prixPaye: abonnement?.prixPaye || 0,
    dateExpiration: abonnement?.dateExpiration 
      ? new Date(abonnement.dateExpiration).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
    notes: abonnement?.notes || ''
  });

  const isDarkMode = effectiveTheme === 'dark';
  const isEditing = Boolean(abonnement);

  // Type d'abonnement sélectionné
  const typeSelectionne = typesAbonnements?.find(t => t.id === parseInt(formData.typeAbonnementId));

  // Calculer le prix suggéré
  const prixSuggere = typeSelectionne ? typeSelectionne.prixHeure * formData.nombreHeuresAchetees : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.typeAbonnementId || !formData.nombreHeuresAchetees) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const abonnementData = {
        clientId,
        typeAbonnementId: parseInt(formData.typeAbonnementId),
        nombreHeuresAchetees: parseInt(formData.nombreHeuresAchetees),
        prixPaye: parseFloat(formData.prixPaye),
        dateExpiration: formData.dateExpiration,
        notes: formData.notes
      };

      if (isEditing) {
        await abonnementService.modifierAbonnement(abonnement.id, abonnementData);
        showSuccess('Abonnement modifié avec succès');
      } else {
        await abonnementService.creerAbonnement(abonnementData);
        showSuccess('Abonnement créé avec succès');
      }

      queryClient.invalidateQueries(['abonnements']);
      onSave?.(abonnementData);
    } catch (error) {
      console.error('❌ [ABONNEMENT] Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`
        w-full max-w-md rounded-xl shadow-2xl
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}>
        <div className={`
          p-6 border-b
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <h3 className="text-xl font-bold">
            {isEditing ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type d'abonnement */}
          <div>
            <label className="block text-sm font-medium mb-1">Type d'abonnement *</label>
            <select
              value={formData.typeAbonnementId}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                typeAbonnementId: e.target.value,
                prixPaye: typesAbonnements?.find(t => t.id === parseInt(e.target.value))?.prixHeure * formData.nombreHeuresAchetees || 0
              }))}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              required
            >
              <option value="">Sélectionner un type</option>
              {typesAbonnements?.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nom} - {type.prixHeure} MAD/h
                </option>
              ))}
            </select>
          </div>

          {/* Nombre d'heures */}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre d'heures *</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.nombreHeuresAchetees}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                nombreHeuresAchetees: parseInt(e.target.value) || 0,
                prixPaye: typeSelectionne ? typeSelectionne.prixHeure * (parseInt(e.target.value) || 0) : 0
              }))}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              required
            />
          </div>

          {/* Prix payé */}
          <div>
            <label className="block text-sm font-medium mb-1">Prix payé (MAD) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.prixPaye}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                prixPaye: parseFloat(e.target.value) || 0 
              }))}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              required
            />
            {prixSuggere > 0 && prixSuggere !== formData.prixPaye && (
              <p className="text-xs text-blue-600 mt-1">
                Prix suggéré: {prixSuggere} MAD
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, prixPaye: prixSuggere }))}
                  className="ml-2 underline"
                >
                  Appliquer
                </button>
              </p>
            )}
          </div>

          {/* Date d'expiration */}
          <div>
            <label className="block text-sm font-medium mb-1">Date d'expiration *</label>
            <input
              type="date"
              value={formData.dateExpiration}
              onChange={(e) => setFormData(prev => ({ ...prev, dateExpiration: e.target.value }))}
              className={`
                w-full px-3 py-2 border rounded-lg
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg resize-none
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
              `}
              placeholder="Notes sur cet abonnement..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`
                flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientSubscriptionManager;
