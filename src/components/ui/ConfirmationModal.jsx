import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { AlertTriangle, Info } from 'lucide-react';

const ConfirmationModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmer l'action",
  description = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmVariant = "default",
  isLoading = false,
  showReasonInput = false,
  reasonPlaceholder = "Raison (optionnel)...",
  type = "warning" // "warning", "info", "danger"
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (showReasonInput) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        {showReasonInput && (
          <div className="space-y-2">
            <Label htmlFor="reason">Motif</Label>
            <Input
              id="reason"
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Traitement...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;