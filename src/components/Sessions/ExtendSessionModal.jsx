import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Clock, Plus } from 'lucide-react';
import { useExtendSession } from '../../hooks/useSessions';
import { useNotification } from '../../contexts/NotificationContext'; // Import useNotification

const ExtendSessionModal = ({
  open,
  onClose,
  session,
}) => {
  const [additionalMinutes, setAdditionalMinutes] = useState('30');
  const [customMinutes, setCustomMinutes] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [localError, setLocalError] = useState(null); // Local error state for validation

  const extendSessionMutation = useExtendSession();
  const { showError, showSuccess } = useNotification(); // Use notification context

  const presetTimes = [
    { label: '15 min', value: '15' },
    { label: '30 min', value: '30' },
    { label: '60 min', value: '60' },
    { label: '120 min', value: '120' },
  ];

  const handleExtend = async () => {
    setLocalError(null); // Clear previous errors
    const minutes = useCustom ? customMinutes : additionalMinutes;
    const parsedMinutes = parseInt(minutes);

    if (isNaN(parsedMinutes) || parsedMinutes <= 0) {
      setLocalError('Veuillez entrer un nombre de minutes valide.');
      return;
    }
    if (parsedMinutes > 480) { // Example max duration, adjust as needed
      setLocalError('Durée maximum: 480 minutes (8 heures)');
      return;
    }

    try {
      await extendSessionMutation.mutateAsync({
        sessionId: session.id,
        additionalMinutes: parsedMinutes
      });
      showSuccess('Session prolongée avec succès !'); // Use success notification
      onClose(); // Close the modal after success
    } catch (error) {
      console.error('Erreur de prolongation de session:', error);
      showError(error?.message || 'Erreur lors de la prolongation de la session.'); // Use error notification
      setLocalError(error?.message || 'Échec de la prolongation de la session.');
    }
  };

  const handleClose = () => {
    setLocalError(null); // Clear errors on close
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prolonger la session</DialogTitle>
          <DialogDescription>
            Ajouter du temps à la session pour le poste <span className="font-semibold">{session.poste?.nom}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {localError && (
            <p className="text-red-500 text-sm mb-4">{localError}</p>
          )}

          <div className="mb-4">
            <Label htmlFor="current-duration">Durée estimée actuelle</Label>
            <Input
              id="current-duration"
              value={`${session.dureeEstimeeMinutes || 0} minutes`}
              readOnly
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {presetTimes.map((time) => (
              <Button
                key={time.value}
                variant={additionalMinutes === time.value && !useCustom ? "default" : "outline"}
                onClick={() => { setAdditionalMinutes(time.value); setCustomMinutes(''); setUseCustom(false); }}
                className="py-2"
              >
                {time.label}
              </Button>
            ))}
          </div>

          <div className="mb-4">
            <Label htmlFor="custom-minutes">Ou durée personnalisée (minutes)</Label>
            <Input
              id="custom-minutes"
              type="number"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
                setUseCustom(true);
                setAdditionalMinutes(''); // Clear preset selection
              }}
              placeholder="Ex: 45"
              className="mt-1"
              min="1"
            />
            {useCustom && customMinutes && (
              <p className="text-sm text-gray-600 mt-1">
                Prolonger de {customMinutes} minute{parseInt(customMinutes) > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>Prolongation:</strong> {useCustom ? customMinutes || '0' : additionalMinutes} minute{(useCustom ? parseInt(customMinutes) : parseInt(additionalMinutes)) > 1 ? 's' : ''}
            </p>
            {session.dureeEstimeeMinutes && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nouvelle durée totale: {session.dureeEstimeeMinutes + (useCustom ? parseInt(customMinutes) || 0 : parseInt(additionalMinutes))} minutes
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={extendSessionMutation.isLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleExtend}
            disabled={extendSessionMutation.isLoading || (!useCustom && (!additionalMinutes || parseInt(additionalMinutes) <= 0)) || (useCustom && (!customMinutes || parseInt(customMinutes) <= 0)) || !!localError}
          >
            {extendSessionMutation.isLoading ? 'Prolongation...' : 'Prolonger'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendSessionModal;
